//
//  AbrevvaBle.swift
//  react-native-abrevva
//
//  Created by Matthias on 05.03.24.
//

import AbrevvaSDK
import CoreBluetooth
import Foundation

@objc(AbrevvaBle)
public class AbrevvaBle: RCTEventEmitter {
    private var bleManager: BleManager?
    private var bleDeviceMap = [String: BleDevice]()

    @objc
    func initialize(
        _: NSDictionary, resolver resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        bleManager = BleManager { success, message in
            if success {
                resolve("success")
            } else {
                reject(message!, nil, nil)
            }
        }
    }

    @objc
    func isEnabled(
        _ resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        guard let bleManager = getBleManager(reject) else { return }
        let enabled: Bool = bleManager.isBleEnabled()
        resolve(["value": enabled])
    }

    @objc
    func isLocationEnabled(
        _: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        reject("isLocationEnabled(): not available on iOS", nil, nil)
    }

    @objc
    func startEnabledNotifications(
        _ resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        guard let bleManager = getBleManager(reject) else { return }
        bleManager.registerStateReceiver { enabled in
            debugPrint("REACHED CALLBACK")
            self.sendEvent(withName: "onEnabledChanged", body: ["value": enabled])
        }
        resolve(nil)
    }

    @objc
    func stopEnabledNotifications(
        _ resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        guard let bleManager = getBleManager(reject) else { return }
        bleManager.unregisterStateReceiver()
        resolve("success")
    }

    @objc
    func openLocationSettings(
        _: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        reject("openLocationSettings(): is not available on iOS", nil, nil)
    }

    @objc
    func openBluetoothSettings(
        _: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        reject("openBluetoothSettings(): is not available on iOS", nil, nil)
    }

    @objc
    func openAppSettings(
        _ resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        guard let settingsURL = URL(string: UIApplication.openSettingsURLString)
        else {
            reject("openAppSettings(): cannot open app settings", nil, nil)
            return
        }

        DispatchQueue.main.async {
            if UIApplication.shared.canOpenURL(settingsURL) {
                UIApplication.shared.open(
                    settingsURL,
                    completionHandler: { success in
                        resolve([
                            "value": success,
                        ])
                    }
                )
            } else {
                reject("openAppSettings(): cannot open app settings", nil, nil)
            }
        }
    }

    @objc
    func startScan(
        _ options: NSDictionary, resolver _: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        guard let optionsSwift = options as? [String: Any] else {
            reject("Failed to convert NSDictionary to Swift dictionary", nil, nil)
            return
        }
        guard let bleManager = getBleManager(reject) else { return }
        let macFilter = optionsSwift["macFilter"] as? String ?? nil
        let allowDuplicates = optionsSwift["allowDuplicates"] as? Bool ?? false
        let timeout = optionsSwift["timeout"] as? Int ?? 10000

        bleManager.startScan(
            { device in
                self.bleDeviceMap[device.getAddress()] = device
                self.sendEvent(
                    withName: "onScanResult", body: self.getAdvertismentData(device)
                )
            },
            { error in
                self.sendEvent(withName: "onScanStart", body: error == nil)
            },
            { error in
                self.sendEvent(withName: "onScanStop", body: error == nil)
            },
            macFilter,
            allowDuplicates,
            timeout
        )
    }

    @objc
    func stopScan(
        _ resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        guard let bleManager = getBleManager(reject) else { return }
        bleManager.stopScan()
        resolve(["value": "success"])
    }

    @objc
    func signalize(
        _ options: NSDictionary, resolver resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) async {
        guard let optionsSwift = options as? [String: Any] else {
            return reject(
                "Failed to convert NSDictionary to Swift dictionary", nil, nil
            )
        }

        guard let deviceID = optionsSwift["deviceId"] as? String else {
            return reject("signalize(): deviceId required", nil, nil)
        }
        guard let bleDevice = bleDeviceMap[deviceID] else {
            return reject("signalize(): deviceId doesnt exist", nil, nil)
        }

        await resolve(["value": bleManager?.signalize(bleDevice)])
    }

    @objc
    func connect(
        _ options: NSDictionary, resolver resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        guard getBleManager(reject) != nil else { return }
        guard
            let device = getDevice(
                options, rejecter: reject, checkConnection: false
            )
        else { return }

        guard let optionsSwift = options as? [String: Any] else {
            reject("Failed to convert NSDictionary to Swift dictionary", nil, nil)
            return
        }

        let timeout = optionsSwift["timeout"] as? Int ?? 10000
        Task {
            let success = await self.bleManager!.connect(
                device,
                { address in
                    self.sendEvent(
                        withName: "onDisconnect|\(address)", body: ["address": address]
                    )
                },
                timeout
            )
            resolve(["value": success])
        }
    }

    @objc
    func disconnect(
        _ options: NSDictionary, resolver resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        guard getBleManager(reject) != nil else { return }
        guard
            let device = getDevice(
                options, rejecter: reject, checkConnection: false
            )
        else { return }

        Task {
            let success = await self.bleManager!.disconnect(device)
            if success {
                resolve(["value": success])
            } else {
                reject("disconnect(): failed to disconnect from device", nil, nil)
            }
        }
    }

    @objc
    func read(
        _ options: NSDictionary, resolver resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        guard getBleManager(reject) != nil else { return }
        guard let device = getDevice(options, rejecter: reject) else { return }
        guard let characteristic = getCharacteristic(options, rejecter: reject)
        else { return }

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
    func write(
        _ options: NSDictionary, resolver resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        guard getBleManager(reject) != nil else { return }
        guard let device = getDevice(options, rejecter: reject) else { return }
        guard let characteristic = getCharacteristic(options, rejecter: reject)
        else { return }

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
                resolve(["value": "success"])
            } else {
                reject("write(): failed to write data", nil, nil)
            }
        }
    }

    @objc
    func disengage(
        _ options: NSDictionary, resolver resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        guard getBleManager(reject) != nil else { return }
        guard
            let device = getDevice(
                options, rejecter: reject, checkConnection: false
            )
        else { return }

        guard let optionsSwift = options as? [String: Any] else {
            reject("Failed to convert NSDictionary to Swift dictionary", nil, nil)
            return
        }

        let mobileID = optionsSwift["mobileId"] as? String ?? ""
        let mobileDeviceKey = optionsSwift["mobileDeviceKey"] as? String ?? ""
        let mobileGroupID = optionsSwift["mobileGroupId"] as? String ?? ""
        let mobileAccessData = optionsSwift["mobileAccessData"] as? String ?? ""
        let isPermanentRelease =
            optionsSwift["isPermanentRelease"] as? Bool ?? false

        Task {
            let status = await self.bleManager!.disengage(
                device,
                mobileID,
                mobileDeviceKey,
                mobileGroupID,
                mobileAccessData,
                isPermanentRelease,
            )
            resolve(["value": status.rawValue])
        }
    }

    @objc
    func startNotifications(
        _ options: NSDictionary, resolver resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        guard getBleManager(reject) != nil else { return }
        guard let device = getDevice(options, rejecter: reject) else { return }
        guard let characteristic = getCharacteristic(options, rejecter: reject)
        else { return }

        guard let optionsSwift = options as? [String: Any] else {
            reject("Failed to convert NSDictionary to Swift dictionary", nil, nil)
            return
        }
        let timeout = optionsSwift["timeout"] as? Int ?? nil
        Task {
            let success = await device.setNotifications(
                characteristic.0, characteristic.1, true,
                { value in
                    let key =
                        "notification|\(device.getAddress().lowercased())|"
                            + "\(characteristic.0.uuidString.lowercased())|"
                            + "\(characteristic.1.uuidString.lowercased())"

                    if value != nil {
                        self.sendEvent(withName: key, body: ["value": dataToString(value!)])
                    } else {
                        self.sendEvent(withName: key, body: nil)
                    }
                }, timeout
            )
            if success {
                resolve(["value": "Success"])
            } else {
                reject("startNotifications(): failed to start notifications", nil, nil)
            }
        }
    }

    @objc
    func stopNotifications(
        _ options: NSDictionary, resolver resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        guard getBleManager(reject) != nil else { return }
        guard let device = getDevice(options, rejecter: reject) else { return }
        guard let characteristic = getCharacteristic(options, rejecter: reject)
        else { return }

        guard let optionsSwift = options as? [String: Any] else {
            reject("Failed to convert NSDictionary to Swift dictionary", nil, nil)
            return
        }

        let timeout = optionsSwift["timeout"] as? Int ?? nil

        Task {
            let success = await device.setNotifications(
                characteristic.0, characteristic.1, false, nil, timeout
            )
            if success {
                resolve(["value": "success"])
            } else {
                reject("stopNotifications(): failed to stop notifications", nil, nil)
            }
        }
    }

    private func getAdvertismentData(
        _ device: BleDevice
    ) -> [String: Any?] {
        var bleDeviceData: [String: Any?] = [
            "deviceId": device.getAddress(),
            "name": device.getName(),
            "raw": device.advertisementData?.rawData,
        ]

        var advertismentData: [String: Any?] = [
            "rssi": device.advertisementData?.rssi,
        ]
        if let isConnectable = device.advertisementData?.isConnectable {
            advertismentData["isConnectable"] = isConnectable
        }

        guard let mfData = device.advertisementData?.manufacturerData else {
            bleDeviceData["advertisementData"] = advertismentData
            return bleDeviceData
        }

        let manufacturerData: [String: Any?] = [
            "companyIdentifier": mfData.companyIdentifier,
            "version": mfData.version,
            "mainFirmwareVersionMajor": mfData.mainFirmwareVersionMajor,
            "mainFirmwareVersionMinor": mfData.mainFirmwareVersionMinor,
            "mainFirmwareVersionPatch": mfData.mainFirmwareVersionPatch,
            "componentHAL": mfData.componentHAL,
            "batteryStatus": mfData.batteryStatus ? "battery-full" : "battery-empty",
            "mainConstructionMode": mfData.mainConstructionMode,
            "subConstructionMode": mfData.subConstructionMode,
            "isOnline": mfData.isOnline,
            "officeModeEnabled": mfData.officeModeEnabled,
            "twoFactorRequired": mfData.twoFactorRequired,
            "officeModeActive": mfData.officeModeActive,
            "identifier": mfData.identifier,
            "subFirmwareVersionMajor": mfData.subFirmwareVersionMajor,
            "subFirmwareVersionMinor": mfData.subFirmwareVersionMinor,
            "subFirmwareVersionPatch": mfData.subFirmwareVersionPatch,
            "subComponentIdentifier": mfData.subComponentIdentifier,
            "componentType": getComponentType(mfData.componentType),
        ]

        advertismentData["manufacturerData"] = manufacturerData
        bleDeviceData["advertisementData"] = advertismentData
        return bleDeviceData
    }

    private func getComponentType(_ componentType: UInt8) -> String {
        switch componentType {
        case 98:
            "escutcheon"
        case 100:
            "handle"
        case 105:
            "iobox"
        case 109:
            "emzy"
        case 119:
            "wallreader"
        case 122:
            "cylinder"
        default:
            "unkown"
        }
    }

    private func getBleManager(_ reject: @escaping RCTPromiseRejectBlock)
        -> BleManager?
    {
        guard let bleManager else {
            reject("getBleManager(): not initialized", nil, nil)
            return nil
        }
        return bleManager
    }

    private func getServiceUUIDs(
        _ options: NSDictionary, rejector reject: @escaping RCTPromiseRejectBlock
    ) -> [CBUUID]? {
        guard let optionsSwift = options as? [String: Any] else {
            reject("Failed to convert NSDictionary to Swift dictionary", nil, nil)
            return nil
        }
        let services = optionsSwift["services"] as? [String] ?? []
        let serviceUUIDs = services.map { service -> CBUUID in
            return CBUUID(string: service)
        }
        return serviceUUIDs
    }

    private func getDevice(
        _ options: NSDictionary, rejecter reject: @escaping RCTPromiseRejectBlock,
        checkConnection: Bool = true
    ) -> BleDevice? {
        guard let optionsSwift = options as? [String: Any] else {
            reject("Failed to convert NSDictionary to Swift dictionary", nil, nil)
            return nil
        }

        guard let deviceID = optionsSwift["deviceId"] as? String else {
            reject("getDevice(): deviceId required", nil, nil)
            return nil
        }
        guard let device = bleDeviceMap[deviceID] else {
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

    private func getCharacteristic(
        _ options: NSDictionary, rejecter reject: @escaping RCTPromiseRejectBlock
    ) -> (CBUUID, CBUUID)? {
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

    /// RCTEventEmitter

    var events: [String] = []
    override open func supportedEvents() -> [String] {
        events
    }

    @objc
    func setSupportedEvents(
        _ options: NSDictionary, resolver resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        guard let optionsSwift = options as? [String: Any] else {
            return reject(
                "setSupportedEvents(): Failed to convert NSDictionary to Swift dictionary",
                nil, nil
            )
        }
        guard let newEvents = optionsSwift["events"] as? [String] else {
            return reject(
                "setSupportedEvents(): provide events as [String]", nil, nil
            )
        }
        events = newEvents
        resolve(nil)
    }
}
