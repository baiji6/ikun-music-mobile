import { getFavoriteList } from '@/core/favoriteList'
import { getPlayHistoryList } from '@/core/playHistory'
import { hasDislike } from '@/core/dislikeList'
import musicSdk from '@/utils/musicSdk'
import settingState from '@/store/setting/state'

/**
 * 推荐原因类型
 */
export interface RecommendReason {
  /** 推荐原因描述 */
  text: string
  /** 推荐来源：favorite-收藏喜好, history-播放历史, artist-艺人偏好, genre-风格偏好 */
  source: 'favorite' | 'history' | 'artist' | 'genre'
}

/**
 * 对数组进行随机洗牌
 * @param array 原始数组
 * @returns 洗牌后的新数组
 */
const shuffleArray = <T>(array: T[]): T[] => {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/**
 * 从歌曲信息中提取艺术家列表
 * @param singer 艺术家字符串
 * @returns 艺术家数组
 */
const extractArtists = (singer: string): string[] => {
  if (!singer) return []
  return singer
    .split(/、|&|;|；|\/|,|，|\|/)
    .map((s) => s.trim())
    .filter(Boolean)
}

/** 艺术家权重信息 */
interface ArtistWeight {
  name: string
  weight: number
}

/** 关键词权重信息 */
interface KeywordWeight {
  keyword: string
  weight: number
}

/**
 * 收集用户偏好：从收藏和历史中提取艺术家和搜索关键词
 * 根据播放次数和最近播放时间加权
 * @param favoriteList 收藏列表
 * @param historyList 播放历史列表
 * @returns 艺术家和关键词权重列表
 */
const collectUserPreferences = (
  favoriteList: LX.Music.MusicInfo[],
  historyList: LX.Music.MusicInfo[]
): { artists: ArtistWeight[]; keywords: KeywordWeight[] } => {
  const artistMap = new Map<string, number>()
  const keywordMap = new Map<string, number>()

  // 从收藏列表提取偏好（权重较高）
  for (let i = 0; i < favoriteList.length; i++) {
    const song = favoriteList[i]
    // 越靠后的收藏权重越高（假设按收藏时间排序）
    const recencyWeight = 1 + (i / Math.max(favoriteList.length, 1)) * 2

    const artists = extractArtists(song.singer)
    for (const artist of artists) {
      artistMap.set(artist, (artistMap.get(artist) ?? 0) + 2 * recencyWeight)
    }

    keywordMap.set(song.name, (keywordMap.get(song.name) ?? 0) + 1.5 * recencyWeight)
  }

  // 从播放历史提取偏好（含播放次数和最近播放时间）
  for (let i = 0; i < historyList.length; i++) {
    const song = historyList[i]
    // history按时间倒序，i越小的越新，权重越高
    const recencyWeight = 1 + ((historyList.length - i) / Math.max(historyList.length, 1)) * 2

    const artists = extractArtists(song.singer)
    for (const artist of artists) {
      artistMap.set(artist, (artistMap.get(artist) ?? 0) + 1 * recencyWeight)
    }
  }

  // 按权重排序，取前10个艺术家和前5个关键词
  const artists = Array.from(artistMap.entries())
    .map(([name, weight]) => ({ name, weight }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 10)

  const keywords = Array.from(keywordMap.entries())
    .map(([keyword, weight]) => ({ keyword, weight }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 5)

  return { artists, keywords }
}

/**
 * 使用音乐源搜索歌曲
 * @param query 搜索关键词
 * @param page 页码
 * @returns 搜索结果列表
 */
const searchSongs = async (
  query: string,
  page: number = 1
): Promise<LX.Music.MusicInfoOnline[]> => {
  const source = settingState.setting['search.source'] || 'kw'
  const limit = 20

  try {
    if (source === 'all') {
      // 聚合搜索：从所有源搜索
      const tasks: Promise<LX.Music.MusicInfoOnline[]>[] = []
      const sources = ['kw', 'kg', 'tx', 'wy', 'mg'] as LX.OnlineSource[]
      for (const s of sources) {
        if (musicSdk[s]?.musicSearch) {
          tasks.push(
            musicSdk[s].musicSearch
              .search(query, page, limit)
              .then((result: any) => result.list ?? [])
              .catch(() => [])
          )
        }
      }
      const results = await Promise.all(tasks)
      return results.flat()
    } else {
      const sdk = musicSdk[source as LX.OnlineSource]
      if (!sdk?.musicSearch) return []
      const result = await sdk.musicSearch.search(query, page, limit)
      return result.list ?? []
    }
  } catch {
    return []
  }
}

/**
 * 过滤推荐结果：移除不喜欢的歌曲和已播放过的歌曲
 * @param songs 推荐歌曲列表
 * @param playedIds 已播放歌曲ID列表
 * @returns 过滤后的歌曲列表
 */
const filterRecommendations = (
  songs: LX.Music.MusicInfo[],
  playedIds: string[]
): LX.Music.MusicInfo[] => {
  return songs.filter((song) => {
    if (hasDislike(song)) return false
    if (playedIds.includes(song.id)) return false
    return true
  })
}

/**
 * 生成推荐歌曲列表
 * 1. 收集用户收藏/历史中的艺术家和关键词偏好
 * 2. 根据偏好搜索相似歌曲
 * 3. 过滤掉不喜欢的歌曲和已播放的歌曲
 * 4. 返回随机洗牌后的推荐列表
 * @param playedIds 已播放的歌曲ID列表（避免重复推荐）
 * @returns 推荐歌曲和推荐原因
 */
export const getRecommendations = async (
  playedIds: string[] = []
): Promise<{
  songs: LX.Music.MusicInfo[]
  reason: RecommendReason | null
}> => {
  try {
    // 1. 获取用户数据
    const favoriteList = await getFavoriteList()
    const historyList = await getPlayHistoryList()

    // 2. 收集偏好
    const { artists, keywords } = collectUserPreferences(favoriteList, historyList)

    // 如果没有足够的偏好数据，使用默认搜索
    if (artists.length === 0 && keywords.length === 0) {
      const defaultResults = await searchSongs('热门推荐')
      const filtered = filterRecommendations(defaultResults, playedIds)
      const shuffled = shuffleArray(filtered).slice(0, 20)
      return {
        songs: shuffled,
        reason: null,
      }
    }

    // 3. 根据偏好搜索歌曲
    const allResults: LX.Music.MusicInfo[] = []
    const seenIds = new Set<string>()

    // 按艺术家搜索
    for (const artist of artists.slice(0, 5)) {
      const results = await searchSongs(artist.name, 1)
      for (const song of results) {
        if (!seenIds.has(song.id)) {
          seenIds.add(song.id)
          allResults.push(song)
        }
      }
    }

    // 按关键词搜索
    for (const kw of keywords.slice(0, 3)) {
      const results = await searchSongs(kw.keyword, 1)
      for (const song of results) {
        if (!seenIds.has(song.id)) {
          seenIds.add(song.id)
          allResults.push(song)
        }
      }
    }

    // 4. 过滤
    const filtered = filterRecommendations(allResults, playedIds)

    // 5. 随机洗牌并限制数量
    const shuffled = shuffleArray(filtered).slice(0, 30)

    // 6. 生成推荐理由
    let reason: RecommendReason | null = null
    if (artists.length > 0) {
      reason = {
        text: `根据你喜欢的「${artists[0].name}」为你推荐`,
        source: 'artist' as const,
      }
    } else if (keywords.length > 0) {
      reason = {
        text: `根据你常听的歌曲风格为你推荐`,
        source: 'genre' as const,
      }
    }

    return { songs: shuffled, reason }
  } catch (error) {
    console.error('获取推荐失败:', error)
    return { songs: [], reason: null }
  }
}