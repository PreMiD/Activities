import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '503557087041683458',
})

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/A/AWTWA/assets/logo.png',
}

let iFrameData = {
  currentTime: -1,
  duration: -1,
  paused: true,
}

const browsingTimestamp = Math.floor(Date.now() / 1000)
const presenceStrings = {
  home: 'Se balade sur la page d\'accueil',
  browsing: 'Utilise son haki de l\'observation sur le catalogue',
  branding: 'Tous vos animes gratuits et en haute qualité sur AWTWA.site',
  websiteName: 'AWTWA.site',
  onPage: 'En train de regarder ',
  watchOn: 'Regarder sur AWTWA.site',
}

presence.on(
  'iFrameData',
  (data: { currentTime: number, duration: number, paused: boolean }) => {
    iFrameData = data
  },
)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    name: 'AWTWA',
  } as PresenceData
  const { pathname, href } = document.location

  if (pathname === '/') {
    presenceData.details = presenceStrings.home
    presenceData.state = presenceStrings.branding
    presenceData.smallImageText = presenceStrings.websiteName
    presenceData.smallImageKey = Assets.Viewing
  }
  else if (pathname === '/catalog') {
    presenceData.details = presenceStrings.browsing
    presenceData.state = presenceStrings.branding
    presenceData.smallImageText = presenceStrings.websiteName
    presenceData.smallImageKey = Assets.Search
    presenceData.startTimestamp = browsingTimestamp
  }
  else if (pathname.includes('/animes')) {
    const poster = document
      .querySelector('div[role=\'img\']')
      ?.getAttribute('style')
      ?.split('url(')[1]
      ?.split(')')[0]
      ?.replace(/['"]/g, '')
    const isPrivacyMode = await presence.getSetting('privacy')

    if (isPrivacyMode) {
      presenceData.details = `${presenceStrings.onPage}un anime`
      presenceData.state = presenceStrings.branding
      presenceData.smallImageText = presenceStrings.watchOn
      presenceData.smallImageKey = Assets.Play
    }
    else {
      presenceData.details = presenceStrings.onPage + document.querySelector('h1')?.textContent
      presenceData.state = `Saison ${
        document.querySelector<HTMLSelectElement>('#season')?.value
      } - Épisode ${
        document.querySelector<HTMLSelectElement>('#episode')?.value
      }`
      presenceData.smallImageText = presenceStrings.watchOn
      presenceData.largeImageKey = poster ?? ActivityAssets.Logo
      presenceData.smallImageKey = Assets.Play

      if (!iFrameData?.paused) {
        [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(iFrameData.currentTime, iFrameData.duration)
      }
      presenceData.smallImageKey = iFrameData?.paused
        ? Assets.Pause
        : Assets.Play
      presenceData.smallImageText = iFrameData?.paused
        ? 'En pause'
        : 'En train de regarder'

      presenceData.buttons = [
        {
          label: presenceStrings.watchOn,
          url: href,
        },
      ]
    }
  }

  presenceData.type = ActivityType.Watching
  presence.setActivity(presenceData)
})
