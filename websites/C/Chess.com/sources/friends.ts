import type { Resolver } from '../util/interfaces.js'
import { ActivityType } from 'premid'
import { ActivityAssets, getText } from '../util/index.js'

const friendsResolver: Resolver = {
  isActive: pathname => pathname === '/friends',

  getDetails: t => t.friends_list,

  getState: (t, _doc) => {
    const count = getText(['.friends-section-count'])

    if (count) {
      const num = Number.parseInt(count.replace(/\D/g, ''))
      return num === 1 ? `${count} ${t.friends_single}` : `${count} ${t.friends_plural}`
    }

    return t.overview
  },

  getType: () => ActivityType.Watching,

  getLargeImageKey: () => ActivityAssets.Logo,

  getSmallImageText: t => t.friends_list,
}

export default friendsResolver
