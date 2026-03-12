const presence = new Presence({
  clientId: '1023713697866199052',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/T/The%20Eternal%20Jukebox/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const { pathname, href, search } = document.location

  switch (pathname) {
    case '/jukebox_index.html': {
      presenceData.details = 'Browsing'
      presenceData.state = 'The Eternal Jukebox'
      break
    }
    case '/jukebox_go.html': {
      const [, hours, mins, secs] = document
        .querySelector<HTMLSpanElement>('#time')
        ?.textContent
        ?.match(/(\d+):(\d+):(\d+)/)
        ?.map(x => +x) ?? []
      const totalSeconds = (hours ?? 0) * 3600 + (mins ?? 0) * 60 + (secs ?? 0)
      const title = document
        .querySelector<HTMLSpanElement>('#song-title')
        ?.textContent
        ?.trim()
      if (title) {
        presenceData.details = 'Listening to a song'
        presenceData.state = title
        if (totalSeconds > 0) {
          presenceData.startTimestamp = Math.floor(Date.now() / 1000) - totalSeconds
        }
        presenceData.buttons = [
          {
            label: 'Listen',
            url: href,
          },
          {
            label: 'View source',
            url: (await presence.getPageletiable<string>(
              'jukeboxData.ogAudioURL',
            )) || document.querySelector<HTMLAnchorElement>('#song-url')?.href || '',
          },
        ]
      }
      else {
        presenceData.details = 'Listening to a song'
        presenceData.state = 'Loading...'
      }
      break
    }
    case '/jukebox_search.html': {
      presenceData.details = 'Searching for a song'
      presenceData.state = document.querySelector<HTMLInputElement>('#search')?.value
      break
    }
    case '/faq.html': {
      presenceData.details = 'Browsing'
      presenceData.state = 'FAQ'
      break
    }
    case '/retro_index.html': {
      presenceData.details = 'Browsing'
      presenceData.state = 'The (Retro) Eternal Jukebox'
      break
    }
    case '/canonizer_index.html': {
      presenceData.details = 'Browsing'
      presenceData.state = 'The Autocanonizer'
      break
    }
    case '/canonizer_go.html': {
      const [, hours, mins, secs] = document
        .querySelector<HTMLSpanElement>('#mtime')
        ?.textContent
        ?.match(/(\d+):(\d+):(\d+)/)
        ?.map(x => +x) ?? []
      const totalSeconds = (hours ?? 0) * 3600 + (mins ?? 0) * 60 + (secs ?? 0)
      const audioSource = await presence.getPageletiable<string>(
        'canonizerData.ogAudioURL',
      )
      if (
        (document.querySelector<SVGElement>('#tiles > svg')?.childElementCount ?? 0)
        > 5
      ) {
        presenceData.details = 'Listening to an autocanonized song'
        presenceData.state = document
          .querySelector<HTMLSpanElement>('#info')
          ?.textContent
          ?.trim()
          .replace(/\(autocanonized\) /, '')
        if (totalSeconds > 0) {
          presenceData.startTimestamp = Math.floor(Date.now() / 1000) - totalSeconds
        }
        presenceData.buttons = [
          {
            label: 'Listen',
            url: href,
          },
          {
            label: 'View source',
            url: audioSource
              ?? `https://open.spotify.com/track/${new URLSearchParams(search).get(
                'id',
              )}`,
          },
        ]
      }
      else {
        presenceData.details = 'Listening to an autocanonized song'
        presenceData.state = 'Loading...'
      }
      break
    }
    case '/canonizer_search.html': {
      presenceData.details = 'Searching for a song'
      presenceData.state = document.querySelector<HTMLInputElement>('#search')?.value
      break
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
