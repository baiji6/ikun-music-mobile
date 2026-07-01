import { memo, useEffect, useState, useRef, useCallback } from 'react'
import { View, TouchableOpacity } from 'react-native'
import { useI18n } from '@/lang'
import { useTheme } from '@/store/theme/hook'
import { useStatusbarHeight } from '@/store/common/hook'
import { createStyle } from '@/utils/tools'
import { useWindowSize } from '@/utils/hooks'
import Image from '@/components/common/Image'
import Text from '@/components/common/Text'
import { Icon } from '@/components/common/Icon'
import { action as privateFMAction } from '@/store/privateFM'
import {
  usePrivateFMMusicInfo,
  usePrivateFMIsPlaying,
  usePrivateFMLoading,
  usePrivateFMReason,
} from '@/store/privateFM/hook'
import { getRecommendations } from '@/core/privateFM'
import { addFavorite } from '@/core/favoriteList'
import { addDislikeInfo } from '@/core/dislikeList'
import { setPlayMusicInfo } from '@/core/player/playInfo'
import { play, pause } from '@/core/player/player'
import playerState from '@/store/player/state'
import { LIST_IDS } from '@/config/constant'

/**
 * 私人FM - 个性化音乐推荐播放界面
 * 全屏播放器式界面，支持喜欢/不喜欢/跳过操作
 */
export default memo(({ componentId }: { componentId: string }) => {
  const t = useI18n()
  const theme = useTheme()
  const statusBarHeight = useStatusbarHeight()
  const { width: winWidth, height: winHeight } = useWindowSize()

  const musicInfo = usePrivateFMMusicInfo()
  const isPlaying = usePrivateFMIsPlaying()
  const isLoading = usePrivateFMLoading()
  const reason = usePrivateFMReason()

  const [showReason, setShowReason] = useState(false)

  // 初始化：加载推荐歌曲
  const hasInitialized = useRef(false)
  useEffect(() => {
    if (hasInitialized.current) return
    hasInitialized.current = true
    loadAndPlay()
  }, [])

  /**
   * 加载推荐并播放第一首
   */
  const loadAndPlay = async () => {
    privateFMAction.setIsLoading(true)
    const { songs, reason } = await getRecommendations(
      privateFMAction.getPlayedSongs()
    )
    if (songs.length > 0) {
      privateFMAction.setQueue(songs)
      privateFMAction.setRecommendReason(reason)
      playNextFromQueue()
    }
    privateFMAction.setIsLoading(false)
  }

  /**
   * 从队列中取出下一首并播放
   */
  const playNextFromQueue = useCallback(() => {
    const next = privateFMAction.popNextFromQueue()
    if (!next) {
      // 队列为空，加载更多
      privateFMAction.setCurrentMusic(null)
      privateFMAction.setIsPlaying(false)
      void loadAndPlay()
      return
    }
    privateFMAction.setCurrentMusic(next)
    privateFMAction.addPlayedSong(next.id)
    privateFMAction.setIsPlaying(true)

    // 通过播放器播放
    setPlayMusicInfo(LIST_IDS.TEMP, next, true)

    // 队列快用完时预加载更多
    if (privateFMAction.getQueue().length < 5) {
      void getRecommendations(privateFMAction.getPlayedSongs()).then(
        ({ songs }) => {
          if (songs.length > 0) {
            privateFMAction.appendToQueue(songs)
          }
        }
      )
    }
  }, [])

  /**
   * 处理喜欢（收藏）
   */
  const handleLike = useCallback(async () => {
    const current = privateFMAction.getCurrentMusic()
    if (!current) return
    await addFavorite(current)
    playNextFromQueue()
  }, [playNextFromQueue])

  /**
   * 处理不喜欢
   */
  const handleDislike = useCallback(async () => {
    const current = privateFMAction.getCurrentMusic()
    if (!current) return
    await addDislikeInfo([{ name: current.name, singer: current.singer }])
    playNextFromQueue()
  }, [playNextFromQueue])

  /**
   * 处理跳过（下一首）
   */
  const handleSkip = useCallback(() => {
    playNextFromQueue()
  }, [playNextFromQueue])

  /**
   * 处理播放/暂停
   */
  const handleTogglePlay = useCallback(() => {
    if (playerState.isPlay) {
      void pause()
    } else {
      play()
    }
  }, [])

  /**
   * 切换推荐原因展开/收起
   */
  const toggleReason = useCallback(() => {
    setShowReason((prev) => !prev)
  }, [])

  // 计算专辑封面大小
  const imgSize = Math.min(winWidth * 0.75, (winHeight - statusBarHeight) * 0.4)

  // 当前歌曲信息
  const currentPic = musicInfo?.meta?.picUrl
  const currentName = musicInfo?.name ?? ''
  const currentSinger = musicInfo?.singer ?? ''
  const currentAlbum = musicInfo?.meta?.albumName ?? ''

  return (
    <View style={{ ...styles.container, backgroundColor: theme['c-content-background'] }}>
      {/* 顶部状态栏区域 */}
      <View style={{ ...styles.header, paddingTop: statusBarHeight }}>
        <Text style={styles.headerTitle} size={18}>
          {t('private_fm_title')}
        </Text>
      </View>

      {/* 主体内容 */}
      <View style={styles.body}>
        {/* 专辑封面 */}
        <View style={styles.coverContainer}>
          <Image
            url={currentPic}
            style={{
              width: imgSize,
              height: imgSize,
              borderRadius: 8,
            }}
          />
        </View>

        {/* 歌曲信息 */}
        <View style={styles.songInfo}>
          <Text style={styles.songName} size={20} numberOfLines={1}>
            {currentName || t('private_fm_loading')}
          </Text>
          <Text style={styles.songArtist} size={15} color={theme['c-500']} numberOfLines={1}>
            {currentSinger}
          </Text>
          {currentAlbum ? (
            <Text style={styles.songAlbum} size={13} color={theme['c-600']} numberOfLines={1}>
              {currentAlbum}
            </Text>
          ) : null}
        </View>

        {/* 推荐原因 */}
        {reason ? (
          <View style={styles.reasonContainer}>
            <TouchableOpacity
              style={styles.reasonHeader}
              onPress={toggleReason}
              activeOpacity={0.7}
            >
              <Text size={13} color={theme['c-500']}>
                {t('private_fm_why_recommend')}
              </Text>
              <Icon
                name={showReason ? 'chevron-left' : 'chevron-left'}
                size={12}
                color={theme['c-500']}
                style={{
                  transform: [{ rotate: showReason ? '90deg' : '-90deg' }],
                  marginLeft: 4,
                }}
              />
            </TouchableOpacity>
            {showReason ? (
              <Text style={styles.reasonText} size={13} color={theme['c-400']}>
                {reason.text}
              </Text>
            ) : null}
          </View>
        ) : null}

        {/* 加载状态 */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text size={14} color={theme['c-500']}>
              {t('private_fm_finding')}
            </Text>
          </View>
        ) : null}
      </View>

      {/* 底部操作按钮 */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlBtn}
          onPress={handleDislike}
          activeOpacity={0.6}
        >
          <View
            style={{
              ...styles.controlBtnInner,
              backgroundColor: theme['c-primary-light-900-alpha-200'],
            }}
          >
            <Icon name="close" size={22} color={theme['c-font']} />
          </View>
          <Text style={styles.controlLabel} size={12} color={theme['c-500']}>
            {t('private_fm_dislike')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlBtn}
          onPress={handleTogglePlay}
          activeOpacity={0.6}
        >
          <View
            style={{
              ...styles.controlBtnInner,
              ...styles.controlBtnCenter,
              backgroundColor: theme['c-primary-light-700-alpha-300'],
            }}
          >
            <Icon
              name={isPlaying ? 'pause' : 'play'}
              size={28}
              color={theme['c-button-font']}
            />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlBtn}
          onPress={handleSkip}
          activeOpacity={0.6}
        >
          <View
            style={{
              ...styles.controlBtnInner,
              backgroundColor: theme['c-primary-light-900-alpha-200'],
            }}
          >
            <Icon name="nextMusic" size={22} color={theme['c-font']} />
          </View>
          <Text style={styles.controlLabel} size={12} color={theme['c-500']}>
            {t('private_fm_skip')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlBtn}
          onPress={handleLike}
          activeOpacity={0.6}
        >
          <View
            style={{
              ...styles.controlBtnInner,
              backgroundColor: theme['c-primary-light-900-alpha-200'],
            }}
          >
            <Icon name="love" size={22} color={theme['c-primary-font-active']} />
          </View>
          <Text style={styles.controlLabel} size={12} color={theme['c-500']}>
            {t('private_fm_like')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
})

const styles = createStyle({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 10,
    paddingHorizontal: 15,
  },
  headerTitle: {
    fontWeight: '600',
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  coverContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 25,
    // 阴影效果
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 8,
  },
  songInfo: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  songName: {
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 6,
  },
  songArtist: {
    textAlign: 'center',
    marginBottom: 4,
  },
  songAlbum: {
    textAlign: 'center',
  },
  reasonContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  reasonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  reasonText: {
    textAlign: 'center',
    paddingHorizontal: 20,
    paddingVertical: 4,
    lineHeight: 20,
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingBottom: 30,
    paddingTop: 15,
  },
  controlBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlBtnInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  controlBtnCenter: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  controlLabel: {
    textAlign: 'center',
    marginTop: 2,
  },
})