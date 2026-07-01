import { memo, useState, useEffect, useCallback } from 'react'
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { useI18n } from '@/lang'
import { useTheme } from '@/store/theme/hook'
import Text from '@/components/common/Text'
import { Icon } from '@/components/common/Icon'
import { createStyle } from '@/utils/tools'
import { getListeningStats, type ListeningStats } from '@/utils/listeningStats'
import { pop } from '@/navigation'
import commonState from '@/store/common/state'
import { useStatusbarHeight } from '@/store/common/hook'

type Period = 'week' | 'month' | 'year'

/**
 * 听歌报告页面
 */
export default memo(() => {
  const t = useI18n()
  const theme = useTheme()
  const statusBarHeight = useStatusbarHeight()
  const [stats, setStats] = useState<ListeningStats | null>(null)
  const [period, setPeriod] = useState<Period>('week')
  const [loading, setLoading] = useState(true)

  // 加载统计数据
  useEffect(() => {
    void getListeningStats().then((data) => {
      setStats(data)
      setLoading(false)
    })
  }, [])

  const handleBack = useCallback(() => {
    void pop(commonState.componentIds.playDetail!)
  }, [])

  const periodLabels: Record<Period, string> = {
    week: t('listening_report_period_week'),
    month: t('listening_report_period_month'),
    year: t('listening_report_period_year'),
  }

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme['c-content-background'] }]}>
        <View style={{ ...styles.loadingContainer }}>
          <Text>{t('loading')}</Text>
        </View>
      </View>
    )
  }

  if (!stats) {
    return (
      <View style={[styles.container, { backgroundColor: theme['c-content-background'] }]}>
        <View style={{ paddingTop: statusBarHeight }}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
              <Icon name="chevron-left" size={22} />
            </TouchableOpacity>
            <Text style={styles.headerTitle} size={18}>
              {t('listening_report_title')}
            </Text>
            <View style={styles.backBtn} />
          </View>
        </View>
        <View style={styles.emptyContainer}>
          <Icon name="music_time" size={48} color={theme['c-600']} />
          <Text style={styles.emptyText} color={theme['c-600']}>
            {t('listening_report_empty')}
          </Text>
        </View>
      </View>
    )
  }

  const maxBarHours = Math.max(...stats.dailyChartData.map((d) => d.hours), 1)

  return (
    <View style={[styles.container, { backgroundColor: theme['c-content-background'] }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 顶部状态栏间距 */}
        <View style={{ paddingTop: statusBarHeight }}>
          {/* 头部 */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
              <Icon name="chevron-left" size={22} />
            </TouchableOpacity>
            <Text style={styles.headerTitle} size={18}>
              {t('listening_report_title')}
            </Text>
            <View style={styles.backBtn} />
          </View>
        </View>

        {/* 时间段选择器 */}
        <View style={styles.periodSelector}>
          {(['week', 'month', 'year'] as Period[]).map((p) => (
            <TouchableOpacity
              key={p}
              style={[
                styles.periodBtn,
                {
                  backgroundColor:
                    period === p ? theme['c-primary'] : theme['c-primary-alpha-100'],
                },
              ]}
              onPress={() => setPeriod(p)}
            >
              <Text
                size={13}
                color={period === p ? theme['c-primary-light-100'] : theme['c-font']}
              >
                {periodLabels[p]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 日期范围 */}
        <Text style={styles.dateRange} size={12} color={theme['c-600']}>
          {t('listening_report_date_range')}
        </Text>

        {/* 概览卡片 */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: theme['c-primary-alpha-100'] }]}>
            <Icon name="music_time" size={20} color={theme['c-primary']} />
            <Text style={styles.summaryValue} size={24} color={theme['c-primary']}>
              {stats.totalHours}h
            </Text>
            <Text size={11} color={theme['c-600']}>
              {t('listening_report_total_time')}
            </Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: theme['c-primary-alpha-100'] }]}>
            <Icon name="album" size={20} color={theme['c-primary']} />
            <Text style={styles.summaryValue} size={24} color={theme['c-primary']}>
              {stats.totalSongs}
            </Text>
            <Text size={11} color={theme['c-600']}>
              {t('listening_report_total_songs')}
            </Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: theme['c-primary-alpha-100'] }]}>
            <Icon name="love" size={20} color={theme['c-primary']} />
            <Text style={styles.summaryValue} size={24} color={theme['c-primary']}>
              {stats.activeDays}
            </Text>
            <Text size={11} color={theme['c-600']}>
              {t('listening_report_active_days')}
            </Text>
          </View>
        </View>

        {/* 连续天数 */}
        <View style={[styles.streakCard, { backgroundColor: theme['c-primary-alpha-100'] }]}>
          <Text size={13} color={theme['c-600']}>
            {t('listening_report_streak')}
          </Text>
          <Text size={20} color={theme['c-primary']}>
            {stats.maxStreak} {t('listening_report_days')}
          </Text>
        </View>

        {/* 最常播放歌曲卡片 */}
        {stats.mostPlayedSong && (
          <View style={[styles.highlightCard, { backgroundColor: theme['c-primary-alpha-100'] }]}>
            <Text size={12} color={theme['c-600']} style={styles.cardLabel}>
              {t('listening_report_top_song')}
            </Text>
            <Text size={16} numberOfLines={1} style={styles.cardTitle}>
              {stats.mostPlayedSong.name}
            </Text>
            <Text size={13} color={theme['c-600']} numberOfLines={1}>
              {stats.mostPlayedSong.singer} - {t('listening_report_play_count', { num: stats.mostPlayedSong.count })}
            </Text>
          </View>
        )}

        {/* 最常播放艺术家卡片 */}
        {stats.mostPlayedArtist && (
          <View style={[styles.highlightCard, { backgroundColor: theme['c-primary-alpha-100'] }]}>
            <Text size={12} color={theme['c-600']} style={styles.cardLabel}>
              {t('listening_report_top_artist')}
            </Text>
            <Text size={16} numberOfLines={1} style={styles.cardTitle}>
              {stats.mostPlayedArtist.name}
            </Text>
            <Text size={13} color={theme['c-600']}>
              {t('listening_report_play_count', { num: stats.mostPlayedArtist.count })}
            </Text>
          </View>
        )}

        {/* 最爱来源 */}
        {stats.favoriteSource && (
          <View style={[styles.highlightCard, { backgroundColor: theme['c-primary-alpha-100'] }]}>
            <Text size={12} color={theme['c-600']} style={styles.cardLabel}>
              {t('listening_report_favorite_source')}
            </Text>
            <Text size={16} style={styles.cardTitle}>
              {stats.favoriteSource.source}
            </Text>
            <Text size={13} color={theme['c-600']}>
              {t('listening_report_play_count', { num: stats.favoriteSource.count })}
            </Text>
          </View>
        )}

        {/* 每日听歌时长柱状图 */}
        {stats.dailyChartData.length > 0 && (
          <View style={[styles.chartCard, { backgroundColor: theme['c-primary-alpha-100'] }]}>
            <Text size={13} style={styles.chartTitle}>
              {t('listening_report_daily_time')}
            </Text>
            <View style={styles.chartContainer}>
              {stats.dailyChartData.slice(-7).map((day, index) => (
                <View key={index} style={styles.barWrapper}>
                  <Text size={9} color={theme['c-600']} style={styles.barValue}>
                    {day.hours}h
                  </Text>
                  <View style={styles.barBg}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: `${Math.max((day.hours / maxBarHours) * 100, 4)}%`,
                          backgroundColor: theme['c-primary'],
                        },
                      ]}
                    />
                  </View>
                  <Text size={8} color={theme['c-600']} style={styles.barLabel}>
                    {day.date.slice(5)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Top 10 歌曲列表 */}
        {stats.top10Songs.length > 0 && (
          <View style={[styles.topListCard, { backgroundColor: theme['c-primary-alpha-100'] }]}>
            <Text size={13} style={styles.chartTitle}>
              {t('listening_report_top10')}
            </Text>
            {stats.top10Songs.map((song, index) => (
              <View key={index} style={styles.topListItem}>
                <Text size={14} style={styles.topListIndex} color={theme['c-primary']}>
                  {index + 1}
                </Text>
                <View style={styles.topListInfo}>
                  <Text size={13} numberOfLines={1}>
                    {song.name}
                  </Text>
                  <Text size={11} color={theme['c-600']} numberOfLines={1}>
                    {song.singer}
                  </Text>
                </View>
                <Text size={11} color={theme['c-600']}>
                  {song.count}次
                </Text>
              </View>
            ))}
          </View>
        )}

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  emptyText: {
    marginTop: 16,
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
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 10,
  },
  periodBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 14,
  },
  dateRange: {
    textAlign: 'center',
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    gap: 8,
    marginBottom: 10,
  },
  summaryCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  summaryValue: {
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 2,
  },
  streakCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 12,
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  highlightCard: {
    marginHorizontal: 12,
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  cardLabel: {
    marginBottom: 4,
  },
  cardTitle: {
    fontWeight: '600',
    marginBottom: 2,
  },
  chartCard: {
    marginHorizontal: 12,
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  chartTitle: {
    fontWeight: '600',
    marginBottom: 10,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 140,
    gap: 4,
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
  },
  barValue: {
    marginBottom: 2,
  },
  barBg: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: '70%',
    borderRadius: 4,
    minHeight: 2,
  },
  barLabel: {
    marginTop: 4,
  },
  topListCard: {
    marginHorizontal: 12,
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  topListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128,128,128,0.2)',
  },
  topListIndex: {
    width: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  topListInfo: {
    flex: 1,
    marginLeft: 8,
    marginRight: 8,
  },
  bottomSpace: {
    height: 40,
  },
})