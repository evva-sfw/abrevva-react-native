package com.margelo.nitro.abrevvareactnative

import android.Manifest
import android.content.Intent
import android.os.Build
import android.provider.Settings
import androidx.annotation.ChecksSdkIntAtLeast
import androidx.annotation.RequiresPermission
import androidx.core.net.toUri
import com.evva.xesar.abrevva.ble.BleDeviceAdvertisementData as AbrevvaBleDeviceAdvertisementData
import com.evva.xesar.abrevva.ble.BleManager as AbrevvaBleManager
import com.evva.xesar.abrevva.disengage.DisengageStatusType as AbrevvaDisengageStatusType
import com.evva.xesar.abrevva.ble.BleWriteType
import com.evva.xesar.abrevva.ble.BleDevice as AbrevvaBleDevice

import com.evva.xesar.abrevva.util.bytesToString
import com.evva.xesar.abrevva.util.stringToBytes
import com.facebook.proguard.annotations.DoNotStrip
import com.margelo.nitro.NitroModules
import com.margelo.nitro.core.Promise
import com.margelo.nitro.core.resolved
import kotlinx.coroutines.DelicateCoroutinesApi
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch
import java.util.UUID

const val DEFAULT_TIMEOUT: Long = 10_000


@DoNotStrip
class AbrevvaBleImpl : HybridAbrevvaBleImplSpec() {
  private var manager: AbrevvaBleManager = requireNotNull(
    NitroModules.applicationContext?.let { AbrevvaBleManager(it) }
  ) { "Application context is required to initialize manager" }
  override fun initialize(androidNeverForLocation: Boolean?): Promise<Unit> {
    return Promise.resolved()
  }

  override fun isEnabled(): Boolean {
    return manager.isBleEnabled()
  }

  override fun isLocationEnabled(): Boolean {
    return manager.isLocationEnabled()
  }

  override fun startEnabledNotifications(callback: (Boolean) -> Unit) {
    manager.startBleEnabledNotifications(callback)
  }

  override fun stopEnabledNotifications() {
    manager.stopBleEnabledNotifications()
  }

  override fun openLocationSettings() {
    val intent = Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS)
    NitroModules.applicationContext!!.currentActivity!!.startActivity(intent)
  }

  override fun openBluetoothSettings() {
    val intent = Intent(Settings.ACTION_BLUETOOTH_SETTINGS)
    NitroModules.applicationContext!!.currentActivity!!.startActivity(intent)
  }

  override fun openAppSettings() {
    val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS)
    val activity = NitroModules.applicationContext!!.currentActivity!!

    intent.data = ("package:" + activity.packageName).toUri()
    activity.startActivity(intent)
  }

  private fun convertAdvertismentData(aData: AbrevvaBleDeviceAdvertisementData?): BleDeviceAdvertisementData? {
    if (aData == null) {
      return null
    }

    val mData = aData.manufacturerData

    if (mData == null) {
      return BleDeviceAdvertisementData(
        aData.rssi.toDouble(),
        aData.isConnectable,
        null
      )
    }
    val manData = BleDeviceManufacturerData(
      mData.companyIdentifier.toDouble(),
      mData.version.toDouble(),
      getComponentType(mData.componentType.toInt()),
      mData.mainFirmwareVersionMajor.toDouble(),
      mData.mainFirmwareVersionMinor.toDouble(),
      mData.mainFirmwareVersionPatch.toDouble(),
      mData.componentHAL.toString(),
      if (mData.batteryStatus) BatteryStatus.BATTERY_FULL else BatteryStatus.BATTERY_EMPTY,
      mData.mainConstructionMode,
      mData.subConstructionMode,
      mData.isOnline,
      mData.officeModeActive,
      mData.twoFactorRequired,
      mData.officeModeActive,
      mData.identifier,
      mData.subFirmwareVersionMajor?.toDouble(),
      mData.subFirmwareVersionMinor?.toDouble(),
      mData.subFirmwareVersionPatch?.toDouble(),
      mData.subComponentIdentifier
    )

    return BleDeviceAdvertisementData(
      aData.rssi.toDouble(),
      aData.isConnectable,
      manData
    )
  }

  fun getComponentType(value: Int): ComponentType {
    return ComponentType.entries.find { it.value == value } ?: ComponentType.UNKNOWN
  }

  fun getDisengageStatusType(value: com.evva.xesar.abrevva.disengage.DisengageStatusType): DisengageStatusType {
    return when (value) {
        AbrevvaDisengageStatusType.ERROR -> DisengageStatusType.ERROR
        AbrevvaDisengageStatusType.AUTHORIZED -> DisengageStatusType.AUTHORIZED
        AbrevvaDisengageStatusType.AUTHORIZED_PERMANENT_ENGAGE -> DisengageStatusType.AUTHORIZED_PERMANENT_ENGAGE
        AbrevvaDisengageStatusType.AUTHORIZED_PERMANENT_DISENGAGE -> DisengageStatusType.AUTHORIZED_PERMANENT_DISENGAGE
        AbrevvaDisengageStatusType.AUTHORIZED_BATTERY_LOW -> DisengageStatusType.AUTHORIZED_BATTERY_LOW
        AbrevvaDisengageStatusType.AUTHORIZED_OFFLINE -> DisengageStatusType.AUTHORIZED_OFFLINE
        AbrevvaDisengageStatusType.UNAUTHORIZED -> DisengageStatusType.UNAUTHORIZED
        AbrevvaDisengageStatusType.UNAUTHORIZED_OFFLINE -> DisengageStatusType.UNAUTHORIZED_OFFLINE
        AbrevvaDisengageStatusType.SIGNAL_LOCALIZATION -> DisengageStatusType.SIGNAL_LOCALIZATION
        AbrevvaDisengageStatusType.MEDIUM_DEFECT_ONLINE -> DisengageStatusType.MEDIUM_DEFECT_ONLINE
        AbrevvaDisengageStatusType.MEDIUM_BLACKLISTED -> DisengageStatusType.MEDIUM_BLACKLISTED
        AbrevvaDisengageStatusType.UNABLE_TO_CONNECT -> DisengageStatusType.UNABLE_TO_CONNECT
        AbrevvaDisengageStatusType.UNABLE_TO_SET_NOTIFICATIONS -> DisengageStatusType.UNABLE_TO_SET_NOTIFICATIONS
        AbrevvaDisengageStatusType.UNABLE_TO_READ_CHALLENGE -> DisengageStatusType.UNABLE_TO_READ_CHALLENGE
        AbrevvaDisengageStatusType.UNABLE_TO_WRITE_MDF -> DisengageStatusType.UNABLE_TO_WRITE_MDF
        AbrevvaDisengageStatusType.ACCESS_CIPHER_ERROR -> DisengageStatusType.ACCESS_CIPHER_ERROR
        AbrevvaDisengageStatusType.BLE_ADAPTER_DISABLED -> DisengageStatusType.BLE_ADAPTER_DISABLED
        AbrevvaDisengageStatusType.UNKNOWN_DEVICE -> DisengageStatusType.UNKNOWN_DEVICE
        AbrevvaDisengageStatusType.TIMEOUT -> DisengageStatusType.TIMEOUT
        AbrevvaDisengageStatusType.UNKNOWN_STATUS_CODE -> DisengageStatusType.UNKNOWN_STATUS_CODE
    }
  }

  override fun startScan(
    onScanResult: (BleDevice) -> Unit,
    onScanStart: ((Throwable?) -> Unit)?,
    onScanStop: ((Throwable?) -> Unit)?,
    macFilter: String?,
    allowDuplicates: Boolean?,
    timeout: Double?
  ) {

    manager.startScan(
      { device: AbrevvaBleDevice ->
        val bleDevice: BleDevice = BleDevice(
          device.address,
          device.localName,
          this.convertAdvertismentData(device.advertisementData)
        )
        onScanResult(bleDevice)
      },
      { success: Boolean ->
        onScanStart?.invoke(if (success) null else Throwable("ScanStartError"))
      }, { success: Boolean ->
        onScanStop?.invoke(if (success) null else Throwable("ScanStartError"))
      }, macFilter, allowDuplicates, timeoutToLongOrDefault(timeout)
    )
  }

  override fun stopScan() {
    manager.stopScan()
  }

  @RequiresPermission(Manifest.permission.BLUETOOTH_CONNECT)
  override fun connect(
    deviceId: String,
    onDisconnect: (String) -> Unit,
    timeout: Double?
  ): Promise<Boolean> {


    val bleDevice = manager.getBleDevice(deviceId)
    if (bleDevice == null) {
      return Promise.rejected(Error("connect(): device not found"))
    }

    val promise = Promise<Boolean>()

    manager.connect(
      bleDevice, { success ->
        promise.resolve(success)
      },
      { success ->
        onDisconnect(deviceId)
      },
      timeoutToLongOrDefault(timeout)
    )

    return promise
  }

  @RequiresPermission(Manifest.permission.BLUETOOTH_CONNECT)
  override fun disconnect(deviceId: String): Promise<Boolean> {

    val bleDevice = manager.getBleDevice(deviceId)
    if (bleDevice == null) {
      return Promise.rejected(Error("connect(): device not found"))
    }

    val promise = Promise<Boolean>()

    manager.disconnect(bleDevice) { success ->
      promise.resolve(success)
    }

    return promise
  }

  @OptIn(DelicateCoroutinesApi::class)
  @RequiresPermission(value = "android.permission.BLUETOOTH_CONNECT")
  override fun read(
    deviceId: String,
    service: String,
    characteristic: String,
    timeout: Double?
  ): Promise<String> {

    val bleDevice = manager.getBleDevice(deviceId)
    if (bleDevice == null) {
      return Promise.rejected(Error("connect(): device not found"))
    }

    val promise = Promise<String>()
    GlobalScope.launch {
      val data =
        bleDevice.read(
          UUID.fromString(service),
          UUID.fromString(characteristic),
          timeoutToLongOrDefault(timeout)
        )
      if (data != null) {
        promise.resolve(bytesToString(data))
      } else {
        promise.reject(Exception("read(): failed to read from device"))
      }
    }
    return promise
  }

  @OptIn(DelicateCoroutinesApi::class)
  @RequiresPermission(value = "android.permission.BLUETOOTH_CONNECT")
  override fun write(
    deviceId: String,
    service: String,
    characteristic: String,
    value: String,
    timeout: Double?
  ): Promise<Boolean> {

    val bleDevice = manager.getBleDevice(deviceId)
    if (bleDevice == null) {
      return Promise.rejected(Error("connect(): device not found"))
    }
    val promise = Promise<Boolean>()

    GlobalScope.launch {
      val success = bleDevice.write(
        UUID.fromString(service), UUID.fromString(characteristic),
        stringToBytes(value),
        BleWriteType.NO_RESPONSE,
        timeoutToLongOrDefault(timeout)
      )
      promise.resolve(success)
    }

    return promise
  }

  @RequiresPermission(Manifest.permission.BLUETOOTH_CONNECT)
  override fun signalize(deviceId: String): Promise<Boolean> {

    val bleDevice = manager.getBleDevice(deviceId)
    if (bleDevice == null) {
      return Promise.rejected(Error("connect(): device not found"))
    }
    val promise = Promise<Boolean>()

    manager.signalize(bleDevice) { success: Boolean ->
      promise.resolve(success)
    }

    return promise
  }

  @RequiresPermission(value = "android.permission.BLUETOOTH_CONNECT")
  @Deprecated("Use disengageWithXvnResponse() instead.")
  override fun disengage(
    deviceId: String,
    mobileId: String,
    mobileDeviceKey: String,
    mobileGroupId: String,
    mobileAccessData: String,
    isPermanentRelease: Boolean
  ): Promise<DisengageStatusType> {

    val bleDevice = manager.getBleDevice(deviceId)
    if (bleDevice == null) {
      return Promise.rejected(Error("connect(): device not found"))
    }
    val promise = Promise<DisengageStatusType>()

    manager.disengage(
      bleDevice,
      mobileId,
      mobileDeviceKey,
      mobileGroupId,
      mobileAccessData,
      isPermanentRelease
    )
    { status ->
      promise.resolve(getDisengageStatusType(status))
    }

    return promise
  }

  @OptIn(ExperimentalStdlibApi::class)
  @RequiresPermission(Manifest.permission.BLUETOOTH_CONNECT)
  override fun disengageWithXvnResponse(
    deviceId: String,
    mobileId: String,
    mobileDeviceKey: String,
    mobileGroupId: String,
    mobileAccessData: String,
    isPermanentRelease: Boolean
  ): Promise<XvnResponse> {
    val bleDevice = manager.getBleDevice(deviceId)
    if (bleDevice == null) {
      return Promise.rejected(Error("connect(): device not found"))
    }
    val promise = Promise<XvnResponse>()

    manager.disengageWithXvnResponse(
      bleDevice,
      mobileId,
      mobileDeviceKey,
      mobileGroupId,
      mobileAccessData,
      isPermanentRelease
    )
    { status, xvnData ->
      promise.resolve(XvnResponse(getDisengageStatusType(status), xvnData?.toHexString()))
    }

    return promise
  }

  @OptIn(DelicateCoroutinesApi::class)
  @RequiresPermission(Manifest.permission.BLUETOOTH_CONNECT)
  override fun startNotifications(
    deviceId: String,
    service: String,
    characteristic: String,
    timeout: Double,
    callback: (String) -> Unit
  ): Promise<Boolean> {

    val bleDevice = manager.getBleDevice(deviceId)
    if (bleDevice == null) {
      return Promise.rejected(Error("connect(): device not found"))
    }
    val promise = Promise<Boolean>()

    GlobalScope.launch {
      val success = bleDevice.setNotifications(
        UUID.fromString(service),
        UUID.fromString(characteristic),
        { data ->
          callback(bytesToString(data))
        },
        timeoutToLongOrDefault(timeout)
      )
      promise.resolve(success)
    }

    return promise
  }

  @OptIn(DelicateCoroutinesApi::class)
  @RequiresPermission(Manifest.permission.BLUETOOTH_CONNECT)
  override fun stopNotifications(
    deviceId: String,
    service: String,
    characteristic: String
  ): Promise<Boolean> {

    val bleDevice = manager.getBleDevice(deviceId)
    if (bleDevice == null) {
      return Promise.rejected(Error("connect(): device not found"))
    }
    val promise = Promise<Boolean>()

    GlobalScope.launch {
      val success = bleDevice.stopNotifications(
        UUID.fromString(service),
        UUID.fromString(characteristic))
      promise.resolve(success)
    }

    return promise
  }
}
