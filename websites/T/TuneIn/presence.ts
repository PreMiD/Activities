import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '503557087041683458',
})
const startTimestamp = Math.floor(Date.now() / 1000)

async function getStrings() {
  return presence.getStrings({
    play: 'general.playing',
    pause: 'general.paused',
    browse: 'general.browsing',
    live: 'general.live',
    listening: 'general.listeningMusic',
  })
}

let strings: Awaited<ReturnType<typeof getStrings>>
let oldLang: string | null = null

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/T/TuneIn/assets/logo.png',
    type: ActivityType.Listening,
    startTimestamp,
    name: 'TuneIn',
  }
  const [newLang, timestamps, cover, privacy] = await Promise.all([
    presence.getSetting<string>('lang').catch(() => 'en'),
    presence.getSetting<boolean>('timestamps'),
    presence.getSetting<boolean>('cover'),
    presence.getSetting<boolean>('privacy'),
  ])
  const isLive = document.querySelector('[data-icon=\'stop\']')
  const isPlaying = document.querySelector('[data-testid=\'player-status-playing\']')

  if (oldLang !== newLang) {
    oldLang = newLang
    strings = await getStrings()
  }

  if (isLive || isPlaying) {
    if (privacy) {
      presenceData.details = strings.listening
    }
    else {
      const title = document.querySelector('#playerTitle')?.textContent
      const author = document.querySelector('#playerSubtitle')?.textContent
      const artwork = document.querySelector<HTMLImageElement>(
        '#directoryStationArtwork,#playerArtwork',
      )?.src

      if (title)
        presenceData.details = title
      if (author)
        presenceData.state = author
      if (artwork && cover)
        presenceData.largeImageKey = artwork
    }

    presenceData.smallImageKey = isLive ? Assets.Live : Assets.Play
    presenceData.smallImageText = isLive ? strings.live : strings.play

    if (!privacy && timestamps && !isLive && isPlaying) {
      const elapsed = document.querySelector('#scrubberElapsed')?.textContent
      const duration = document.querySelector('#scrubberDuration')?.textContent

      if (elapsed !== '00:00' || duration !== '') {
        [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(
          presence.timestampFromFormat(elapsed ?? ''),
          presence.timestampFromFormat(duration ?? ''),
        )
      }
    }
  }
  else {
    presenceData.details = strings.browse
  }

  presence.setActivity(presenceData)
})
