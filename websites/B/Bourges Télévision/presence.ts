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

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://i.ibb.co/yBY6V8RK/OAuth-Icon-512.png',
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
    const episodeTitle = document.querySelector<HTMLElement>(
      'h1[data-v-24a19c48]',
    )?.textContent?.trim()

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

    presenceData.buttons = [
      {
        label: (await strings).buttonWatchVideo,
        url: href,
      },
    ]
  }
  // Page : Collection / émission  /replay/collection/*
  else if (pathname.startsWith('/replay/collection/')) {
    const showTitle = document.querySelector<HTMLElement>(
      'h1.text-4xl',
    )?.textContent?.trim()

    presenceData.details = (await strings).view
    presenceData.state = showTitle ?? 'Une émission'

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
    presenceData.state = 'Catalogue Replay'
  }
  // Toute autre page (la-chaine, direct, programmation…)
  else {
    const pageTitle = document.querySelector('title')?.textContent?.trim()
    presenceData.details = (await strings).view
    presenceData.state = pageTitle ?? 'bourgestelevision.fr'
  }

  presence.setActivity(presenceData)
})
