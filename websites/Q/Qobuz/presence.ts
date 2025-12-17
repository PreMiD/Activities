import { Assets } from 'premid'

const presence = new Presence({
  clientId: '921861694190407730',
})

async function getStrings() {
  return presence.getStrings(
    {
      play: 'general.playing',
      pause: 'general.paused',
      viewAlbum: 'general.buttonViewAlbum',
      viewPlaylist: 'general.buttonViewPlaylist',
    },

  )
}

let strings: Awaited<ReturnType<typeof getStrings>> | null = null
let oldLang: string | null = null

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/Q/Qobuz/assets/logo.png',
}

presence.on('UpdateData', async () => {
  if (!document.querySelector('#root'))
    return presence.setActivity({ largeImageKey: ActivityAssets.Logo })

  const [newLang, timestamps, cover] = await Promise.all([
    presence.getSetting<string>('lang').catch(() => 'en'),
    presence.getSetting<boolean>('timestamps'),
    presence.getSetting<boolean>('cover'),
  ])

  if (oldLang !== newLang || !strings) {
    oldLang = newLang
    strings = await getStrings()
  }

  const presenceData: PresenceData = {
    largeImageKey: cover
      ? document
          .querySelector<HTMLImageElement>(
            'div[class="player__track-cover"] img',
          )
          ?.src
          .replaceAll('230', '600')
      : ActivityAssets.Logo,
  }
  const songTitle = document.querySelector<HTMLAnchorElement>(
    'a[class="player__track-name"]',
  )
  const fromPlaylist = !!document.querySelectorAll(
    'div[class="player__track-album"] a',
  )[2]
  const currentTimeSec = presence.timestampFromFormat(
    document.querySelector<HTMLElement>(
      'span[class="player__track-time-text"]',
    )?.textContent ?? '',
  )
  const endTimeSec = presence.timestampFromFormat(
    document.querySelectorAll<HTMLElement>(
      'span[class="player__track-time-text"]',
    )[1]?.textContent ?? '',
  )
  const paused = !!document.querySelector(
    'span[class="player__action-play pct pct-player-play "] ',
  )
  const elm = document.querySelector('.player__action-repeat.pct')
  const obj = {
    repeatType: elm?.classList.contains('pct-repeat-once')
      ? 'loopTrack'
      : elm?.classList.contains('player__action-repeat--active')
        ? 'loopQueue'
        : 'deactivated',
    songPlaylist: document.querySelectorAll<HTMLAnchorElement>(
      'div[class="player__track-album"] a',
    )[2],
  }

  let playliststring = ''
  if (fromPlaylist)
    playliststring = ` | From: ${obj.songPlaylist?.textContent}`

  presenceData.details = songTitle?.textContent
  presenceData.state = document.querySelector('div[class="player__track-album"] > a')?.textContent
    + playliststring

  if (currentTimeSec > 0 || !paused) {
    [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(currentTimeSec, endTimeSec)
    presenceData.smallImageKey = paused ? Assets.Pause : Assets.Play
    presenceData.smallImageText = paused ? strings.pause : strings.play
  }

  if (paused || !timestamps) {
    delete presenceData.startTimestamp
    delete presenceData.endTimestamp
  }

  if (obj.repeatType !== 'deactivated' && !paused) {
    presenceData.smallImageKey = obj.repeatType === 'loopQueue' ? Assets.Repeat : Assets.RepeatOne
    presenceData.smallImageText = obj.repeatType === 'loopQueue' ? Assets.Repeat : Assets.RepeatOne
  }

  presenceData.buttons = [
    {
      label: strings.viewAlbum,
      url: songTitle?.href ?? '',
    },
  ]
  if (fromPlaylist) {
    presenceData.buttons.push({
      label: strings.viewPlaylist,
      url: obj.songPlaylist?.href ?? '',
    })
  }
  presence.setActivity(presenceData)
})
