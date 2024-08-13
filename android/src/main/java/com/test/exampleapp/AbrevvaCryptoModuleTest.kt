package com.test.exampleapp

import android.graphics.Color
import com.evva.xesar.abrevva.crypto.AesCCM
import com.evva.xesar.abrevva.crypto.AesGCM
import com.evva.xesar.abrevva.crypto.HKDF
import com.evva.xesar.abrevva.crypto.SimpleSecureRandom
import com.evva.xesar.abrevva.crypto.X25519Wrapper
import com.exampleapp.AbrevvaCryptoModule
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Dynamic
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.ReadableMapKeySetIterator
import com.facebook.react.bridge.ReadableType
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
        mockkObject(AesCCM)
        mockkObject(AesGCM)
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
    fun afterEach(){
        unmockkAll()
    }
    @Nested
    @DisplayName("encrypt()")
    inner class EncryptTests {
        @Test
        fun should_reject_if_ct_is_empty() {
            every { Hex.decode(any<String>()) } answers { callOriginal()}
            every { AesCCM.encrypt(any(), any(), any(), any(), any()) } returns ByteArray(0)

            abrevvaCryptoModule.encrypt(readableMapMock, promiseMock)

            verify { promiseMock.reject(any<Throwable>()) }
        }

        @Test
        fun should_resolve_if_ct_is_not_empty() {
            every { AesCCM.encrypt(any(), any(), any(), any(), any()) } returns ByteArray(10)

            abrevvaCryptoModule.encrypt(readableMapMock, promiseMock)

            verify { promiseMock.resolve(any()) }
        }
    }

    @Nested
    @DisplayName("decrypt()")
    inner class DecryptTests {
        @Test
        fun should_reject_if_pt_is_empty() {
            every { AesCCM.decrypt(any(), any(), any(), any(), any()) } returns ByteArray(0)

            abrevvaCryptoModule.decrypt(readableMapMock, promiseMock)

            verify { promiseMock.reject(any<Throwable>()) }
        }

        @Test
        fun should_resolve_if_pt_is_not_empty() {
            every { AesCCM.decrypt(any(), any(), any(), any(), any()) } returns ByteArray(10)

            abrevvaCryptoModule.decrypt(readableMapMock, promiseMock)

            verify { promiseMock.resolve(any()) }
        }
    }

    @Nested
    @DisplayName("generateKeyPair()")
    inner class GenerateKeyPairTests {
        @Test
        fun should_resolve_if_keys_where_generated_successfully() {
            every { X25519Wrapper.generateKeyPair() } returns mockk<X25519Wrapper.KeyPair>(relaxed = true)

            abrevvaCryptoModule.generateKeyPair(promiseMock)

            verify { promiseMock.resolve(any()) }
        }

        @Test
        fun should_reject_if_keys_cannot_be_generated() {
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
        fun encryptFile_should_reject_if_any_Param_is_missing(
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
        fun parameterizedArgs_encrypt(): Stream<JunitArguments>{
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
        fun should_resolve_if_args_are_valid_and_file_could_be_encrypted() {
            val mapMock = mockk<WritableMap>(relaxed = true)
            every { mapMock.getString(any()) } returns "notEmpty"
            every { AesGCM.encryptFile(any(), any(), any()) } returns true

            abrevvaCryptoModule.encryptFile(mapMock, promiseMock)

            verify { promiseMock.resolve(any()) }
        }

        @Test
        fun should_reject_if_args_are_valid_but_encryption_fails() {
            val mapMock = mockk<WritableMap>(relaxed = true)
            every { mapMock.getString(any()) } returns "notEmpty"
            every {
                AesGCM.encryptFile(
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
        fun should_reject_if_any_Param_is_empty(
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

        fun parameterizedArgs_decrypt(): Stream<JunitArguments>{
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
        fun should_resolve_if_args_are_valid_and_file_could_be_encrypted() {
            val mapMock = mockk<WritableMap>(relaxed = true)
            every { mapMock.getString(any()) } returns "notEmpty"
            every { AesGCM.decryptFile(any(), any(), any()) } returns true

            abrevvaCryptoModule.decryptFile(mapMock, promiseMock)

            verify { promiseMock.resolve(any()) }
        }

        @Test
        fun should_reject_if_encryption_fails() {
            val mapMock = mockk<WritableMap>(relaxed = true)
            every { mapMock.getString(any()) } returns "notEmpty"
            every {
                AesGCM.decryptFile(
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
        inner class DecryptFileFromURL_ParameterizedTest {
            @ParameterizedTest
            @MethodSource("parameterizedArgs_decryptFileFromURL")
            fun should_reject_if_any_Param_is_empty(
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

            fun parameterizedArgs_decryptFileFromURL(): Stream<JunitArguments> {
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
        fun decryptFileFromURL_should_reject_if_ctPathFile_is_not_accessible() {
            val mockMap = mockk<ReadableMap>(relaxed = true)
            val moduleSpy = spyk(AbrevvaCryptoModule(contextMock))
            every { mockMap.getString(any()) } returns "notEmpty"
            every { moduleSpy.writeToFile(any(), any()) } throws Exception("decryptFileFromURL() Fail Exception")

            moduleSpy.decryptFileFromURL(mockMap, promiseMock)

            verify { promiseMock.reject(any<Exception>()) }
        }

        @Test
        fun decryptFileFromURL_should_reject_if_decode_fails() {
            val mockMap = mockk<ReadableMap>(relaxed = true)
            val moduleSpy = spyk(AbrevvaCryptoModule(contextMock))
            every { mockMap.getString(any()) } returns "notEmpty"
            every { moduleSpy.writeToFile(any(), any()) } returns Unit
            every { Hex.decode(any<String>()) } throws Exception("decryptFileFromURL() Fail Exception")

            moduleSpy.decryptFileFromURL(mockMap, promiseMock)

            verify { promiseMock.reject(any<Exception>()) }
        }

        @Test
        fun decryptFileFromURL_should_resolve_if_everything_works_as_intended() {
            val mockMap = mockk<ReadableMap>(relaxed = true)
            val moduleSpy = spyk(AbrevvaCryptoModule(contextMock))
            every { mockMap.getString(any()) } returns "notEmpty"
            every { moduleSpy.writeToFile(any(), any()) } returns Unit
            every { AesGCM.decryptFile(any(), any(), any()) } returns true

            moduleSpy.decryptFileFromURL(mockMap, promiseMock)

            verify { promiseMock.resolve(any()) }
        }
    }

    @Nested
    @DisplayName("random()")
    inner class RandomTests {
        @ParameterizedTest(name = "random(numBytes: {0}) resolved String size should be {1}")
        @CsvSource("2,4", "4,8", "7,14")
        fun should_return_random_bytes_n_number_of_bytes_if_successful(
            numBytes: Int,
            expectedStrLen: Int
        ) {
            val mockMap = mockk<WritableMap>(relaxed = true)
            every { mockMap.getInt("numBytes") } returns numBytes

            abrevvaCryptoModule.random(mockMap, promiseMock)

            assert(testMap.getString("value")!!.length == expectedStrLen)
        }

        @Test
        fun should_reject_if_bytes_cannot_be_generated(){
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
        fun should_resolve_if_successful() {
            testMap.putInt("length", 0)
            every { HKDF.derive(any(), any(), any(), any()) } returns ByteArray(0)

            abrevvaCryptoModule.derive(testMap, promiseMock)

            verify { promiseMock.reject(any<Exception>()) }
        }
        @Test
        fun should_reject_if_unsuccessful() {
            testMap.putInt("length", 10)
            every { HKDF.derive(any(), any(), any(), any()) } returns ByteArray(10)
            abrevvaCryptoModule.derive(testMap, promiseMock)

            verify { promiseMock.resolve(any()) }
        }
    }
}