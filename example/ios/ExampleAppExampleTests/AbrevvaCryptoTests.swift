import XCTest
import Quick
import Nimble
import Mockingbird
@testable import react_native_example_app
import AbrevvaSDK

class RCTPromise{
  var data: Any?
  var resolved: Bool?
  
  func resolve(data: Any){
    self.data = data
    resolved = true
  }
  func reject(_: String?,_: String?,_: Error?){
    resolved = false
  }
}
final class AbrevvaCryptoTests: QuickSpec {
  override class func spec(){
    var promise: RCTPromise?
    var cryptoModule: AbrevvaCrypto?
    
    beforeEach {
      promise = RCTPromise()
      cryptoModule = AbrevvaCrypto()
    }
    
    describe("encrypt()"){
      it("should resolve if encryption succeds"){
        let options: NSDictionary = [
          "key": "404142434445464748494a4b4c4d4e4f",
          "iv": "10111213141516",
          "adata": "0001020304050607",
          "pt": "20212223",
          "tagLength": 4,
        ]
        
        cryptoModule?.encrypt(options, resolver: promise!.resolve, rejecter: promise!.reject)
      
        expect(promise!.resolved).to(beTrue())
      }
      
      it("should reject if encryption fails"){
        cryptoModule?.encrypt([:], resolver: promise!.resolve, rejecter: promise!.reject)
      
        expect(promise!.resolved).to(beFalse())
      }
    }
    describe("decrypt()"){
      it("should resolve if decryption succeds"){
        let options: NSDictionary = [
          "key": "404142434445464748494a4b4c4d4e4f",
          "iv": "10111213141516",
          "adata": "0001020304050607",
          "ct": "7162015b4dac255d",
          "tagLength": 4,
        ]

        cryptoModule?.decrypt(options, resolver: promise!.resolve, rejecter: promise!.reject)
      
        expect(promise!.resolved).to(beTrue())
      }
      
      it("should reject if decryption fails"){
        cryptoModule!.decrypt([:], resolver: promise!.resolve, rejecter: promise!.reject)
        
        expect(promise!.resolved).to(beFalse())
      }
    }
    describe("generateKeyPair()"){
      it("should resolve with two keys"){
        cryptoModule!.generateKeyPair(promise!.resolve, rejecter: promise!.reject)
        
        expect(promise!.resolved).to(beTrue())
        let pair = promise!.data as! [String:String]
        expect(pair["privateKey"]).toNot(beNil())
        expect(pair["publicKey"]).toNot(beNil())
      }
    }
    describe("computeSharedSecret"){
      it("should resolve with a valid shared secret"){
        let options: NSDictionary = [
          "key": "0468f4f0ec2f08c558246a866ce477d903fa577373f8622e1aa2e64e2e2c456d",
          "peerPublicKey": "f764ef9667497e7bcb4cdbeb0bf86462638cf65637569a65a8b5ed23b9a79621"
        ]
        let secret = "34b78ecc79b605c85e0d995f8143990ffcee19b276fa55418c5232915c43af2c"

        cryptoModule!.computeSharedSecret(options, resolver: promise!.resolve, rejecter: promise!.reject)
        
        expect(promise!.resolved).to(beTrue())
        let data = promise!.data as! [String:String]
        expect(data["sharedSecret"]).to(equal(secret))
      }
      it("should return nil if secret cannot be computed"){
        let options: NSDictionary = [
          "key": "InvalidKey",
          "peerPublicKey": "f764ef9667497e7bcb4cdbeb0bf86462638cf65637569a65a8b5ed23b9a79621"
        ]

        cryptoModule!.computeSharedSecret(options, resolver: promise!.resolve, rejecter: promise!.reject)
        
        expect(promise!.resolved).to(beTrue())
        let data = promise!.data as! [String:String?]
        expect(data["sharedSecret"]).to(beNil())
      }
    }
    describe("encryptFile"){
      let directoryPath = "./aes_gcm_test"

      beforeEach {
         try? FileManager.default.createDirectory(atPath: directoryPath, withIntermediateDirectories: false)
        
        debugPrint(FileManager.default.currentDirectoryPath)
      }
      afterEach {
        try? FileManager.default.removeItem(atPath: directoryPath)

      }
      it("should resolve if encryption worked"){
        let options: [String : String] = [
          "sharedSecret": "feffe9928665731c6d6a8f9467308308",
          "ptPath": "\(directoryPath)/pt",
          "ctPath": "\(directoryPath)/ct"
        ]
        let pt = "feedfacedeadbeeffeedfacedeadbeef"
        FileManager.default.createFile(atPath: "\(directoryPath)/pt", contents: Data(hex: pt))

        cryptoModule!.encryptFile(options as NSDictionary, resolver: promise!.resolve, rejecter: promise!.reject)
        
        expect(promise!.resolved).to(beTrue())
      }
      it("should reject if encryption failed"){
        let options: [String : String] = [
          "sharedSecret": "",
          "ptPath": "\(directoryPath)/pt",
          "ctPath": "\(directoryPath)/ct"
        ]
        let pt = "feedfacedeadbeeffeedfacedeadbeef"
        FileManager.default.createFile(atPath: "\(directoryPath)/pt", contents: Data(hex: pt))

        cryptoModule!.encryptFile(options as NSDictionary, resolver: promise!.resolve, rejecter: promise!.reject)
        
        expect(promise!.resolved).to(beFalse())
      }
    }
    describe("decryptFile"){
      let directoryPath = "./aes_gcm_test"

      beforeEach {
        try? FileManager.default.createDirectory(atPath: directoryPath, withIntermediateDirectories: false)
      }
      afterEach {
        try? FileManager.default.removeItem(atPath: directoryPath)
      }
      it("should resolve if decryption worked"){
        let options: [String : String] = [
          "sharedSecret": "feffe9928665731c6d6a8f9467308308",
          "ptPath": "\(directoryPath)/pt",
          "ctPath": "\(directoryPath)/ct"
        ]
        let ct = "017d4aacf0a0f987d697d09c885aa9513aed2a25a1e87252038f0f7a3955b11dec43d9d7669e9910c527ee4eec719edb387ee63f8e0c2d7dcf7678fe58"
        FileManager.default.createFile(atPath: "\(directoryPath)/ct", contents: Data(hex: ct))

        cryptoModule!.decryptFile(options as NSDictionary, resolver: promise!.resolve, rejecter: promise!.reject)
        
        expect(promise!.resolved).to(beTrue())
      }
      it("should reject if decryption failed"){
        let options: NSDictionary = [
          "sharedSecret": "",
          "ptPath": "\(directoryPath)/pt",
          "ctPath": "\(directoryPath)/ct"
        ]
        let ct = "017d4aacf0a0f987d697d09c885aa9513aed2a25a1e87252038f0f7a3955b11dec43d9d7669e9910c527ee4eec719edb387ee63f8e0c2d7dcf7678fe58"
        FileManager.default.createFile(atPath: "\(directoryPath)/ct", contents: Data(hex: ct))

        cryptoModule!.decryptFile(options, resolver: promise!.resolve, rejecter: promise!.reject)
        
        expect(promise!.resolved).to(beFalse())
      }
    }
    describe("random()"){
      it("should return n random byte"){
        let options: NSDictionary = ["numBytes" : 4]
        
        cryptoModule!.random(options, resolver: promise!.resolve, rejecter: promise!.reject)
        
        expect(promise!.resolved).to(beTrue())
        let data = promise!.data as! [String:String?]
        expect((data["value"]!!).count).to(equal(8))
      }
    }
    describe("derive()"){
      it("should return a correctly derived key"){
        let options: NSDictionary = [
          "key": "0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b",
          "salt": "000102030405060708090a0b0c",
          "info": "f0f1f2f3f4f5f6f7f8f9",
          "length": 42,
        ]
        
        cryptoModule!.derive(options, resolver: promise!.resolve, rejecter: promise!.reject)
        
        expect(promise!.resolved).to(beTrue())
        let derivedKey = "3cb25f25faacd57a90434f64d0362f2a2d2d0a90cf1a5a4c5db02d56ecc4c5bf34007208d5b887185865"
        let data = promise!.data as! [String:String?]
        expect((data["value"]!!)).to(equal(derivedKey))
      }
      it("should reject on failed derivation"){
        let options: NSDictionary = [
          "key": "invalidKey",
          "salt": "000102030405060708090a0b0c",
          "info": "f0f1f2f3f4f5f6f7f8f9",
          "length": 42,
        ]
        
        cryptoModule!.derive(options, resolver: promise!.resolve, rejecter: promise!.reject)
        
        expect(promise!.resolved).to(beFalse())
      }
    }
  }
}
