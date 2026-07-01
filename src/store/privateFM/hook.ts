import { useEffect, useState } from 'react'
import { state, type RecommendReason } from './state'

/**
 * 私人FM Hook - 获取当前歌曲信息
 * @returns 当前歌曲信息
 */
export const usePrivateFMMusicInfo = () => {
  const [value, setValue] = useState(state.currentMusicInfo)

  useEffect(() => {
    const interval = setInterval(() => {
      setValue(state.currentMusicInfo)
    }, 500)
    return () => {
      clearInterval(interval)
    }
  }, [])

  return value
}

/**
 * 私人FM Hook - 获取队列
 * @returns 推荐队列
 */
export const usePrivateFMQueue = () => {
  const [value, setValue] = useState(state.queue)

  useEffect(() => {
    const interval = setInterval(() => {
      setValue([...state.queue])
    }, 500)
    return () => {
      clearInterval(interval)
    }
  }, [])

  return value
}

/**
 * 私人FM Hook - 获取播放状态
 * @returns 播放状态
 */
export const usePrivateFMIsPlaying = () => {
  const [value, setValue] = useState(state.isPlaying)

  useEffect(() => {
    const interval = setInterval(() => {
      setValue(state.isPlaying)
    }, 500)
    return () => {
      clearInterval(interval)
    }
  }, [])

  return value
}

/**
 * 私人FM Hook - 获取加载状态
 * @returns 加载状态
 */
export const usePrivateFMLoading = () => {
  const [value, setValue] = useState(state.isLoading)

  useEffect(() => {
    const interval = setInterval(() => {
      setValue(state.isLoading)
    }, 500)
    return () => {
      clearInterval(interval)
    }
  }, [])

  return value
}

/**
 * 私人FM Hook - 获取推荐原因
 * @returns 推荐原因
 */
export const usePrivateFMReason = () => {
  const [value, setValue] = useState<RecommendReason | null>(state.recommendReason)

  useEffect(() => {
    const interval = setInterval(() => {
      setValue(state.recommendReason)
    }, 500)
    return () => {
      clearInterval(interval)
    }
  }, [])

  return value
}

/**
 * 私人FM Hook - 获取完整状态
 * @returns 完整状态
 */
export const usePrivateFM = () => {
  const [value, setValue] = useState({ ...state })

  useEffect(() => {
    const interval = setInterval(() => {
      setValue({ ...state })
    }, 500)
    return () => {
      clearInterval(interval)
    }
  }, [])

  return value
}