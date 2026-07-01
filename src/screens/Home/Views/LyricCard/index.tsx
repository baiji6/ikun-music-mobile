import { memo, useState, useCallback, useRef, useMemo } from 'react'
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { useI18n } from '@/lang'
import { useTheme } from '@/store/theme/hook'
import Text from '@/components/common/Text'
import { Icon } from '@/components/common/Icon'
import { createStyle, toast } from '@/utils/tools'
import { GradientCard, AlbumArtCard, MinimalCard } from '@/components/LyricCard'
import { pop } from '@/navigation'
import commonState from '@/store/common/state'
import { useStatusbarHeight } from '@/store/common/hook'
import { usePlayerMusicInfo } from '@/store/player/hook'
import { useLrcPlay, useLrcSet } from '@/plugins/lyric'
import Clipboard from '@react-native-clipboard/clipboard'

type CardTemplate = 'gradient' | 'albumArt' | 'minimal'
type GradientType = 'dark' | 'light' | 'colorful'
type LyricMode = 'current' | 'full' | 'favorite'

/**
 * 歌词卡片分享页面
 */
export default memo(() => {
  const t = useI18n()
  const theme = useTheme()
  const statusBarHeight = useStatusbarHeight()
  const musicInfo = usePlayerMusicInfo()
  const { text: currentLyric } = useLrcPlay()
  const lyricLines = useLrcSet()

  const [template, setTemplate] = useState<CardTemplate>('gradient')
  const [gradientType, setGradientType] = useState<GradientType>('dark')
  const [textColor, setTextColor] = useState('#FFFFFF')
  const [fontSize, setFontSize] = useState(18)
  const [showInfo, setShowInfo] = useState(true)
  const [showWatermark, setShowWatermark] = useState(true)
  const [lyricMode, setLyricMode] = useState<LyricMode>('current')

  // 获取要显示的歌词
  const displayLyrics = useMemo(() => {
    switch (lyricMode) {
      case 'current':
        return currentLyric || t('lyric_card_no_lyric')
      case 'full':
        return lyricLines.map((l) => l.text).join('\n') || t('lyric_card_no_lyric')
      case 'favorite':
        return currentLyric || t('lyric_card_no_lyric')
      default:
        return currentLyric || t('lyric_card_no_lyric')
    }
  }, [lyricMode, currentLyric, lyricLines, t])

  const handleBack = useCallback(() => {
    void pop(commonState.componentIds.playDetail!)
  }, [])

  // 分享歌词文字
  const handleShareText = useCallback(() => {
    const shareText = `${displayLyrics}\n\n—— ${musicInfo.name} - ${musicInfo.singer}`
    Clipboard.setString(shareText)
    toast(t('copy_name_tip'))
  }, [displayLyrics, musicInfo, t])

  const templateLabels: Record<CardTemplate, string> = {
    gradient: t('lyric_card_template_gradient'),
    albumArt: t('lyric_card_template_album_art'),
    minimal: t('lyric_card_template_minimal'),
  }

  const gradientLabels: Record<GradientType, string> = {
    dark: t('lyric_card_gradient_dark'),
    light: t('lyric_card_gradient_light'),
    colorful: t('lyric_card_gradient_colorful'),
  }

  const lyricModeLabels: Record<LyricMode, string> = {
    current: t('lyric_card_mode_current'),
    full: t('lyric_card_mode_full'),
    favorite: t('lyric_card_mode_favorite'),
  }

  const textColorOptions = ['#FFFFFF', '#333333', '#E74C3C', '#2ECC71', '#3498DB', '#F39C12']

  const renderCard = () => {
    const commonProps = {
      lyrics: displayLyrics,
      songName: musicInfo.name || t('lyric_card_unknown_song'),
      artist: musicInfo.singer || t('lyric_card_unknown_artist'),
      textColor,
      fontSize,
      showInfo,
      showWatermark,
      albumArtUrl: musicInfo.pic || undefined,
    }

    switch (template) {
      case 'gradient':
        return <GradientCard {...commonProps} gradientType={gradientType} />
      case 'albumArt':
        return <AlbumArtCard {...commonProps} />
      case 'minimal':
        return <MinimalCard {...commonProps} />
      default:
        return <GradientCard {...commonProps} gradientType={gradientType} />
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: theme['c-content-background'] }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 头部 */}
        <View style={{ paddingTop: statusBarHeight }}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
              <Icon name="chevron-left" size={22} />
            </TouchableOpacity>
            <Text style={styles.headerTitle} size={18}>
              {t('lyric_card_title')}
            </Text>
            <TouchableOpacity onPress={handleShareText} style={styles.backBtn}>
              <Icon name="share" size={20} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 卡片预览 */}
        <View style={styles.previewContainer}>
          {renderCard()}
        </View>

        {/* 模板选择 */}
        <View style={styles.section}>
          <Text size={13} style={styles.sectionTitle}>
            {t('lyric_card_template')}
          </Text>
          <View style={styles.optionRow}>
            {(['gradient', 'albumArt', 'minimal'] as CardTemplate[]).map((tpl) => (
              <TouchableOpacity
                key={tpl}
                style={[
                  styles.optionBtn,
                  {
                    backgroundColor:
                      template === tpl ? theme['c-primary'] : theme['c-primary-alpha-100'],
                  },
                ]}
                onPress={() => setTemplate(tpl)}
              >
                <Text
                  size={12}
                  color={template === tpl ? theme['c-primary-light-100'] : theme['c-font']}
                >
                  {templateLabels[tpl]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 渐变类型（仅在渐变模板时显示） */}
        {template === 'gradient' && (
          <View style={styles.section}>
            <Text size={13} style={styles.sectionTitle}>
              {t('lyric_card_gradient_type')}
            </Text>
            <View style={styles.optionRow}>
              {(['dark', 'light', 'colorful'] as GradientType[]).map((gt) => (
                <TouchableOpacity
                  key={gt}
                  style={[
                    styles.optionBtn,
                    {
                      backgroundColor:
                        gradientType === gt ? theme['c-primary'] : theme['c-primary-alpha-100'],
                    },
                  ]}
                  onPress={() => setGradientType(gt)}
                >
                  <Text
                    size={12}
                    color={gradientType === gt ? theme['c-primary-light-100'] : theme['c-font']}
                  >
                    {gradientLabels[gt]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* 歌词模式 */}
        <View style={styles.section}>
          <Text size={13} style={styles.sectionTitle}>
            {t('lyric_card_lyric_mode')}
          </Text>
          <View style={styles.optionRow}>
            {(['current', 'full', 'favorite'] as LyricMode[]).map((mode) => (
              <TouchableOpacity
                key={mode}
                style={[
                  styles.optionBtn,
                  {
                    backgroundColor:
                      lyricMode === mode ? theme['c-primary'] : theme['c-primary-alpha-100'],
                  },
                ]}
                onPress={() => setLyricMode(mode)}
              >
                <Text
                  size={12}
                  color={lyricMode === mode ? theme['c-primary-light-100'] : theme['c-font']}
                >
                  {lyricModeLabels[mode]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 文字颜色 */}
        <View style={styles.section}>
          <Text size={13} style={styles.sectionTitle}>
            {t('lyric_card_text_color')}
          </Text>
          <View style={styles.optionRow}>
            {textColorOptions.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorBtn,
                  {
                    backgroundColor: color,
                    borderWidth: textColor === color ? 2 : 0,
                    borderColor: theme['c-primary'],
                  },
                ]}
                onPress={() => setTextColor(color)}
              />
            ))}
          </View>
        </View>

        {/* 字体大小 */}
        <View style={styles.section}>
          <Text size={13} style={styles.sectionTitle}>
            {t('lyric_card_font_size')}: {fontSize}
          </Text>
          <View style={styles.fontSizeRow}>
            <TouchableOpacity
              style={[styles.fontSizeBtn, { backgroundColor: theme['c-primary-alpha-100'] }]}
              onPress={() => setFontSize(Math.max(12, fontSize - 2))}
            >
              <Text size={16}>-</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.fontSizeBtn, { backgroundColor: theme['c-primary-alpha-100'] }]}
              onPress={() => setFontSize(Math.min(32, fontSize + 2))}
            >
              <Text size={16}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 显示选项 */}
        <View style={styles.section}>
          <Text size={13} style={styles.sectionTitle}>
            {t('lyric_card_options')}
          </Text>
          <TouchableOpacity
            style={styles.toggleRow}
            onPress={() => setShowInfo(!showInfo)}
          >
            <Text size={13}>{t('lyric_card_show_info')}</Text>
            <View
              style={[
                styles.toggle,
                {
                  backgroundColor: showInfo ? theme['c-primary'] : theme['c-primary-alpha-300'],
                },
              ]}
            >
              <View
                style={[
                  styles.toggleKnob,
                  {
                    left: showInfo ? 18 : 2,
                  },
                ]}
              />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.toggleRow}
            onPress={() => setShowWatermark(!showWatermark)}
          >
            <Text size={13}>{t('lyric_card_show_watermark')}</Text>
            <View
              style={[
                styles.toggle,
                {
                  backgroundColor: showWatermark
                    ? theme['c-primary']
                    : theme['c-primary-alpha-300'],
                },
              ]}
            >
              <View
                style={[
                  styles.toggleKnob,
                  {
                    left: showWatermark ? 18 : 2,
                  },
                ]}
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* 底部留白 */}
        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  )
})

const styles = createStyle({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 42,
    paddingHorizontal: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '600',
  },
  previewContainer: {
    paddingVertical: 20,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128,128,128,0.15)',
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
  },
  colorBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  fontSizeRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  fontSizeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  toggle: {
    width: 40,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleKnob: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    position: 'absolute',
  },
  bottomSpace: {
    height: 40,
  },
})