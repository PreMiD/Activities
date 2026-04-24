import { Assets, getTimestamps } from 'premid'

enum Images {
  Logo = 'https://i.imgur.com/SbmVetu.png',
}

const presence = new Presence({
  clientId: '1471931109104160820',
})

const strings = presence.getStrings({
  play: 'general.playing',
  pause: 'general.paused',
  browsing: 'general.browsing',
})

let startTimestamp: number, endTimestamp: number

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: Images.Logo,
  }

  const path = document.location.pathname
  const showEpisode = await presence.getSetting<boolean>('showEpisode')
  const showTimestamps = await presence.getSetting<boolean>('showTimestamps')
  const resolvedStrings = await strings

  if (path === '/') {
    presenceData.details = 'Ana Sayfada'
    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = resolvedStrings.browsing
  }
  else if (path.startsWith('/watch/')) {
    const videoPlayer = document.getElementById('videoPlayer') as HTMLVideoElement | null
    const titleEl = document.getElementById('videoTitle')

    if (videoPlayer) {
      const titleText = titleEl?.textContent?.trim() || document.title.replace(' - Deokwave', '').trim()

      const isPaused = videoPlayer.paused

      if (!isPaused && showTimestamps && !Number.isNaN(videoPlayer.duration)) {
        ;[startTimestamp, endTimestamp] = getTimestamps(
          Math.floor(videoPlayer.currentTime),
          Math.floor(videoPlayer.duration),
        )
        presenceData.startTimestamp = startTimestamp
        presenceData.endTimestamp = endTimestamp
      }
      else {
        delete presenceData.startTimestamp
        delete presenceData.endTimestamp
      }

      presenceData.details = isPaused ? resolvedStrings.pause : resolvedStrings.play
      presenceData.smallImageKey = isPaused ? Assets.Pause : Assets.Play
      presenceData.smallImageText = isPaused ? resolvedStrings.pause : resolvedStrings.play

      if (showEpisode) {
        presenceData.state = titleText
      }
    }
    else {
      presenceData.details = 'Anime İzliyor'
      presenceData.smallImageKey = Assets.Play
    }
  }
  else if (path.startsWith('/anime/')) {
    const title = (document.querySelector('h1') as HTMLElement | null)?.textContent?.trim()
    presenceData.details = 'Anime Sayfasında'

    if (title) {
      presenceData.state = title
    }

    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = resolvedStrings.browsing
  }
  else if (path.startsWith('/animeler/')) {
    presenceData.details = 'Anime Listesinde'
    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = resolvedStrings.browsing
  }
  else if (path.startsWith('/kategoriler/')) {
    presenceData.details = 'Kategorilerde'
    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = resolvedStrings.browsing
  }
  else if (path.startsWith('/takvim/')) {
    presenceData.details = 'Yayın Takviminde'
    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = resolvedStrings.browsing
  }
  else if (path.startsWith('/kesfet/')) {
    presenceData.details = 'Anime Keşfediyor'
    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = resolvedStrings.browsing
  }
  else if (path.startsWith('/siralama/')) {
    presenceData.details = 'Sıralamada'
    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = resolvedStrings.browsing
  }
  else if (path.startsWith('/liste/')) {
    presenceData.details = 'Listesinde'
    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = resolvedStrings.browsing
  }
  else if (path.startsWith('/profil/')) {
    presenceData.details = 'Profil Sayfasında'
    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = resolvedStrings.browsing
  }
  else if (path.startsWith('/mesajlar/')) {
    presenceData.details = 'Mesajlarında'
    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = resolvedStrings.browsing
  }
  else if (path.startsWith('/birlikte-izle/')) {
    presenceData.details = 'Birlikte İzliyor'
    presenceData.smallImageKey = Assets.Play
    presenceData.smallImageText = resolvedStrings.play
  }
  else if (path.startsWith('/ayarlar/')) {
    presenceData.details = 'Ayarlarda'
    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = resolvedStrings.browsing
  }
  else if (path.startsWith('/rehber/')) {
    presenceData.details = 'Rehberde'
    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = resolvedStrings.browsing
  }
  else {
    presenceData.details = `Deokwave'de`
    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = resolvedStrings.browsing
  }

  presence.setActivity(presenceData)
})
