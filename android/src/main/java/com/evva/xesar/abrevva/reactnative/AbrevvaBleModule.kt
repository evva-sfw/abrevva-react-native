package com.evva.xesar.abrevva.reactnative

import android.annotation.SuppressLint
import android.content.Intent
import android.os.Build
import android.provider.Settings
import androidx.annotation.RequiresPermission
import com.evva.xesar.abrevva.ble.BleDevice
import com.evva.xesar.abrevva.ble.BleManager
import com.evva.xesar.abrevva.ble.BleWriteType
import com.evva.xesar.abrevva.disengage.DisengageStatusType
import com.evva.xesar.abrevva.util.bytesToString
import com.evva.xesar.abrevva.util.stringToBytes
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import kotlinx.coroutines.DelicateCoroutinesApi
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch
import java.util.UUID
import androidx.core.net.toUri

class AbrevvaBleModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private var manager: BleManager = BleManager(reactContext)

    @ReactMethod
    fun checkSdkVersion(promise: Promise) {
        promise.resolve(Build.VERSION.SDK_INT >= Build.VERSION_CODES.S)
    }

    @ReactMethod
    fun isEnabled(promise: Promise) {
        val result = Arguments.createMap()
        result.putBoolean("value", manager.isBleEnabled())

        promise.resolve(result)
    }

    @ReactMethod
    fun isLocationEnabled(promise: Promise) {
        val result = Arguments.createMap()
        result.putBoolean("value", manager.isLocationEnabled())

        promise.resolve(result)
    }

    @ReactMethod
    fun startEnabledNotifications(promise: Promise) {
        val success = manager.startBleEnabledNotifications { enabled: Boolean ->
            val result = Arguments.createMap()
            result.putBoolean("value", enabled)
            reactApplicationContext.emitDeviceEvent("onEnabledChanged", result)
        }

        if (!success) {
            return promise.reject(Exception("startEnabledNotifications(): Failed to set handler"))
        }
        promise.resolve("success")
    }

    @ReactMethod
    fun stopEnabledNotifications(promise: Promise) {
        manager.stopBleEnabledNotifications()

        promise.resolve("success")
    }

    @ReactMethod
    fun openLocationSettings(promise: Promise) {
        val intent = Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS)
        this.currentActivity!!.startActivity(intent)

        promise.resolve("success")
    }

    @ReactMethod
    fun openBluetoothSettings(promise: Promise) {
        val intent = Intent(Settings.ACTION_BLUETOOTH_SETTINGS)
        this.currentActivity!!.startActivity(intent)

        promise.resolve("success")
    }

    @ReactMethod
    fun openAppSettings(promise: Promise) {
        val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS)
        intent.data = ("package:" + currentActivity!!.packageName).toUri()

        currentActivity!!.startActivity(intent)

        promise.resolve("success")
    }

    @ReactMethod
    fun startScan(options: ReadableMap, promise: Promise) {
        var timeout: Long = 10000
        try {
            timeout = options.getDouble("timeout").toLong()
        } catch (_: Exception) {
        }

        val macFilter: String? = options.getString("macFilter")
        val allowDuplicates: Boolean = options.getBoolean("allowDuplicates")
        
        this.manager.startScan(
            { device: BleDevice ->
                reactApplicationContext.emitDeviceEvent("onScanResult", getBleDeviceData(device))
            },
            { success ->
                val ret = Arguments.createMap()
                ret.putBoolean("value", success)
                reactApplicationContext.emitDeviceEvent("onScanStart", ret)
            }, { success ->
                val ret = Arguments.createMap()
                ret.putBoolean("value", success)
                reactApplicationContext.emitDeviceEvent("onScanStop", ret)
            },
            macFilter,
            allowDuplicates,
            timeout
        )
        promise.resolve(null)
    }

    @ReactMethod
    fun stopScan(promise: Promise) {
        manager.stopScan()
        promise.resolve(null)
    }

    @ReactMethod
    @RequiresPermission(value = "android.permission.BLUETOOTH_CONNECT")
    fun connect(options: ReadableMap, promise: Promise) {
        val deviceId: String = options.getString("deviceId") ?: ""
        var timeout: Long = 10000
        try {
            timeout = options.getDouble("timeout").toLong()
        } catch (_: Exception) {
        }

        val bleDevice = manager.getBleDevice(deviceId) ?: run {
            return promise.reject(Exception("connect(): device not found"))
        }

        manager.connect(
            bleDevice,
            { success ->
                if (success) {
                    val ret = Arguments.createMap()
                    ret.putBoolean("value", true)
                    promise.resolve(ret)
                } else {
                    promise.reject(Exception("connect(): failed to connect"))
                }
            },
            { success ->
                if (success) {
                    val ret = Arguments.createMap()
                    ret.putString("address", deviceId)
                    reactApplicationContext.emitDeviceEvent("onDisconnect|${deviceId}", ret)
                } else {
                    promise.reject(Exception("connect(): disconnect error"))
                }
            },
            timeout
        )
        promise.resolve(null)
    }

    @ReactMethod
    @RequiresPermission(value = "android.permission.BLUETOOTH_CONNECT")
    fun disconnect(options: ReadableMap, promise: Promise) {
        val deviceId = options.getString("deviceId") ?: ""
        val bleDevice = manager.getBleDevice(deviceId) ?: run {
            return promise.reject(Exception("disconnect(): device not found"))
        }

        manager.disconnect(bleDevice) { success: Boolean ->
            if (success) {
                val ret = Arguments.createMap()
                ret.putBoolean("value", true)
                promise.resolve(ret)
            } else {
                promise.reject(Exception("disconnect(): failed to disconnect"))
            }
        }
    }

    @OptIn(DelicateCoroutinesApi::class)
    @ReactMethod
    @RequiresPermission(value = "android.permission.BLUETOOTH_CONNECT")
    fun read(options: ReadableMap, promise: Promise) {
        val deviceId = options.getString("deviceId") ?: ""
        var timeout: Long = 10000
        try {
            timeout = options.getDouble("timeout").toLong()
        } catch (_: Exception) {
        }
        val bleDevice = manager.getBleDevice(deviceId) ?: run {
            return promise.reject(Exception("connect(): device not found"))
        }
        val characteristic = getCharacteristic(options, promise)
            ?: return promise.reject(Exception("read(): bad characteristic"))
        GlobalScope.launch {
            val data = bleDevice.read(characteristic.first, characteristic.second, timeout)
            if (data != null) {
                val ret = Arguments.createMap()
                ret.putString("value", bytesToString(data))
                promise.resolve(ret)
            } else {
                promise.reject(Exception("read(): failed to read from device"))
            }
        }
    }

    @OptIn(DelicateCoroutinesApi::class)
    @ReactMethod
    @RequiresPermission(value = "android.permission.BLUETOOTH_CONNECT")
    fun write(options: ReadableMap, promise: Promise) {
        val deviceId = options.getString("deviceId") ?: ""
        var timeout: Long = 10000
        try {
            timeout = options.getDouble("timeout").toLong()
        } catch (_: Exception) {
        }
        val characteristic =
            getCharacteristic(options, promise)
                ?: return promise.reject(Exception("read(): bad characteristic"))
        val value =
            options.getString("value")
                ?: return promise.reject(Exception("write(): missing value for write"))
        val bleDevice = manager.getBleDevice(deviceId) ?: run {
            return promise.reject(Exception("connect(): device not found"))
        }
        GlobalScope.launch {
            val success = bleDevice.write(
                characteristic.first,
                characteristic.second,
                stringToBytes(value),
                BleWriteType.NO_RESPONSE,
                timeout
            )
            if (success) {
                promise.resolve("success")
            } else {
                promise.reject(Exception("write(): failed to write to device"))
            }
        }
    }

    @SuppressLint("MissingPermission")
    @ReactMethod
    fun signalize(options: ReadableMap, promise: Promise) {
        val deviceId = options.getString("deviceId") ?: ""
        val bleDevice = manager.getBleDevice(deviceId) ?: run {
            return promise.reject(Exception("connect(): device not found"))
        }
        manager.signalize(bleDevice) { success: Boolean ->
            if (success) {
                promise.resolve("success")
            } else {
                promise.reject(Exception("signalize() failed"))
            }
        }
    }

    @ReactMethod
    @RequiresPermission(value = "android.permission.BLUETOOTH_CONNECT")
    fun disengage(options: ReadableMap, promise: Promise) {
        val deviceId = options.getString("deviceId") ?: ""
        val mobileId = options.getString("mobileId") ?: ""
        val mobileDeviceKey = options.getString("mobileDeviceKey") ?: ""
        val mobileGroupId = options.getString("mobileGroupId") ?: ""
        val mobileAccessData = options.getString("mobileAccessData") ?: ""
        var isPermanentRelease = false
        try {
            isPermanentRelease = options.getBoolean("isPermanentRelease")
        } catch (_: Exception) {
        }
        val bleDevice = manager.getBleDevice(deviceId) ?: run {
            return promise.reject(Exception("connect(): device not found"))
        }
        manager.disengage(
            bleDevice,
            mobileId,
            mobileDeviceKey,
            mobileGroupId,
            mobileAccessData,
            isPermanentRelease
        ) { status: DisengageStatusType ->
            val ret = Arguments.createMap()
            ret.putString("value", status.toString())
            promise.resolve(ret)
        }
    }

    @OptIn(DelicateCoroutinesApi::class)
    @ReactMethod
    @RequiresPermission(value = "android.permission.BLUETOOTH_CONNECT")
    fun startNotifications(options: ReadableMap, promise: Promise) {
        val deviceId = options.getString("deviceId") ?: ""
        val characteristic =
            getCharacteristic(options, promise)
                ?: return promise.reject(Exception("startNotifications(): bad characteristic"))
        val bleDevice = manager.getBleDevice(deviceId) ?: run {
            return promise.reject(Exception("connect(): device not found"))
        }

        GlobalScope.launch {
            val success = bleDevice.setNotifications(
                characteristic.first,
                characteristic.second, { data ->
                    val key =
                        "notification|${deviceId}|${(characteristic.first)}|${(characteristic.second)}"
                    val ret = Arguments.createMap()

                    ret.putString("value", bytesToString(data))
                    reactApplicationContext.emitDeviceEvent(key, ret)
                })
            if (success) {
                val ret = Arguments.createMap()
                ret.putString("value", "success")
                promise.resolve(ret)
            } else {
                promise.reject(Exception("startNotifications(): failed to set notifications"))
            }
        }
    }

    @OptIn(DelicateCoroutinesApi::class)
    @ReactMethod
    @RequiresPermission(value = "android.permission.BLUETOOTH_CONNECT")
    fun stopNotifications(options: ReadableMap, promise: Promise) {
        val deviceId = options.getString("deviceId") ?: ""
        val characteristic =
            getCharacteristic(options, promise)
                ?: return promise.reject(Exception("stopNotifications(): bad characteristic"))
        val bleDevice = manager.getBleDevice(deviceId) ?: run {
            return promise.reject(Exception("connect(): device not found"))
        }
        GlobalScope.launch {
            val success = bleDevice.stopNotifications(characteristic.first, characteristic.second)
            if (success) {
                val ret = Arguments.createMap()
                ret.putString("value", "success")
                promise.resolve(ret)
            } else {
                promise.reject(Exception("stopNotifications(): failed to unset notifications"))
            }
        }
    }

    private fun getCharacteristic(options: ReadableMap, promise: Promise): Pair<UUID, UUID>? {
        val serviceString = options.getString("service")
        val serviceUUID: UUID?

        try {
            serviceUUID = UUID.fromString(serviceString)
        } catch (e: IllegalArgumentException) {
            promise.reject(Exception("getCharacteristic(): invalid service uuid"))
            return null
        }

        if (serviceUUID == null) {
            promise.reject(Exception("getCharacteristic(): service uuid required"))
            return null
        }

        val characteristicString = options.getString("characteristic")
        val characteristicUUID: UUID?

        try {
            characteristicUUID = UUID.fromString(characteristicString)
        } catch (e: IllegalArgumentException) {
            promise.reject(Exception("getCharacteristic(): invalid characteristic uuid"))
            return null
        }

        if (characteristicUUID == null) {
            promise.reject(Exception("getCharacteristic(): characteristic uuid required"))
            return null
        }

        return Pair(serviceUUID, characteristicUUID)
    }

    private fun getBleDeviceData(device: BleDevice): ReadableMap {
        val bleDeviceData = Arguments.createMap()

        bleDeviceData.putString("deviceId", device.address)
        bleDeviceData.putString("name", device.localName)

        val advertisementData = Arguments.createMap()
        device.advertisementData?.let {
            advertisementData.putInt("rssi", it.rssi)
            advertisementData.putBoolean("isConnectable", it.isConnectable == true)

            val manufacturerData = Arguments.createMap()
            it.manufacturerData?.let { data ->
                manufacturerData.putInt("companyIdentifier", data.companyIdentifier.toInt())
                manufacturerData.putInt("version", data.version.toInt())
                manufacturerData.putString(
                    "componentType",
                    when (data.componentType.toInt()) {
                        98 -> "escutcheon"
                        100 -> "handle"
                        105 -> "iobox"
                        109 -> "emzy"
                        119 -> "wallreader"
                        122 -> "cylinder"
                        else -> "unknown"
                    }
                )
                manufacturerData.putInt(
                    "mainFirmwareVersionMajor",
                    data.mainFirmwareVersionMajor.toInt()
                )
                manufacturerData.putInt(
                    "mainFirmwareVersionMinor",
                    data.mainFirmwareVersionMinor.toInt()
                )
                manufacturerData.putInt(
                    "mainFirmwareVersionPatch",
                    data.mainFirmwareVersionPatch.toInt()
                )
                manufacturerData.putInt("componentHAL", data.componentHAL)
                manufacturerData.putString(
                    "batteryStatus",
                    if (data.batteryStatus) "battery-full" else "battery-empty"
                )
                manufacturerData.putBoolean("mainConstructionMode", data.mainConstructionMode)
                manufacturerData.putBoolean("subConstructionMode", data.subConstructionMode)
                manufacturerData.putBoolean("isOnline", data.isOnline)
                manufacturerData.putBoolean("officeModeEnabled", data.officeModeEnabled)
                manufacturerData.putBoolean("twoFactorRequired", data.twoFactorRequired)
                manufacturerData.putBoolean("officeModeActive", data.officeModeActive)
                manufacturerData.putInt("reservedBits", data.reservedBits ?: 0)
                manufacturerData.putString("identifier", data.identifier)
                manufacturerData.putInt(
                    "subFirmwareVersionMajor",
                    data.subFirmwareVersionMajor?.toInt() ?: 0
                )
                manufacturerData.putInt(
                    "subFirmwareVersionMinor",
                    data.subFirmwareVersionMinor?.toInt() ?: 0
                )
                manufacturerData.putInt(
                    "subFirmwareVersionPatch",
                    data.subFirmwareVersionPatch?.toInt() ?: 0
                )
                manufacturerData.putString("subComponentIdentifier", data.subComponentIdentifier)
            }
            advertisementData.putMap("manufacturerData", manufacturerData)
        }
        bleDeviceData.putMap("advertisementData", advertisementData)

        return bleDeviceData
    }

    override fun getName(): String {
        return NAME
    }

    companion object {
        const val NAME = "AbrevvaBle"
    }

    // not needed for Android
    @ReactMethod
    fun setSupportedEvents(options: ReadableMap, promise: Promise) {
        promise.resolve(null)
    }

    @ReactMethod
    fun addListener(type: String?) {
        // Keep: Required for RN built in Event Emitter Calls.
    }

    @ReactMethod
    fun removeListeners(type: Int?) {
        // Keep: Required for RN built in Event Emitter Calls.
    }
}
