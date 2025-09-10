package com.scannerkit

import android.content.Context
import android.view.View
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.events.RCTEventEmitter
import com.facebook.react.uimanager.annotations.ReactProp

class ARObjectScannerView(context: ThemedReactContext) : View(context) {
  // Placeholder view; implement ARCore scanning here using Sceneform/ARCore APIs.
}

class ARObjectScannerViewManager(private val reactContext: ReactApplicationContext) : SimpleViewManager<ARObjectScannerView>() {
  override fun getName(): String = "ARObjectScannerView"

  override fun createViewInstance(reactContext: ThemedReactContext): ARObjectScannerView {
    return ARObjectScannerView(reactContext)
  }

  // Map direct events for RN <View /> props like onNativeProgress, etc.
  override fun getExportedCustomDirectEventTypeConstants(): MutableMap<String, Any> {
    val builder = com.facebook.react.common.MapBuilder.builder<String, Any>()
    builder.put("onNativeProgress", com.facebook.react.common.MapBuilder.of("registrationName", "onNativeProgress"))
    builder.put("onNativeError", com.facebook.react.common.MapBuilder.of("registrationName", "onNativeError"))
    builder.put("onNativeCompleted", com.facebook.react.common.MapBuilder.of("registrationName", "onNativeCompleted"))
    return builder.build()
  }
}
