package com.margelo.nitro.abrevvareactnative

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfoProvider

class AbrevvaReactNativePackage : BaseReactPackage() {
    override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? {
        return null
    }

    override fun getReactModuleInfoProvider(): ReactModuleInfoProvider {
        return ReactModuleInfoProvider { HashMap() }
    }

    companion object {
        init {
            System.loadLibrary("abrevvareactnative")
        }
    }
}

fun timeoutToLongOrDefault(timeout: Double?): Long {
  if (timeout == null) {
    return DEFAULT_TIMEOUT
  }
  return timeout.toLong()
}
