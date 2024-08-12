package com.test.exampleapp

import com.facebook.react.bridge.Dynamic
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.ReadableMapKeySetIterator
import com.facebook.react.bridge.ReadableType
import com.facebook.react.bridge.WritableMap
import io.mockk.mockk
import kotlin.reflect.typeOf

class WritableMapTestImplementation(args: MutableMap<String ,Any?> = mutableMapOf<String, Any?>()) : WritableMap {
    private var map = mutableMapOf<String, Any?>()
    init {
        map = args
    }

    fun print() {
        map.forEach { key, value ->
            println("${key}: ${value}")
        }
    }

    override fun equals(other: Any?): Boolean {
        return map == (other as WritableMapTestImplementation).getMap()
    }
    fun getSize(): Int {return map.size}
    fun getMap(): MutableMap<String, Any?> { return map }
    override fun hasKey(p0: String): Boolean { return map.containsKey(p0) }
    override fun isNull(p0: String): Boolean { return map[p0] == null }
    override fun getBoolean(p0: String): Boolean { return map[p0] as Boolean }
    override fun getDouble(p0: String): Double { return map[p0] as Double }
    override fun getInt(p0: String): Int { return map[p0] as Int }
    override fun getString(p0: String): String? { return map[p0] as String? }
    override fun getArray(p0: String): ReadableArray? { return map[p0] as ReadableArray? }
    override fun getMap(p0: String): ReadableMap? { return map[p0] as ReadableMap? }
    override fun getDynamic(p0: String): Dynamic { return mockk<Dynamic>() }
    override fun getType(p0: String): ReadableType { return mockk<ReadableType>() }
    override fun getEntryIterator(): MutableIterator<MutableMap.MutableEntry<String, Any>> {
        return mockk<MutableIterator<MutableMap.MutableEntry<String, Any>>>()
    }
    override fun keySetIterator(): ReadableMapKeySetIterator {
        return mockk<ReadableMapKeySetIterator>()
    }
    override fun toHashMap(): HashMap<String, Any> {  return mockk<HashMap<String, Any>>() }
    override fun putNull(p0: String) { map[p0] = null  }
    override fun putBoolean(p0: String, p1: Boolean) { map[p0] = p1 }
    override fun putDouble(p0: String, p1: Double) { map[p0] = p1 }
    override fun putInt(p0: String, p1: Int) { map[p0] = p1 }
    override fun putString(p0: String, p1: String?) { map[p0] = p1 }
    override fun putArray(p0: String, p1: ReadableArray?) { map[p0] = p1 }
    override fun putMap(p0: String, p1: ReadableMap?) { map[p0] = p1 }
    override fun merge(p0: ReadableMap) {
        TODO("Not yet implemented")
    }
    override fun copy(): WritableMap {
        TODO("Not yet implemented")
    }
}