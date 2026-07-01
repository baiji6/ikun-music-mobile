interface InitState {
  /** 收藏歌曲列表 */
  list: LX.Music.MusicInfo[]
  /** 加载状态 */
  loadStatus: 'NOT_LOAD' | 'LOADING' | 'LOADED'
}

const state: InitState = {
  list: [],
  loadStatus: 'NOT_LOAD',
}

export { state }