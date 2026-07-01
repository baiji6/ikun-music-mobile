import { getData, saveData } from '@/plugins/storage'
import { action } from '@/store/favoriteList'

const FAVORITE_LIST_KEY = 'favorite_list'

/**
 * 获取收藏歌曲列表
 * @returns 收藏歌曲列表
 */
export const getFavoriteList = async (): Promise<LX.Music.MusicInfo[]> => {
  const list = await getData<LX.Music.MusicInfo[]>(FAVORITE_LIST_KEY)
  return list ?? []
}

/**
 * 保存收藏歌曲列表到存储
 * @param list 收藏歌曲列表
 */
export const saveFavoriteList = async (list: LX.Music.MusicInfo[]) => {
  await saveData(FAVORITE_LIST_KEY, list)
}

/**
 * 加载收藏列表到 store
 */
export const loadFavoriteList = async () => {
  const list = await getFavoriteList()
  action.setFavoriteList(list)
}

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
export const clearFavoriteList = async () => {
  action.clearFavorite()
  await saveFavoriteList([])
}

/**
 * 检查歌曲是否已收藏
 * @param musicInfo 歌曲信息
 * @returns 是否已收藏
 */
export { hasFavorite } from '@/store/favoriteList/action'