import { memo, forwardRef } from 'react'
import { View } from 'react-native'
import { createStyle } from '@/utils/tools'
import Text from '@/components/common/Text'

export interface LyricCardProps {
  /** 歌词文本 */
  lyrics: string
  /** 歌曲名 */
  songName: string
  /** 艺术家 */
  artist: string
  /** 文字颜色 */
  textColor?: string
  /** 字体大小 */
  fontSize?: number
  /** 是否显示歌曲信息 */
  showInfo?: boolean
  /** 是否显示水印 */
  showWatermark?: boolean
  /** 渐变类型 */
  gradientType?: 'dark' | 'light' | 'colorful'
  /** 专辑封面URL（AlbumArtCard使用） */
  albumArtUrl?: string
}

/**
 * 渐变背景歌词卡片
 */
const GradientCard = forwardRef<View, LyricCardProps>(
  (
    {
      lyrics,
      songName,
      artist,
      textColor = '#FFFFFF',
      fontSize = 18,
      showInfo = true,
      showWatermark = true,
      gradientType = 'dark',
    },
    ref
  ) => {
    const gradientColors: Record<string, string[]> = {
      dark: ['#1a1a2e', '#16213e', '#0f3460'],
      light: ['#fdfbfb', '#ebedee', '#d4d4d4'],
      colorful: ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3'],
    }

    const colors = gradientColors[gradientType]

    return (
      <View ref={ref} style={styles.cardContainer}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors[0],
            },
          ]}
        >
          {/* 渐变层 */}
          <View style={[styles.gradientLayer, { backgroundColor: colors[1] }]} />
          <View style={[styles.gradientLayer2, { backgroundColor: colors[2] }]} />

          {/* 内容 */}
          <View style={styles.content}>
            {showInfo && (
              <View style={styles.info}>
                <Text size={14} color={textColor} style={styles.songName} numberOfLines={1}>
                  {songName}
                </Text>
                <Text size={12} color={textColor} style={styles.artist} numberOfLines={1}>
                  {artist}
                </Text>
              </View>
            )}

            <View style={styles.lyricsContainer}>
              <Text
                size={fontSize}
                color={textColor}
                style={styles.lyrics}
              >
                {lyrics}
              </Text>
            </View>

            {showWatermark && (
              <Text size={10} color={textColor} style={styles.watermark}>
                IKUN Music
              </Text>
            )}
          </View>
        </View>
      </View>
    )
  }
)

GradientCard.displayName = 'GradientCard'

export default memo(GradientCard)

const styles = createStyle({
  cardContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: 320,
    minHeight: 400,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  gradientLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: '30%',
    opacity: 0.6,
  },
  gradientLayer2: {
    position: 'absolute',
    top: '30%',
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.4,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  info: {
    marginBottom: 24,
    alignItems: 'center',
  },
  songName: {
    fontWeight: '600',
    marginBottom: 4,
  },
  artist: {
    opacity: 0.8,
  },
  lyricsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  lyrics: {
    textAlign: 'center',
    lineHeight: 32,
  },
  watermark: {
    textAlign: 'center',
    opacity: 0.5,
    marginTop: 16,
  },
})