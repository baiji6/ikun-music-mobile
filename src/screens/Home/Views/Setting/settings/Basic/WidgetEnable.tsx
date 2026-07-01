import { updateSetting } from '@/core/common'
import { useI18n } from '@/lang'
import { createStyle } from '@/utils/tools'
import { memo } from 'react'
import { View } from 'react-native'
import { useSettingValue } from '@/store/setting/hook'

import CheckBoxItem from '../../components/CheckBoxItem'

/**
 * 桌面小组件启用设置
 */
export default memo(() => {
  const t = useI18n()
  const widgetEnabled = useSettingValue('widget.enabled')
  const setWidgetEnable = (widgetEnabled: boolean) => {
    updateSetting({ 'widget.enabled': widgetEnabled })
  }

  return (
    <View style={styles.content}>
      <CheckBoxItem
        check={widgetEnabled}
        onChange={setWidgetEnable}
        helpDesc={t('setting_widget_enable_tip')}
        label={t('setting_widget_enable')}
      />
    </View>
  )
})

const styles = createStyle({
  content: {
    marginTop: 5,
  },
})