import { getData, saveData } from '@/plugins/storage'
import { action } from '@/store/playHistory'

const PLAY_HISTORY_KEY = 'play_history_list'

/**
 * 获取播放历史列表
 * @returns 播放历史列表
 */
export const getPlayHistoryList = async (): Promise<LX.Music.MusicInfo[]> => {
  const list = await getData<LX.Music.MusicInfo[]>(PLAY_HISTORY_KEY)
  return list ?? []
}

/**
 * 保存播放历史列表到存储
 * @param list 播放历史列表
 */
export const savePlayHistoryList = async (list: LX.Music.MusicInfo[]) => {
  await saveData(PLAY_HISTORY_KEY, list)
}

/**
 * 加载播放历史到 store
 */
export const loadPlayHistory = async () => {
  const list = await getPlayHistoryList()
  action.clearPlayHistory()
  for (const item of list) {
    action.addPlayHistory(item)
  }
}

/**
 * 添加播放历史
 * @param musicInfo 歌曲信息
 */
export const addPlayHistory = async (musicInfo: LX.Music.MusicInfo) => {
  action.addPlayHistory(musicInfo)
  await savePlayHistoryList(action.getPlayHistory())
}

/**
 * 移除播放历史
 * @param musicInfo 歌曲信息
 */
export const removePlayHistory = async (musicInfo: LX.Music.MusicInfo) => {
  action.removePlayHistory(musicInfo)
  await savePlayHistoryList(action.getPlayHistory())
}

/**
 * 清空播放历史
 */
export const clearPlayHistory = async () => {
  action.clearPlayHistory()
  await savePlayHistoryList([])
}