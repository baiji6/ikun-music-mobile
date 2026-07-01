import { state, type RecommendReason } from './state'

/**
 * 设置当前播放的歌曲
 * @param musicInfo 歌曲信息
 */
export const setCurrentMusic = (musicInfo: LX.Music.MusicInfo | null) => {
  state.currentMusicInfo = musicInfo
}

/**
 * 设置推荐队列
 * @param queue 歌曲队列
 */
export const setQueue = (queue: LX.Music.MusicInfo[]) => {
  state.queue = [...queue]
}

/**
 * 从队列中取出下一首歌曲
 * @returns 下一首歌曲，如果没有则返回 null
 */
export const popNextFromQueue = (): LX.Music.MusicInfo | null => {
  if (state.queue.length === 0) return null
  const next = state.queue.shift()!
  return next
}

/**
 * 添加歌曲到队列末尾
 * @param musicInfos 歌曲列表
 */
export const appendToQueue = (musicInfos: LX.Music.MusicInfo[]) => {
  state.queue = [...state.queue, ...musicInfos]
}

/**
 * 清空推荐队列
 */
export const clearQueue = () => {
  state.queue = []
}

/**
 * 添加已播放歌曲记录
 * @param songId 歌曲ID
 */
export const addPlayedSong = (songId: string) => {
  if (!state.playedSongs.includes(songId)) {
    state.playedSongs = [...state.playedSongs, songId]
  }
}

/**
 * 获取已播放歌曲ID列表
 * @returns 已播放歌曲ID列表
 */
export const getPlayedSongs = (): string[] => {
  return [...state.playedSongs]
}

/**
 * 设置播放状态
 * @param isPlaying 是否正在播放
 */
export const setIsPlaying = (isPlaying: boolean) => {
  state.isPlaying = isPlaying
}

/**
 * 设置加载状态
 * @param isLoading 是否正在加载
 */
export const setIsLoading = (isLoading: boolean) => {
  state.isLoading = isLoading
}

/**
 * 设置推荐原因
 * @param reason 推荐原因
 */
export const setRecommendReason = (reason: RecommendReason | null) => {
  state.recommendReason = reason
}

/**
 * 设置加载状态
 * @param loadStatus 加载状态
 */
export const setLoadStatus = (loadStatus: 'NOT_LOAD' | 'LOADING' | 'LOADED') => {
  state.loadStatus = loadStatus
}

/**
 * 获取当前歌曲
 * @returns 当前歌曲信息
 */
export const getCurrentMusic = (): LX.Music.MusicInfo | null => {
  return state.currentMusicInfo
}

/**
 * 获取队列
 * @returns 队列
 */
export const getQueue = (): LX.Music.MusicInfo[] => {
  return [...state.queue]
}