import { action } from '@/store/playHistory'
import { savePlayHistoryList } from '@/core/playHistory'

/**
 * 添加播放历史记录
 * @param musicInfo 歌曲信息
 */
export const addPlayHistory = async (musicInfo: LX.Music.MusicInfo) => {
  action.addPlayHistory(musicInfo)
  await savePlayHistoryList(action.getPlayHistory())
}

/**
 * 移除播放历史记录
 * @param musicInfo 歌曲信息
 */
export const removePlayHistory = async (musicInfo: LX.Music.MusicInfo) => {
  action.removePlayHistory(musicInfo)
  await savePlayHistoryList(action.getPlayHistory())
}

/**
 * 检查歌曲是否在播放历史中
 * @param musicInfo 歌曲信息
 * @returns 是否在播放历史中
 */
export const hasPlayHistory = (musicInfo: LX.Music.MusicInfo): boolean => {
  return action.getPlayHistory().some((item) => item.id === musicInfo.id)
}