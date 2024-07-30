//
//  AbrevvaBle.swift
//  react-native-abrevva
//
//  Created by Matthias on 05.03.24.
//

import Foundation
import AbrevvaSDK
import CoreBluetooth

@objc(AbrevvaBle)
public class AbrevvaBle: RCTEventEmitter {

    private var bleManager: BleManager?
    private var bleDeviceMap = [String: BleDevice]()

    @objc
    func initialize(_ options: NSDictionary , resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        self.bleManager = BleManager { success, message in
            if success {
                resolve("success")
            } else {
                reject(message!, nil, nil)
            }
        }
    }

    @objc
    func isEnabled(_  resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        guard let bleManager = self.getBleManager(reject) else { return }
        let enabled: Bool = bleManager.isBleEnabled()
        resolve(["value": enabled])
    }

    @objc
    func isLocationEnabled(_  resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        reject("isLocationEnabled(): not available on iOS", nil,nil)
    }

    @objc
    func startEnabledNotifications(_  resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        guard let bleManager = self.getBleManager(reject) else { return }
        bleManager.registerStateReceiver { enabled in
            self.sendEvent(withName: "onEnabledChanged", body: ["value": enabled])
        }
    }

    @objc
    func stopEnabledNotifications(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        guard let bleManager = self.getBleManager(reject) else { return }
        bleManager.unregisterStateReceiver()
        resolve("success")
    }

    @objc
    func openLocationSettings(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        reject("openLocationSettings(): is not available on iOS", nil, nil)
    }

    @objc
    func openBluetoothSettings(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        reject("openBluetoothSettings(): is not available on iOS", nil, nil)
    }

    @objc
    func openAppSettings(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        guard let settingsURL = URL(string: UIApplication.openSettingsURLString) else {
            reject("openAppSettings(): cannot open app settings", nil, nil)
            return
        }

        DispatchQueue.main.async {
            if UIApplication.shared.canOpenURL(settingsURL) {
                UIApplication.shared.open(settingsURL, completionHandler: { success in
                    resolve([
                        "value": success,
                    ])
                })
            } else {
                reject("openAppSettings(): cannot open app settings", nil, nil)
            }
        }
    }

    @objc
    func requestLEScan(_ options: NSDictionary , resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {

        guard let optionsSwift = options as? [String: Any] else {
            reject("Failed to convert NSDictionary to Swift dictionary", nil, nil)
            return
        }
        guard let bleManager = self.getBleManager(reject) else { return }
        let name = optionsSwift["name"] as? String ?? nil
        let namePrefix = optionsSwift["namePrefix"] as? String ?? nil
        let allowDuplicates = optionsSwift["allowDuplicates"] as? Bool ?? false
        let timeout =   optionsSwift["timeout"] as? Int ?? 0
    
        bleManager.startScan(
            name,
            namePrefix,
            allowDuplicates,
            { success in

                if success {
                    resolve("success")
                } else {
                    reject("requestLEScan(): failed to start", nil, nil)
                }
            }, { device, advertisementData, rssi in
                self.bleDeviceMap[device.getAddress()] = device
                let data = self.getScanResultDict(device, advertisementData, rssi)
                self.sendEvent(withName: "onScanResult", body: data)
            },{ address in
                self.sendEvent(withName: "onConnect", body: address)
            },{ address in
                self.sendEvent(withName: "onDisconnect", body: address)
            },
            timeout
        )
    }

    @objc
    func stopLEScan(_  resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        guard let bleManager = self.getBleManager(reject) else { return }
        bleManager.stopScan()
        resolve("success")
    }

    @objc
    func connect(_ options: NSDictionary , resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        guard self.getBleManager(reject) != nil else { return }
        guard let device = self.getDevice(options, rejecter: reject, checkConnection: false) else { return }
        
        guard let optionsSwift = options as? [String: Any] else {
            reject("Failed to convert NSDictionary to Swift dictionary", nil, nil)
            return
        }
        
        let timeout = optionsSwift["timeout"] as? Int ?? nil

        Task {
            let success = await self.bleManager!.connect(device, timeout)
            if success {
                resolve("success")
            } else {
                reject("connect(): failed to connect to device", nil, nil)
            }
        }
    }

    @objc
    func disconnect(_ options: NSDictionary , resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        guard self.getBleManager(reject) != nil else { return }
        guard let device = self.getDevice(options, rejecter: reject, checkConnection: false) else { return }

        Task {
            let success = await self.bleManager!.disconnect(device)
            if success {
                resolve("success")
            } else {
                reject("disconnect(): failed to disconnect from device", nil, nil)
            }
        }
    }

    @objc
    func read(_ options: NSDictionary , resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        guard self.getBleManager(reject) != nil else { return }
        guard let device = self.getDevice(options, rejecter: reject) else { return }
        guard let characteristic = self.getCharacteristic(options, rejecter: reject) else { return }
        
        guard let optionsSwift = options as? [String: Any] else {
            reject("Failed to convert NSDictionary to Swift dictionary", nil, nil)
            return
        }
        
        let timeout = optionsSwift["timeout"] as? Int ?? nil
        Task {
            let data = await device.read(characteristic.0, characteristic.1, timeout)
            print("done with read")
            if data != nil {
                resolve(["value": dataToString(data!)])
            } else {
                reject("read(): failed to read data", nil, nil)
            }
        }
    }

    @objc
    func write(_ options: NSDictionary , resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        guard self.getBleManager(reject) != nil else { return }
        guard let device = self.getDevice(options, rejecter: reject) else { return }
        guard let characteristic = self.getCharacteristic(options, rejecter: reject) else { return }
        
        guard let optionsSwift = options as? [String: Any] else {
            reject("Failed to convert NSDictionary to Swift dictionary", nil, nil)
            return
        }
        
        guard let value = optionsSwift["value"] as? String else {
            reject("write(): value must be provided", nil, nil)
            return
        }
        let writeType = CBCharacteristicWriteType.withoutResponse

        let timeout = optionsSwift["timeout"] as? Int ?? 10000

        Task {
            let success = await device.write(
                characteristic.0,
                characteristic.1,
                stringToData(value),
                writeType,
                timeout
            )
            if success {
                resolve("success")
            } else {
                reject("write(): failed to write data", nil, nil)
            }
        }
    }

    @objc
    func disengage(_ options: NSDictionary , resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        guard self.getBleManager(reject) != nil else { return }
        guard let device = self.getDevice(options, rejecter: reject, checkConnection: false) else { return }
        
        guard let optionsSwift = options as? [String: Any] else {
            reject("Failed to convert NSDictionary to Swift dictionary", nil, nil)
            return
        }
        
        let mobileID = optionsSwift["mobileId"] as? String ?? ""
        let mobileDeviceKey = optionsSwift["mobileDeviceKey"] as? String ?? ""
        let mobileGroupID = optionsSwift["mobileGroupId"] as? String ?? ""
        let mobileAccessData = optionsSwift["mobileAccessData"] as? String ?? ""
        let isPermanentRelease = optionsSwift["isPermanentRelease"] as? Bool ?? false
        let timeout = optionsSwift["timeout"] as? Int ?? nil

        Task {
            let status = await self.bleManager!.disengage(
                device,
                mobileID,
                mobileDeviceKey,
                mobileGroupID,
                mobileAccessData,
                isPermanentRelease,
                timeout
            )
            resolve(["value": status.rawValue])
        }
    }

    @objc
    func startNotifications(_ options: NSDictionary , resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        
        guard self.getBleManager(reject) != nil else { return }
        guard let device = self.getDevice(options, rejecter: reject) else { return }
        guard let characteristic = self.getCharacteristic(options, rejecter: reject) else { return }
        
        guard let optionsSwift = options as? [String: Any] else {
            reject("Failed to convert NSDictionary to Swift dictionary", nil, nil)
            return
        }
        let timeout = optionsSwift["timeout"] as? Int ?? nil
        Task {
            let success = await device.setNotifications(characteristic.0, characteristic.1, true, { value in
                let key =
                "notification|\(device.getAddress().lowercased())|" +
                    "\(characteristic.0.uuidString.lowercased())|" +
                    "\(characteristic.1.uuidString.lowercased())"

                if value != nil {
                    self.sendEvent(withName: key, body: ["value": dataToString(value!)])
                } else {
                    self.sendEvent(withName: key, body: nil)
                }
            }, timeout)
            if success {
                resolve("Success")
            } else {
                reject("startNotifications(): failed to start notifications", nil, nil)
            }
        }
    }

    @objc
    func stopNotifications(_ options: NSDictionary , resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        guard self.getBleManager(reject) != nil else { return }
        guard let device = self.getDevice(options, rejecter: reject) else { return }
        guard let characteristic = self.getCharacteristic(options, rejecter: reject) else { return }
        
        guard let optionsSwift = options as? [String: Any] else {
            reject("Failed to convert NSDictionary to Swift dictionary", nil, nil)
            return
        }
        
        let timeout = optionsSwift["timeout"] as? Int ?? nil

        Task {
            let success = await device.setNotifications(characteristic.0, characteristic.1, false, nil, timeout)
            if success {
                resolve("success")
            } else {
                reject("stopNotifications(): failed to stop notifications", nil, nil)
            }
        }
    }

    private func getBleManager(_ reject: @escaping RCTPromiseRejectBlock) -> BleManager? {
        guard let bleManager = self.bleManager else {
            reject("getBleManager(): not initialized", nil, nil)
            return nil
        }
        return bleManager
    }

    private func getServiceUUIDs(_ options: NSDictionary, rejector reject: @escaping RCTPromiseRejectBlock) -> [CBUUID]? {
        guard let optionsSwift = options as? [String: Any] else {
            reject("Failed to convert NSDictionary to Swift dictionary", nil, nil)
            return nil
        }
        let services = optionsSwift["services"] as? [String] ?? [] // TODO: Check if works as intended
        let serviceUUIDs = services.map { service -> CBUUID in
            return CBUUID(string: service)
        }
        return serviceUUIDs
    }

    private func getDevice(_ options: NSDictionary , rejecter reject: @escaping RCTPromiseRejectBlock, checkConnection: Bool = true) -> BleDevice? {
        guard let optionsSwift = options as? [String: Any] else {
            reject("Failed to convert NSDictionary to Swift dictionary", nil, nil)
            return nil
        }
        
        guard let deviceID = optionsSwift["deviceId"] as? String else {
            reject("getDevice(): deviceId required", nil, nil)
            return nil
        }
        guard let device = self.bleDeviceMap[deviceID] else {
            reject("getDevice(): device not found", nil, nil)
            return nil
        }
        if checkConnection {
            guard device.isConnected() else {
                reject("getDevice(): not connected to device", nil, nil)
                return nil
            }
        }
        return device
    }

    private func getCharacteristic(_ options: NSDictionary , rejecter reject: @escaping RCTPromiseRejectBlock) -> (CBUUID, CBUUID)? {

        guard let optionsSwift = options as? [String: Any] else {
            reject("Failed to convert NSDictionary to Swift dictionary", nil, nil)
            return nil
        }
                
        guard let service = optionsSwift["service"] as? String else {
            reject("getCharacteristic(): service UUID required", nil, nil)
            return nil
        }
        
        let serviceUUID = CBUUID(string: service)

        guard let characteristic = optionsSwift["characteristic"] as? String else {
            reject("getCharacteristic(): characteristic UUID required", nil, nil)
            return nil
        }
        
        let characteristicUUID = CBUUID(string: characteristic)
        return (serviceUUID, characteristicUUID)
    }

    private func getBleDeviceDict(_ device: BleDevice) -> [String: String] {
        var bleDevice = [
            "deviceId": device.getAddress(),
        ]
        if device.getName() != nil {
            bleDevice["name"] = device.getName()
        }
        return bleDevice
    }

    private func getScanResultDict(
        _ device: BleDevice,
        _ advertisementData: [String: Any],
        _ rssi: NSNumber
    ) -> [String: Any] {
        var data = [
            "device": self.getBleDeviceDict(device),
            "rssi": rssi,
            "txPower": advertisementData[CBAdvertisementDataTxPowerLevelKey] ?? 127,
            "uuids": (advertisementData[CBAdvertisementDataServiceUUIDsKey] as? [CBUUID] ?? []).map { uuid -> String in
                return CBUUIDToString(uuid)
            },
        ]

        let localName = advertisementData[CBAdvertisementDataLocalNameKey] as? String
        if localName != nil {
            data["localName"] = localName
        }

        let manufacturerData = advertisementData[CBAdvertisementDataManufacturerDataKey] as? Data
        if manufacturerData != nil {
            data["manufacturerData"] = self.getManufacturerDataDict(data: manufacturerData!)
        }

        let serviceData = advertisementData[CBAdvertisementDataServiceDataKey] as? [CBUUID: Data]
        if serviceData != nil {
            data["serviceData"] = self.getServiceDataDict(data: serviceData!)
        }
        return data
    }

    private func getManufacturerDataDict(data: Data) -> [String: String] {
        var company = 0
        var rest = ""
        for (index, byte) in data.enumerated() {
            if index == 0 {
                company += Int(byte)
            } else if index == 1 {
                company += Int(byte) * 256
            } else {
                rest += String(format: "%02hhx ", byte)
            }
        }
        return [String(company): rest]
    }

    private func getServiceDataDict(data: [CBUUID: Data]) -> [String: String] {
        var result: [String: String] = [:]
        for (key, value) in data {
            result[CBUUIDToString(key)] = dataToString(value)
        }
        return result
    }
    
    /// RCTEventEmitter
    
    var events = ["onScanResult", "onEnabledChanged"]
    open override func supportedEvents() -> [String] {
        self.events
    }
    
    @objc
    func setSupportedEvents(_ options: NSDictionary , resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        guard let optionsSwift = options as? [String: Any] else {
            return reject("setSupportedEvents(): Failed to convert NSDictionary to Swift dictionary", nil, nil)
        }
        guard let newEvents = optionsSwift["events"] as? [String] else {
            return reject("setSupportedEvents(): characteristic UUID required", nil, nil)
        }
        self.events = newEvents
        resolve(nil)
    }
}
