import { Assets } from 'premid'

const presence = new Presence({
  clientId: '809067572061405246',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

async function getStrings() {
  return presence.getStrings(
    {
      browse: 'general.browsing',
      names: 'namemc.upcomingNames',
      skinsFeatured: 'namemc.skinsTrending',
      skinsTop: 'namemc.skinsTop',
      skinsNew: 'namemc.skinsNew',
      skinsRandom: 'namemc.skinsRandom',
      skinsTagged: 'namemc.skinsTagged',
      skinsTag: 'namemc.skinsTag',
      capes: 'namemc.capes',
      viewCape: 'namemc.viewCape',
      servers: 'namemc.servers',
      viewServer: 'namemc.viewServer',
      claim: 'namemc.claim',
      profileEdit: 'namemc.profileEdit',
      viewFriends: 'namemc.viewFriends',
      viewSkins: 'namemc.viewSkins',
      viewEmoji: 'namemc.viewEmojis',
      viewProfile: 'general.viewProfile',
      view: 'general.view',
      privacy: 'general.privacy',
      search: 'general.searchFor',
      buttonViewServer: 'namemc.buttonViewServer',
      buttonViewProfile: 'general.buttonViewProfile',
      viewSkin: 'namemc.viewSkin',
    },

  )
}

let strings: Awaited<ReturnType<typeof getStrings>>
let oldLang: string | null = null

presence.on('UpdateData', async () => {
  const [newLang, privacy, buttons] = await Promise.all([
    presence.getSetting<string>('lang').catch(() => 'en'),
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('buttons'),
  ])

  if (oldLang !== newLang || !strings) {
    oldLang = newLang
    strings = await getStrings()
  }

  let presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/N/NameMC/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }

  const statics: {
    [name: string]: PresenceData
  } = {
    '/': {
      details: strings.browse,
    },
    '/minecraft-names/': {
      details: strings.names,
    },
    '/minecraft-skins/': {
      details: strings.skinsFeatured,
    },
    '/minecraft-skins/top/': {
      details: strings.skinsTop,
    },
    '/minecraft-skins/new/': {
      details: strings.skinsNew,
    },
    '/minecraft-skins/random/': {
      details: strings.skinsRandom,
    },
    '/minecraft-skins/tag/': {
      details: strings.skinsTagged,
    },
    '/minecraft-skins/tag/(\\w*)/': {
      details: strings.skinsTag.replace(
        '{0}',
        document
          .querySelector('body > main > h1')
          ?.textContent
          ?.replace(
            document.querySelector('body > main > h1 > small')?.textContent ?? '',
            '',
          )
          .trim() ?? '',
      ),
    },
    '/capes/': {
      details: strings.capes,
    },
    '/cape/': {
      details: strings.viewCape,
      state: `${
        document.querySelector('main > h1')?.textContent?.split('\n')[1]
      }`,
    },
    '/minecraft-servers/': {
      details: strings.servers,
    },
    '/server/': {
      details: strings.viewServer,
      state: document.querySelector('body > main > div > div > h1')
        ?.textContent,
      buttons: [
        {
          label: strings.buttonViewServer,
          url: document.URL,
        },
      ],
    },
    '/claim-your-profile/': {
      details: strings.claim,
    },
    '/my-profile/': {
      details: strings.profileEdit.split('{0}')[0],
      state: strings.profileEdit.split('{0}')[1],
    },
    '/my-profile/friends/': {
      details: strings.viewFriends,
    },
    '/my-profile/skins/': {
      details: strings.viewSkins,
    },
    '/my-profile/emoji/': {
      details: strings.viewEmoji,
    },
    '/profile/': {
      details: strings.viewProfile,
      state: document.querySelector('body > main > div > div > h1')
        ?.textContent,
      buttons: [
        {
          label: strings.buttonViewProfile,
          url: document.URL,
        },
      ],
    },
    '/privacy/': {
      details: strings.view,
      state: strings.privacy,
    },
    '/search': {
      details: strings.search,
      state: document.location.href.split('/search?q=')[1],
      smallImageKey: Assets.Search,
    },
    '/skin/': {
      details: strings.viewSkin,
    },
  }

  if (privacy) {
    presenceData.details = strings.browse
  }
  else {
    for (const [k, v] of Object.entries(statics)) {
      if (
        document.location.href
          .replace(/\/?$/, '/')
          .replace(`https://${document.location.hostname}`, '')
          .replace('?', '/')
          .match(k)
      ) {
        presenceData.smallImageKey = Assets.Reading
        presenceData.smallImageText = strings.browse
        presenceData = { ...presenceData, ...v } as PresenceData
      }
    }
    if (!buttons)
      delete presenceData.buttons
  }

  presence.setActivity(presenceData)
})
