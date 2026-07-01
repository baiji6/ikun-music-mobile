import { action, state } from '@/store/favoriteList'

export const getLocalFavoriteData = async (): Promise<LX.Music.MusicInfo[]> => {
  return [...state.list]
}

export const setLocalFavoriteData = async (listData: LX.Music.MusicInfo[]) => {
  await global.favorite_event.favorite_data_overwrite(listData, true)
}

export const registerFavoriteActionEvent = (
  sendFavoriteAction: (action: LX.Sync.Favorite.ActionList) => void | Promise<void>
) => {
  const favorite_music_add = async (
    musicInfo: LX.Music.MusicInfo,
    isRemote: boolean = false
  ) => {
    if (isRemote) return
    await sendFavoriteAction({ action: 'favorite_music_add', data: musicInfo })
  }
  const favorite_music_remove = async (
    musicInfo: LX.Music.MusicInfo,
    isRemote: boolean = false
  ) => {
    if (isRemote) return
    await sendFavoriteAction({ action: 'favorite_music_remove', data: musicInfo })
  }
  const favorite_music_clear = async (isRemote: boolean = false) => {
    if (isRemote) return
    await sendFavoriteAction({ action: 'favorite_music_clear' })
  }
  const favorite_data_overwrite = async (
    listInfos: LX.Music.MusicInfo[],
    isRemote: boolean = false
  ) => {
    if (isRemote) return
    await sendFavoriteAction({ action: 'favorite_data_overwrite', data: listInfos })
  }

  global.favorite_event.on('favorite_music_add', favorite_music_add)
  global.favorite_event.on('favorite_music_remove', favorite_music_remove)
  global.favorite_event.on('favorite_music_clear', favorite_music_clear)
  global.favorite_event.on('favorite_data_overwrite', favorite_data_overwrite)
  return () => {
    global.favorite_event.off('favorite_music_add', favorite_music_add)
    global.favorite_event.off('favorite_music_remove', favorite_music_remove)
    global.favorite_event.off('favorite_music_clear', favorite_music_clear)
    global.favorite_event.off('favorite_data_overwrite', favorite_data_overwrite)
  }
}

export const handleRemoteFavoriteAction = async (event: LX.Sync.Favorite.ActionList) => {
  switch (event.action) {
    case 'favorite_music_add':
      await global.favorite_event.favorite_music_add(event.data, true)
      break
    case 'favorite_music_remove':
      await global.favorite_event.favorite_music_remove(event.data, true)
      break
    case 'favorite_music_clear':
      await global.favorite_event.favorite_music_clear(true)
      break
    case 'favorite_data_overwrite':
      await global.favorite_event.favorite_data_overwrite(event.data, true)
      break
    default:
      throw new Error('unknown favorite sync action')
  }
}