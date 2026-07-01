import Btn from './Btn'
import { navigations } from '@/navigation'
import commonState from '@/store/common/state'

/**
 * 分享歌词卡片按钮
 */
export default () => {
  const handleShowLyricCard = () => {
    navigations.pushLyricCardScreen(commonState.componentIds.playDetail!)
  }

  return <Btn icon="lyric-on" onPress={handleShowLyricCard} />
}