import { memo, forwardRef } from 'react'
import { View, Image } from 'react-native'
import { createStyle } from '@/utils/tools'
import Text from '@/components/common/Text'
import type { LyricCardProps } from './GradientCard'

/**
 * 模糊专辑封面背景歌词卡片
 */
const AlbumArtCard = forwardRef<View, LyricCardProps>(
  (
    {
      lyrics,
      songName,
      artist,
      textColor = '#FFFFFF',
      fontSize = 18,
      showInfo = true,
      showWatermark = true,
      albumArtUrl,
    },
    ref
  ) => {
    return (
      <View ref={ref} style={styles.cardContainer}>
        <View style={styles.card}>
          {/* 背景图片（模拟模糊效果的图片层） */}
          {albumArtUrl ? (
            <Image
              source={{ uri: albumArtUrl }}
              style={styles.bgImage}
              blurRadius={20}
            />
          ) : (
            <View style={[styles.bgImage, { backgroundColor: '#1a1a2e' }]} />
          )}

          {/* 暗色覆盖层 */}
          <View style={styles.overlay} />

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
              <Text size={fontSize} color={textColor} style={styles.lyrics}>
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

AlbumArtCard.displayName = 'AlbumArtCard'

export default memo(AlbumArtCard)

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
  bgImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
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