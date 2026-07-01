import { useEffect, useState } from 'react'
import { state } from './state'

/**
 * 获取播放历史列表的 hook
 * @returns 播放历史列表
 */
export const usePlayHistoryList = () => {
  const [list, setList] = useState(state.list)

  useEffect(() => {
    const handleUpdate = () => {
      setList([...state.list])
    }
    // 由于 state.list 是响应式的，这里通过定时器或事件方式更新
    // 在实际使用中，组件会通过 state.list 直接获取最新数据
    const interval = setInterval(handleUpdate, 500)
    return () => {
      clearInterval(interval)
    }
  }, [])

  return list
}