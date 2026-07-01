import { action } from '@/store/favoriteList'
import { saveFavoriteList } from '@/core/favoriteList'

/**
 * 添加收藏歌曲
 * @param musicInfo 歌曲信息
 */
export const addFavorite = async (musicInfo: LX.Music.MusicInfo) => {
  action.addFavorite(musicInfo)
  await saveFavoriteList(action.getFavoriteList())
}

/**
 * 移除收藏歌曲
 * @param musicInfo 歌曲信息
 */
export const removeFavorite = async (musicInfo: LX.Music.MusicInfo) => {
  action.removeFavorite(musicInfo)
  await saveFavoriteList(action.getFavoriteList())
}

/**
 * 切换收藏状态
 * @param musicInfo 歌曲信息
 */
export const toggleFavorite = async (musicInfo: LX.Music.MusicInfo) => {
  action.toggleFavorite(musicInfo)
  await saveFavoriteList(action.getFavoriteList())
}

/**
 * 清空收藏列表
 */
export const clearFavorite = async () => {
  action.clearFavorite()
  await saveFavoriteList([])
}

/**
 * 检查歌曲是否已收藏
 * @param musicInfo 歌曲信息
 * @returns 是否已收藏
 */
export const hasFavorite = (musicInfo: LX.Music.MusicInfo): boolean => {
  return action.hasFavorite(musicInfo)
}