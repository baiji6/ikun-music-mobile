import Btn from './Btn'
import { memo } from 'react'
import { setNavActiveId } from '@/core/common'

/**
 * 均衡器快速访问按钮
 * 点击后跳转到设置页面的均衡器设置
 */
export default memo(() => {
  const handlePress = () => {
    global.lx.settingActiveId = 'equalizer'
    setNavActiveId('nav_setting')
  }

  return <Btn icon="equalizer" onPress={handlePress} />
})