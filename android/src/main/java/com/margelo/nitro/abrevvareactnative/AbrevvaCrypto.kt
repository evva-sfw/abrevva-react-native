package com.margelo.nitro.abrevvareactnative

import com.evva.xesar.abrevva.crypto.AesCcm
import com.evva.xesar.abrevva.crypto.AesGcm
import com.evva.xesar.abrevva.crypto.HKDF
import com.evva.xesar.abrevva.crypto.SimpleSecureRandom
import com.evva.xesar.abrevva.crypto.X25519Wrapper
import com.facebook.proguard.annotations.DoNotStrip
import com.margelo.nitro.core.Promise
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import org.bouncycastle.util.encoders.Base64
import org.bouncycastle.util.encoders.Hex
import java.io.BufferedInputStream
import java.io.File
import java.io.FileOutputStream
import java.io.IOException
import java.net.HttpURLConnection
import java.net.URL
import java.nio.file.Paths

private enum class CryptoError {
  EncryptCryptoError,
  EncryptEmptyResultError,
  EncryptFileCryptoError,
  EncryptFileInvalidArgumentError,
  DecryptEmptyResultError,
  DecryptCryptoError,
  DecryptFileCryptoError,
  DecryptFileInvalidArgumentError,
  DecryptFileFromURLNetworkError,
  DecryptFileFromURLNotFoundError,
  DecryptFileFromURLInaccessibleError,
  DecryptFileFromURLNoResponseDataError,
  DecryptFileFromURLInvalidArgumentError,
  GenerateKeypairError,
  ComputeSharedSecretError,
  ComputeED25519PublicKeyError,
  SignCryptoError,
  VerifyCryptoError,
  RandomError,
  DeriveInvalidArgumentError,
  DeriveEmptyResultError,
  DeriveCryptoError
}

private class CryptoException(error: CryptoError, throwable: Throwable? = null) :
  Exception("${AbrevvaCryptoImpl::class.simpleName}::${error.name}", throwable)

@DoNotStrip
class AbrevvaCryptoImpl : HybridAbrevvaCryptoImplSpec() {
  override fun encrypt(
    key: String,
    iv: String,
    adata: String,
    pt: String,
    tagLength: Double?
  ): EncryptResult {
    val keyByte = Hex.decode(key)
    val ivByte = Hex.decode(iv)
    val adataByte = Hex.decode(adata)
    val ptByte = Hex.decode(pt)
    val _tagLength: Int = (tagLength ?: DEFAULT_TIMEOUT).toInt()

    try {
      val ct: ByteArray = AesCcm.encrypt(keyByte, ivByte, adataByte, ptByte, _tagLength)
      val cipherText = ByteArray(ptByte.size)
      val authTag = ByteArray(_tagLength)

      System.arraycopy(ct, 0, cipherText, 0, ptByte.size)
      System.arraycopy(ct, ptByte.size, authTag, 0, _tagLength)

      if (ct.isEmpty()) {
        throw CryptoException(CryptoError.EncryptEmptyResultError)
      } else {
        return EncryptResult(Hex.toHexString(cipherText), Hex.toHexString(authTag))
      }
    } catch (e: Exception) {
      throw CryptoException(CryptoError.EncryptCryptoError, e)
    }
  }

  override fun decrypt(
    key: String,
    iv: String,
    adata: String,
    ct: String,
    tagLength: Double?
  ): DecryptResult {
    val keyHex = Hex.decode(key)
    val ivHex = Hex.decode(iv)
    val adataHex = Hex.decode(adata)
    val ctHex = Hex.decode(ct)
    val _tagLength: Int = (tagLength ?: DEFAULT_TIMEOUT).toInt()

    try {
      val data: ByteArray = AesCcm.decrypt(keyHex, ivHex, adataHex, ctHex, _tagLength)
      if (data.isEmpty()) {
        throw CryptoException(CryptoError.DecryptEmptyResultError)
      }
      return DecryptResult(Hex.toHexString(data), true)
    } catch (e: Exception) {
      throw CryptoException(CryptoError.DecryptCryptoError, e)
    }
  }

  override fun generateKeyPair(): KeypairResult {
    val keyPair: X25519Wrapper.KeyPair
    val privateKey: String
    val publicKey: String
    try {
      keyPair = X25519Wrapper.generateKeyPair()
      privateKey = Base64.toBase64String(keyPair.privateKey)
      publicKey = Base64.toBase64String(keyPair.publicKey)
      return KeypairResult(privateKey, publicKey)
    } catch (e: Exception) {
      throw CryptoException(CryptoError.GenerateKeypairError, e)
    }
  }

  override fun computeSharedSecret(
    key: String,
    peerPublicKey: String
  ): String {
    try {
      val result = X25519Wrapper.computeSharedSecret(
        Base64.decode(key),
        Base64.decode(peerPublicKey)
      )
      return Hex.toHexString(result)
    } catch (e: Exception) {
      throw CryptoException(CryptoError.ComputeSharedSecretError, e)
    }
  }

  override fun encryptFile(
    sharedSecret: String,
    ptPath: String,
    ctPath: String
  ): Boolean {
    val sharedSecretBytes: ByteArray

    try {
      sharedSecretBytes = Hex.decode(sharedSecret)
    } catch (e: Exception) {
      throw CryptoException(CryptoError.EncryptFileInvalidArgumentError, e)
    }

    try {
      return AesGcm.encryptFile(Hex.decode(sharedSecretBytes), ptPath, ctPath)
    } catch (e: Exception) {
      throw CryptoException(CryptoError.EncryptFileCryptoError, e)
    }
  }

  override fun decryptFile(
    sharedSecret: String,
    ptPath: String,
    ctPath: String
  ): Boolean {
    val sharedSecretByte: ByteArray

    try {
      sharedSecretByte = Hex.decode(sharedSecret)
    } catch (e: Exception) {
      throw CryptoException(CryptoError.DecryptFileInvalidArgumentError, e)
    }

    try {
      return AesGcm.decryptFile(sharedSecretByte, ctPath, ptPath)
    } catch (e: Exception) {
      throw CryptoException(CryptoError.DecryptFileCryptoError, e)
    }
  }

    override fun decryptFileFromURL(
    sharedSecret: String,
    ptPath: String,
    url: String
  ): Promise<Boolean> {
        val promise = Promise<Boolean>()

        CoroutineScope(Dispatchers.IO).launch {

            val sharedSecretByte: ByteArray
            try {
                sharedSecretByte = Hex.decode(sharedSecret)
            } catch (e: Exception) {
                promise.reject(
                    CryptoException(
                        CryptoError.DecryptFileFromURLInvalidArgumentError,
                        e
                    )
                )
                return@launch
            }

            val ctPath = Paths.get(ptPath).parent.toString() + "/blob"

            val file = File(ctPath)
            val uri: URL
            val connection: HttpURLConnection
            val statusCode: Int

            try {
                uri = URL(url)
                connection = uri.openConnection() as HttpURLConnection
                statusCode = connection.responseCode
            } catch (e: Exception) {
                promise.reject(CryptoException(CryptoError.DecryptFileFromURLNetworkError, e))
                return@launch
            }
            try {
                when (statusCode) {
                    200 -> {
                        val inputStream = connection.inputStream
                        val bufferedInputStream = BufferedInputStream(inputStream)
                        val outputStream = FileOutputStream(file)
                        val dataBuffer = ByteArray(4096)
                        var bytesRead: Int

                        while (bufferedInputStream.read(dataBuffer, 0, 4096)
                                .also { bytesRead = it } != -1
                        ) {
                            outputStream.write(dataBuffer, 0, bytesRead)
                        }
                        outputStream.flush()
                        outputStream.close()
                    }

                    404 -> {
                        promise.reject(CryptoException(CryptoError.DecryptFileFromURLNotFoundError))
                        return@launch
                    }

                    else -> {
                        promise.reject(CryptoException(CryptoError.DecryptFileFromURLInaccessibleError))
                        return@launch

                    }
                }
            } catch (e: IOException) {
                promise.reject(
                    CryptoException(
                        CryptoError.DecryptFileFromURLNoResponseDataError,
                        e
                    )
                )
                return@launch
            }
            promise.resolve(AesGcm.decryptFile(sharedSecretByte, ctPath, ptPath))
        }.start()
        return promise
    }

  override fun random(numBytes: Double): String {
    try {
      val result = SimpleSecureRandom.getSecureRandomBytes(numBytes.toInt())
      return Hex.toHexString(result)
    } catch (e: Exception) {
      throw CryptoException(CryptoError.RandomError, e)
    }
  }

  override fun derive(
    key: String,
    salt: String,
    info: String,
    length: Double
  ): String {
    val keyByte: ByteArray
    val saltByte: ByteArray
    val infoByte: ByteArray
    try {
      keyByte = Hex.decode(key)
      saltByte = Hex.decode(salt)
      infoByte = Hex.decode(info)
    } catch (e: Exception) {
      throw CryptoException(CryptoError.DeriveInvalidArgumentError, e)
    }

    try {
      val result: ByteArray = HKDF.derive(keyByte, saltByte, infoByte, length.toInt())
      if (result.isEmpty()) {
        throw CryptoException(CryptoError.DeriveEmptyResultError)
      }
      return Hex.toHexString(result)
    } catch (e: Exception) {
      throw CryptoException(CryptoError.DeriveCryptoError, e)
    }
  }

  override fun computeED25519PublicKey(privateKey: String): String {
    try {
      val result = X25519Wrapper.computeED25519PublicKey(Base64.decode(privateKey))
      return Base64.toBase64String(result)
    } catch (e: Exception) {
      throw CryptoException(CryptoError.ComputeED25519PublicKeyError, e)
    }
  }

  override fun sign(privateKey: String, data: String): String {
    try {
      val result = X25519Wrapper.sign(Base64.decode(privateKey), data.toByteArray())
      return Base64.toBase64String(result)
    } catch (e: Exception) {
      throw CryptoException(CryptoError.SignCryptoError, e)
    }
  }

  override fun verify(publicKey: String, data: String, signature: String): Boolean {
    try {
      val signatureBase = Base64.decode(signature)
      return X25519Wrapper.verify(Base64.decode(publicKey), data.toByteArray(), signatureBase)
    } catch (e: Exception) {
      throw CryptoException(CryptoError.VerifyCryptoError, e)
    }
  }
}
