package com.ikunshare.music.mobile.widget

import android.content.Intent
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap

/**
 * 桌面小组件 React Native 桥接模块
 * 提供 updateWidget 方法供 JS 端调用
 */
class WidgetModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "WidgetModule"

    /**
     * 更新桌面小组件
     * @param songInfo 包含 title, artist, isPlaying 的歌曲信息
     */
    @ReactMethod
    fun updateWidget(songInfo: ReadableMap) {
        val title = if (songInfo.hasKey("title")) songInfo.getString("title") ?: "" else ""
        val artist = if (songInfo.hasKey("artist")) songInfo.getString("artist") ?: "" else ""
        val isPlaying = if (songInfo.hasKey("isPlaying")) songInfo.getBoolean("isPlaying") else false

        val serviceIntent = Intent(reactApplicationContext, MusicWidgetService::class.java).apply {
            action = MusicWidgetService.ACTION_UPDATE
            putExtra(MusicWidgetService.EXTRA_TITLE, title)
            putExtra(MusicWidgetService.EXTRA_ARTIST, artist)
            putExtra(MusicWidgetService.EXTRA_IS_PLAYING, isPlaying)
        }
        reactApplicationContext.startService(serviceIntent)
    }
}