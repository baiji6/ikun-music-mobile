import { SYNC_CLOSE_CODE } from '@/plugins/sync/constants'
import { registerFavoriteActionEvent } from '../../../favoriteEvent'

let unregisterLocalListAction: (() => void) | null

export const registerEvent = (socket: LX.Sync.Socket) => {
  unregisterEvent()
  unregisterLocalListAction = registerFavoriteActionEvent((action) => {
    if (!socket.moduleReadys?.favorite) return
    void socket.remoteQueueFavorite.onFavoriteSyncAction(action).catch((err) => {
      socket.moduleReadys.favorite = false
      socket.close(SYNC_CLOSE_CODE.failed)
      console.log(err.message)
    })
  })
}

export const unregisterEvent = () => {
  unregisterLocalListAction?.()
  unregisterLocalListAction = null
}