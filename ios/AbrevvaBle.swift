import AbrevvaSDK
import CoreBluetooth
import Foundation

typealias NitroPromise<T> = NitroModules.Promise<T>
typealias AbrevvaBleMangager = AbrevvaSDK.BleManager
typealias AbrevvaBleDevice = AbrevvaSDK.BleDevice


enum AbrevvaBleError: Error {
    case Initialize(_ message: String)
    case BleManagerNotInitialized
    case Signalize(_ message: String)
    case NotAvailableOnIos(_ message: String)
    case OpenAppSettings(_ message: String)
    case GetDevice(_ message: String)
    case Read(_ message: String)
}

class AbrevvaBleImpl: HybridAbrevvaBleImplSpec {

  
  private var bleManager: AbrevvaBleMangager?
    private var bleDeviceMap = [String: AbrevvaBleDevice]()
  
  func initialize(androidNeverForLocation: Bool?) throws -> NitroModules.Promise<Void> {
    let promise = NitroPromise<Void>()
    bleManager = AbrevvaBleMangager { success, message in
      debugPrint("bleManager init", success)

      if success {
        promise.resolve()
      } else {
        promise.reject(withError: AbrevvaBleError.Initialize(message!))
      }
    }
    return promise
  }
  
  func isEnabled() throws -> Bool {
    let bleManager = try getBleManager()
    return bleManager.isBleEnabled()
  }
  
  func isLocationEnabled() throws -> Bool  {
    throw AbrevvaBleError.NotAvailableOnIos("isLocationEnabled")
  }

  func startEnabledNotifications(callback: @escaping (Bool) -> Void) throws {
    let bleManager = try getBleManager()
    bleManager.registerStateReceiver(callback)
  }
  
  func stopEnabledNotifications() throws {
    let bleManager = try getBleManager()
    bleManager.unregisterStateReceiver()
  }
  
  func openLocationSettings() throws {
    throw AbrevvaBleError.NotAvailableOnIos("openLocationSettings")
  }
  
  func openBluetoothSettings() throws {
    throw AbrevvaBleError.NotAvailableOnIos("openBluetoothSettings")
  }
  
  func openAppSettings() throws {
    guard let settingsURL = URL(string: UIApplication.openSettingsURLString)
    else {
      throw AbrevvaBleError.OpenAppSettings("cannot open app settings")
    }
    
    let promise = NitroPromise<Bool>()
    DispatchQueue.main.async {
      if UIApplication.shared.canOpenURL(settingsURL) {
        UIApplication.shared.open(
          settingsURL,
          completionHandler: { success in
            promise.resolve(withResult: success)
          }
        )
      } else {
        promise.reject(withError: AbrevvaBleError.OpenAppSettings("cannot open app settings"))
      }
    }
  }
  
  func startScan(onScanResult: @escaping (BleDevice) -> Void, onScanStart: (((any Error)?) -> Void)?, onScanStop: (((any Error)?) -> Void)?, macFilter: String?, allowDuplicates: Bool?, timeout: Double?) throws {

    let bleManager = try getBleManager()
    self.bleDeviceMap = [:]

    bleManager.startScan(
      { device in
        self.bleDeviceMap[device.getAddress()] = device
        let bleDevice = BleDevice.init(
          deviceId: device.address,
          name: device.getName(),
          advertisementData: self.convertAdvertismentData(device.advertisementData)
        )
        onScanResult(bleDevice)
      },
      onScanStart,
      onScanStop,
      macFilter,
      allowDuplicates ?? false,
      Int(timeout ?? 10_000)
    )
  }
  
  func stopScan() throws {
    let bleManager = try getBleManager()
    bleManager.stopScan()
    
  }
  
  func connect(deviceId: String, onDisconnect: @escaping (String) -> Void, timeout: Double?) throws -> NitroModules.Promise<Bool> {
    let bleManager = try getBleManager()
    let device = try getDevice(deviceId)
    
    
    let promise = NitroPromise<Bool>()
    Task {
      let success = await bleManager.connect(
        device,
        onDisconnect,
        Int(timeout ?? 10_000)
      )
      promise.resolve(withResult: success)
    }
    return promise
  }
  
  func disconnect(deviceId: String) throws -> NitroModules.Promise<Bool> {
    let bleManager = try getBleManager()
    let device = try getDevice(deviceId)
    
    let promise = NitroPromise<Bool>()
    Task {
      let success = await bleManager.disconnect(device)
      promise.resolve(withResult: success)
    }
    return promise
  }
  
  func read(deviceId: String, service: String, characteristic: String, timeout: Double?) throws -> NitroModules.Promise<String> {
    let device = try getDevice(deviceId)
    
    let promise = NitroPromise<String>()
    Task {
      let data = await device.read(CBUUID(string: service), CBUUID(string: characteristic), Int(timeout ?? 10_000))
      if data != nil {
        promise.resolve(withResult: dataToString(data!))
      } else {
        promise.reject(withError: AbrevvaBleError.Read("failed to read data"))
      }
    }
    return promise
  }
  
  func write(deviceId: String, service: String, characteristic: String, value: String, timeout: Double?) throws -> NitroModules.Promise<Bool> {
    let device = try getDevice(deviceId)
    
    let promise = NitroPromise<Bool>()
    Task {
      let success = await device.write(
        CBUUID(string: service),
        CBUUID(string: characteristic),
        stringToData(value),
        CBCharacteristicWriteType.withoutResponse,
        Int(timeout ?? 10_000)
      )
      promise.resolve(withResult: success)
    }
    return promise
  }
  
  func signalize(deviceId: String) throws -> Promise<Bool> {
    let bleManager = try getBleManager()
    
    guard let bleDevice = bleDeviceMap[deviceId] else {
      throw AbrevvaBleError.Signalize("No BLE device with id: '\(deviceId)")
    }
    
    let promise = NitroPromise<Bool>()
    Task {
      let result = await bleManager.signalize(bleDevice)
      promise.resolve(withResult: result)
    }
    return promise
  }
  
  @available(*, deprecated, message: "Use disengageWithXvnResponse() instead.")
  func disengage(deviceId: String, mobileId: String, mobileDeviceKey: String, mobileGroupId: String, mobileAccessData: String, isPermanentRelease: Bool) throws -> NitroModules.Promise<DisengageStatusType> {
    let bleManager = try getBleManager()
    let device = try getDevice(deviceId)
    
    let promise = NitroPromise<DisengageStatusType>()
    Task {
      let status = await bleManager.disengage(
        device,
        mobileId,
        mobileDeviceKey,
        mobileGroupId,
        mobileAccessData,
        isPermanentRelease
      )
      promise.resolve(withResult: DisengageStatusType.init(fromString: status.rawValue) ?? DisengageStatusType.error)
    }
    return promise
  }
  
  func disengageWithXvnResponse(deviceId: String, mobileId: String, mobileDeviceKey: String, mobileGroupId: String, mobileAccessData: String, isPermanentRelease: Bool) throws -> Promise<XvnResponse> {
    let bleManager = try getBleManager()
    let device = try getDevice(deviceId)
    
    let promise = NitroPromise<XvnResponse>()
    Task {
      let response = await bleManager.disengageWithXvnResponse(
        device,
        mobileId,
        mobileDeviceKey,
        mobileGroupId,
        mobileAccessData,
        isPermanentRelease
      )
      let xvnData = response.1?.toHexString() ?? nil
      let disengageStatusType = DisengageStatusType(fromString: response.0.rawValue) ?? DisengageStatusType.error
      
      promise.resolve(withResult: XvnResponse(disengageStatusType: disengageStatusType, xvnData: xvnData))
    }
    return promise
  }
  
  func startNotifications(deviceId: String, service: String, characteristic: String, timeout: Double, callback: @escaping (String) -> Void) throws -> NitroModules.Promise<Bool> {
    let device = try getDevice(deviceId)
    
    let promise = NitroPromise<Bool>()
    
    Task {
      let success = await device.setNotifications(
        CBUUID(string: service),
        CBUUID(string: characteristic),
        true,
        { value in
          if value != nil {
            callback(dataToString(value!))
          }
        }, Int(timeout)
      )
      promise.resolve(withResult: success)
    }
    return promise
  }
  
  func stopNotifications(deviceId: String, service: String, characteristic: String) throws -> NitroModules.Promise<Bool> {
    let device = try getDevice(deviceId)
    
    let promise = NitroPromise<Bool>()
    
    Task {
      let success = await device.setNotifications(
        CBUUID(string: service),
        CBUUID(string: characteristic),
        false,
        nil,
      )
      promise.resolve(withResult: success)
    }
    return promise
  }
  
  private func getBleManager() throws -> BleManager {
    guard let bleManager = self.bleManager else {
      throw AbrevvaBleError.BleManagerNotInitialized
    }
    return bleManager
  }
  
  private func getDevice(
    _ deviceId: String,
    checkConnection: Bool = true
  ) throws -> AbrevvaSDK.BleDevice {
    
    guard let device = bleDeviceMap[deviceId] else {
      throw AbrevvaBleError.GetDevice("No BLE device with id: '\(deviceId)")
    }
    if checkConnection {
      guard device.isConnected() else {
        throw AbrevvaBleError.GetDevice("not connected to BLE device with id: '\(deviceId)")
      }
    }
    return device
  }
  
  private func convertAdvertismentData(_ data: AbrevvaSDK.BleDeviceAdvertisementData?) -> margelo.nitro.abrevvareactnative.BleDeviceAdvertisementData? {
    guard let aData = data else  { return nil }
    
    
    guard let mData = aData.manufacturerData else { return
      BleDeviceAdvertisementData.init(
        rssi: Double(aData.rssi),
        isConnectable: aData.isConnectable,
        manufacturerData: nil,
      )
    }

    let manData = BleDeviceManufacturerData.init(
      companyIdentifier: Double(mData.companyIdentifier),
      version: Double(mData.version),
      componentType:ComponentType.init(rawValue: Int32(mData.componentType)),
      mainFirmwareVersionMajor: Double(mData.mainFirmwareVersionMajor),
      mainFirmwareVersionMinor: Double(mData.mainFirmwareVersionMinor),
      mainFirmwareVersionPatch: Double(mData.mainFirmwareVersionPatch),
      componentHAL: String(mData.componentHAL),
      batteryStatus: BatteryStatus.init(rawValue: mData.batteryStatus ? 1 : 0),
      mainConstructionMode: mData.mainConstructionMode,
      subConstructionMode: mData.subConstructionMode,
      isOnline: mData.isOnline,
      officeModeEnabled: mData.officeModeActive,
      twoFactorRequired: mData.twoFactorRequired,
      officeModeActive: mData.officeModeActive,
      identifier: mData.identifier,
      subFirmwareVersionMajor: Double(mData.subFirmwareVersionMajor ?? 0),
      subFirmwareVersionMinor: Double(mData.subFirmwareVersionMinor ?? 0),
      subFirmwareVersionPatch: Double(mData.subFirmwareVersionPatch ?? 0),
      subComponentIdentifier: mData.subComponentIdentifier,
    )
    
    return BleDeviceAdvertisementData.init(
      rssi: Double(aData.rssi),
      isConnectable: aData.isConnectable,
      manufacturerData: manData,
    )
  }
}
