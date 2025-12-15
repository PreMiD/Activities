import { ActivityType, Assets } from 'premid'

const presence = new Presence({ clientId: '1016797607370162256' })
const browsingTimestamp = Math.floor(Date.now() / 1000)
const staticPages: { [name: string]: string } = {
  '': 'Visionne la page d\'accueil',
  'planning': 'Regarde le planning des sorties',
  'aide': 'Lit la page d\'aide',
  'profil': 'Visionne son profil',
  'catalogue': 'Parcourt le catalogue',
}

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/A/Anime%20Sama/assets/logo.png',
}

let video = {
  duration: 0,
  currentTime: 0,
  paused: true,
}

presence.on(
  'iFrameData',
  (data: unknown) => {
    const data2 = data as { duration: number, currentTime: number, paused: boolean }
    if (data2?.duration)
      video = data2
  },
)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const { pathname, href } = document.location
  const pathArr = pathname.split('/')
  const [showButtons, privacyMode, showTimestamps, showCover] = await Promise.all([
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('timestamps'),
    presence.getSetting<boolean>('cover'),
  ])

  if (Object.keys(staticPages).includes(pathArr[1]!) && pathArr.length <= 3) {
    presenceData.details = staticPages[pathArr[1]!]
    if (privacyMode)
      presenceData.details = 'Navigue...'
  }
  else if (pathArr.length === 4) {
    const pageTitle = document.querySelector(
      'h2.border-slate-500',
    )?.textContent
    presenceData.details = pageTitle === 'Anime'
      ? 'Regarde la page de '  + document.querySelector('#titreOeuvre')
      ?.textContent
      ?.trim()
      : 'Regarde la page du manga'
    presenceData.buttons = [{ label: 'Voir la page', url: href }]
    presenceData.largeImageKey = document.querySelector<HTMLMetaElement>('[property=\'og:image\']')
      ?.content ?? ActivityAssets.Logo
    if (privacyMode) {
      delete presenceData.state
      presenceData.details = pageTitle === 'Anime'
        ? 'Regarde la page d\'un anime'
        : 'Regarde la page d\'un manga'
    }
  }
  else if (document.querySelector<HTMLSelectElement>('#selectEpisodes')) {
    const season = document.querySelector('#avOeuvre')?.textContent
    const selectEps = document.querySelector<HTMLSelectElement>('#selectEpisodes')
    const selectLecteur = document.querySelector<HTMLSelectElement>('#selectLecteurs')
    presenceData.details = `Regarde ${
      document.querySelector('#titreOeuvre')?.textContent ?? ''
    }`
    const [startTimestamp, endTimestamp] = presence.getTimestamps(
      video.currentTime,
      video.duration,
    )
    presenceData.largeImageText = `${season ? `${season}, ` : ''}${
      selectEps?.options[selectEps.selectedIndex]?.value ?? ''
    }`

    presenceData.buttons = [{ label: 'Regarder', url: href }, { label: 'À propos de l\'anime', url: `${document.location.origin}/catalogue/${pathArr[2]}` }]
    presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
    presenceData.smallImageText = selectLecteur?.options[selectLecteur.selectedIndex]?.value ?? ''
    presenceData.largeImageKey = document.querySelector<HTMLMetaElement>('[property=\'og:image\']')
      ?.content ?? ActivityAssets.Logo;
    [presenceData.startTimestamp, presenceData.endTimestamp] = [
      startTimestamp,
      endTimestamp,
    ]
    if (video.paused) {
      delete presenceData.startTimestamp
      delete presenceData.endTimestamp
    }
    if (privacyMode) {
      delete presenceData.state
      delete presenceData.smallImageKey
      delete presenceData.largeImageText
      presenceData.details = 'Regarde un anime'
    }
  }
  else if (document.querySelector<HTMLSelectElement>('#selectChapitres')) {
    const selectChapitres = document.querySelector<HTMLSelectElement>('#selectChapitres')
    presenceData.details = `Lit ${
      document.querySelector('#titreOeuvre')?.textContent ?? ''
    }`
    presenceData.state = selectChapitres?.options[selectChapitres.selectedIndex]?.value?.trim() ?? ''
    const selectLecteur = document.querySelector<HTMLSelectElement>('#selectLecteurs')
    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = selectLecteur?.options[selectLecteur.selectedIndex]?.value ?? ''
    presenceData.buttons = [{ label: 'Lire le scan', url: href }]
    presenceData.largeImageKey = document.querySelector<HTMLMetaElement>('[property=\'og:image\']')
      ?.content ?? ActivityAssets.Logo
    if (privacyMode) {
      delete presenceData.state
      delete presenceData.smallImageKey
      presenceData.details = 'Lit un manga'
    }
  }
  else {
    presenceData.details = !privacyMode ? 'Page inconnue' : 'Navigue..'
  }

  if (!showButtons || privacyMode)
    delete presenceData.buttons
  if (!showTimestamps) {
    delete presenceData.startTimestamp
    delete presenceData.endTimestamp
  }
  if (!showCover || privacyMode)
    presenceData.largeImageKey = ActivityAssets.Logo
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
