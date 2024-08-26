package com.evva.xesar.abrevva.reactnative

import android.annotation.SuppressLint
import android.bluetooth.BluetoothManager
import android.content.Context
import android.os.ParcelUuid
import com.evva.xesar.abrevva.ble.BleManager
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.WritableArray
import io.mockk.MockKAnnotations
import io.mockk.every
import io.mockk.impl.annotations.MockK
import io.mockk.mockk
import io.mockk.mockkConstructor
import io.mockk.mockkStatic
import io.mockk.slot
import io.mockk.spyk
import io.mockk.unmockkAll
import no.nordicsemi.android.common.core.DataByteArray
import no.nordicsemi.android.kotlin.ble.core.ServerDevice
import no.nordicsemi.android.kotlin.ble.core.scanner.BleScanRecord
import no.nordicsemi.android.kotlin.ble.core.scanner.BleScanResult
import no.nordicsemi.android.kotlin.ble.core.scanner.BleScanResultData
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

class AbrevvaBleModuleTest {
    private lateinit var abrevvaBleModule: AbrevvaBleModule

    private lateinit var testMap: WritableMapTestImplementation

    @MockK(relaxed = true)
    private lateinit var contextMock: ReactApplicationContext

    @MockK(relaxed = true)
    private lateinit var promiseMock: Promise

    @MockK(relaxed = true)
    private lateinit var writeableArrayMock: WritableArray

    @BeforeEach
    fun beforeEach() {
        MockKAnnotations.init(this)
        mockkStatic(Arguments::class)
        testMap = WritableMapTestImplementation()
        every { Arguments.createMap() } returns testMap
        every { Arguments.createArray() } returns writeableArrayMock
        every { contextMock.getSystemService(Context.BLUETOOTH_SERVICE) } returns mockk<BluetoothManager>(
            relaxed = true
        )
        abrevvaBleModule = AbrevvaBleModule(contextMock)
    }

    @AfterEach
    fun afterEach() {
        unmockkAll()
    }

    /* https://github.com/mockk/mockk/issues/586#issuecomment-1404973825 */
    @SuppressLint("MissingPermission")
    @Test
    fun `startNotifications notification recieved closure should generate key correctly`() {
        mockkConstructor(BleManager::class)
        val callbackSlot = slot<(data: ByteArray) -> Unit>()
        val keySlot = slot<String>()
        val deviceId = "e7f635ac-27ae-4bc6-a5ca-3f07872f49e9"
        val service = "01a660db-5dbd-488a-bd01-b42449817c82"
        val characteristic = "d0d71305-05b2-4add-9ea9-bcd1cc82211c"
        val options = WritableMapTestImplementation(
            mutableMapOf(
                "deviceId" to deviceId,
                "service" to service,
                "characteristic" to characteristic
            )
        )
        every { Arguments.createMap() } returns options
        every {
            anyConstructed<BleManager>().startNotifications(
                any(),
                any(),
                any(),
                any(),
                capture(callbackSlot),
                any()
            )
        } returns Unit
        every { contextMock.emitDeviceEvent(capture(keySlot), any()) } returns Unit
        abrevvaBleModule = AbrevvaBleModule(contextMock)

        abrevvaBleModule.startNotifications(
            options, promiseMock
        )
        callbackSlot.captured.invoke(ByteArray(0))

        assert(keySlot.captured == "notification|e7f635ac-27ae-4bc6-a5ca-3f07872f49e9|01a660db-5dbd-488a-bd01-b42449817c82|d0d71305-05b2-4add-9ea9-bcd1cc82211c")
    }

    @Test
    fun `getBleDeviceFromNordic should save data from BleScanResult in new map`() {
        val name = "name"
        val address = "deviceAddress"
        val bleDevice = WritableMapTestImplementation()
        every { Arguments.createMap() } returns bleDevice
        val bleScanResult = mockk<BleScanResult>(relaxed = true)
        val device = mockk<ServerDevice>()
        every { bleScanResult.device } returns device
        every { device.hasName } returns true
        every { device.name } returns name
        every { device.address } returns address
        every { writeableArrayMock.size() } returns 0

        abrevvaBleModule.getBleDeviceFromNordic(bleScanResult)

        val ref = WritableMapTestImplementation(
            mutableMapOf(
                "deviceId" to address,
                "name" to name,
            )
        )
        assert(ref == bleDevice)
    }

    @Test
    fun `getScanResultFromNordic should construct ReadableMap from ScanResult`() {
        val name = "name"
        val deviceId = "deviceId"
        val txPower = 10
        val bleSpy = spyk(AbrevvaBleModule(contextMock))
        val result = mockk<BleScanResult>()
        val data = mockk<BleScanResultData>()
        val device = mockk<ServerDevice>()
        val scanRecord = mockk<BleScanRecord>()
        val bytes = DataByteArray(byteArrayOf(0x01, 0x02, 0x03, 0x04, 0x05, 0x07, 0x08, 0x09, 0x10))
        val parcelUuid = mockk<ParcelUuid>(relaxed = true)
        val serviceData = mapOf(
            parcelUuid to DataByteArray(
                byteArrayOf(
                    0x01,
                    0x02,
                    0x03,
                    0x04,
                    0x05,
                    0x07,
                    0x08,
                    0x09,
                    0x10
                )
            )
        )
        val bleDevice = WritableMapTestImplementation(
            mutableMapOf(
                "deviceId" to deviceId,
                "name" to name
            )
        )
        val scanResult = WritableMapTestImplementation()
        val manufacturerData = WritableMapTestImplementation()
        val serviceDataMap = WritableMapTestImplementation()

        every { result.data } returns null andThen data
        every { result.device } returns device
        every { result.device.hasName } returns true
        every { result.device.name } returns "name"
        every { data.txPower } returns txPower
        every { data.scanRecord } returns scanRecord
        every { scanRecord.bytes } returns bytes
        every { scanRecord.serviceData } returns serviceData
        every { scanRecord.serviceUuids } returns null
        every { bleSpy.getBleDeviceFromNordic(any()) } returns bleDevice
        every { Arguments.createMap() } returns scanResult andThen manufacturerData andThen serviceDataMap

        bleSpy.getScanResultFromNordic(result)

        val ref = WritableMapTestImplementation(
            mutableMapOf(
                "device" to bleDevice,
                "localName" to name,
                "txPower" to txPower,
                "manufacturerData" to WritableMapTestImplementation(mutableMapOf("2055" to "09 10")),
                "rawAdvertisement" to "(0x) 01:02:03:04:05:07:08:09:10",
                "uuids" to writeableArrayMock,
                "serviceData" to serviceDataMap
            )
        )
        assert(ref == scanResult)
    }
}