package com.exampleapp

import android.app.Activity
import android.content.Intent
import android.nfc.NfcAdapter
import android.os.Build
import androidx.annotation.RequiresApi
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.evva.xesar.abrevva.nfc.KeyStoreHandler
import com.evva.xesar.abrevva.nfc.Message
import com.evva.xesar.abrevva.nfc.Mqtt5Client
import com.evva.xesar.abrevva.nfc.NfcDelegate
import com.evva.xesar.abrevva.nfc.asByteArray
import com.evva.xesar.abrevva.nfc.toHexString
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.BaseActivityEventListener
import com.facebook.react.bridge.LifecycleEventListener
import com.hivemq.client.mqtt.mqtt5.message.publish.Mqtt5Publish
import java.util.Timer
import java.util.TimerTask

class AbrevvaNfcModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  private val host = "172.16.2.91"
  private val port = 1883
  private val clientID = "96380897-0eee-479e-80c3-84c0dde286cd"

  private val STATUS_NFC_OK = "enabled"

  private val kyOffTimer = Timer()
  private val hbTimer = Timer()

  private var mqtt5Client: Mqtt5Client? = null
  private var nfcDelegate = NfcDelegate()

  private var clientId: String? = null

  private val adapterStatus: String
    get() = nfcDelegate.setAdapterStatus()

  private val activityEventListener = object : BaseActivityEventListener() {
    override fun onNewIntent(intent: Intent?) {
      super.onNewIntent(intent)
      if (intent != null) {
        currentActivity!!.intent = intent
        nfcDelegate.processTag(intent) {
          mqtt5Client?.subscribe("readers/1/$clientId/t", ::messageReceivedCallback)
          mqtt5Client?.publish(
            "readers/1/$clientId",
            Message(
              "ky",
              "on",
              nfcDelegate.getIdentifier(),
              nfcDelegate.getHistoricalBytesAsHexString(),
              "BAKA"
            ).asByteArray()
          )
          setDisconnectTimer()
          setHbTimer()
        }
      }
    }
  }

  private val lifecycleEventListener = object : LifecycleEventListener {
    override fun onHostResume() {
      nfcDelegate.restartForegroundDispatch(reactContext, currentActivity)
    }

    override fun onHostPause() {
      nfcDelegate.disableForegroundDispatch(reactContext, currentActivity)
    }

    override fun onHostDestroy() {
    }
  }

  init {
    reactContext.addActivityEventListener(activityEventListener)
    reactContext.addLifecycleEventListener(lifecycleEventListener)
    nfcDelegate.setAdapter(NfcAdapter.getDefaultAdapter(reactContext))
  }

  private fun messageReceivedCallback(response: Mqtt5Publish) {
    try {
      val resp = nfcDelegate.transceive(response.payloadAsBytes)
      mqtt5Client?.publish("readers/1/$clientId/f", resp)
    } catch (e: Exception){
      println(e)
    }
  }

  private fun setDisconnectTimer() {
    kyOffTimer.scheduleAtFixedRate(object : TimerTask() {
      override fun run() {
        try {
          // .isConnected throws SecurityException when Tag is outdated
          nfcDelegate.isConnected()
        } catch (ex: java.lang.Exception) {
          mqtt5Client?.publish("readers/1",Message("ky", "off", oid = clientId).asByteArray())
          this.cancel()
        }
      }
    }, 250, 250)
  }

  private fun setHbTimer(){
    hbTimer.scheduleAtFixedRate(object : TimerTask() {
      override fun run() {
        mqtt5Client?.publish("readers/1", Message("cr", "hb", oid = clientId).asByteArray())
      }
    }, 30000, 30000)
  }

  @ReactMethod
  fun read(promise: Promise) {
    if (adapterStatus != STATUS_NFC_OK) {
      // No NFC hardware or NFC is disabled by the user
      promise.reject(adapterStatus)
      return
    }
    nfcDelegate.restartForegroundDispatch(reactApplicationContext, currentActivity)
  }

  @OptIn(ExperimentalStdlibApi::class)
  @ReactMethod
  fun connect() {
    val ksh = KeyStoreHandler()
    try {
      val cacheDir = reactApplicationContext.cacheDir
      ksh.parseP12File("$cacheDir/client-android.p12", "123")
      ksh.initKeyManagerFactory()
      ksh.initTrustManagerFactory()
    }
    catch (ex: Exception) {
      println(ex)
      return
    }

    this.clientId = clientID
    this.mqtt5Client = Mqtt5Client(clientID, port, host, ksh)
    mqtt5Client?.connect()
    print(Message("ky", "off", oid = "oidValue").asByteArray().toHexString())
  }

  @ReactMethod
  fun disconnect() {
    hbTimer.cancel()
    kyOffTimer.cancel()
    mqtt5Client?.publish("readers/1",Message("cr", "off", oid = clientID).asByteArray())
    mqtt5Client?.disconnect()
  }

  override fun getName(): String {
    return NAME
  }
  companion object {
    const val NAME = "AbrevvaNfc"
  }
}