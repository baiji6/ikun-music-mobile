/** 加载状态枚举 */
export enum LoadState {
  NOT_LOAD = 'NOT_LOAD',
  LOADING = 'LOADING',
  LOADED = 'LOADED',
}

interface InitState {
  /** 播放历史列表 */
  list: LX.Music.MusicInfo[]
  /** 历史视图是否可见 */
  isVisible: boolean
  /** 加载状态 */
  loadStatus: LoadState
}

const state: InitState = {
  list: [],
  isVisible: false,
  loadStatus: LoadState.NOT_LOAD,
}

export { state }