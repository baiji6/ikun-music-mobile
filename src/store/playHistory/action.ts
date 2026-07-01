import { state } from './state'

/**
 * 添加播放历史记录
 * 最多保留500条，最新播放的在前，去重
 * @param musicInfo 歌曲信息
 */
export const addPlayHistory = (musicInfo: LX.Music.MusicInfo) => {
  // 移除已存在的相同歌曲（去重）
  const index = state.list.findIndex((item) => item.id === musicInfo.id)
  if (index > -1) {
    state.list.splice(index, 1)
  }
  // 最新播放的插入到最前面
  state.list.unshift(musicInfo)
  // 最多保留500条
  if (state.list.length > 500) {
    state.list = state.list.slice(0, 500)
  }
}

/**
 * 移除播放历史记录
 * @param musicInfo 歌曲信息
 */
export const removePlayHistory = (musicInfo: LX.Music.MusicInfo) => {
  const index = state.list.findIndex((item) => item.id === musicInfo.id)
  if (index > -1) {
    state.list.splice(index, 1)
  }
}

/**
 * 清空播放历史记录
 */
export const clearPlayHistory = () => {
  state.list = []
}

/**
 * 获取播放历史列表
 * @returns 播放历史列表
 */
export const getPlayHistory = (): LX.Music.MusicInfo[] => {
  return [...state.list]
}