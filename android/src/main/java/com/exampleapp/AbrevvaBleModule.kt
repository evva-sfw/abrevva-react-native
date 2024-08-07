package com.exampleapp

import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.provider.Settings
import androidx.activity.result.contract.ActivityResultContracts
import androidx.annotation.RequiresPermission
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import java.util.UUID
import com.evva.xesar.abrevva.ble.BleManager
import com.evva.xesar.abrevva.util.bytesToString
import com.evva.xesar.abrevva.util.stringToBytes
import com.evva.xesar.abrevva.nfc.toHexString

import com.facebook.react.ReactActivity
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext.RCTDeviceEventEmitter
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.facebook.react.modules.core.PermissionListener
import com.facebook.react.modules.core.RCTNativeAppEventEmitter
import com.facebook.react.uimanager.events.RCTModernEventEmitter
import io.reactivex.annotations.NonNull
import no.nordicsemi.android.kotlin.ble.core.scanner.BleScanResult
import org.json.JSONArray

class AbrevvaBleModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {
    private lateinit var manager: BleManager
    private lateinit var aliases: Array<String>

    init {
        manager = BleManager(reactContext)
        aliases = arrayOf()
    }

    @ReactMethod
    fun initialize(options: ReadableMap, promise: Promise) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            var neverForLocation = false
            try {
                neverForLocation = options.getBoolean("androidNeverForLocation")
            } catch (_: Exception){}

            this.aliases = if (neverForLocation) {
                arrayOf(
                    android.Manifest.permission.BLUETOOTH_SCAN,
                    android.Manifest.permission.BLUETOOTH_CONNECT,
                )
            } else {
                arrayOf(
                    android.Manifest.permission.BLUETOOTH_SCAN,
                    android.Manifest.permission.BLUETOOTH_CONNECT,
                    android.Manifest.permission.ACCESS_FINE_LOCATION,
                )
            }
        } else {
            this.aliases = arrayOf(
                android.Manifest.permission.ACCESS_COARSE_LOCATION,
                        android.Manifest.permission.ACCESS_FINE_LOCATION,
                        android.Manifest.permission.BLUETOOTH,
                        android.Manifest.permission.BLUETOOTH_ADMIN,
            )
        }

        this.aliases.forEach {
            if (ContextCompat.checkSelfPermission(reactApplicationContext, it) == PackageManager.PERMISSION_DENIED){
                ActivityCompat.requestPermissions(
                    currentActivity!!,
                    this.aliases,
                    1
                )
                return@initialize
            }
        }
        promise.resolve(null)
    }

    private fun runInitialization(options: ReadableMap, promise: Promise) {
        if (!currentActivity!!.packageManager.hasSystemFeature(PackageManager.FEATURE_BLUETOOTH_LE)) {
            return promise.reject("runInitialization(): BLE is not supported")
        }

        if (!manager.isBleEnabled()) {
            return promise.reject("runInitialization(): BLE is not available")
        }
        promise.resolve("success")
    }

    @ReactMethod
    fun isEnabled(promise: Promise) {
        val result = Arguments.createMap()
        result.putBoolean("value", manager.isBleEnabled())

        promise.resolve(result)
    }

    @ReactMethod
    fun isLocationEnabled( promise: Promise) {
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
            promise.reject("startEnabledNotifications(): Failed to set handler")
            return
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
        intent.data = Uri.parse("package:" + currentActivity!!.packageName)

        currentActivity!!.startActivity(intent)

        promise.resolve("success")
    }

    @ReactMethod
    fun requestLEScan(options: ReadableMap, promise: Promise) {
        var timeout: Long = 10000
        try {
            timeout = options.getDouble("timeout").toLong()
        } catch (_:Exception){}

        this.manager.startScan({ success: Boolean ->
            if (success) {
                promise.resolve("success")
            } else {
                promise.reject("requestLEScan(): failed to start")
            }
        }, { result: BleScanResult ->
            val scanResult = getScanResultFromNordic(result)
            reactApplicationContext.emitDeviceEvent("onScanResult", scanResult)

        }, { address: String ->
            reactApplicationContext.emitDeviceEvent("connected|${address}", null)
        }, { address ->
            reactApplicationContext.emitDeviceEvent("disconnected|${address}", null)
        },
            timeout
        )
    }

    @ReactMethod
    fun stopLEScan(promise: Promise) {
        manager.stopScan()
    }

    @ReactMethod
    @RequiresPermission(value = "android.permission.BLUETOOTH_CONNECT")
    fun connect(options: ReadableMap, promise: Promise) {
        val deviceId = options.getString("deviceId") ?: ""
        var timeout: Long = 10000
        try {
            timeout = options.getDouble("timeout").toLong()
        } catch (_:Exception){}

        manager.connect(deviceId, { success: Boolean ->
            if (success) {
                promise.resolve("success")
            } else {
                promise.reject("connect(): failed to connect")
            }
        }, timeout)
    }

    @ReactMethod
    @RequiresPermission(value = "android.permission.BLUETOOTH_CONNECT")
    fun disconnect(options: ReadableMap, promise: Promise) {
        val deviceId = options.getString("deviceId") ?: ""

        manager.disconnect(deviceId) { success: Boolean ->
            if (success) {
                promise.resolve("success")
            } else {
                promise.reject("disconnect(): failed to disconnect")
            }
        }
    }

    @ReactMethod
    @RequiresPermission(value = "android.permission.BLUETOOTH_CONNECT")
    fun read(options: ReadableMap, promise: Promise) {
        val deviceId = options.getString("deviceId") ?: ""
        var timeout: Long = 10000
        try {
            timeout = options.getDouble("timeout").toLong()
        } catch (_:Exception) {}

        val characteristic = getCharacteristic(options, promise)
            ?: return promise.reject("read(): bad characteristic")

        manager.read(deviceId, characteristic.first, characteristic.second, { success: Boolean, data: ByteArray? ->
            if (success) {
                val ret = Arguments.createMap()
                ret.putString("value", bytesToString(data!!))
                promise.resolve(ret)
            } else {
                promise.reject("read(): failed to read from device")
            }
        }, timeout)
    }

    @ReactMethod
    @RequiresPermission(value = "android.permission.BLUETOOTH_CONNECT")
    fun write(options: ReadableMap, promise: Promise) {
        val deviceId = options.getString("deviceId") ?: ""
        var timeout: Long = 10000
        try {
            timeout = options.getDouble("timeout").toLong()
        }catch (_:Exception){}

        val characteristic =
            getCharacteristic(options, promise) ?: return promise.reject("read(): bad characteristic")
        val value =
            options.getString("value") ?: return promise.reject("write(): missing value for write")

        manager.write(
            deviceId,
            characteristic.first,
            characteristic.second,
            stringToBytes(value),
            { success: Boolean ->
                if (success) {
                    promise.resolve("success")
                } else {
                    promise.reject("write(): failed to write to device")
                }
            },
            timeout
        )
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
        } catch (_:Exception){}

        manager.disengage(
            deviceId,
            mobileId,
            mobileDeviceKey,
            mobileGroupId,
            mobileAccessData,
            isPermanentRelease
        ) { status: Any ->
            val result = Arguments.createMap()
            result.putString("value", status as String) // TODO: Check if this works

            promise.resolve(result)
        }
    }

    @ReactMethod
    @RequiresPermission(value = "android.permission.BLUETOOTH_CONNECT")
    fun startNotifications(options: ReadableMap, promise: Promise) {
        val deviceId = options.getString("deviceId") ?: ""
        val characteristic =
            getCharacteristic(options, promise)
                ?: return promise.reject("startNotifications(): bad characteristic")

        manager.startNotifications(
            deviceId,
            characteristic.first,
            characteristic.second,
            { success:Boolean ->
                if (success) {
                    promise.resolve("success")
                } else {
                    promise.reject("startNotifications(): failed to set notifications")
                }
            }, { data: ByteArray ->
            val key =
                "notification|${deviceId}|${(characteristic.first)}|${(characteristic.second)}"

            val ret = Arguments.createMap()
            ret.putString("value", bytesToString(data))
            reactApplicationContext.emitDeviceEvent(key, ret)
        })
    }

    @ReactMethod
    @RequiresPermission(value = "android.permission.BLUETOOTH_CONNECT")
    fun stopNotifications(options: ReadableMap, promise: Promise) {
        val deviceId = options.getString("deviceId") ?: ""
        val characteristic =
            getCharacteristic(options, promise)
                ?: return promise.reject("stopNotifications(): bad characteristic")

        manager.stopNotifications(deviceId, characteristic.first, characteristic.second) { success: Boolean ->
            if (success) {
                promise.resolve("success")
            } else {
                promise.reject("stopNotifications(): failed to unset notifications")
            }
        }
    }

    private fun getCharacteristic(options: ReadableMap, promise: Promise): Pair<UUID, UUID>? {
        val serviceString = options.getString("service")
        val serviceUUID: UUID?

        try {
            serviceUUID = UUID.fromString(serviceString)
        } catch (e: IllegalArgumentException) {
            promise.reject("getCharacteristic(): invalid service uuid")
            return null
        }

        if (serviceUUID == null) {
            promise.reject("getCharacteristic(): service uuid required")
            return null
        }

        val characteristicString = options.getString("characteristic")
        val characteristicUUID: UUID?

        try {
            characteristicUUID = UUID.fromString(characteristicString)
        } catch (e: IllegalArgumentException) {
            promise.reject("getCharacteristic(): invalid characteristic uuid")
            return null
        }

        if (characteristicUUID == null) {
            promise.reject("getCharacteristic(): characteristic uuid required")
            return null
        }

        return Pair(serviceUUID, characteristicUUID)
    }

    private fun getBleDeviceFromNordic(result: BleScanResult): ReadableMap {
        val bleDevice = Arguments.createMap()

        bleDevice.putString("deviceId", result.device.address)

        if (result.device.hasName) {
            bleDevice.putString("name", result.device.name)
        }

        val uuids = Arguments.createArray()
        result.data?.scanRecord?.serviceUuids?.forEach { uuid -> uuids.pushString(uuid.toString()) }

        if (uuids.size() > 0) {
            bleDevice.putArray("uuids", uuids)
        }
        return bleDevice
    }

    private fun getScanResultFromNordic(result: BleScanResult): ReadableMap {
        val scanResult = Arguments.createMap()
        val bleDevice = getBleDeviceFromNordic(result)

        scanResult.putMap("device", bleDevice)

        if (result.device.hasName) {
            scanResult.putString("localName", result.device.name)
        }
        if (result.data?.rssi != null) {
            scanResult.putInt("rssi", result.data!!.rssi)
        }
        if (result.data?.txPower != null) {
            scanResult.putInt("txPower", result.data!!.txPower ?: 0)
        } else {
            scanResult.putInt("txPower", 127)
        }

        val manufacturerData = Arguments.createMap()

        val scanRecordBytes = result.data?.scanRecord?.bytes
        if (scanRecordBytes != null) {
            try {
                // Extract EVVA manufacturer-id
                var arr = byteArrayOf(0x01)
                arr.toHexString()
                val keyHex = byteArrayOf(scanRecordBytes.getByte(6)!!).toHexString() + byteArrayOf(scanRecordBytes.getByte(5)!!).toHexString()
                val keyDec = keyHex.toInt(16)

                // Slice out manufacturer data
                val bytes = scanRecordBytes.copyOfRange(7, scanRecordBytes.size)

                manufacturerData.putString(keyDec.toString(), bytesToString(bytes.value))
            } catch (e: Exception) {
                System.err.println("getScanResultFromNordic(): invalid manufacturer data")
            }
        }

        scanResult.putMap("manufacturerData", manufacturerData)

        val serviceDataObject = Arguments.createMap()
        val serviceData = result.data?.scanRecord?.serviceData
        serviceData?.forEach {
            serviceDataObject.putString(it.key.toString(), bytesToString(it.value.value))
        }
        scanResult.putMap("serviceData", serviceDataObject)

        val uuids = Arguments.createArray()
        result.data?.scanRecord?.serviceUuids?.forEach { uuid -> uuids.pushString(uuid.toString()) }
        scanResult.putArray("uuids", uuids)
        scanResult.putString(
            "rawAdvertisement",
            result.data?.scanRecord?.bytes?.toString()
        )

        return scanResult
    }

    // not needed for Android
    @ReactMethod
    fun setSupportedEvents(options: ReadableMap, promise: Promise) {
        promise.resolve(null)
    }

    override fun getName(): String {
        return NAME
    }

    companion object {
        const val NAME = "AbrevvaBle"
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