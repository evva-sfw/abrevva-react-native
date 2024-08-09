package com.evva.xesar.abrevva.reactnative

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import io.mockk.MockKAnnotations
import io.mockk.impl.annotations.MockK
import io.mockk.unmockkAll
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach

class AbrevvaBleModuleTest {
    private lateinit var abrevvaBleModule: com.evva.xesar.abrevva.reactnative.AbrevvaBleModule

    private lateinit var testMap: WritableMapTestImplementation

    @MockK(relaxed = true)
    private lateinit var contextMock: ReactApplicationContext

    @MockK(relaxed = true)
    private lateinit var promiseMock: Promise

    @MockK(relaxed = true)
    private lateinit var readableMapMock: ReadableMap

    @BeforeEach
    fun beforeEach() {
        MockKAnnotations.init(this)
        abrevvaBleModule = com.evva.xesar.abrevva.reactnative.AbrevvaBleModule(contextMock)
    }

    @AfterEach
    fun afterEach() {
        unmockkAll()
    }
}