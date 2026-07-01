import { NativeModules, Platform } from 'react-native'

const { EqualizerModule } = NativeModules

// 均衡器预设名称
export const EQ_PRESETS = [
  'Normal',
  'Rock',
  'Pop',
  'Classical',
  'Jazz',
  'Hip-Hop',
  'Electronic',
  'Bass Boost',
  'Vocal Boost',
  'Custom',
] as const

export type EQPreset = (typeof EQ_PRESETS)[number]

// 频率波段（Hz）
export const EQ_BANDS = [60, 230, 910, 3600, 14000] as const

// 均衡器增益范围
export const EQ_MIN_LEVEL = -15
export const EQ_MAX_LEVEL = 15

// 检查原生模块是否可用
const isAvailable = Platform.OS === 'android' && EqualizerModule != null

/**
 * 获取当前频率波段增益值
 * @returns 返回各波段的增益值数组 (dB)
 */
export const getBands = async (): Promise<number[]> => {
  if (!isAvailable) return [0, 0, 0, 0, 0]
  return EqualizerModule.getBands()
}

/**
 * 设置指定频率波段的增益值
 * @param band - 波段索引 (0-4)
 * @param level - 增益值 (-15 到 +15 dB)
 */
export const setBandLevel = (band: number, level: number): void => {
  if (!isAvailable) return
  const clampedLevel = Math.max(EQ_MIN_LEVEL, Math.min(EQ_MAX_LEVEL, level))
  EqualizerModule.setBandLevel(band, clampedLevel)
}

/**
 * 获取可用的预设列表
 * @returns 预设名称数组
 */
export const getPresets = async (): Promise<string[]> => {
  if (!isAvailable) return [...EQ_PRESETS]
  return EqualizerModule.getPresets()
}

/**
 * 设置均衡器预设
 * @param preset - 预设名称
 */
export const setPreset = (preset: string): void => {
  if (!isAvailable) return
  EqualizerModule.setPreset(preset)
}

/**
 * 启用/禁用均衡器
 * @param isEnabled - 是否启用
 */
export const enable = (isEnabled: boolean): void => {
  if (!isAvailable) return
  EqualizerModule.enable(isEnabled)
}

/**
 * 原生模块是否可用
 */
export const isEqualizerAvailable = isAvailable