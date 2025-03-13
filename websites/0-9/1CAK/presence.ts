import { Assets } from 'premid'

const presence = new Presence({
  clientId: '634332519398899724',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/0-9/1CAK/assets/logo.png',
}

async function getStrings() {
  return presence.getStrings(
    {
      privacy: 'general.privacy',
      terms: 'general.terms',
      browse: 'general.browsing',
      search: 'general.searchFor',
      viewHome: 'general.viewHome',
      buttonViewPage: 'general.buttonViewPage',
    },

  )
}
let strings: Awaited<ReturnType<typeof getStrings>>
let oldLang: string | null = null

presence.on('UpdateData', async () => {
  let presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const newLang = await presence.getSetting<string>('lang').catch(() => 'en')
  const { pathname, href } = document.location
  if (oldLang !== newLang || !strings) {
    oldLang = newLang
    strings = await getStrings()
  }

  if (pathname.includes('of')) {
    if (pathname === 'of') {
      presenceData.details = document
        .querySelector('#content > h3')
        ?.textContent
        ?.trim()
    }
    else {
      presenceData.details = document.querySelector(
        '#content > div > table > tbody > tr > td > div > .blur a > b',
      )?.textContent
    }
  }
  else if (pathname.includes('saved')) {
    if (!document.querySelector('#content > p'))
      presenceData.details = 'Viewing their saved posts'
    else presenceData.details = 'Viewing saved posts'
  }
  else if (pathname.includes('voteof')) {
    if (!document.querySelector('#content > p'))
      presenceData.details = 'Viewing their liked posts'
    else presenceData.details = 'Viewing liked posts'
  }
  else if (pathname.includes('legendary')) {
    presenceData.details = 'Viewing legendary posts'
  }
  else if (pathname.includes('search')) {
    presenceData.smallImageKey = Assets.Search
    presenceData.details = strings.search
    presenceData.state = pathname.slice(10, pathname.length)
  }
  else {
    const pages: Record<string, PresenceData> = {
      '': {
        details: strings.viewHome,
      },
      'trends': {
        details: 'Viewing trending posts',
      },
      'trending': {
        details: 'Viewing trending posts',
      },
      'recent': {
        details: 'Viewing recent uploads',
      },
      'tvvote': {
        details: 'Viewing fun videos',
      },
      'friends': {
        details: 'Viewing their friend list',
      },
      'rules': {
        details: 'Reading the rules',
        smallImageKey: Assets.Reading,
      },
      'notifications': {
        details: 'Viewing notifications',
      },
      'upload': {
        details: 'Viewing the upload section',
      },
      'about': {
        details: 'About 1CAK/1CUK',
      },
      'terms': {
        details: strings.terms,
      },
      'privacy': {
        details: strings.privacy,
      },
      'disclaimer': {
        details: 'Reading the disclaimer',
        smallImageKey: Assets.Reading,
      },
      'advertise': {
        details: 'Advertising on 1CAK',
      },
      'weeklytop': {
        details: 'Viewing weekly top users',
      },
      'alltimetop': {
        details: 'Viewing all time top users',
      },
      'privacysettings': {
        details: 'Viewing their settings',
      },
      'preferences': {
        details: 'Viewing their settings',
      },
    }
    for (const [path, data] of Object.entries(pages)) {
      if (pathname.replace(/_/g, '').includes(path))
        presenceData = { ...presenceData, ...data } as PresenceData
    }
  }

  if (pathname !== '/') {
    presenceData.buttons = [
      {
        label: strings.buttonViewPage,
        url: href,
      },
    ]
  }
  if (!presenceData.details)
    presenceData.details = strings.browse
  presence.setActivity(presenceData)
})
