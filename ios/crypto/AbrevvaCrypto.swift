import AbrevvaSDK
import CryptoKit
import CryptoSwift
import Foundation

@objc(AbrevvaCrypto)
public class AbrevvaCrypto: NSObject {
  private let X25519Impl = X25519()
  private let AesGcmImpl = AesGcm()
  private let AesCcmImpl = AesCcm()
  private let SimpleSecureRandomImpl = SimpleSecureRandom()
  private let HKDFImpl = HKDFWrapper()

  @objc func encrypt(
    _ options: NSDictionary, resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    guard let optionsSwift = options as? [String: Any] else {
      reject("Failed to convert NSDictionary to Swift dictionary", nil, nil)
      return
    }

    let key = [UInt8](hex: "0x" + (optionsSwift["key"] as? String ?? ""))
    let iv = [UInt8](hex: "0x" + (optionsSwift["iv"] as? String ?? ""))
    let adata = [UInt8](hex: "0x" + (optionsSwift["adata"] as? String ?? ""))
    let pt = [UInt8](hex: "0x" + (optionsSwift["pt"] as? String ?? ""))
    let tagLength = optionsSwift["tagLength"] as? Int ?? 0
    let ct = AesCcmImpl.encrypt(
      key: key, iv: iv, adata: adata, pt: pt, tagLength: tagLength)
    if ct.isEmpty {
      reject("encrypt failed", nil, nil)
    } else {
      resolve([
        "cipherText": [UInt8](ct[..<pt.count]).toHexString(),
        "authTag": [UInt8](ct[pt.count...]).toHexString(),
      ])
    }
  }

  @objc func decrypt(
    _ options: NSDictionary, resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    guard let optionsSwift = options as? [String: Any] else {
      reject("Failed to convert NSDictionary to Swift dictionary", nil, nil)
      return
    }

    let key = [UInt8](hex: "0x" + (optionsSwift["key"] as? String ?? ""))
    let iv = [UInt8](hex: "0x" + (optionsSwift["iv"] as? String ?? ""))
    let adata = [UInt8](hex: "0x" + (optionsSwift["adata"] as? String ?? ""))
    let ct = [UInt8](hex: "0x" + (optionsSwift["ct"] as? String ?? ""))
    let tagLength = optionsSwift["tagLength"] as? Int ?? 0

    let pt = AesCcmImpl.decrypt(
      key: key, iv: iv, adata: adata, ct: ct, tagLength: tagLength
    ).toHexString()
    if pt.isEmpty {
      reject("decrypt failed", nil, nil)
    } else {
      resolve([
        "plainText": pt,
        "authOk": true,
      ])
    }
  }

  @objc func generateKeyPair(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    let keyPair = X25519Impl.generateKeyPair()

    resolve([
      "privateKey": keyPair[0].toHexString(),
      "publicKey": keyPair[1].toHexString(),
    ])
  }

  @objc func computeSharedSecret(
    _ options: NSDictionary, resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    guard let optionsSwift = options as? [String: Any] else {
      reject("Failed to convert NSDictionary to Swift dictionary", nil, nil)
      return
    }

    let privateKeyData = Data(
      hex: "0x" + (optionsSwift["key"] as? String ?? ""))
    let publicKeyData = Data(
      hex: "0x" + (optionsSwift["peerPublicKey"] as? String ?? ""))
    let sharedSecret = X25519Impl.computeSharedSecret(
      privateKeyData: privateKeyData, publicKeyData: publicKeyData)

    resolve([
      "sharedSecret": sharedSecret?.toHexString()
    ])
  }

  @objc func encryptFile(
    _ options: NSDictionary, resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    guard let optionsSwift = options as? [String: Any] else {
      reject("Failed to convert NSDictionary to Swift dictionary", nil, nil)
      return
    }

    let sharedSecret = [UInt8](
      hex: "0x" + (optionsSwift["sharedSecret"] as? String ?? ""))
    let ptPath = optionsSwift["ptPath"] as? String ?? ""
    let ctPath = optionsSwift["ctPath"] as? String ?? ""

    let operationResult = AesGcmImpl.encryptFile(
      key: sharedSecret, pathPt: ptPath, pathCt: ctPath)
    if operationResult == false {
      reject("encryption failed", nil, nil)
    } else {
      resolve([
        "opOk": operationResult
      ])
    }
  }

  @objc func decryptFile(
    _ options: NSDictionary, resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    guard let optionsSwift = options as? [String: Any] else {
      reject("Failed to convert NSDictionary to Swift dictionary", nil, nil)
      return
    }

    let sharedSecret = [UInt8](
      hex: "0x" + (optionsSwift["sharedSecret"] as? String ?? ""))
    let ctPath = optionsSwift["ctPath"] as? String ?? ""
    let ptPath = optionsSwift["ptPath"] as? String ?? ""

    let url = URL(fileURLWithPath: ctPath)

    let data: Data
    do {
      data = try Data(contentsOf: url, options: .mappedIfSafe)
    } catch {
      debugPrint(
        "\(AbrevvaCrypto.description()): Failed to load data from file")
      return reject("Failed to load data", nil, nil)
    }

    let operationResult = AesGcmImpl.decryptFile(
      key: sharedSecret, data: data, pathPt: ptPath)
    if operationResult == false {
      reject("Encryption has failed", nil, nil)
    } else {
      resolve([
        "opOk": operationResult
      ])
    }
  }

  @objc func decryptFileFromURL(
    _ options: NSDictionary, resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    guard let optionsSwift = options as? [String: Any] else {
      reject("Failed to convert NSDictionary to Swift dictionary", nil, nil)
      return
    }

    let sharedSecret = [UInt8](
      hex: "0x" + (optionsSwift["sharedSecret"] as? String ?? ""))
    let ptPath = optionsSwift["ptPath"] as? String ?? ""

    let url = URL(string: optionsSwift["url"] as? String ?? "")

    let data: Data
    do {
      data = try Data(contentsOf: url!)
    } catch {
      debugPrint("\(AbrevvaCrypto.description()): Failed to load data from url")
      return reject("Failed to load data", nil, nil)
    }

    let operationResult = AesGcmImpl.decryptFile(
      key: sharedSecret, data: data, pathPt: ptPath)
    if operationResult == false {
      reject("Decryption has failed", nil, nil)
    } else {
      resolve([
        "opOk": operationResult
      ])
    }
  }

  @objc func random(
    _ options: NSDictionary, resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    guard let optionsSwift = options as? [String: Any] else {
      reject("Failed to convert NSDictionary to Swift dictionary", nil, nil)
      return
    }

    let numBytes = optionsSwift["numBytes"] as? Int ?? 0

    let rnd = SimpleSecureRandomImpl.random(numBytes).toHexString()
    if rnd.isEmpty {
      reject("random generation failed", nil, nil)
    } else {
      resolve([
        "value": rnd
      ])
    }
  }

  @objc func derive(
    _ options: NSDictionary, resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    guard let optionsSwift = options as? [String: Any] else {
      reject("Failed to convert NSDictionary to Swift dictionary", nil, nil)
      return
    }

    let key = [UInt8](hex: "0x" + (optionsSwift["key"] as? String ?? ""))
    let salt = [UInt8](hex: "0x" + (optionsSwift["salt"] as? String ?? ""))
    let info = [UInt8](hex: "0x" + (optionsSwift["info"] as? String ?? ""))
    let length = optionsSwift["length"] as? Int ?? 0

    let derived = HKDFImpl.derive(
      key: key, salt: salt, info: info, length: length
    ).toHexString()
    if derived.isEmpty {
      reject("derivation failed", nil, nil)
    } else {
      resolve([
        "value": derived
      ])
    }
  }
}
