import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1253713118803263568',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/0-9/7tv/assets/logo.png',
}

async function getStrings() {
  return presence.getStrings(
    {
      viewHome: 'general.viewHome',
      view: 'general.view',
      search: 'general.search',
      searchFor: 'general.searchFor',
      store: 'general.store',
      searchSomething: 'general.searchSomething',
      viewPage: 'general.viewPage',
      viewProfile: 'general.viewProfile',
      viewAnUser: 'general.viewAnUser',
      viewList: 'general.viewList',
      readingADM: 'general.readingADM',
      cookie: 'general.cookie',
      upload: 'youtube.upload',
    },

  )
}

let strings: Awaited<ReturnType<typeof getStrings>>
let oldLang: string | null = null

function textContent(tags: string) {
  return document.querySelector(tags)?.textContent?.trim()
}

function getImage(tags: string) {
  return document.querySelector<HTMLImageElement>(tags)?.src
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const [newLang, privacy, showEmotes] = await Promise.all([
    presence.getSetting<string>('lang').catch(() => 'en'),
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('showEmotes'),
  ])
  const { pathname, href } = document.location
  const path = pathname.split('/')

  if (oldLang !== newLang || !strings) {
    oldLang = newLang
    strings = await getStrings()
  }

  function getQuery() {
    return new URL(href).searchParams.get('query')
  }

  switch (path[1]) {
    case '':
      presenceData.details = strings.viewHome
      break

    case 'emotes':
      presenceData.details = privacy ? strings.searchSomething : strings.search
      presenceData.smallImageKey = Assets.Search
      presenceData.smallImageText = strings.search

      if (!privacy && getQuery()) {
        presenceData.details = strings.searchFor
        presenceData.state = getQuery()
      }

      if (path[2]) {
        switch (path[2]) {
          case 'create':
            presenceData.details = strings.upload
            presenceData.smallImageKey = Assets.Uploading
            presenceData.smallImageText = strings.upload
            break

          default:
            if (!privacy) {
              presenceData.details = strings.viewPage
              presenceData.state = textContent('.emote-name p')
              presenceData.smallImageKey = Assets.Viewing
              presenceData.smallImageText = strings.view

              if (showEmotes) {
                presenceData.largeImageKey = getImage(
                  '.preview-size.is-large > img',
                )
                presenceData.smallImageKey = ActivityAssets.Logo
              }
            }
            break
        }
      }

      break

    case 'users':
      presenceData.details = privacy ? strings.viewAnUser : strings.viewProfile
      presenceData.state = textContent('.user-card .username')
      presenceData.smallImageKey = Assets.Viewing
      presenceData.smallImageText = strings.view

      if (!privacy) {
        presenceData.largeImageKey = getImage('.user-card .user-picture-wrapper img') ?? ActivityAssets.Logo
        presenceData.smallImageKey = ActivityAssets.Logo
      }
      break

    case 'emote-sets':
      presenceData.details = strings.viewList
      presenceData.state = textContent('.emote-set-wrapper > div > div > h3')
      presenceData.smallImageKey = Assets.Viewing
      presenceData.smallImageText = strings.view
      break

    case 'inbox':
      presenceData.details = strings.readingADM
      presenceData.smallImageKey = Assets.Reading
      presenceData.smallImageText = strings.readingADM
      break

    case 'store':
      presenceData.details = strings.viewPage
      presenceData.state = strings.store
      presenceData.smallImageKey = Assets.Viewing
      presenceData.smallImageText = strings.view
      break

    case 'legal':
      presenceData.details = strings.viewPage
      presenceData.state = strings.cookie
      presenceData.smallImageKey = Assets.Reading
      presenceData.smallImageText = strings.readingADM
      break
  }

  if (privacy)
    delete presenceData.state
  presence.setActivity(presenceData)
})
