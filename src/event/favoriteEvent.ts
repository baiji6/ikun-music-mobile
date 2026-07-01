import { addFavorite, removeFavorite, clearFavorite } from '@/utils/favoriteManage'
import Event from './Event'
import { saveFavoriteList } from '@/core/favoriteList'
import { action } from '@/store/favoriteList'

const updateList = async (favoriteList: LX.Music.MusicInfo[]) => {
  await saveFavoriteList(favoriteList)
}

export class FavoriteEvent extends Event {
  favorite_changed() {
    this.emit('favorite_changed')
  }

  /**
   * 添加歌曲到收藏列表
   * @param musicInfo 歌曲信息
   * @param isRemote 是否属于远程操作
   */
  async favorite_music_add(musicInfo: LX.Music.MusicInfo, isRemote: boolean = false) {
    await addFavorite(musicInfo)
    await updateList(action.getFavoriteList())
    this.emit('favorite_music_add', musicInfo, isRemote)
    this.favorite_changed()
  }

  /**
   * 从收藏列表移除歌曲
   * @param musicInfo 歌曲信息
   * @param isRemote 是否属于远程操作
   */
  async favorite_music_remove(musicInfo: LX.Music.MusicInfo, isRemote: boolean = false) {
    await removeFavorite(musicInfo)
    await updateList(action.getFavoriteList())
    this.emit('favorite_music_remove', musicInfo, isRemote)
    this.favorite_changed()
  }

  /**
   * 清空收藏列表
   * @param isRemote 是否属于远程操作
   */
  async favorite_music_clear(isRemote: boolean = false) {
    await clearFavorite()
    await updateList([])
    this.emit('favorite_music_clear', isRemote)
    this.favorite_changed()
  }

  /**
   * 覆盖整个收藏列表
   * @param favoriteData 收藏列表数据
   * @param isRemote 是否属于远程操作
   */
  async favorite_data_overwrite(favoriteData: LX.Music.MusicInfo[], isRemote: boolean = false) {
    action.setFavoriteList(favoriteData)
    await updateList(favoriteData)
    this.emit('favorite_data_overwrite', favoriteData, isRemote)
    this.favorite_changed()
  }
}

type EventMethods = Omit<EventType, keyof Event>

declare class EventType extends FavoriteEvent {
  on<K extends keyof EventMethods>(event: K, listener: EventMethods[K]): any
  off<K extends keyof EventMethods>(event: K, listener: EventMethods[K]): any
}

export type FavoriteEventTypes = Omit<EventType, keyof Omit<Event, 'on' | 'off'>>
export const createFavoriteEventHub = (): FavoriteEventTypes => {
  return new FavoriteEvent()
}