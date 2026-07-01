import { updateWidget } from '@/nativeModules/WidgetModule'
import settingState from '@/store/setting/state'
import playerState from '@/store/player/state'

/**
 * 桌面小组件集成
 * 监听播放器状态变化并更新桌面小组件
 */
const initWidgetIntegration = () => {
  // 监听歌曲信息变化
  const handleMusicInfoChanged = () => {
    if (!settingState.setting['widget.enabled']) return
    updateWidget({
      title: playerState.musicInfo.name || '未知歌曲',
      artist: playerState.musicInfo.singer || '未知艺术家',
      isPlaying: playerState.isPlay,
    })
  }

  // 监听播放状态变化
  const handlePlayStateChanged = (isPlaying: boolean) => {
    if (!settingState.setting['widget.enabled']) return
    updateWidget({
      title: playerState.musicInfo.name || '未知歌曲',
      artist: playerState.musicInfo.singer || '未知艺术家',
      isPlaying,
    })
  }

  // 监听设置变化
  const handleConfigUpdated = (keys: Array<keyof LX.AppSetting>) => {
    if (!keys.includes('widget.enabled')) return
    if (settingState.setting['widget.enabled']) {
      // 启用小组件时立即更新
      updateWidget({
        title: playerState.musicInfo.name || '未知歌曲',
        artist: playerState.musicInfo.singer || '未知艺术家',
        isPlaying: playerState.isPlay,
      })
    }
  }

  global.state_event.on('playerMusicInfoChanged', handleMusicInfoChanged)
  global.state_event.on('playStateChanged', handlePlayStateChanged)
  global.state_event.on('configUpdated', handleConfigUpdated)
}

export default initWidgetIntegration