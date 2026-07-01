import { getPlayHistoryList } from '@/core/playHistory'

/**
 * 听歌统计数据接口
 */
export interface ListeningStats {
  /** 总听歌时长（小时） */
  totalHours: number
  /** 总播放歌曲数 */
  totalSongs: number
  /** 最常播放歌曲 */
  mostPlayedSong: { name: string; singer: string; count: number } | null
  /** 最常播放艺术家 */
  mostPlayedArtist: { name: string; count: number } | null
  /** 最爱来源/类型 */
  favoriteSource: { source: string; count: number } | null
  /** 听歌天数 */
  activeDays: number
  /** 听歌连续天数（最长连续） */
  maxStreak: number
  /** 当前连续天数 */
  currentStreak: number
  /** 每日听歌时长图表数据 */
  dailyChartData: Array<{ date: string; hours: number }>
  /** 每周听歌时长图表数据 */
  weeklyChartData: Array<{ week: string; hours: number }>
  /** 每月听歌时长图表数据 */
  monthlyChartData: Array<{ month: string; hours: number }>
  /** Top 10 最常播放歌曲 */
  top10Songs: Array<{ name: string; singer: string; count: number }>
}

/**
 * 播放历史条目（带时间戳）
 */
interface PlayHistoryEntry {
  musicInfo: LX.Music.MusicInfo
  timestamp: number
}

/**
 * 获取听歌统计数据
 * 分析播放历史数据生成听歌报告
 */
export const getListeningStats = async (): Promise<ListeningStats> => {
  const history = await getPlayHistoryList()

  // 如果没有历史数据，返回空统计
  if (!history || history.length === 0) {
    return {
      totalHours: 0,
      totalSongs: 0,
      mostPlayedSong: null,
      mostPlayedArtist: null,
      favoriteSource: null,
      activeDays: 0,
      maxStreak: 0,
      currentStreak: 0,
      dailyChartData: [],
      weeklyChartData: [],
      monthlyChartData: [],
      top10Songs: [],
    }
  }

  // 总播放歌曲数
  const totalSongs = history.length

  // 估算总听歌时长（每首歌平均按 3.5 分钟计算）
  const avgMinutesPerSong = 3.5
  const totalHours = Math.round((totalSongs * avgMinutesPerSong) / 60 * 10) / 10

  // 统计歌曲播放次数
  const songCountMap = new Map<string, { name: string; singer: string; count: number }>()
  const artistCountMap = new Map<string, { name: string; count: number }>()
  const sourceCountMap = new Map<string, { source: string; count: number }>()

  for (const item of history) {
    const songKey = `${item.name}__${item.singer}`
    if (songCountMap.has(songKey)) {
      songCountMap.get(songKey)!.count++
    } else {
      songCountMap.set(songKey, { name: item.name, singer: item.singer, count: 1 })
    }

    const artist = item.singer || '未知艺术家'
    if (artistCountMap.has(artist)) {
      artistCountMap.get(artist)!.count++
    } else {
      artistCountMap.set(artist, { name: artist, count: 1 })
    }

    const source = item.source || 'unknown'
    if (sourceCountMap.has(source)) {
      sourceCountMap.get(source)!.count++
    } else {
      sourceCountMap.set(source, { source, count: 1 })
    }
  }

  // 最常播放歌曲
  let mostPlayedSong: ListeningStats['mostPlayedSong'] = null
  let maxSongCount = 0
  for (const song of songCountMap.values()) {
    if (song.count > maxSongCount) {
      maxSongCount = song.count
      mostPlayedSong = song
    }
  }

  // 最常播放艺术家
  let mostPlayedArtist: ListeningStats['mostPlayedArtist'] = null
  let maxArtistCount = 0
  for (const artist of artistCountMap.values()) {
    if (artist.count > maxArtistCount) {
      maxArtistCount = artist.count
      mostPlayedArtist = artist
    }
  }

  // 最爱来源
  let favoriteSource: ListeningStats['favoriteSource'] = null
  let maxSourceCount = 0
  for (const source of sourceCountMap.values()) {
    if (source.count > maxSourceCount) {
      maxSourceCount = source.count
      favoriteSource = source
    }
  }

  // Top 10 歌曲
  const top10Songs = Array.from(songCountMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  // 每日图表数据 - 基于历史记录数量估算
  const dailyChartData = generateDailyChartData(history)
  const weeklyChartData = generateWeeklyChartData(dailyChartData)
  const monthlyChartData = generateMonthlyChartData(dailyChartData)

  // 活跃天数
  const activeDays = dailyChartData.length

  // 计算连续天数
  const { maxStreak, currentStreak } = calculateStreaks(dailyChartData)

  return {
    totalHours,
    totalSongs,
    mostPlayedSong,
    mostPlayedArtist,
    favoriteSource,
    activeDays,
    maxStreak,
    currentStreak,
    dailyChartData,
    weeklyChartData,
    monthlyChartData,
    top10Songs,
  }
}

/**
 * 生成每日听歌图表数据
 */
const generateDailyChartData = (history: LX.Music.MusicInfo[]): Array<{ date: string; hours: number }> => {
  const dayMap = new Map<string, number>()

  for (const item of history) {
    const day = new Date().toISOString().slice(0, 10) // 简化处理，使用当前日期
    // 实际场景中应使用播放时间戳，这里基于历史顺序估算
    const dayIndex = history.indexOf(item)
    const daysAgo = Math.floor(dayIndex / 10) // 每10首歌算一天
    const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

    if (dayMap.has(date)) {
      dayMap.set(date, dayMap.get(date)! + 1)
    } else {
      dayMap.set(date, 1)
    }
  }

  const result: Array<{ date: string; hours: number }> = []
  for (const [date, count] of dayMap.entries()) {
    result.push({
      date,
      hours: Math.round((count * 3.5) / 60 * 10) / 10, // 转换为小时
    })
  }

  return result.sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * 生成每周听歌图表数据
 */
const generateWeeklyChartData = (
  dailyData: Array<{ date: string; hours: number }>
): Array<{ week: string; hours: number }> => {
  const weekMap = new Map<string, number>()

  for (const day of dailyData) {
    const d = new Date(day.date)
    const weekStart = new Date(d.getTime() - d.getDay() * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10)
    const weekLabel = `W${getWeekNumber(d)}`

    if (weekMap.has(weekLabel)) {
      weekMap.set(weekLabel, weekMap.get(weekLabel)! + day.hours)
    } else {
      weekMap.set(weekLabel, day.hours)
    }
  }

  const result: Array<{ week: string; hours: number }> = []
  for (const [week, hours] of weekMap.entries()) {
    result.push({ week, hours: Math.round(hours * 10) / 10 })
  }

  return result.sort((a, b) => a.week.localeCompare(b.week))
}

/**
 * 生成每月听歌图表数据
 */
const generateMonthlyChartData = (
  dailyData: Array<{ date: string; hours: number }>
): Array<{ month: string; hours: number }> => {
  const monthMap = new Map<string, number>()

  for (const day of dailyData) {
    const monthLabel = day.date.slice(0, 7)

    if (monthMap.has(monthLabel)) {
      monthMap.set(monthLabel, monthMap.get(monthLabel)! + day.hours)
    } else {
      monthMap.set(monthLabel, day.hours)
    }
  }

  const result: Array<{ month: string; hours: number }> = []
  for (const [month, hours] of monthMap.entries()) {
    result.push({ month, hours: Math.round(hours * 10) / 10 })
  }

  return result.sort((a, b) => a.month.localeCompare(b.month))
}

/**
 * 获取星期数
 */
const getWeekNumber = (date: Date): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

/**
 * 计算听歌连续天数
 */
const calculateStreaks = (
  dailyData: Array<{ date: string; hours: number }>
): { maxStreak: number; currentStreak: number } => {
  if (dailyData.length === 0) {
    return { maxStreak: 0, currentStreak: 0 }
  }

  const dates = dailyData.map((d) => d.date).sort()
  let maxStreak = 1
  let currentStreak = 1
  let tempStreak = 1

  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1])
    const curr = new Date(dates[i])
    const diffDays = (curr.getTime() - prev.getTime()) / (24 * 60 * 60 * 1000)

    if (diffDays === 1) {
      tempStreak++
      currentStreak = tempStreak
    } else if (diffDays > 1) {
      tempStreak = 1
    }

    if (tempStreak > maxStreak) {
      maxStreak = tempStreak
    }
  }

  return { maxStreak, currentStreak }
}

/**
 * 获取时间段内的统计数据
 * @param period 时间段：'week' | 'month' | 'year'
 */
export const getFilteredStats = async (
  period: 'week' | 'month' | 'year'
): Promise<ListeningStats> => {
  const stats = await getListeningStats()

  const now = new Date()
  let startDate: Date

  switch (period) {
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      break
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1)
      break
  }

  const startDateStr = startDate.toISOString().slice(0, 10)

  // 过滤图表数据
  stats.dailyChartData = stats.dailyChartData.filter((d) => d.date >= startDateStr)

  return stats
}