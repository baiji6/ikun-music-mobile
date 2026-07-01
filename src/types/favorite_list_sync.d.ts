declare namespace LX {
  namespace Sync {
    namespace Favorite {
      interface ListInfo {
        lastSyncDate?: number
        snapshotKey: string
      }

      interface SyncActionBase<A> {
        action: A
      }
      interface SyncActionData<A, D> extends SyncActionBase<A> {
        data: D
      }

      type ActionList =
        | { action: 'favorite_music_add'; data: LX.Music.MusicInfo }
        | { action: 'favorite_music_remove'; data: LX.Music.MusicInfo }
        | { action: 'favorite_music_clear' }
        | { action: 'favorite_data_overwrite'; data: LX.Music.MusicInfo[] }

      type SyncMode =
        | 'merge_local_remote'
        | 'merge_remote_local'
        | 'overwrite_local_remote'
        | 'overwrite_remote_local'
        | 'cancel'
    }
  }
}