package com.evva.xesar.abrevva.reactnative

import com.evva.xesar.abrevva.crypto.AesCcm
import com.evva.xesar.abrevva.crypto.AesGcm
import com.evva.xesar.abrevva.crypto.HKDF
import com.evva.xesar.abrevva.crypto.SimpleSecureRandom
import com.evva.xesar.abrevva.crypto.X25519Wrapper
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap
import io.mockk.MockKAnnotations
import io.mockk.every
import io.mockk.impl.annotations.MockK
import io.mockk.mockk
import io.mockk.mockkObject
import io.mockk.mockkStatic
import io.mockk.spyk
import io.mockk.unmockkAll
import io.mockk.verify
import org.bouncycastle.util.encoders.Hex
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.CsvSource
import org.junit.jupiter.params.provider.MethodSource
import java.util.stream.Stream
import org.junit.jupiter.params.provider.Arguments as JunitArguments
class AbrevvaCryptoModuleTest {

    private lateinit var abrevvaCryptoModule: AbrevvaCryptoModule

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
        mockkObject(AesCcm)
        mockkObject(AesGcm)
        mockkObject(X25519Wrapper)
        mockkObject(SimpleSecureRandom)
        mockkObject(HKDF)
        mockkStatic(Arguments::createMap)
        mockkStatic(Hex::class)
        testMap = WritableMapTestImplementation()
        every { Arguments.createMap() } returns testMap
        every { Hex.decode(any<String>()) } returns byteArrayOf(1)
        abrevvaCryptoModule = AbrevvaCryptoModule(contextMock)
    }

    @AfterEach
    fun afterEach() {
        unmockkAll()
    }

    @Nested
    @DisplayName("encrypt()")
    inner class EncryptTests {
        @Test
        fun `should reject if ct is empty`() {
            every { Hex.decode(any<String>()) } answers { callOriginal() }
            every { AesCcm.encrypt(any(), any(), any(), any(), any()) } returns ByteArray(0)

            abrevvaCryptoModule.encrypt(readableMapMock, promiseMock)

            verify { promiseMock.reject(any<Throwable>()) }
        }

        @Test
        fun `should resolve if ct is not empty`() {
            every { AesCcm.encrypt(any(), any(), any(), any(), any()) } returns ByteArray(10)

            abrevvaCryptoModule.encrypt(readableMapMock, promiseMock)

            verify { promiseMock.resolve(any()) }
        }
    }

    @Nested
    @DisplayName("decrypt()")
    inner class DecryptTests {
        @Test
        fun `should reject if pt is empty`() {
            every { AesCcm.decrypt(any(), any(), any(), any(), any()) } returns ByteArray(0)

            abrevvaCryptoModule.decrypt(readableMapMock, promiseMock)

            verify { promiseMock.reject(any<Throwable>()) }
        }

        @Test
        fun `should resolve if pt is not empty`() {
            every { AesCcm.decrypt(any(), any(), any(), any(), any()) } returns ByteArray(10)

            abrevvaCryptoModule.decrypt(readableMapMock, promiseMock)

            verify { promiseMock.resolve(any()) }
        }
    }

    @Nested
    @DisplayName("generateKeyPair()")
    inner class GenerateKeyPairTests {
        @Test
        fun `should resolve if keys where generated successfully`() {
            every { X25519Wrapper.generateKeyPair() } returns mockk<X25519Wrapper.KeyPair>(relaxed = true)

            abrevvaCryptoModule.generateKeyPair(promiseMock)

            verify { promiseMock.resolve(any()) }
        }

        @Test
        fun `should reject if keys cannot be generated`() {
            every { X25519Wrapper.generateKeyPair() } throws Exception("generateKeyPair() Fail Exception")

            abrevvaCryptoModule.generateKeyPair(promiseMock)

            verify { promiseMock.reject(any<Throwable>()) }
        }
    }

    @Nested
    @DisplayName("encryptFile()")
    @TestInstance(TestInstance.Lifecycle.PER_CLASS)
    inner class EncryptFileTests {
        @ParameterizedTest(name = "encryptFile({0}, {1}, {2}) should reject")
        @MethodSource("parameterizedArgs_encrypt")
        fun `encryptFile() should reject if any Param is missing`(
            ctPath: String?,
            ptPath: String?,
            sharedSecret: String?
        ) {
            testMap.putString("ctPath", ctPath)
            testMap.putString("ptPath", ptPath)
            testMap.putString("sharedSecret", sharedSecret)

            abrevvaCryptoModule.encryptFile(testMap, promiseMock)

            verify { promiseMock.reject(any<Throwable>()) }
        }

        private fun parameterizedArgs_encrypt(): Stream<JunitArguments> {
            return Stream.of(
                JunitArguments.of("", "ptPath", "sharedSecret"),
                JunitArguments.of("ctPath", "", "sharedSecret"),
                JunitArguments.of("ctPath", "sharedSecret", ""),
                JunitArguments.of(null, "ptPath", "sharedSecret"),
                JunitArguments.of("ctPath", null, "sharedSecret"),
                JunitArguments.of("ctPath", "ptPath", null),
            )
        }

        @Test
        fun `should resolve if args are valid and file could be encrypted`() {
            val mapMock = mockk<WritableMap>(relaxed = true)
            every { mapMock.getString(any()) } returns "notEmpty"
            every { AesGcm.encryptFile(any(), any(), any()) } returns true

            abrevvaCryptoModule.encryptFile(mapMock, promiseMock)

            verify { promiseMock.resolve(any()) }
        }

        @Test
        fun `should reject if args are valid but encryption fails`() {
            val mapMock = mockk<WritableMap>(relaxed = true)
            every { mapMock.getString(any()) } returns "notEmpty"
            every {
                AesGcm.encryptFile(
                    any(),
                    any(),
                    any()
                )
            } throws Exception("encryptFile() Fail Exception")

            abrevvaCryptoModule.encryptFile(mapMock, promiseMock)

            verify { promiseMock.reject(any<Throwable>()) }
        }
    }

    @Nested
    @DisplayName("decryptFile()")
    @TestInstance(TestInstance.Lifecycle.PER_CLASS)
    inner class DecryptFileTests {
        @ParameterizedTest(name = "empty args should be rejected")
        @MethodSource("parameterizedArgs_decrypt")
        fun `should reject if any Param is empty`(
            ctPath: String?,
            ptPath: String?,
            sharedSecret: String?
        ) {
            testMap.putString("ctPath", ctPath)
            testMap.putString("ptPath", ptPath)
            testMap.putString("sharedSecret", sharedSecret)

            abrevvaCryptoModule.decryptFile(testMap, promiseMock)

            verify { promiseMock.reject(any<Throwable>()) }
        }

        private fun parameterizedArgs_decrypt(): Stream<JunitArguments> {
            return Stream.of(
                JunitArguments.of("", "ptPath", "sharedSecret"),
                JunitArguments.of("ctPath", "", "sharedSecret"),
                JunitArguments.of("ctPath", "ptPath", ""),
                JunitArguments.of(null, "ptPath", "sharedSecret"),
                JunitArguments.of("ctPath", null, "sharedSecret"),
                JunitArguments.of("ctPath", "ptPath", null),
            )
        }

        @Test
        fun `should resolve if args are valid and file could be encrypted`() {
            val mapMock = mockk<WritableMap>(relaxed = true)
            every { mapMock.getString(any()) } returns "notEmpty"
            every { AesGcm.decryptFile(any(), any(), any()) } returns true

            abrevvaCryptoModule.decryptFile(mapMock, promiseMock)

            verify { promiseMock.resolve(any()) }
        }

        @Test
        fun `should reject if encryption fails`() {
            val mapMock = mockk<WritableMap>(relaxed = true)
            every { mapMock.getString(any()) } returns "notEmpty"
            every {
                AesGcm.decryptFile(
                    any(),
                    any(),
                    any()
                )
            } throws Exception("encryptFile() Fail Exception")

            abrevvaCryptoModule.decryptFile(mapMock, promiseMock)

            verify { promiseMock.reject(any<Throwable>()) }
        }
    }

    @Nested
    @DisplayName("decryptFileFromURL()")
    inner class DecryptFileFromURLTests {

        @Nested
        @DisplayName("should reject if any Param is empty")
        @TestInstance(TestInstance.Lifecycle.PER_CLASS)
        inner class DecryptFileFromURLParameterizedTest {
            @ParameterizedTest
            @MethodSource("parameterizedArgs_decryptFileFromURL")
            fun `should reject if any Param is empty`(
                sharedSecret: String?,
                url: String?,
                ptPath: String?
            ) {
                testMap.putString("sharedSecret", sharedSecret)
                testMap.putString("url", url)
                testMap.putString("ptPath", ptPath)

                abrevvaCryptoModule.decryptFileFromURL(testMap, promiseMock)

                verify { promiseMock.reject(any<Throwable>()) }
            }

            private fun parameterizedArgs_decryptFileFromURL(): Stream<JunitArguments> {
                return Stream.of(
                    JunitArguments.of("", "url", "ptPath"),
                    JunitArguments.of("sharedSecret", "", "ptPath"),
                    JunitArguments.of("sharedSecret", "url", ""),
                    JunitArguments.of(null, "url", "ptPath"),
                    JunitArguments.of("sharedSecret", null, "ptPath"),
                    JunitArguments.of("sharedSecret", "url", null),
                )
            }
        }

        @Test
        fun `decryptFileFromURL() should reject if ctPath-File is not accessible`() {
            val mockMap = mockk<ReadableMap>(relaxed = true)
            val moduleSpy =
                spyk(AbrevvaCryptoModule(contextMock))
            every { mockMap.getString(any()) } returns "notEmpty"
            every {
                moduleSpy.writeToFile(
                    any(),
                    any()
                )
            } throws Exception("decryptFileFromURL() Fail Exception")

            moduleSpy.decryptFileFromURL(mockMap, promiseMock)

            verify { promiseMock.reject(any<Exception>()) }
        }

        @Test
        fun `decryptFileFromURL() should reject if decode fails`() {
            val mockMap = mockk<ReadableMap>(relaxed = true)
            val moduleSpy =
                spyk(AbrevvaCryptoModule(contextMock))
            every { mockMap.getString(any()) } returns "notEmpty"
            every { moduleSpy.writeToFile(any(), any()) } returns Unit
            every { Hex.decode(any<String>()) } throws Exception("decryptFileFromURL() Fail Exception")

            moduleSpy.decryptFileFromURL(mockMap, promiseMock)

            verify { promiseMock.reject(any<Exception>()) }
        }

        @Test
        fun `decryptFileFromURL() should resolve if everything works as intended`() {
            val mockMap = mockk<ReadableMap>(relaxed = true)
            val moduleSpy =
                spyk(AbrevvaCryptoModule(contextMock))
            every { mockMap.getString(any()) } returns "notEmpty"
            every { moduleSpy.writeToFile(any(), any()) } returns Unit
            every { AesGcm.decryptFile(any(), any(), any()) } returns true

            moduleSpy.decryptFileFromURL(mockMap, promiseMock)

            verify { promiseMock.resolve(any()) }
        }
    }

    @Nested
    @DisplayName("random()")
    inner class RandomTests {
        @ParameterizedTest(name = "random(numBytes: {0}) resolved String size should be {1}")
        @CsvSource("2,4", "4,8", "7,14")
        fun `should return random bytes n number of bytes if successful`(
            numBytes: Int,
            expectedStrLen: Int
        ) {
            val mockMap = mockk<WritableMap>(relaxed = true)
            every { mockMap.getInt("numBytes") } returns numBytes

            abrevvaCryptoModule.random(mockMap, promiseMock)

            assert(testMap.getString("value")!!.length == expectedStrLen)
        }

        @Test
        fun `should reject if bytes cannot be generated`() {
            every { SimpleSecureRandom.getSecureRandomBytes(any()) } returns ByteArray(0)
            testMap.putInt("numBytes", 10)

            abrevvaCryptoModule.random(testMap, promiseMock)

            verify { promiseMock.reject(any<Exception>()) }
        }
    }

    @Nested
    @DisplayName("derive()")
    inner class DeriveTests {

        @Test
        fun `should resolve if successful`() {
            testMap.putInt("length", 0)
            every { HKDF.derive(any(), any(), any(), any()) } returns ByteArray(0)

            abrevvaCryptoModule.derive(testMap, promiseMock)

            verify { promiseMock.reject(any<Exception>()) }
        }

        @Test
        fun `should reject if unsuccessful`() {
            testMap.putInt("length", 10)
            every { HKDF.derive(any(), any(), any(), any()) } returns ByteArray(10)
            abrevvaCryptoModule.derive(testMap, promiseMock)

            verify { promiseMock.resolve(any()) }
        }
    }
}
