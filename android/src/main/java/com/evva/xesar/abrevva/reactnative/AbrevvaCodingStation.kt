package com.evva.xesar.abrevva.reactnative

import android.app.Activity
import android.content.Intent
import android.view.View
import com.evva.xesar.abrevva.auth.AuthManager
import com.evva.xesar.abrevva.cs.CodingStation
import com.evva.xesar.abrevva.mqtt.MqttConnectionOptionsTLS
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.uimanager.ReactShadowNode
import com.facebook.react.uimanager.ViewManager
import kotlinx.coroutines.DelicateCoroutinesApi
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.async
import kotlinx.coroutines.runBlocking
import java.net.URL
import java.util.Collections
import kotlin.jvm.Throws


class AbrevvaCodingStation(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext),
    ActivityEventListener
{
    init {
        reactContext.addActivityEventListener(this)
    }

    private val codingStation = CodingStation(reactContext)
    private var mqttConnectionOptionsTLS: MqttConnectionOptionsTLS? = null

    @ReactMethod
    fun register(options: ReadableMap, promise: Promise) {
        val clientId = options.getString("clientId") ?: ""
        val username = options.getString("username") ?: ""
        val password = options.getString("password") ?: ""
        val url: URL
        try {
           url = URL(options.getString("url") ?: "")
        } catch (e:Exception){
            return promise.reject(Throwable("register(): invalid url"))
        }
        mqttConnectionOptionsTLS = AuthManager.getMqttConfigForXS(url, clientId, username, password)
        promise.resolve(true)
    }

    @ReactMethod
    fun connect(promise: Promise) {
        if (mqttConnectionOptionsTLS == null) {
            return promise.reject(Exception("connect(): No MqttCredentials present. call register() first"))
        }
        runBlocking {
            try {
                codingStation.connect(mqttConnectionOptionsTLS!!)
            } catch (e: Exception) {
                promise.reject(e)
            }
            promise.resolve(null)
        }
    }

    @ReactMethod
    fun write(promise: Promise) {
        runBlocking {
            codingStation.startTagReader(currentActivity!!,10_000) {
                promise.resolve(true)
            }
        }
    }

    @ReactMethod
    fun disconnect(promise: Promise) {
        codingStation.disconnect()
    }

    /// ActivityEventListener
    override fun onActivityResult(p0: Activity?, p1: Int, p2: Int, p3: Intent?) {
    }

    override fun onNewIntent(p0: Intent?) {
        codingStation.onHandleIntent(p0)
    }


    /// ReactContextBaseJavaModule
    override fun getName(): String {
        return NAME
    }

    companion object {
        const val NAME = "AbrevvaCodingStation"
    }
}
