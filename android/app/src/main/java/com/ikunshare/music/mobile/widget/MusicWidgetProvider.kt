package com.ikunshare.music.mobile.widget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews

/**
 * 音乐桌面小组件 Provider
 * 显示当前播放歌曲信息，提供播放/暂停和下一曲按钮
 */
class MusicWidgetProvider : AppWidgetProvider() {

    companion object {
        const val ACTION_PLAY_PAUSE = "com.ikunshare.music.mobile.widget.ACTION_PLAY_PAUSE"
        const val ACTION_NEXT = "com.ikunshare.music.mobile.widget.ACTION_NEXT"
        const val ACTION_WIDGET_TAP = "com.ikunshare.music.mobile.widget.ACTION_WIDGET_TAP"

        // 当前小组件显示的歌曲信息（静态缓存）
        var currentTitle: String = ""
        var currentArtist: String = ""
        var isPlaying: Boolean = false

        /**
         * 更新所有小组件实例
         */
        fun updateAllWidgets(context: Context, title: String, artist: String, playing: Boolean) {
            currentTitle = title
            currentArtist = artist
            isPlaying = playing

            val appWidgetManager = AppWidgetManager.getInstance(context)
            val ids = appWidgetManager.getAppWidgetIds(
                android.content.ComponentName(context, MusicWidgetProvider::class.java)
            )
            for (id in ids) {
                updateWidget(context, appWidgetManager, id, title, artist, playing)
            }
        }

        /**
         * 更新单个小组件实例
         */
        private fun updateWidget(
            context: Context,
            appWidgetManager: AppWidgetManager,
            appWidgetId: Int,
            title: String,
            artist: String,
            playing: Boolean
        ) {
            val views = RemoteViews(context.packageName, com.ikunshare.music.mobile.R.layout.widget_music)

            // 设置歌曲名称
            views.setTextViewText(com.ikunshare.music.mobile.R.id.widget_title, title.ifEmpty { "未知歌曲" })
            // 设置艺术家
            views.setTextViewText(com.ikunshare.music.mobile.R.id.widget_artist, artist.ifEmpty { "未知艺术家" })

            // 设置播放/暂停按钮图标
            val playPauseIcon = if (playing) {
                com.ikunshare.music.mobile.R.drawable.ic_widget_pause
            } else {
                com.ikunshare.music.mobile.R.drawable.ic_widget_play
            }
            views.setImageViewResource(com.ikunshare.music.mobile.R.id.widget_btn_play_pause, playPauseIcon)

            // 播放/暂停按钮点击事件
            val playPauseIntent = Intent(context, MusicWidgetProvider::class.java).apply {
                action = ACTION_PLAY_PAUSE
                putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId)
            }
            val playPausePendingIntent = PendingIntent.getBroadcast(
                context, appWidgetId, playPauseIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(com.ikunshare.music.mobile.R.id.widget_btn_play_pause, playPausePendingIntent)

            // 下一曲按钮点击事件
            val nextIntent = Intent(context, MusicWidgetProvider::class.java).apply {
                action = ACTION_NEXT
                putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId)
            }
            val nextPendingIntent = PendingIntent.getBroadcast(
                context, appWidgetId + 1000, nextIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(com.ikunshare.music.mobile.R.id.widget_btn_next, nextPendingIntent)

            // 点击小组件整体区域打开应用
            val tapIntent = Intent(context, MusicWidgetProvider::class.java).apply {
                action = ACTION_WIDGET_TAP
            }
            val tapPendingIntent = PendingIntent.getBroadcast(
                context, appWidgetId + 2000, tapIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(com.ikunshare.music.mobile.R.id.widget_root, tapPendingIntent)

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }
    }

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        for (appWidgetId in appWidgetIds) {
            updateWidget(context, appWidgetManager, appWidgetId, currentTitle, currentArtist, isPlaying)
        }
    }

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)

        when (intent.action) {
            ACTION_PLAY_PAUSE -> {
                // 发送播放/暂停事件到 React Native
                sendEventToApp(context, "playPause")
            }
            ACTION_NEXT -> {
                // 发送下一曲事件到 React Native
                sendEventToApp(context, "next")
            }
            ACTION_WIDGET_TAP -> {
                // 打开应用
                val launchIntent = context.packageManager.getLaunchIntentForPackage(context.packageName)
                if (launchIntent != null) {
                    launchIntent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                    context.startActivity(launchIntent)
                }
            }
        }
    }

    /**
     * 发送事件到 React Native 端
     */
    private fun sendEventToApp(context: Context, event: String) {
        try {
            val serviceIntent = Intent(context, MusicWidgetService::class.java).apply {
                action = event
            }
            context.startService(serviceIntent)
        } catch (e: Exception) {
            // 如果服务未启动，尝试直接打开应用
            val launchIntent = context.packageManager.getLaunchIntentForPackage(context.packageName)
            if (launchIntent != null) {
                launchIntent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
                launchIntent.putExtra("widget_event", event)
                context.startActivity(launchIntent)
            }
        }
    }
}