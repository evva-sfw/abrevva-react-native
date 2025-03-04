import Foundation
import AbrevvaSDK

@objc(AbrevvaCodingStation)
public class AbrevvaCodingStation: NSObject {
    private let codingStation = CodingStation()
    private var mqttConnectionOptions: MqttConnectionOptions?

    @objc func register(
        _ options: NSDictionary, resolver resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        guard let args = options as? [String: Any] else {
            return reject("Failed to convert NSDictionary to Swift dictionary", nil, nil)
        }

        guard let url = URL(string: args["url"] as? String ?? "") else {
            return reject( "register(): failed to create URL", nil, nil)
        }
        let clientId = args["clientId"] as? String ?? ""
        let username = args["username"] as? String ?? ""
        let password = args["password"] as? String ?? ""
        Task {
            do {
                mqttConnectionOptions = try await AuthManager.getMqttConfigForXS(
                    url: url, clientId: clientId, username: username, password: password
                )
                resolve(true)
            } catch {
                reject("getMqttConfigForXS(): \(error)", nil, nil)
            }
        }
    }

    @objc func connect(
        _ resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        if self.mqttConnectionOptions == nil {
            return reject("connect(): No MqttConfig set. Call register() first.", nil, nil)
        }
        Task {
            do {
                try await codingStation.connect(mqttConnectionOptions!)
                resolve(true)
            } catch {
                reject("connect(): \(error)", nil, nil)
            }
        }
    }

    @objc func write(
        _ resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        Task {
            do {
                try await codingStation.write()
                resolve(true)
            } catch {
                reject("write(): \(error)", nil, nil)
            }
        }
    }

    @objc func disconnect(
        _ resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        codingStation.disconnect()
        resolve(true)
    }
}
