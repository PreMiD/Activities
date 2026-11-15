import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1503166751603556543',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

const strings = presence.getStrings({
  browse: 'general.browsing',
  viewHome: 'general.viewHome',
  view: 'general.view',
  watching: 'general.watching',
  paused: 'general.paused',
  buttonWatchVideo: 'general.buttonWatchVideo',
  buttonViewShow: 'general.buttonViewShow',
})

// Retire le suffixe « — Bourges Télévision » / « - Bourges Télévision » du titre de l'onglet
function getPageTitle(): string | undefined {
  return document.title
    .replace(/\s[—-]\s*Bourges Télévision$/, '')
    .trim() || undefined
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/B/Bourges%20T%C3%A9l%C3%A9vision/assets/logo.png',
    type: ActivityType.Watching,
    startTimestamp: browsingTimestamp,
  }

  const { href, pathname } = document.location
  const showButtons = await presence.getSetting<boolean>('buttons')

  // Page : Accueil
  if (pathname === '/') {
    presenceData.details = (await strings).viewHome
    presenceData.state = 'bourgestelevision.fr'
  }
  // Page : Regard un replay en cours de lecture  /replay/watch/*
  else if (pathname.startsWith('/replay/watch/')) {
    const episodeTitle = document.querySelector<HTMLElement>('h1')?.textContent?.trim()
      || getPageTitle()?.replace(/^Replay\s-\s/, '')

    presenceData.details = (await strings).watching
    presenceData.state = episodeTitle ?? 'Un épisode en replay'
    // Progression de lecture via l'élément vidéo
    const video = document.querySelector('video')
    const isPaused = video?.paused ?? false
    const current = Math.floor(video?.currentTime ?? 0)
    const duration = Math.floor(video?.duration ?? 0)

    if (duration > 0) {
      const [start, end] = getTimestamps(current, duration)
      if (!isPaused) {
        presenceData.startTimestamp = start
        presenceData.endTimestamp = end
      }
      else {
        delete presenceData.startTimestamp
      }
    }

    presenceData.smallImageKey = isPaused ? Assets.Pause : Assets.Play
    presenceData.smallImageText = isPaused
      ? (await strings).paused
      : (await strings).watching

    if (showButtons) {
      presenceData.buttons = [
        {
          label: (await strings).buttonWatchVideo,
          url: href,
        },
      ]
    }
  }
  // Page : Collection / émission  /replay/collection/*
  else if (pathname.startsWith('/replay/collection/')) {
    const showTitle = document.querySelector<HTMLElement>(
      'h1',
    )?.textContent?.trim()

    presenceData.details = (await strings).view
    presenceData.state = showTitle || 'Une émission'

    if (showButtons) {
      presenceData.buttons = [
        {
          label: (await strings).buttonViewShow,
          url: href,
        },
      ]
    }
  }
  // Page : Tous les replays  /replay/*  (liste, recent, catégorie…)
  else if (pathname.startsWith('/replay')) {
    presenceData.details = (await strings).browse
    presenceData.state = document.querySelector<HTMLElement>('h1')?.textContent?.trim()
      || 'Catalogue Replay'
  }
  // Page : Direct
  else if (pathname.startsWith('/direct')) {
    const pageText = document.body.textContent ?? ''
    const isLoading = pageText.includes('Chargement du direct')
    const isOffline = Array.from(document.querySelectorAll('h2')).some(el =>
      el.textContent?.includes('Nous ne diffusons pas'),
    )

    if (isLoading || isOffline) {
      presenceData.details = (await strings).view
      presenceData.state = isOffline ? 'Direct (Hors ligne)' : 'Le direct'
    }
    else {
      presenceData.details = (await strings).watching
      presenceData.state = 'Le direct'

      const video = document.querySelector('video')
      if (video) {
        const isPaused = video.paused
        presenceData.smallImageKey = isPaused ? Assets.Pause : Assets.Play
        presenceData.smallImageText = isPaused
          ? (await strings).paused
          : (await strings).watching
      }

      if (showButtons) {
        presenceData.buttons = [
          {
            label: (await strings).buttonWatchVideo,
            url: href,
          },
        ]
      }
    }
  }
  // Page : La chaîne (titre d'onglet non exploitable)
  else if (pathname.startsWith('/la-chaine')) {
    presenceData.details = (await strings).view
    presenceData.state = 'La chaîne'
  }
  // Toute autre page (programmation, mentions légales, CGU…)
  else {
    presenceData.details = (await strings).view
    presenceData.state = getPageTitle() ?? 'bourgestelevision.fr'
  }

  presence.setActivity(presenceData)
})
