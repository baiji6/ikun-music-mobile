/**
 * 私人FM 状态管理
 * 管理当前播放歌曲、推荐队列、播放历史、播放状态等
 */

/** 推荐原因类型 */
export interface RecommendReason {
  /** 推荐原因描述 */
  text: string
  /** 推荐来源：favorite-收藏喜好, history-播放历史, artist-艺人偏好, genre-风格偏好 */
  source: 'favorite' | 'history' | 'artist' | 'genre'
}

export interface InitState {
  /** 当前播放的歌曲 */
  currentMusicInfo: LX.Music.MusicInfo | null
  /** 推荐歌曲队列 */
  queue: LX.Music.MusicInfo[]
  /** 已播放的歌曲列表（用于避免重复推荐） */
  playedSongs: string[]
  /** 是否正在播放 */
  isPlaying: boolean
  /** 是否正在加载推荐 */
  isLoading: boolean
  /** 当前歌曲的推荐原因 */
  recommendReason: RecommendReason | null
  /** 加载状态 */
  loadStatus: 'NOT_LOAD' | 'LOADING' | 'LOADED'
}

const state: InitState = {
  currentMusicInfo: null,
  queue: [],
  playedSongs: [],
  isPlaying: false,
  isLoading: false,
  recommendReason: null,
  loadStatus: 'NOT_LOAD',
}

export { state }