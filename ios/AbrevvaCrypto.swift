import AbrevvaSDK
import CryptoKit
import CryptoSwift
import Foundation

private enum CryptoError: Error {
  case EncryptCryptoError
  case DecryptCryptoError
  case ComputeSharedSecretError
  case DecryptFileReadError
  case DecryptFileFromURLNetworkError
  case DecryptFileFromURLNotFoundError
  case DecryptFileFromURLInaccessibleError
  case DecryptFileFromURLNoResponseDataError
  case ComputeED25519PublicKeyError
  case SignCryptoError
}

class AbrevvaCryptoImpl: HybridAbrevvaCryptoImplSpec {
  private let X25519Impl = X25519()
  private let AesGcmImpl = AesGcm()
  private let AesCcmImpl = AesCcm()
  private let SimpleSecureRandomImpl = SimpleSecureRandom()
  private let HKDFImpl = HKDFWrapper()
  
  func encrypt(key: String, iv: String, adata: String, pt: String, tagLength: Double?) throws -> EncryptResult {
    let ct = AesCcmImpl.encrypt(
      key: [UInt8](hex: "0x" + key),
      iv: [UInt8](hex: "0x" + iv),
      adata: [UInt8](hex: "0x" + adata),
      pt: [UInt8](hex: "0x" + pt),
      tagLength: Int(tagLength ?? 0)
    )
    if ct.isEmpty {
      throw CryptoError.EncryptCryptoError
    } else {
      return EncryptResult(
        cipherText: [UInt8](ct[..<pt.count]).toHexString(),
        authTag: [UInt8](ct[pt.count...]).toHexString()
      )
    }
  }
  
  func decrypt(key: String, iv: String, adata: String, ct: String, tagLength: Double?) throws -> DecryptResult {
    
    let pt = AesCcmImpl.decrypt(
      key: [UInt8](hex: "0x" + key),
      iv: [UInt8](hex: "0x" + iv),
      adata: [UInt8](hex: "0x" + adata),
      ct: [UInt8](hex: "0x" + ct),
      tagLength: Int(tagLength ?? 0)
    ).toHexString()
    if pt.isEmpty {
      throw CryptoError.DecryptCryptoError
    } else {
      return DecryptResult(plainText: pt, authOk: true)
    }
  }
  
  func generateKeyPair() -> KeypairResult {
    let keyPair = X25519Impl.generateKeyPair()
    
    return KeypairResult(
      privateKey: keyPair[0].toHexString(),
      publicKey: keyPair[1].toHexString()
    )
  }
  
  func computeSharedSecret(key: String, peerPublicKey: String) throws -> String {
    let privateKeyData = Data(hex: "0x" + key)
    let publicKeyData = Data(hex: "0x" + peerPublicKey)
    let sharedSecret = X25519Impl.computeSharedSecret(
      privateKeyData: privateKeyData, publicKeyData: publicKeyData
    )
    if sharedSecret == nil {
      throw CryptoError.ComputeSharedSecretError
    }
    return sharedSecret!.toHexString()
  }
  
  func encryptFile(sharedSecret: String, ptPath: String, ctPath: String) -> Bool {
    let sharedSecret = [UInt8](
      hex: "0x" + sharedSecret)
    
    let operationResult = AesGcmImpl.encryptFile(
      key: sharedSecret, pathPt: ptPath, pathCt: ctPath
    )
    return operationResult
  }
  
  func decryptFile(sharedSecret: String, ptPath: String, ctPath: String) throws -> Bool {
    let sharedSecret = [UInt8](
      hex: "0x" + sharedSecret)
    
    let url = URL(fileURLWithPath: ctPath)
    
    let data: Data
    do {
      data = try Data(contentsOf: url, options: .mappedIfSafe)
    } catch {
      throw CryptoError.DecryptFileReadError
    }
    
    return AesGcmImpl.decryptFile(
      key: sharedSecret, data: data, pathPt: ptPath
    )
  }
  
    func decryptFileFromURL(sharedSecret: String, ptPath: String, url: String) throws -> NitroModules.Promise<Bool> {
        let sharedSecret = [UInt8](
            hex: "0x" + sharedSecret)
        var result: (Data, URLResponse)?
        var e: Error?
        let semaphore = DispatchSemaphore(value: 0)
        
        let promise = Promise<Bool>()
        Task {
            do {
                guard let url = URL(string: url) else {
                    throw CryptoError.DecryptFileFromURLNetworkError
                }
                result = try await URLSession.shared.data(from: url)
            } catch {
                e = error
            }
            semaphore.signal()
        }
        semaphore.wait()
        
        if e != nil {
            return Promise.rejected(withError: CryptoError.DecryptFileFromURLNetworkError)
        }
        
        guard  let httpResult = result, let httpResponse = httpResult.1 as? HTTPURLResponse else {
            return Promise.rejected(withError: CryptoError.DecryptFileFromURLNoResponseDataError)
        }
        
        if httpResponse.statusCode == 200 {
            promise.resolve(withResult: self.AesGcmImpl.decryptFile(key: sharedSecret, data: httpResult.0, pathPt: ptPath))
        } else if  httpResponse.statusCode == 404 {
            return Promise.rejected(withError: CryptoError.DecryptFileFromURLNotFoundError)
        }
        return Promise.rejected(withError: CryptoError.DecryptFileFromURLInaccessibleError)
    }
  
  func random(numBytes: Double) -> String {
    return SimpleSecureRandomImpl.random(Int(numBytes)).toHexString()
  }
  
  func derive(key: String, salt: String, info: String, length: Double) -> String {
    return HKDFImpl.derive(
      key: [UInt8](hex: "0x" + key),
      salt: [UInt8](hex: "0x" + salt),
      info: [UInt8](hex: "0x" + info),
      length: Int(length)
    ).toHexString()
  }
  
  func computeED25519PublicKey(privateKey: String) throws -> String {
    let privateKeyData = Data(base64Encoded: privateKey)
    
    if let publicKey = self.X25519Impl.computeED25519PublicKey(privateKeyData: privateKeyData!) {
      return publicKey.base64EncodedString()
    }
    throw CryptoError.ComputeED25519PublicKeyError
  }
  
  func sign(privateKey: String, data: String) throws -> String {
    let privateKeyData = Data(base64Encoded: privateKey)
    let data = data.data(using: .utf8)
    
    if let signature = self.X25519Impl.sign(privateKeyData: privateKeyData!, data: data!) {
      return signature.base64EncodedString()
    }
    throw CryptoError.SignCryptoError
  }
  
  func verify(publicKey: String, data: String, signature: String) -> Bool {
    let publicKeyData = Data(base64Encoded: publicKey)
    let data = data.data(using: .utf8)
    let signature = Data(base64Encoded: signature)
    
    return self.X25519Impl.verify(publicKeyData: publicKeyData!, data: data!, signature: signature!)
  }
}
