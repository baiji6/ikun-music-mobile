import { memo } from 'react'

import Section from '../../components/Section'
import EqualizerView from '../../../Equalizer'
import { useI18n } from '@/lang'

/**
 * 均衡器设置页面
 * 在设置中显示均衡器调节界面
 */
export default memo(() => {
  const t = useI18n()

  return (
    <Section title={t('setting_equalizer')}>
      <EqualizerView />
    </Section>
  )
})