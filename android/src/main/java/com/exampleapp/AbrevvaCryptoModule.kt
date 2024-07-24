package com.exampleapp

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.evva.xesar.abrevva.crypto.AesCCM
import com.evva.xesar.abrevva.crypto.AesGCM
import com.evva.xesar.abrevva.crypto.HKDF
import com.evva.xesar.abrevva.crypto.SimpleSecureRandom
import com.evva.xesar.abrevva.crypto.X25519Wrapper
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReadableMap
import org.bouncycastle.util.encoders.Base64
import org.bouncycastle.util.encoders.Hex
import java.io.BufferedInputStream
import java.io.FileOutputStream
import java.io.IOException
import java.net.URL
import java.nio.file.Paths

class AbrevvaCryptoModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    @ReactMethod
    fun encrypt(options: ReadableMap, promise: Promise) {
        val key = Hex.decode(options.getString("key")?: "")
        val iv = Hex.decode(options.getString("iv")?: "")
        val adata = Hex.decode(options.getString("adata")?: "")
        val pt = Hex.decode(options.getString("pt")?: "")
        val tagLength = options.getInt("tagLength")

        val ct: ByteArray = AesCCM.encrypt(key, iv, adata, pt, tagLength)
        val cipherText = ByteArray(pt.size)
        val authTag = ByteArray(tagLength)

        System.arraycopy(ct, 0, cipherText, 0, pt.size)
        System.arraycopy(ct, pt.size, authTag, 0, tagLength)

        if (ct.isEmpty()) {
            promise.reject("encrypt(): encryption failed")
        } else {
            val ret = Arguments.createMap()
            ret.putString("cipherText", Hex.toHexString(cipherText))
            ret.putString("authTag", Hex.toHexString(authTag))
            promise.resolve(ret)
        }
    }

    @ReactMethod
    fun decrypt(options: ReadableMap, promise: Promise) {
        val key = Hex.decode(options.getString("key")?: "")
        val iv = Hex.decode(options.getString("iv")?: "")
        val adata = Hex.decode(options.getString("adata")?: "")
        val ct = Hex.decode(options.getString("ct")?: "")
        val tagLength = options.getInt("tagLength")

        val pt: ByteArray = AesCCM.decrypt(key, iv, adata, ct, tagLength)

        if (ct.isEmpty()) {
            promise.reject("decrypt(): decryption failed")
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
            ret.putString("privateKey", Base64.toBase64String(keyPair.privateKey))
            ret.putString("publicKey", Base64.toBase64String(keyPair.publicKey))
            promise.resolve(ret)
        } catch (e: Exception) {
            promise.reject("generateKeyPair(): private key creation failed")
        }
    }

    @ReactMethod
    fun computeSharedSecret(options: ReadableMap, promise: Promise) {
        try {
            val privateKey = options.getString("privateKey")
            if (privateKey == null || privateKey == "") {
                promise.reject("computeSharedSecret(): invalid private key")
                return
            }
            val peerPublicKey = options.getString("peerPublicKey")
            if (peerPublicKey == null || peerPublicKey == "") {
                promise.reject("computeSharedSecret(): invalid peer public key")
                return
            }
            val sharedSecret: ByteArray = X25519Wrapper.computeSharedSecret(
                Base64.decode(privateKey),
                Base64.decode(peerPublicKey)
            )

            val ret = Arguments.createMap()
            ret.putString("sharedSecret", Hex.toHexString(sharedSecret))
            promise.resolve(ret)
        } catch (e: Exception) {
            promise.reject("computeSharedSecret(): failed to create shared key")
        }
    }

    @ReactMethod
    fun encryptFile(options: ReadableMap, promise: Promise) {
        try {
            val ptPath = options.getString("ptPath")
            if (ptPath == null || ptPath == "") {
                promise.reject("encryptFile(): invalid ptPath")
                return
            }
            val ctPath = options.getString("ctPath")
            if (ctPath == null || ctPath == "") {
                promise.reject("encryptFile(): invalid ctPath")
                return
            }
            val sharedSecret = options.getString("sharedSecret")
            if (sharedSecret == null || sharedSecret == "") {
                promise.reject("encryptFile(): invalid shared secret")
                return
            }

            val sharedKey = Hex.decode(sharedSecret)
            val operationOk: Boolean = AesGCM.encryptFile(sharedKey, ptPath, ctPath)

            val ret = Arguments.createMap()
            ret.putBoolean("opOk", operationOk)
            promise.resolve(ret)
        } catch (e: Exception) {
            promise.reject("encryptFile(): failed to encrypt file")
        }
    }

    @ReactMethod
    fun decryptFile(options: ReadableMap, promise: Promise) {
        try {
            val sharedSecret = options.getString("sharedSecret")
            if (sharedSecret == null || sharedSecret == "") {
                promise.reject("decryptFile(): invalid shared secret")
                return
            }
            val ctPath = options.getString("ctPath")
            if (ctPath == null || ctPath == "") {
                promise.reject("decryptFile(): invalid ctPath")
                return
            }
            val ptPath = options.getString("ptPath")
            if (ptPath == null || ptPath == "") {
                promise.reject("decryptFile(): invalid ptPath")
                return
            }

            val sharedKey = Hex.decode(sharedSecret)
            val operationOk: Boolean = AesGCM.decryptFile(sharedKey, ctPath, ptPath)

            val ret = Arguments.createMap()
            ret.putBoolean("opOk", operationOk)
            promise.resolve(ret)
        } catch (e: Exception) {
            promise.reject("decryptFile(): failed to decrypt file")
        }
    }

    @ReactMethod
    fun decryptFileFromURL(options: ReadableMap, promise: Promise) {
        val sharedSecret = options.getString("sharedSecret")
        if (sharedSecret == null || sharedSecret == "") {
            promise.reject("decryptFileFromURL(): invalid shared secret")
            return
        }
        val url = options.getString("url")
        if (url == null || url == "") {
            promise.reject("decryptFileFromURL(): invalid url")
            return
        }
        val ptPath = options.getString("ptPath")
        if (ptPath == null || ptPath == "") {
            promise.reject("decryptFileFromURL(): invalid ptPath")
            return
        }

        val ctPath = Paths.get(ptPath).parent.toString() + "/blob"
        try {
            BufferedInputStream(URL(url).openStream()).use { `in` ->
                FileOutputStream(ctPath).use { fileOutputStream ->
                    val dataBuffer = ByteArray(4096)
                    var bytesRead: Int
                    while (`in`.read(dataBuffer, 0, 4096).also { bytesRead = it } != -1) {
                        fileOutputStream.write(dataBuffer, 0, bytesRead)
                    }
                }
            }
        } catch (e: IOException) {
            promise.reject("decryptFileFromURL(): failed to load data from url")
            return
        }

        try {
            val sharedKey = Hex.decode(sharedSecret)
            val operationOk: Boolean = AesGCM.decryptFile(sharedKey, ctPath, ptPath)

            val ret = Arguments.createMap()
            ret.putBoolean("opOk", operationOk)
            promise.resolve(ret)
        } catch (e: Exception) {
            promise.reject("decryptFileFromURL(): failed to decrypt from file")
        }
    }

    @ReactMethod
    fun random(options: ReadableMap, promise: Promise) {
        val numBytes = options.getInt("numBytes")
        val rnd: ByteArray = SimpleSecureRandom.getSecureRandomBytes(numBytes)

        if (rnd.isEmpty()) {
            promise.reject("random(): random generation failed")
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
            promise.reject("derive(): key derivation failed")
        } else {
            val ret = Arguments.createMap()
            ret.putString("value", Hex.toHexString(derived))
            promise.resolve(ret)
        }
    }

    override fun getName(): String {
        return ("AbrevvaCrypto")
    }
}