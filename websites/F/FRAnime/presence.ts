import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1102272266278027296',
})
enum ActivityAssets {
  FRAnimeLogo = 'https://cdn.rcd.gg/PreMiD/websites/F/FRAnime/assets/logo.png',
  FRAnimeLogoBg = 'https://cdn.rcd.gg/PreMiD/websites/F/FRAnime/assets/0.png',
}
const presenceStrings = {
  browsing: 'Parcours le catalogue',
  branding: 'Animes gratuit & sans pub',
  websiteName: 'FRAnime.fr',
  onPage: 'Sur la page',
  watchOn: 'Regarder sur FRAnime.fr',
}
const animeBrowsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {}
  const { href, pathname } = document.location
  const params = new URLSearchParams(new URL(href).search.slice(1))
  const scriptElement = document.querySelector<HTMLScriptElement>(
    'script[type="application/ld+json"]',
  )
  const jsonLD = scriptElement ? JSON.parse(scriptElement.textContent || '') : null

  // Home page
  if (pathname === '/') {
    presenceData.details = presenceStrings.browsing
    presenceData.state = presenceStrings.branding
    presenceData.smallImageText = presenceStrings.websiteName
    presenceData.largeImageKey = ActivityAssets.FRAnimeLogoBg
    presenceData.smallImageKey = Assets.Search
    presenceData.startTimestamp = animeBrowsingTimestamp

    // Anime page
  }
  else if (params.get('ep') === '') {
    presenceData.details = `${presenceStrings.onPage} ${jsonLD.name}`
    presenceData.state = presenceStrings.branding
    presenceData.smallImageText = presenceStrings.websiteName
    presenceData.largeImageKey = jsonLD.thumbnailUrl
    presenceData.smallImageKey = Assets.Search
    presenceData.startTimestamp = animeBrowsingTimestamp
    presenceData.buttons = [
      {
        label: presenceStrings.watchOn,
        url: href,
      },
    ]

    // Watching page
  }
  else if (document.querySelector('#play_button')) {
    presenceData.details = `${jsonLD.name} - S${params.getAll(
      's',
    )}, EP${params.getAll('ep')}`

    presenceData.state = presenceStrings.branding
    presenceData.smallImageText = presenceStrings.websiteName
    presenceData.smallImageKey = Assets.Pause
    presenceData.largeImageKey = jsonLD.thumbnailUrl
    presenceData.buttons = [
      {
        label: presenceStrings.watchOn,
        url: href,
      },
    ]

    // The anime is loading, so we delete the timestamp
    delete presenceData.startTimestamp
    delete presenceData.endTimestamp

    // player is loaded
  }
  else if (document.querySelectorAll('video')) {
    const video = document.querySelector('video')!

    presenceData.details = `${jsonLD.name} - S${params.getAll(
      's',
    )}, EP${params.getAll('ep')}`

    presenceData.state = presenceStrings.branding
    presenceData.smallImageText = presenceStrings.websiteName;
    [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestampsfromMedia(video)
    presenceData.largeImageKey = jsonLD.thumbnailUrl
    presenceData.buttons = [
      {
        label: presenceStrings.watchOn,
        url: href,
      },
    ]

    if (!video.paused) {
      presenceData.smallImageKey = Assets.Play
    }
    else {
      presenceData.smallImageKey = Assets.Pause
      delete presenceData.startTimestamp
      delete presenceData.endTimestamp
    }
  }
  presence.setActivity(presenceData)
})
