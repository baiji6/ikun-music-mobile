import { state } from './state'

/**
 * 检查歌曲是否已收藏
 * @param musicInfo 歌曲信息
 * @returns 是否已收藏
 */
export const hasFavorite = (musicInfo: LX.Music.MusicInfo): boolean => {
  return state.list.some((item) => item.id === musicInfo.id)
}

/**
 * 添加收藏歌曲
 * @param musicInfo 歌曲信息
 */
export const addFavorite = (musicInfo: LX.Music.MusicInfo) => {
  if (hasFavorite(musicInfo)) return
  state.list = [...state.list, musicInfo]
}

/**
 * 移除收藏歌曲
 * @param musicInfo 歌曲信息
 */
export const removeFavorite = (musicInfo: LX.Music.MusicInfo) => {
  state.list = state.list.filter((item) => item.id !== musicInfo.id)
}

/**
 * 切换收藏状态
 * @param musicInfo 歌曲信息
 */
export const toggleFavorite = (musicInfo: LX.Music.MusicInfo) => {
  if (hasFavorite(musicInfo)) {
    removeFavorite(musicInfo)
  } else {
    addFavorite(musicInfo)
  }
}

/**
 * 清空收藏列表
 */
export const clearFavorite = () => {
  state.list = []
}

/**
 * 获取收藏列表
 * @returns 收藏列表
 */
export const getFavoriteList = (): LX.Music.MusicInfo[] => {
  return [...state.list]
}

/**
 * 设置收藏列表
 * @param list 收藏列表
 */
export const setFavoriteList = (list: LX.Music.MusicInfo[]) => {
  state.list = [...list]
}