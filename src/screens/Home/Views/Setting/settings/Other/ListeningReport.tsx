import { memo, useCallback } from 'react'
import { View } from 'react-native'

import SubTitle from '../../components/SubTitle'
import Button from '../../components/Button'
import { useI18n } from '@/lang'
import { navigations } from '@/navigation'
import commonState from '@/store/common/state'

/**
 * 设置 - 其他 - 听歌报告入口
 */
export default memo(() => {
  const t = useI18n()

  const handlePress = useCallback(() => {
    navigations.pushListeningReportScreen(commonState.componentIds.home!)
  }, [])

  return (
    <SubTitle title={t('nav_listening_report')}>
      <View>
        <Button onPress={handlePress}>
          {t('nav_listening_report')}
        </Button>
      </View>
    </SubTitle>
  )
})