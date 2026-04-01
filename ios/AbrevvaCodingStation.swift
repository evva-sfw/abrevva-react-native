import Foundation
import AbrevvaSDK

enum AbrevvaCodingStationError: Error {
    case register(_ message: String)
    case connect(_ message: String)
    case write(_ message: String)
    case disconnect(_ message: String)
}

class AbrevvaCodingStationImpl: HybridAbrevvaCodingStationImplSpec {
  private let codingStation = CodingStation()
  private var mqttConnectionOptions: MqttConnectionOptions?
  
  func _register(url: String, clientId: String, username: String, password: String) throws -> NitroModules.Promise<Void>  {
    guard let url = URL(string: url) else {
      throw AbrevvaCodingStationError.register("failed to create URL")
    }
    
    let promise = NitroPromise<Void>()
    Task {
      do {
        mqttConnectionOptions = try await AuthManager.getMqttConfigForXS(
          url: url, clientId: clientId, username: username, password: password
        )
        promise.resolve()
      } catch {
        promise.reject(withError: error)
      }
    }
    return promise
  }
  
  func connect() throws -> NitroModules.Promise<Void> {
    if self.mqttConnectionOptions == nil {
      throw AbrevvaCodingStationError.connect("No MqttConfig set. Call register() first.")
    }
    
    let promise = NitroPromise<Void>()
    Task {
      do {
        try await codingStation.connect(mqttConnectionOptions!)
        promise.resolve()
      } catch {
        promise.reject(withError: error)
      }
    }
    return promise
  }
  
  func write() throws -> NitroModules.Promise<Void> {
    let promise = NitroPromise<Void>()
    Task {
      do {
        try await codingStation.write()
        promise.resolve()
      } catch {
        promise.reject(withError: error)
      }
    }
    return promise
  }
  
  func disconnect() throws {
    codingStation.disconnect()
  }
}
