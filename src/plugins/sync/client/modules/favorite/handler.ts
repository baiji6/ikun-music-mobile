// 这个文件导出的方法将暴露给服务端调用，第一个参数固定为当前 socket 对象
import {
  handleRemoteFavoriteAction,
  getLocalFavoriteData,
  setLocalFavoriteData,
} from '../../../favoriteEvent'
import log from '../../../log'
import { removeSyncModeEvent, selectSyncMode } from '@/core/sync'
import { toMD5 } from '@/utils/tools'
import { registerEvent, unregisterEvent } from './localEvent'

const logInfo = (eventName: string, success = false) => {
  log.info(
    `[${eventName}]${eventName.replace('favorite:sync:favorite_sync_', '').replace(/_/g, ' ')}${success ? ' success' : ''}`
  )
}
const handler: LX.Sync.ClientSyncHandlerFavoriteActions<LX.Sync.Socket> = {
  async onFavoriteSyncAction(socket, action) {
    if (!socket.moduleReadys?.favorite) return
    await handleRemoteFavoriteAction(action)
  },

  async favorite_sync_get_md5(socket) {
    logInfo('favorite:sync:favorite_sync_get_md5')
    return toMD5(JSON.stringify(await getLocalFavoriteData()))
  },

  async favorite_sync_get_sync_mode(socket) {
    logInfo('favorite:sync:favorite_sync_get_sync_mode')
    const unsubscribe = socket.onClose(() => {
      removeSyncModeEvent()
    })
    return selectSyncMode(socket.data.keyInfo.serverName, 'favorite').finally(unsubscribe)
  },

  async favorite_sync_get_list_data(socket) {
    logInfo('favorite:sync:favorite_sync_get_list_data')
    return getLocalFavoriteData()
  },

  async favorite_sync_set_list_data(socket, data) {
    logInfo('favorite:sync:favorite_sync_set_list_data')
    await setLocalFavoriteData(data)
  },

  async favorite_sync_finished(socket) {
    logInfo('favorite:sync:finished')
    socket.moduleReadys.favorite = true
    registerEvent(socket)
    socket.onClose(() => {
      unregisterEvent()
    })
  },
}

export default handler