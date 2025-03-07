package com.evva.xesar.abrevva.reactnative

import com.evva.xesar.abrevva.crypto.AesCcm
import com.evva.xesar.abrevva.crypto.AesGcm
import com.evva.xesar.abrevva.crypto.HKDF
import com.evva.xesar.abrevva.crypto.SimpleSecureRandom
import com.evva.xesar.abrevva.crypto.X25519Wrapper
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import org.bouncycastle.util.encoders.Hex
import java.io.BufferedInputStream
import java.io.FileOutputStream
import java.net.URL
import java.nio.file.Paths

class AbrevvaCryptoModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    @ReactMethod
    fun encrypt(options: ReadableMap, promise: Promise) {
        val key = Hex.decode(options.getString("key") ?: "")
        val iv = Hex.decode(options.getString("iv") ?: "")
        val adata = Hex.decode(options.getString("adata") ?: "")
        val pt = Hex.decode(options.getString("pt") ?: "")
        val tagLength = options.getInt("tagLength")

        val ct: ByteArray = AesCcm.encrypt(key, iv, adata, pt, tagLength)
        val cipherText = ByteArray(pt.size)
        val authTag = ByteArray(tagLength)

        System.arraycopy(ct, 0, cipherText, 0, pt.size)
        System.arraycopy(ct, pt.size, authTag, 0, tagLength)

        if (ct.isEmpty()) {
            promise.reject(Exception("encrypt(): encryption failed"))
        } else {
            val ret = Arguments.createMap()
            ret.putString("cipherText", Hex.toHexString(cipherText))
            ret.putString("authTag", Hex.toHexString(authTag))
            promise.resolve(ret)
        }
    }

    @ReactMethod
    fun decrypt(options: ReadableMap, promise: Promise) {
        val key = Hex.decode(options.getString("key") ?: "")
        val iv = Hex.decode(options.getString("iv") ?: "")
        val adata = Hex.decode(options.getString("adata") ?: "")
        val ct = Hex.decode(options.getString("ct") ?: "")
        val tagLength = options.getInt("tagLength")

        val pt: ByteArray = AesCcm.decrypt(key, iv, adata, ct, tagLength)

        if (pt.isEmpty()) {
            promise.reject(Exception("decrypt(): decryption failed"))
        } else {
            val ret = Arguments.createMap()
            ret.putString("plainText", Hex.toHexString(pt))
            ret.putBoolean("authOk", true)
            promise.resolve(ret)
        }
    }

    @ReactMethod
    fun generateKeyPair(promise: Promise) {
        try {
            val keyPair: X25519Wrapper.KeyPair = X25519Wrapper.generateKeyPair()

            val ret = Arguments.createMap()
            ret.putString("privateKey", Hex.toHexString(keyPair.privateKey))
            ret.putString("publicKey", Hex.toHexString(keyPair.publicKey))
            promise.resolve(ret)
        } catch (e: Exception) {
            promise.reject(Exception("generateKeyPair(): private key creation failed"))
        }
    }

    @ReactMethod
    fun computeSharedSecret(options: ReadableMap, promise: Promise) {
        try {
            val privateKey = options.getString("privateKey")
            if (privateKey == null || privateKey == "") {
                promise.reject(Exception("computeSharedSecret(): invalid private key"))
                return
            }
            val peerPublicKey = options.getString("peerPublicKey")
            if (peerPublicKey == null || peerPublicKey == "") {
                promise.reject(Exception("computeSharedSecret(): invalid peer public key"))
                return
            }
            val sharedSecret: ByteArray = X25519Wrapper.computeSharedSecret(
                Hex.decode(privateKey),
                Hex.decode(peerPublicKey)
            )

            val ret = Arguments.createMap()
            ret.putString("sharedSecret", Hex.toHexString(sharedSecret))
            promise.resolve(ret)
        } catch (e: Exception) {
            promise.reject(Exception("computeSharedSecret(): failed to create shared key"))
        }
    }

    @ReactMethod
    fun encryptFile(options: ReadableMap, promise: Promise) {
        try {
            val ptPath = options.getString("ptPath")
            if (ptPath == null || ptPath == "") {
                promise.reject(Exception("encryptFile(): invalid ptPath"))
                return
            }
            val ctPath = options.getString("ctPath")
            if (ctPath == null || ctPath == "") {
                promise.reject(Exception("encryptFile(): invalid ctPath"))
                return
            }
            val sharedSecret = options.getString("sharedSecret")
            if (sharedSecret == null || sharedSecret == "") {
                promise.reject(Exception("encryptFile(): invalid shared secret"))
                return
            }

            val sharedKey = Hex.decode(sharedSecret)
            val operationOk: Boolean = AesGcm.encryptFile(sharedKey, ptPath, ctPath)

            val ret = Arguments.createMap()
            ret.putBoolean("opOk", operationOk)
            promise.resolve(ret)
        } catch (e: Exception) {
            promise.reject(e)
        }
    }

    @ReactMethod
    fun decryptFile(options: ReadableMap, promise: Promise) {
        try {
            val sharedSecret = options.getString("sharedSecret")
            if (sharedSecret == null || sharedSecret == "") {
                promise.reject(Exception("decryptFile(): invalid shared secret"))
                return
            }
            val ctPath = options.getString("ctPath")
            if (ctPath == null || ctPath == "") {
                promise.reject(Exception("decryptFile(): invalid ctPath"))
                return
            }
            val ptPath = options.getString("ptPath")
            if (ptPath == null || ptPath == "") {
                promise.reject(Exception("decryptFile(): invalid ptPath"))
                return
            }

            val sharedKey = Hex.decode(sharedSecret)
            val operationOk: Boolean = AesGcm.decryptFile(sharedKey, ctPath, ptPath)

            val ret = Arguments.createMap()
            ret.putBoolean("opOk", operationOk)
            promise.resolve(ret)
        } catch (e: Exception) {
            promise.reject(e)
        }
    }

    fun writeToFile(ctPath: String, url: String) {
        BufferedInputStream(URL(url).openStream()).use { `in` ->
            FileOutputStream(ctPath).use { fileOutputStream ->
                val dataBuffer = ByteArray(4096)
                var bytesRead: Int
                while (`in`.read(dataBuffer, 0, 4096).also { bytesRead = it } != -1) {
                    fileOutputStream.write(dataBuffer, 0, bytesRead)
                }
            }
        }
    }

    @ReactMethod
    fun decryptFileFromURL(options: ReadableMap, promise: Promise) {
        val sharedSecret = options.getString("sharedSecret")
        if (sharedSecret == null || sharedSecret == "") {
            promise.reject(Exception("decryptFileFromURL(): invalid shared secret"))
            return
        }
        val url = options.getString("url")
        if (url == null || url == "") {
            promise.reject(Exception("decryptFileFromURL(): invalid url"))
            return
        }
        val ptPath = options.getString("ptPath")
        if (ptPath == null || ptPath == "") {
            promise.reject(Exception("decryptFileFromURL(): invalid ptPath"))
            return
        }

        val ctPath = Paths.get(ptPath).parent.toString() + "/blob"
        try {
            writeToFile(ctPath, url)
        } catch (e: Exception) {
            promise.reject(e)
            return
        }

        try {
            val sharedKey = Hex.decode(sharedSecret)
            val operationOk: Boolean = AesGcm.decryptFile(sharedKey, ctPath, ptPath)

            val ret = Arguments.createMap()
            ret.putBoolean("opOk", operationOk)
            promise.resolve(ret)
        } catch (e: Exception) {
            promise.reject(e)
        }
    }

    @ReactMethod
    fun random(options: ReadableMap, promise: Promise) {
        val numBytes = options.getInt("numBytes")
        val rnd: ByteArray = SimpleSecureRandom.getSecureRandomBytes(numBytes)

        if (rnd.isEmpty()) {
            promise.reject(Exception("random(): random generation failed"))
        } else {
            val ret = Arguments.createMap()
            ret.putString("value", Hex.toHexString(rnd))
            promise.resolve(ret)
        }
    }

    @ReactMethod
    fun derive(options: ReadableMap, promise: Promise) {
        val key = Hex.decode(options.getString("key") ?: "")
        val salt = Hex.decode(options.getString("salt") ?: "")
        val info = Hex.decode(options.getString("info") ?: "")
        val length = options.getInt("length")

        val derived: ByteArray = HKDF.derive(key, salt, info, length)
        if (derived.isEmpty()) {
            promise.reject(Exception("derive(): key derivation failed"))
        } else {
            val ret = Arguments.createMap()
            ret.putString("value", Hex.toHexString(derived))
            promise.resolve(ret)
        }
    }

    override fun getName(): String {
        return NAME
    }

    companion object {
        const val NAME = "AbrevvaCrypto"
    }

}
