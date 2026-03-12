import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1273851679191728160',
})
const strings = presence.getStrings({
  play: 'general.playing',
  pause: 'general.paused',
  live: 'general.live',
})
const baseImage = 'https://cdn.rcd.gg/PreMiD/websites/I/iHeartRadio/assets/logo.png'

function checkLength(string: string): string {
  if (string.length > 128)
    return `${string.substring(0, 125)}...`
  else return string
}
/**
 * @param {string} stationName
 * @returns {string|null} stationDesc
 */
async function getStationDesc(stationName: string): Promise<string | null> {
  const stationInfoReq = await fetch(
    `https://api.iheart.com/api/v2/content/liveStations?q=${new URLSearchParams(
      stationName,
    )}`,
  )
  const stationInfoRes = await stationInfoReq.json()
  if (stationInfoRes.total === 0)
    return null
  return stationInfoRes.hits[0].description
}

let stationDescription: string | null = null

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: baseImage,
    details: 'Browsing iHeartRadio...',
  }

  if (document.location.hostname === 'www.iheart.com') {
    switch (document.location.pathname) {
      case '/for-you/': {
        presenceData.details = 'Viewing For You'
        break
      }
      case '/your-library/': {
        presenceData.details = 'Viewing Library'
        break
      }
      case '/your-library/recently-played/': {
        presenceData.details = 'Viewing Recently Played Library'
        break
      }
      case '/your-library/saved-stations/': {
        presenceData.details = 'Viewing Saved Stations Library'
        break
      }
      case '/your-library/podcasts/': {
        presenceData.details = 'Viewing Podcasts Library'
        break
      }
      case '/your-library/playlists/': {
        presenceData.details = 'Viewing Playlists Library'
        break
      }
      case '/artist/': {
        presenceData.details = 'Viewing Popular Artists'
        break
      }
      case '/artist/genre/alternative/': {
        presenceData.details = 'Viewing Alternative Artists'
        break
      }
      case '/artist/genre/christian-gospel/': {
        presenceData.details = 'Viewing Christian & Gospel Artists'
        break
      }
      case '/artist/genre/classic-rock/': {
        presenceData.details = 'Viewing Classic Rock Artists'
        break
      }
      case '/artist/genre/classical/': {
        presenceData.details = 'Viewing Classical Artists'
        break
      }
      case '/artist/genre/college-radio/': {
        presenceData.details = 'Viewing College Radio Artists'
        break
      }
      case '/artist/genre/comedy/': {
        presenceData.details = 'Viewing Comedy Artists'
        break
      }
      case '/artist/genre/country/': {
        presenceData.details = 'Viewing Country Artists'
        break
      }
      case '/artist/genre/dance-electronic/': {
        presenceData.details = 'Viewing Dance & Electronic Artists'
        break
      }
      case '/artist/genre/hip-hop/': {
        presenceData.details = 'Viewing Hip-Hop Artists'
        break
      }
      case '/artist/genre/jazz-blues/': {
        presenceData.details = 'Viewing Jazz & Blues Artists'
        break
      }
      case '/artist/genre/kids-family/': {
        presenceData.details = 'Viewing Kids & Family Artists'
        break
      }
      case '/artist/genre/latin/': {
        presenceData.details = 'Viewing Latin Artists'
        break
      }
      case '/artist/genre/mix-variety/': {
        presenceData.details = 'Viewing Mix & Variety Artists'
        break
      }
      case '/artist/genre/oldies-classic-hits/': {
        presenceData.details = 'Viewing Oldies & Classic Hits Artists'
        break
      }
      case '/artist/genre/public-radio/': {
        presenceData.details = 'Viewing Public Radio Artists'
        break
      }
      case '/artist/genre/rb-throwbacks/': {
        presenceData.details = 'Viewing R&B & Throwbacks Artists'
        break
      }
      case '/artist/genre/reggae-island/': {
        presenceData.details = 'Viewing Reggae & Island Artists'
        break
      }
      case '/artist/genre/rock/': {
        presenceData.details = 'Viewing Rock Artists'
        break
      }
      case '/artist/genre/soft-rock/': {
        presenceData.details = 'Viewing Soft Rock Artists'
        break
      }
      case '/artist/genre/top-40-pop/': {
        presenceData.details = 'Viewing Top 40 & Pop Artists'
        break
      }
      case '/playlist/': {
        presenceData.details = 'Viewing Playlists'
        break
      }
    }

    if (
      (document.location.href.includes('live')
        && document.querySelector('div[data-test="hero-container"]')
        && !document.location.href.includes('/live/country/'))
      || (document.location.href.includes('live')
        && document.querySelector('div[data-test="hero-container"]')
        && document.location.pathname !== '/live/')
    ) {
      const stationName = document
        .querySelector('div[data-test="hero-container"]')
        ?.querySelector('h1')
        ?.textContent
      const stationDesc = document
        .querySelector('div[data-test="hero-container"]')
        ?.querySelector('h2')
        ?.textContent
      presenceData.details = stationName
        ? `Viewing ${stationName} Station`
        : 'Viewing Station Page'
      presenceData.state = stationDesc
      presenceData.largeImageKey = document
        .querySelector('div[data-test="hero-container"]')
        ?.querySelector('img')
        ?.src ?? baseImage
      presenceData.buttons = [
        {
          label: 'View Station',
          url: document.location.href,
        },
      ]
    }

    if (
      document.location.href.includes('artist')
      && document
        .querySelector('h1[data-test="artist-title"]')
        ?.querySelector('p')
        ?.querySelector('span')
        && document.location.pathname !== '/artist/'
    ) {
      const artistName = document
        .querySelector('h1[data-test="artist-title"]')
        ?.querySelector('p')
        ?.querySelector('span')
        ?.textContent

      presenceData.details = 'Viewing Artist'
      presenceData.state = artistName
      presenceData.largeImageKey = document
        .querySelector('div[data-test="hero-artist"]')
        ?.querySelector('img')
        ?.src ?? baseImage
      presenceData.buttons = [
        {
          label: 'View Artist',
          url: document.location.href,
        },
      ]
    }

    if (
      document.querySelector('div[data-test="control-set"]')
      && document
        .querySelector('div[data-test="control-set"]')
        ?.querySelector('svg[aria-label="Stop Icon"]')
    ) {
      const playerArtwork = document
        .querySelector('div[data-test="player-artwork-image"]')
        ?.querySelector('div')
        ?.querySelector('img')
        ?.src
      const metadataText = document
        .querySelector('div[data-test="player-text"]')
        ?.querySelectorAll('a') ?? null

      presenceData.state = document
        .querySelector('div[data-test="player-text"]')
        ?.querySelector('a')
        ?.textContent
      presenceData.largeImageKey = playerArtwork ?? baseImage
      presenceData.smallImageKey = Assets.Live
      presenceData.smallImageText = (await strings).live

      if (
        metadataText
        && metadataText[0]
        && metadataText[1]
        && metadataText[2]
      ) {
        presenceData.details = metadataText[1]?.textContent && metadataText[2]?.textContent
          ? `${metadataText[1]?.textContent} · ${metadataText[2]?.textContent}`
          : ''
        presenceData.buttons = [
          {
            label: 'View Station',
            url: metadataText[0]?.href ?? null,
          },
        ]
      }

      if (
        metadataText
        && metadataText[1]?.getAttribute('href')?.includes('song')
        && metadataText[2]?.getAttribute('href')?.includes('artist')
      ) {
        presenceData.buttons = [
          {
            label: 'View Song',
            url: document.location.origin + metadataText[1]?.getAttribute('href'),
          },
          {
            label: 'View Artist',
            url: document.location.origin + metadataText[2]?.getAttribute('href'),
          },
        ]
      }
    }

    if (
      document.querySelector('div[data-test="control-set"]')
      && document
        .querySelector('div[data-test="control-set"]')
        ?.querySelector('svg[aria-label="Pause Icon"]')
    ) {
      const playerArtwork = document
        .querySelector('div[data-test="player-artwork-image"]')
        ?.querySelector('div')
        ?.querySelector('img')
        ?.src
      const metadataText = document
        .querySelector('div[data-test="player-text"]')
        ?.querySelectorAll('a') ?? null
      const currentTime = presence.timestampFromFormat(
        document.querySelector('div[aria-label="Seekbar Position"]')
          ?.textContent ?? '',
      )
      const timestamps = presence.getTimestamps(
        currentTime,
        presence.timestampFromFormat(
          document.querySelector('div[aria-label="Seekbar Duration"]')
            ?.textContent ?? '',
        ),
      )

      presenceData.state = document
        .querySelector('div[data-test="player-text"]')
        ?.querySelector('a')
        ?.textContent
      presenceData.details = metadataText
        && metadataText[1]?.textContent
        && metadataText[2]?.textContent
        ? `${metadataText[1]?.textContent} · ${metadataText[2]?.textContent}`
        : ''
      presenceData.largeImageKey = playerArtwork ?? baseImage
      presenceData.smallImageKey = Assets.Play
      presenceData.smallImageText = (await strings).play
      presenceData.startTimestamp = timestamps[0]
      presenceData.endTimestamp = timestamps[1]

      if (
        metadataText
        && metadataText[1]?.getAttribute('href')?.includes('song')
        && metadataText[2]?.getAttribute('href')?.includes('artist')
      ) {
        presenceData.buttons = [
          {
            label: 'View Song',
            url: document.location.origin + metadataText[1]?.getAttribute('href'),
          },
          {
            label: 'View Artist',
            url: document.location.origin + metadataText[2]?.getAttribute('href'),
          },
        ]
      }
    }

    await presence.setActivity(presenceData)
  }
  else if (document.location.hostname === 'listen.iheart.com') {
    presenceData.details = 'Browsing iHeartRadio [BETA]'

    switch (document.location.pathname) {
      case '/browse/live': {
        presenceData.details = 'Viewing Search Stations'
        break
      }
      case '/search': {
        presenceData.details = 'Searching for Stations'
        break
      }
      case '/library/live': {
        presenceData.details = 'Viewing Library of Followed Stations'
        break
      }
      case '/browse/artists': {
        presenceData.details = 'Viewing Search Artists'
        break
      }
      case '/browse/podcasts': {
        presenceData.details = 'Viewing Search Podcasts'
        break
      }
      case '/browse/playlists': {
        presenceData.details = 'Viewing Search Playlists'
        break
      }
      case '/library/artists': {
        presenceData.details = 'Viewing Artists Library'
        break
      }
      case '/library/podcasts': {
        presenceData.details = 'Viewing Podcasts Library'
        break
      }
      case '/library/playlists': {
        presenceData.details = 'Viewing Playlists Library'
        break
      }
    }

    if (
      document.location.href.includes('live')
      && document.querySelector('main[data-test="main"]')
      && !document.location.href.includes('/browse/live')
    ) {
      const stationName = document
        .querySelector('main[data-test="main"]')
        ?.querySelector('h1')
        ?.textContent
      const stationArtwork = document
        .querySelector('main[data-test="main"]')
        ?.querySelector('div[data-test="image-container"]')
        ?.querySelector('img')
        ?.src

      presenceData.details = stationName
        ? `Viewing ${stationName} Station`
        : 'Viewing Station Page'
      presenceData.state = document
        .querySelector('main[data-test="main"]')
        ?.querySelector('p')
        ?.textContent
      presenceData.largeImageKey = stationArtwork ?? baseImage
      presenceData.buttons = [
        {
          label: 'View Station',
          url: document.location.href,
        },
      ]
    }

    if (
      document.location.href.includes('artist')
      && document.querySelector('main[data-test="main"]')
      && !document.location.href.includes('/browse/artists')
    ) {
      const artistArtwork = document
        .querySelector('main[data-test="main"]')
        ?.querySelector('div[data-test="image-container"]')
        ?.querySelector('img')
        ?.src

      presenceData.details = 'Viewing Artist'
      presenceData.state = document.querySelector('main[data-test="main"]')?.querySelector('h1')?.textContent ?? 'Unknown Artist'
      presenceData.largeImageKey = artistArtwork ?? baseImage
      presenceData.buttons = [
        {
          label: 'View Artist',
          url: document.location.href,
        },
      ]
    }

    if (
      document.location.href.includes('song')
      && document.querySelector('main[data-test="main"]')
      && document
        .querySelector('div[data-test="song-hero"]')
        ?.querySelector('p')
        ?.querySelector('a')
    ) {
      const songName = document
        .querySelector('main[data-test="main"]')
        ?.querySelector('h1')
        ?.textContent
      const songArtwork = document
        .querySelector('main[data-test="main"]')
        ?.querySelector('div[data-test="image-container"]')
        ?.querySelector('img')
        ?.src
      const songArtist = document
        .querySelector('div[data-test="song-hero"]')
        ?.querySelector('p')
        ?.querySelector('a')

      presenceData.details = 'Viewing Song'
      presenceData.state = songName && songArtist?.textContent
        ? `${songName} · ${songArtist?.textContent}`
        : 'Unknown Song'
      presenceData.largeImageKey = songArtwork
      presenceData.buttons = [
        {
          label: 'View Song',
          url: document.location.href,
        },
        {
          label: 'View Artist',
          url: songArtist?.href ?? null,
        },
      ]
    }

    if (
      document.location.href.includes('album')
      && document.querySelector('main[data-test="main"]')
      && document
        .querySelector('div[data-test="album-hero"]')
        ?.querySelector('p')
        ?.querySelector('a')
    ) {
      const albumName = document
        .querySelector('main[data-test="main"]')
        ?.querySelector('h1')
        ?.textContent
      const albumArtwork = document
        .querySelector('main[data-test="main"]')
        ?.querySelector('div[data-test="image-container"]')
        ?.querySelector('img')
        ?.src
      const albumArtist = document
        .querySelector('div[data-test="album-hero"]')
        ?.querySelector('p')
        ?.querySelector('a')

      presenceData.details = 'Viewing Album'
      presenceData.state = albumName && albumArtist?.textContent
        ? `${albumName} · ${albumArtist?.textContent}`
        : 'Unknown Album'
      presenceData.largeImageKey = albumArtwork ?? baseImage
      presenceData.buttons = [
        {
          label: 'View Album',
          url: document.location.href,
        },
        {
          label: 'View Artist',
          url: albumArtist?.href ?? null,
        },
      ]
    }

    if (
      document.location.href.includes('playlist')
      && document.querySelector('main[data-test="main"]')
      && document
        .querySelector('div[data-test="hero-container"]')
        ?.querySelector('h1')
        ?.textContent
    ) {
      const playlistTitle = document
        .querySelector('div[data-test="hero-container"]')
        ?.querySelector('h1')
        ?.textContent
      const playlistCreator = document
        .querySelector('div[data-test="hero-container"]')
        ?.querySelectorAll('p')[1]
        ?.textContent
      presenceData.details = 'Viewing Playlist'
      presenceData.state = playlistTitle && playlistCreator
        ? `${playlistTitle} · ${playlistCreator}`
        : 'Unknown Playlist'
      presenceData.largeImageKey = document
        .querySelector('div[data-test="image-container"]')
        ?.querySelector('img')
        ?.src ?? baseImage
      presenceData.buttons = [
        {
          label: 'View Playlist',
          url: document.location.href,
        },
      ]
    }

    if (
      document.location.href.includes('podcast')
      && document.querySelector('main[data-test="main"]')
      && !document.location.href.includes('browse/podcasts')
    ) {
      const podcastName = document
        .querySelector('div[data-test="hero-container"]')
        ?.querySelector('h1')
        ?.textContent
      const podcastIcon = document
        .querySelector('div[data-test="hero-container"]')
        ?.querySelector('div[data-test="image-container"]')
        ?.querySelector('img')
        ?.src

      presenceData.details = 'Viewing Podcast'
      presenceData.state = podcastName ?? 'Unknown Podcast'
      presenceData.largeImageKey = podcastIcon ?? baseImage
      presenceData.buttons = [
        {
          label: 'View Podcast',
          url: document.location.href,
        },
      ]
    }

    if (
      document.location.href.includes('episode')
      && document.querySelector('main[data-test="main"]')
      && !document.location.href.includes('browse/podcasts')
    ) {
      const episodeName = document
        .querySelector('main[data-test="main"]')
        ?.querySelector('h1')
        ?.textContent
      const podcastIcon = document
        .querySelector('main[data-test="main"]')
        ?.querySelector('div[data-test="image-container"]')
        ?.querySelector('img')
        ?.src
      const podcastName = document
        .querySelector('main[data-test="main"]')
        ?.querySelector('a')

      presenceData.details = episodeName
        ? `Viewing ${episodeName}`
        : 'Viewing Unknown Episode'
      presenceData.state = podcastName?.textContent ?? 'Unknown Podcast'
      presenceData.largeImageKey = podcastIcon ?? baseImage
      presenceData.buttons = [
        {
          label: 'View Episode',
          url: document.location.href,
        },
        {
          label: 'View Podcast',
          url: podcastName?.href ?? null,
        },
      ]
    }

    if (
      document.querySelector('div[data-test="player-controls"]')
      && document
        .querySelector('div[data-test="player-controls"]')
        ?.querySelector('button[data-test="player-play-button"]')
        ?.querySelector('svg[aria-label="Pause Icon"]')
    ) {
      const playerArtwork = document
        .querySelector('div[data-test="player-metadata"]')
        ?.querySelector('div[data-test="image-container"]')
        ?.querySelector('img')
        ?.src ?? baseImage
      const songTitle = document.querySelector('a[data-test="title-link"]')
      const artist = document.querySelector('a[data-test="description-link"]')
      const stationName = document.querySelector('a[data-test="subtitle-link"]')
      const songPosition = document.querySelector(
        'span[aria-label="position"][role="timer"][data-kind="caption-4"]',
      )
      const songDuration = document.querySelector(
        'span[aria-label="duration"][role="timer"][data-kind="caption-4"]',
      )
      const timestamps = presence.getTimestamps(
        presence.timestampFromFormat(songPosition?.textContent ?? ''),
        presence.timestampFromFormat(songDuration?.textContent ?? ''),
      )

      presenceData.largeImageKey = playerArtwork
        ? `${playerArtwork}`
        : baseImage
      presenceData.details = songTitle?.textContent && artist?.textContent
        ? `${songTitle?.textContent} · ${artist?.textContent}`
        : ''
      presenceData.state = stationName?.textContent
      presenceData.smallImageKey = Assets.Play
      presenceData.smallImageText = (await strings).play
      presenceData.startTimestamp = timestamps[0]
      presenceData.endTimestamp = timestamps[1]

      if (
        artist?.getAttribute('href')?.includes('podcast')
        && stationName?.getAttribute('href')?.includes('episode')
      ) {
        presenceData.details = checkLength(artist?.textContent ?? '')
        presenceData.state = checkLength(stationName?.textContent ?? '')
        presenceData.buttons = [
          {
            label: 'View Episode',
            url: document.location.origin + stationName?.getAttribute('href'),
          },
          {
            label: 'View Podcast',
            url: document.location.origin + artist?.getAttribute('href'),
          },
        ]
      }

      if (
        artist?.getAttribute('href')?.includes('artist')
        && songTitle?.getAttribute('href')?.includes('song')
      ) {
        presenceData.buttons = [
          {
            label: 'View Song',
            url: document.location.origin + songTitle?.getAttribute('href'),
          },
          {
            label: 'View Artist',
            url: document.location.origin + artist?.getAttribute('href'),
          },
        ]
      }
    }

    if (
      document.querySelector('div[data-test="player-controls"]')
      && document
        .querySelector('div[data-test="player-controls"]')
        ?.querySelector('button[data-test="player-play-button"]')
        ?.querySelector('svg[aria-label="Stop Icon"]')
    ) {
      const stationName = document.querySelector(
        'a[data-test="subtitle-link"]',
      )
      const stationFallbackName = document.querySelector(
        'a[data-test="fallback-subtitle-link"]',
      )
      const stationMetaTitle = document.querySelector('a[data-test="title-link"]')
      const stationFallbackDesc = document.querySelector(
        'a[data-test="fallback-description-link"]',
      )
      const stationMetaDesc = document.querySelector(
        'a[data-test="description-link"]',
      )
      const stationArtwork = document
        .querySelector('div[data-test="image-container"]')
        ?.querySelector('img')
        ?.src

      let stationArtWorkFixed

      if (stationDescription && stationFallbackDesc?.textContent)
        stationDescription = null
      if (!stationDescription && !stationFallbackDesc?.textContent) {
        stationName?.textContent
          ? (stationDescription = await getStationDesc(
              stationName?.textContent,
            ))
          : (stationDescription = await getStationDesc(
              stationFallbackName?.textContent ?? '',
            ))
      }

      if (stationArtwork && stationArtwork.includes('ops=cover'))
        stationArtWorkFixed = stationArtwork.replace('(400,400)', '(500,500)')

      presenceData.state = stationName?.textContent && stationDescription
        ? `${stationName?.textContent} · ${stationDescription}`
        : stationFallbackDesc?.textContent ?? stationName?.textContent
      presenceData.details = stationMetaTitle && stationMetaDesc
        ? `${stationMetaTitle?.textContent} · ${stationMetaDesc?.textContent}`
        : stationFallbackName?.textContent
      presenceData.smallImageKey = Assets.Live
      presenceData.smallImageText = (await strings).live
      presenceData.largeImageKey = stationArtWorkFixed
        ? `${stationArtWorkFixed}`
        : stationArtwork
          ? `${stationArtwork}`
          : baseImage

      if (
        stationFallbackDesc?.getAttribute('href')?.includes('live')
        || stationFallbackName?.getAttribute('href')?.includes('live')
      ) {
        presenceData.buttons = [
          {
            label: 'View Station',
            url: stationFallbackDesc?.getAttribute('href')
              ? document.location.origin
              + stationFallbackDesc?.getAttribute('href')
              : document.location.origin
                + stationFallbackName?.getAttribute('href'),
          },
        ]
      }

      if (
        stationMetaTitle?.getAttribute('href')?.includes('song')
        && stationMetaDesc?.getAttribute('href')?.includes('artist')
      ) {
        presenceData.buttons = [
          {
            label: 'View Song',
            url: document.location.origin + stationMetaTitle?.getAttribute('href'),
          },
          {
            label: 'View Artist',
            url: document.location.origin + stationMetaDesc?.getAttribute('href'),
          },
        ]
      }
    }

    await presence.setActivity(presenceData)
  }
})
