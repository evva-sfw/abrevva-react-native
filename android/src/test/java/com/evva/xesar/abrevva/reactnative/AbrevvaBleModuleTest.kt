package com.evva.xesar.abrevva.reactnative

import android.annotation.SuppressLint
import android.bluetooth.BluetoothManager
import android.content.Context
import com.evva.xesar.abrevva.ble.BleDevice
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.WritableArray
import io.mockk.MockKAnnotations
import io.mockk.coEvery
import io.mockk.every
import io.mockk.impl.annotations.MockK
import io.mockk.mockk
import io.mockk.mockkConstructor
import io.mockk.mockkStatic
import io.mockk.slot
import io.mockk.unmockkAll
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach

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
    // @Test
    fun `startNotifications notification received closure should generate key correctly`() {
        mockkConstructor(BleDevice::class)
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

        coEvery {
            anyConstructed<BleDevice>().setNotifications(
                any(),
                any(),
                capture(callbackSlot),
                any()
            )
        } returns true

        every { contextMock.emitDeviceEvent(capture(keySlot), any()) } returns Unit
        abrevvaBleModule = AbrevvaBleModule(contextMock)

        abrevvaBleModule.startNotifications(
            options, promiseMock
        )
        callbackSlot.captured.invoke(ByteArray(0))

        assert(keySlot.captured == "notification|e7f635ac-27ae-4bc6-a5ca-3f07872f49e9|01a660db-5dbd-488a-bd01-b42449817c82|d0d71305-05b2-4add-9ea9-bcd1cc82211c")
    }
}
