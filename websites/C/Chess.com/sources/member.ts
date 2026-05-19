import type { Resolver } from '../util/interfaces.js'
import { ActivityAssets, getText } from '../util/index.js'

const memberResolver: Resolver = {
  isActive: pathname => pathname.includes('/member/'),

  getDetails: t => t.profile_viewing,

  getState: (t, doc) => {
    const username = getText(['.profile-card-username'])
    const realName = getText(['.profile-card-name'])

    if (username && realName) {
      return `${username} (${realName})`
    }

    if (username)
      return username

    const parts = doc.location.pathname.split('/')
    const memberIndex = parts.indexOf('member')
    const urlName = parts[memberIndex + 1]

    if (memberIndex !== -1 && urlName) {
      return urlName.charAt(0).toUpperCase() + urlName.slice(1)
    }

    return t.profile_general_alt
  },

  getLargeImageKey: (_t, doc) => {
    const avatarImg = doc.querySelector<HTMLImageElement>('.profile-header-avatar .cc-avatar-img')

    if (avatarImg && avatarImg.src) {
      return avatarImg.src
    }

    return ActivityAssets.Logo
  },

  getSmallImageKey: () => ActivityAssets.Logo,

  getSmallImageText: t => t.profile_general_alt,
}

export default memberResolver
