package com.margelo.nitro.abrevvareactnative

import com.evva.xesar.abrevva.auth.AuthManager
import com.evva.xesar.abrevva.cs.CodingStation
import com.evva.xesar.abrevva.mqtt.MqttConnectionOptionsTLS
import com.facebook.proguard.annotations.DoNotStrip
import com.margelo.nitro.core.Promise
import java.net.URL
import com.margelo.nitro.NitroModules
import com.margelo.nitro.core.resolve
import com.margelo.nitro.core.resolved
import kotlinx.coroutines.DelicateCoroutinesApi
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.async

@DoNotStrip
class AbrevvaCodingStationImpl: HybridAbrevvaCodingStationImplSpec() {
  private val codingStation = requireNotNull(
  NitroModules.applicationContext?.let { CodingStation(it) }
  ) { "Application context is required to initialize CodingStation" }

  private var mqttConnectionOptionsTLS: MqttConnectionOptionsTLS? = null
  override fun _register(
    url: String,
    clientId: String,
    username: String,
    password: String
  ): Promise<Unit> {
    try {
      mqttConnectionOptionsTLS = AuthManager.getMqttConfigForXS(URL(url), clientId, username, password)
    } catch (e:Exception){
      return Promise.rejected(Throwable("register(): $e"))
    }
    return Promise.resolved()
  }

  @OptIn(DelicateCoroutinesApi::class)
  override fun connect(): Promise<Unit> {
    if (mqttConnectionOptionsTLS == null) {
      return Promise.rejected(Exception("connect(): No MqttCredentials present. call register() first"))
    }
    val promise = Promise<Unit>()

    GlobalScope.async {
      try {
        codingStation.connect(mqttConnectionOptionsTLS!!)
      } catch (e: Exception) {
        promise.reject(e)
      }
      promise.resolve()
    }

    return promise
  }

  @OptIn(DelicateCoroutinesApi::class)
  override fun write(): Promise<Unit> {
    val promise = Promise<Unit>()

    GlobalScope.async {
      codingStation.startTagReader(NitroModules.applicationContext!!.currentActivity!!,10_000)
      promise.resolve()
    }
    return promise
  }

  override fun disconnect() {
    codingStation.disconnect()
  }
}
