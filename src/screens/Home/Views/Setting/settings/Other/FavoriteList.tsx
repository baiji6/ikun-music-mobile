import { memo, useState, useCallback, useEffect } from 'react'
import { StyleSheet, View, FlatList, TouchableOpacity } from 'react-native'

import SubTitle from '../../components/SubTitle'
import Button from '../../components/Button'
import { toast } from '@/utils/tools'
import { useI18n } from '@/lang'
import Text from '@/components/common/Text'
import { useTheme } from '@/store/theme/hook'
import { state, useFavoriteNum } from '@/store/favoriteList'
import { loadFavoriteList, clearFavoriteList, removeFavorite } from '@/core/favoriteList'
import { confirmDialog } from '@/utils/tools'

export default memo(() => {
  const t = useI18n()
  const theme = useTheme()
  const [list, setList] = useState<LX.Music.MusicInfo[]>([])
  const favoriteNum = useFavoriteNum()

  useEffect(() => {
    void loadFavoriteList().then(() => {
      setList([...state.list])
    })
  }, [])

  const handleClear = useCallback(() => {
    void confirmDialog({
      message: t('setting__other_favorite_list_clear_confirm'),
      confirmButtonText: t('list_remove_tip_button'),
    }).then((isConfirm) => {
      if (!isConfirm) return
      void clearFavoriteList().then(() => {
        setList([])
        toast(t('setting__other_favorite_list_cleared'))
      })
    })
  }, [t])

  const handleRemove = useCallback(
    (musicInfo: LX.Music.MusicInfo) => {
      void removeFavorite(musicInfo).then(() => {
        setList([...state.list])
      })
    },
    []
  )

  const renderItem = ({ item, index }: { item: LX.Music.MusicInfo; index: number }) => (
    <View style={styles.item}>
      <View style={styles.itemInfo}>
        <Text style={styles.index} size={12} color={theme['c-600']}>
          {index + 1}.
        </Text>
        <View style={styles.itemText}>
          <Text numberOfLines={1} size={14}>
            {item.name}
          </Text>
          <Text numberOfLines={1} size={12} color={theme['c-600']}>
            {item.singer}
          </Text>
        </View>
      </View>
      <TouchableOpacity onPress={() => handleRemove(item)} style={styles.removeBtn}>
        <Text size={12} color={theme['c-600']}>
          {t('delete')}
        </Text>
      </TouchableOpacity>
    </View>
  )

  return (
    <SubTitle title={t('setting__other_favorite_list')}>
      <View style={styles.ruleNum}>
        <Text>
          {t('setting__other_favorite_list_label', { num: favoriteNum })}
        </Text>
      </View>
      <View style={styles.btn}>
        <Button onPress={handleClear}>
          {t('setting__other_favorite_list_clear_btn')}
        </Button>
      </View>
      {list.length > 0 ? (
        <FlatList
          style={styles.list}
          data={list}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
        />
      ) : null}
    </SubTitle>
  )
})

const styles = StyleSheet.create({
  ruleNum: {
    marginBottom: 5,
  },
  btn: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  list: {
    maxHeight: 300,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 5,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128,128,128,0.2)',
  },
  itemInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  index: {
    width: 30,
    textAlign: 'center',
  },
  itemText: {
    flex: 1,
    marginLeft: 5,
  },
  removeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
})