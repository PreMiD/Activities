import { ActivityType, Assets } from 'premid'

const LOGO_URL = 'https://cdn.rcd.gg/PreMiD/websites/T/Tidal/assets/logo.png'
const presence = new Presence({ clientId: '901591802342150174' })

async function getStrings() {
  return presence.getStrings(
    {
      play: 'general.playing',
      pause: 'general.paused',
      viewSong: 'general.buttonViewSong',
    },

  )
}

let strings: Awaited<ReturnType<typeof getStrings>>
let oldLang: string | null = null

presence.on('UpdateData', async () => {
  if (!document.querySelector('#footerPlayer'))
    return presence.setActivity({ largeImageKey: LOGO_URL })

  const [newLang, timestamps, cover, buttons] = await Promise.all([
    presence.getSetting<string>('lang').catch(() => 'en'),
    presence.getSetting<boolean>('timestamps'),
    presence.getSetting<boolean>('cover'),
    presence.getSetting<boolean>('buttons'),
  ])

  if (oldLang !== newLang || !strings) {
    oldLang = newLang
    strings = await getStrings()
  }
  const presenceData: PresenceData = {
    largeImageKey: LOGO_URL,
    type: ActivityType.Listening,
  }
  const songTitle = document.querySelector<HTMLAnchorElement>(
    '[data-test=\'footer-track-title\'] > div > a',
  )
  const currentTime = document.querySelector<HTMLElement>(
    'time[data-test="current-time"]',
  )?.textContent
  const paused = document
    .querySelector('div[data-test="play-controls"] div > button')
    ?.getAttribute('data-test') === 'play'
  const repeatType = document
    .querySelector(
      'div[data-test="play-controls"] > button[data-test="repeat"]',
    )
    ?.getAttribute('data-type')

  presenceData.details = songTitle?.textContent
  // get artists
  presenceData.state = Array.from(
    document.querySelectorAll<HTMLAnchorElement>('#footerPlayer .artist-link a'),
  )
    .map(artist => artist.textContent)
    .join(', ')

  if (cover) {
    presenceData.largeImageKey = document
      .querySelector(
        'figure[data-test=current-media-imagery] > div > div > div > img',
      )
      ?.getAttribute('src')
      ?.replace('80x80', '640x640')
  }
  if (
    (Number.parseFloat(currentTime?.[0] ?? '') * 60 + Number.parseFloat(currentTime?.[1] ?? '')) * 1000 > 0
    || !paused
  ) {
    [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(
      presence.timestampFromFormat(currentTime ?? ''),
      presence.timestampFromFormat(
        document.querySelector<HTMLElement>('time[data-test="duration"]')
          ?.textContent ?? '',
      ),
    )
    presenceData.smallImageKey = paused ? Assets.Pause : Assets.Play
    presenceData.smallImageText = paused ? strings.pause : strings.play
  }

  if (
    document
      .querySelector(
        'div[data-test="play-controls"] > button[data-test="repeat"]',
      )
      ?.getAttribute('aria-checked') === 'true'
  ) {
    presenceData.smallImageKey = repeatType === 'button__repeatAll' ? Assets.Repeat : Assets.RepeatOne
    presenceData.smallImageText = repeatType === 'button__repeatAll' ? 'Playlist on loop' : 'On loop'

    delete presenceData.endTimestamp
  }
  if (buttons) {
    presenceData.buttons = [
      {
        label: strings.viewSong,
        url: songTitle?.href ?? '',
      },
    ]
  }
  if (!timestamps)
    delete presenceData.endTimestamp
  presence.setActivity(presenceData)
})
