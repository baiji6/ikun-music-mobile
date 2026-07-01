import * as list from './list'
import * as dislike from './dislike'
import * as favorite from './favorite'
// export * as theme from './theme'

export const callObj = Object.assign({}, list.handler, dislike.handler, favorite.handler)

export const modules = {
  list,
  dislike,
  favorite,
}

export const featureVersion = {
  list: 1,
  dislike: 1,
  favorite: 1,
} as const
