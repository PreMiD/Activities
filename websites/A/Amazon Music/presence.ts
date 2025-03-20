import { Assets } from 'premid'

const presence = new Presence({
  clientId: '808756700022702120',
})

async function getStrings() {
  return presence.getStrings(
    {
      play: 'general.playing',
      pause: 'general.paused',
      viewPlaylist: 'general.buttonViewPlaylist',
      viewArtist: 'general.buttonViewArtist',
    },

  )
}

let strings: Awaited<ReturnType<typeof getStrings>>
let oldLang: string | null = null

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/A/Amazon%20Music/assets/logo.png',
  }
  const [buttons, newLang, showPlaylist, cover] = await Promise.all([
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<string>('lang').catch(() => 'en'),
    presence.getSetting<boolean>('showPlaylist'),
    presence.getSetting<boolean>('cover'),
  ])

  if (oldLang !== newLang || !strings) {
    oldLang = newLang
    strings = await getStrings()
  }

  if (navigator.mediaSession.metadata) {
    const paused = navigator.mediaSession.playbackState === 'paused'

    if (
      !document.querySelector(
        'div._2kGtEHAlQ5t5sY3jvz-wwl > div._1Wgs9MKFGuL58IFgKSM811 > div._2HXusrWftEtKAYukKt5IuO > music-button',
      )
    ) {
      const playlistLink = document
        .querySelector('music-app.hydrated music-horizontal-item')
        ?.shadowRoot
        ?.querySelector('div > div > span')
        ?.children[2]
        ?.querySelector('a')
        ?.href
      const artistLink = document
        .querySelector('music-app.hydrated music-horizontal-item')
        ?.shadowRoot
        ?.querySelector('div > div > span')
        ?.children[0]
        ?.querySelector('a')
        ?.href

      if (showPlaylist && buttons && artistLink && playlistLink) {
        presenceData.buttons = [
          {
            label: strings.viewArtist,
            url: artistLink,
          },
          {
            label: strings.viewPlaylist,
            url: playlistLink,
          },
        ]
      }
      else if (artistLink && buttons) {
        presenceData.buttons = [
          {
            label: strings.viewArtist,
            url: artistLink,
          },
        ]
      }
    }

    presenceData.details = navigator.mediaSession.metadata.title
    presenceData.state = navigator.mediaSession.metadata.artist
    presenceData.smallImageKey = paused ? Assets.Pause : Assets.Play
    presenceData.smallImageText = paused ? strings.pause : strings.play
    presenceData.endTimestamp = Date.now() / 1000
      + presence.timestampFromFormat(
        document
          .querySelector('div.sXaGQzYs9WqImj2uxDCBs > span:nth-child(2)')!.textContent!.match(/[0-9:]+/)![0],
      )

    if (cover) {
      presenceData.largeImageKey = navigator.mediaSession.metadata.artwork[0]?.src
    }

    if (paused) {
      delete presenceData.startTimestamp
      delete presenceData.endTimestamp
    }

    presence.setActivity(presenceData)
  }
  else {
    presenceData.details = 'Browsing...'
    presence.setActivity(presenceData)
  }
})
