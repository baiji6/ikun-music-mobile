import { memo, useState, useEffect, useCallback } from 'react'
import { View, StyleSheet } from 'react-native'

import { useTheme } from '@/store/theme/hook'
import { createStyle } from '@/utils/tools'
import Text from '@/components/common/Text'
import Slider from '@/components/common/Slider'
import CheckBox from '@/components/common/CheckBox'
import DorpDownMenu from '@/components/common/DorpDownMenu'
import { Icon } from '@/components/common/Icon'
import { useI18n } from '@/lang'
import {
  EQ_PRESETS,
  EQ_BANDS,
  EQ_MIN_LEVEL,
  EQ_MAX_LEVEL,
  getBands,
  setBandLevel,
  getPresets,
  setPreset,
  enable,
  isEqualizerAvailable,
} from '@/nativeModules/EqualizerModule'
import { useSettingValue } from '@/store/setting/hook'
import { updateSetting } from '@/core/common'

// 均衡器预设增益值配置
const PRESET_VALUES: Record<string, number[]> = {
  Normal: [0, 0, 0, 0, 0],
  Rock: [4, 2, -1, 3, 5],
  Pop: [-2, 0, 2, 3, 1],
  Classical: [2, 1, 0, -1, -2],
  Jazz: [3, 1, -1, 0, 2],
  'Hip-Hop': [5, 3, 0, 2, 3],
  Electronic: [5, 3, 0, -2, 4],
  'Bass Boost': [5, 3, 0, 0, 0],
  'Vocal Boost': [-2, -1, 0, 3, 2],
  Custom: [0, 0, 0, 0, 0],
}

// 格式化频率显示
const formatFreq = (hz: number): string => {
  if (hz >= 1000) return `${(hz / 1000).toFixed(1)}kHz`
  return `${hz}Hz`
}

export default memo(() => {
  const t = useI18n()
  const theme = useTheme()

  // 从设置中读取 EQ 状态
  const eqEnabled = useSettingValue('equalizer.enabled')
  const eqPreset = useSettingValue('equalizer.preset')
  const eqBandLevels = useSettingValue('equalizer.bandLevels')

  const [bandLevels, setBandLevels] = useState<number[]>(eqBandLevels ?? [0, 0, 0, 0, 0])
  const [selectedPreset, setSelectedPreset] = useState<string>(eqPreset ?? 'Normal')
  const [isEnabled, setIsEnabled] = useState<boolean>(eqEnabled ?? false)
  const [available, setAvailable] = useState<boolean>(false)

  // 初始化
  useEffect(() => {
    setAvailable(isEqualizerAvailable)
    if (isEqualizerAvailable) {
      void getBands().then((bands) => {
        if (bands && bands.length > 0) {
          setBandLevels(bands)
        }
      })
    }
  }, [])

  // 切换启用/禁用
  const handleToggleEnable = useCallback(
    (checked: boolean) => {
      setIsEnabled(checked)
      enable(checked)
      updateSetting({ 'equalizer.enabled': checked })
    },
    []
  )

  // 选择预设
  const handlePresetChange = useCallback(
    (preset: { id: string }) => {
      const presetName = preset.id
      setSelectedPreset(presetName)
      setPreset(presetName)
      updateSetting({ 'equalizer.preset': presetName as any })

      // 更新波段值
      const levels = PRESET_VALUES[presetName] ?? [0, 0, 0, 0, 0]
      setBandLevels(levels)
      updateSetting({ 'equalizer.bandLevels': levels })

      // 应用预设到原生
      if (isEqualizerAvailable) {
        levels.forEach((level, index) => {
          setBandLevel(index, level)
        })
      }
    },
    []
  )

  // 滑块值变化
  const handleBandChange = useCallback(
    (index: number) =>
      (value: number) => {
        const newLevels = [...bandLevels]
        newLevels[index] = Math.round(value)
        setBandLevels(newLevels)

        // 选择自定义预设
        if (selectedPreset !== 'Custom') {
          setSelectedPreset('Custom')
          updateSetting({ 'equalizer.preset': 'Custom' as any })
        }

        // 保存到设置
        updateSetting({ 'equalizer.bandLevels': newLevels })

        // 应用增益值到原生
        if (isEqualizerAvailable) {
          setBandLevel(index, Math.round(value))
        }
      },
    [bandLevels, selectedPreset]
  )

  // 构建预设菜单
  const presetMenus = EQ_PRESETS.map((preset) => ({
    id: preset,
    label: t(`eq_preset_${preset.replace(/\s+/g, '_').toLowerCase()}` as any),
  }))

  // 获取当前预设的显示名称
  const currentPresetLabel = t(`eq_preset_${selectedPreset.replace(/\s+/g, '_').toLowerCase()}` as any)

  return (
    <View style={styles.container}>
      {!available && (
        <View style={styles.unavailableTip}>
          <Icon name="error" size={24} color={theme['c-600']} />
          <Text style={styles.unavailableText} size={14} color={theme['c-600']}>
            {t('eq_unavailable')}
          </Text>
        </View>
      )}

      {/* 启用/禁用开关 */}
      <View style={styles.toggleRow}>
        <Text size={16}>{t('eq_enable')}</Text>
        <CheckBox
          check={isEnabled}
          onChange={handleToggleEnable}
          size={1.1}
          label={isEnabled ? t('eq_enabled') : t('eq_disabled')}
        />
      </View>

      {/* 预设选择器 */}
      <View style={styles.presetRow}>
        <Text size={14} color={theme['c-500']}>
          {t('eq_preset_label')}
        </Text>
        <DorpDownMenu
          menus={presetMenus}
          activeId={selectedPreset}
          onPress={handlePresetChange}
          btnStyle={styles.presetBtn}
        >
          <View style={styles.presetBtnContent}>
            <Text size={14} color={theme['c-primary-font']}>
              {currentPresetLabel}
            </Text>
            <Icon name="chevron-down" size={14} color={theme['c-primary-font']} />
          </View>
        </DorpDownMenu>
      </View>

      {/* 频率波段滑块 */}
      <View style={styles.bandsContainer}>
        {EQ_BANDS.map((freq, index) => (
          <View key={freq} style={styles.bandRow}>
            <View style={styles.bandLabel}>
              <Text size={14} color={theme['c-500']}>
                {formatFreq(freq)}
              </Text>
              <Text size={11} color={theme['c-400']}>
                {bandLevels[index] > 0 ? `+${bandLevels[index]}` : `${bandLevels[index]}`} dB
              </Text>
            </View>
            <Slider
              value={bandLevels[index]}
              minimumValue={EQ_MIN_LEVEL}
              maximumValue={EQ_MAX_LEVEL}
              step={1}
              onValueChange={handleBandChange(index)}
            />
          </View>
        ))}
      </View>
    </View>
  )
})

const styles = createStyle({
  container: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 20,
  },
  unavailableTip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    marginBottom: 10,
  },
  unavailableText: {
    marginLeft: 8,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingRight: 10,
  },
  presetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingRight: 10,
  },
  presetBtn: {
    minWidth: 120,
  },
  presetBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#999',
  },
  bandsContainer: {
    flex: 1,
  },
  bandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bandLabel: {
    width: 70,
    alignItems: 'center',
    marginRight: 8,
  },
})