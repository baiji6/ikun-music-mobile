import { NativeModules, Platform } from 'react-native'

const { WidgetModule } = NativeModules

// 检查原生模块是否可用
const isAvailable = Platform.OS === 'android' && WidgetModule != null

/**
 * 桌面小组件歌曲信息
 */
export interface WidgetSongInfo {
  /** 歌曲名称 */
  title: string
  /** 艺术家 */
  artist: string
  /** 是否正在播放 */
  isPlaying: boolean
}

/**
 * 更新桌面小组件显示的歌曲信息
 * @param songInfo - 歌曲信息
 */
export const updateWidget = (songInfo: WidgetSongInfo): void => {
  if (!isAvailable) return
  WidgetModule.updateWidget(songInfo)
}

/**
 * 原生模块是否可用
 */
export const isWidgetAvailable = isAvailable