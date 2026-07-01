import { memo, forwardRef } from 'react'
import { View } from 'react-native'
import { createStyle } from '@/utils/tools'
import Text from '@/components/common/Text'
import type { LyricCardProps } from './GradientCard'

/**
 * 极简风格歌词卡片
 */
const MinimalCard = forwardRef<View, LyricCardProps>(
  (
    {
      lyrics,
      songName,
      artist,
      textColor = '#333333',
      fontSize = 18,
      showInfo = true,
      showWatermark = true,
    },
    ref
  ) => {
    return (
      <View ref={ref} style={styles.cardContainer}>
        <View style={[styles.card, { backgroundColor: '#FAFAFA' }]}>
          {/* 装饰线 */}
          <View style={styles.decoLine} />

          <View style={styles.content}>
            {showInfo && (
              <View style={styles.info}>
                <Text size={12} color={textColor} style={styles.songName} numberOfLines={1}>
                  {songName}
                </Text>
                <View style={styles.divider} />
                <Text size={11} color={textColor} style={styles.artist} numberOfLines={1}>
                  {artist}
                </Text>
              </View>
            )}

            <View style={styles.lyricsContainer}>
              <Text size={fontSize} color={textColor} style={styles.lyrics}>
                {lyrics}
              </Text>
            </View>

            {showWatermark && (
              <Text size={9} color={textColor} style={styles.watermark}>
                IKUN Music
              </Text>
            )}
          </View>

          <View style={styles.decoLineBottom} />
        </View>
      </View>
    )
  }
)

MinimalCard.displayName = 'MinimalCard'

export default memo(MinimalCard)

const styles = createStyle({
  cardContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: 320,
    minHeight: 400,
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  decoLine: {
    height: 3,
    backgroundColor: '#333333',
  },
  decoLineBottom: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  content: {
    flex: 1,
    padding: 28,
    justifyContent: 'center',
  },
  info: {
    marginBottom: 28,
    alignItems: 'center',
  },
  songName: {
    fontWeight: '500',
    marginBottom: 6,
    letterSpacing: 1,
  },
  divider: {
    width: 20,
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.15)',
    marginBottom: 6,
  },
  artist: {
    opacity: 0.6,
    letterSpacing: 0.5,
  },
  lyricsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  lyrics: {
    textAlign: 'center',
    lineHeight: 34,
  },
  watermark: {
    textAlign: 'center',
    opacity: 0.3,
    marginTop: 16,
  },
})