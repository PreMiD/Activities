const presence = new Presence({
  clientId: '1459934897694048367',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

let oldPath = ''
let currentTimestamp = browsingTimestamp

async function getStrings() {
  return presence.getStrings({
    browsing: 'general.browsing',
    viewingHome: 'general.viewHome',
    browsingPosts: 'itaku.browsingPosts',
    browsingImages: 'itaku.browsingImages',
    browsingCommissions: 'itaku.browsingCommissions',
    browsingUsers: 'itaku.browsingUsers',
    browsingTags: 'itaku.browsingTags',
    viewingHelp: 'general.viewAHelpPage',
    readingRules: 'general.reading',
    viewingProfile: 'general.viewAProfile',
    viewingGallery: 'itaku.viewingGallery',
    viewingUserPosts: 'itaku.viewingUserPosts',
    viewingFollowers: 'itaku.viewingFollowers',
    viewingFollowing: 'itaku.viewingFollowing',
    viewingCommissionPage: 'itaku.viewingCommissionPage',
    viewingDMs: 'general.readingADM',
    viewingCommissionInbox: 'itaku.viewingCommissionInbox',
    viewingTagSuggestions: 'itaku.viewingTagSuggestions',
    viewingSubmissionInbox: 'itaku.viewingSubmissionInbox',
    viewingSettings: 'general.viewAccount',
  })
}

presence.on('UpdateData', async () => {
  const { pathname } = document.location
  const showBrowsing = await presence.getSetting<boolean>('showBrowsing')
  const strings = await getStrings()

  if (oldPath !== pathname) {
    oldPath = pathname
    currentTimestamp = Math.floor(Date.now() / 1000)
  }

  if (!showBrowsing) {
    presence.clearActivity()
    return
  }

  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/I/Itaku/assets/logo.png',
    startTimestamp: currentTimestamp,
  }

  if (pathname === '/' || pathname === '/home' || pathname === '/home/') {
    presenceData.details = strings.viewingHome
  }
  else if (pathname.startsWith('/home/posts')) {
    presenceData.details = strings.browsingPosts
  }
  else if (pathname.startsWith('/home/images')) {
    presenceData.details = strings.browsingImages
  }
  else if (pathname.startsWith('/home/commissions')) {
    presenceData.details = strings.browsingCommissions
  }
  else if (pathname.startsWith('/home/users')) {
    presenceData.details = strings.browsingUsers
  }
  else if (pathname.startsWith('/tags')) {
    presenceData.details = strings.browsingTags
  }
  else if (pathname === '/help' || pathname === '/help/') {
    presenceData.details = strings.viewingHelp
  }
  else if (pathname.startsWith('/help/rules')) {
    presenceData.details = strings.readingRules
  }
  else if (pathname.startsWith('/profile/')) {
    const pathParts = pathname.split('/').filter(Boolean)
    if (pathParts.length === 2) {
      presenceData.details = strings.viewingProfile
    }
    else if (pathname.includes('/commissions')) {
      presenceData.details = strings.viewingCommissionPage
    }
    else if (pathname.includes('/gallery')) {
      presenceData.details = strings.viewingGallery
    }
    else if (pathname.includes('/posts')) {
      presenceData.details = strings.viewingUserPosts
    }
    else if (pathname.includes('/followers')) {
      presenceData.details = strings.viewingFollowers
    }
    else if (pathname.includes('/following')) {
      presenceData.details = strings.viewingFollowing
    }
    else {
      presenceData.details = strings.viewingProfile
    }
  }
  else if (pathname.startsWith('/dms')) {
    presenceData.details = strings.viewingDMs
  }
  else if (pathname.startsWith('/commission-inbox')) {
    presenceData.details = strings.viewingCommissionInbox
  }
  else if (pathname.startsWith('/tag-suggestions')) {
    presenceData.details = strings.viewingTagSuggestions
  }
  else if (pathname.startsWith('/submission-inbox')) {
    presenceData.details = strings.viewingSubmissionInbox
  }
  else if (pathname.startsWith('/settings/')) {
    presenceData.details = strings.viewingSettings
    const settingType = pathname.split('/').pop()
    if (settingType) {
      presenceData.state = settingType.charAt(0).toUpperCase() + settingType.slice(1)
    }
  }
  else {
    presenceData.details = strings.browsing
  }

  presence.setActivity(presenceData)
})
