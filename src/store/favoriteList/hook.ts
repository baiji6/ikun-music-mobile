import { useEffect, useState } from 'react'
import { state } from './state'

/**
 * 获取收藏列表的 hook
 * @returns 收藏列表
 */
export const useFavoriteList = () => {
  const [list, setList] = useState(state.list)

  useEffect(() => {
    const handleUpdate = () => {
      setList([...state.list])
    }
    // 定时轮询更新
    const interval = setInterval(handleUpdate, 500)
    return () => {
      clearInterval(interval)
    }
  }, [])

  return list
}

/**
 * 获取收藏歌曲数量的 hook
 * @returns 收藏歌曲数量
 */
export const useFavoriteNum = () => {
  const [num, setNum] = useState(state.list.length)

  useEffect(() => {
    const handleUpdate = () => {
      setNum(state.list.length)
    }
    const interval = setInterval(handleUpdate, 500)
    return () => {
      clearInterval(interval)
    }
  }, [])

  return num
}