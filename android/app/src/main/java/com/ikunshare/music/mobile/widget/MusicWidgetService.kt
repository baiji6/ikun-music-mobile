package com.ikunshare.music.mobile.widget

import android.app.Service
import android.content.Intent
import android.os.IBinder

/**
 * 音乐小组件更新服务
 * 处理来自 React Native 端的小组件更新请求和小组件按钮事件
 */
class MusicWidgetService : Service() {

    companion object {
        const val ACTION_UPDATE = "com.ikunshare.music.mobile.widget.UPDATE"
        const val EXTRA_TITLE = "title"
        const val EXTRA_ARTIST = "artist"
        const val EXTRA_IS_PLAYING = "isPlaying"
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_UPDATE -> {
                // 从 React Native 端收到更新请求
                val title = intent.getStringExtra(EXTRA_TITLE) ?: ""
                val artist = intent.getStringExtra(EXTRA_ARTIST) ?: ""
                val isPlaying = intent.getBooleanExtra(EXTRA_IS_PLAYING, false)

                MusicWidgetProvider.updateAllWidgets(applicationContext, title, artist, isPlaying)
            }
            "playPause" -> {
                // 小组件播放/暂停按钮被点击，通过 Intent 传递给 MainActivity
                sendEventToMainActivity("widget_play_pause")
            }
            "next" -> {
                // 小组件下一曲按钮被点击
                sendEventToMainActivity("widget_next")
            }
        }

        return START_NOT_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? = null

    /**
     * 通过 Intent 发送事件到 MainActivity
     */
    private fun sendEventToMainActivity(event: String) {
        val launchIntent = packageManager.getLaunchIntentForPackage(packageName)
        if (launchIntent != null) {
            launchIntent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP
            launchIntent.putExtra("widget_event", event)
            startActivity(launchIntent)
        }
    }
}