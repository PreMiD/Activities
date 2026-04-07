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
  if (!document.querySelector('[data-test="track-info"]'))
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
    '[data-test="footer-track-title"] a',
  )

  const currentTime = document.querySelector<HTMLElement>(
    'time[data-test="current-time"]',
  )?.textContent

  const paused = !document.querySelector('button[data-test="pause"]')

  presenceData.details = songTitle?.textContent

  presenceData.state = Array.from(
    document.querySelectorAll<HTMLAnchorElement>(
      '[data-test="footer-artist-name"] a',
    ),
  )
    .map(artist => artist.textContent)
    .join(', ')

  if (cover) {
    presenceData.largeImageKey = document
      .querySelector<HTMLImageElement>(
        'figure[data-test="current-media-imagery"] img',
      )
      ?.getAttribute('src')
      ?.replace('80x80', '640x640')
  }

  const [min = 0, sec = 0] = (currentTime ?? '0:0').split(':').map(Number)

  if ((min * 60 + sec) * 1000 > 0 || !paused) {
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
      .querySelector('button[data-test="repeat"]')
      ?.getAttribute('aria-checked') === 'true'
  ) {
    const isRepeatOne = !!document.querySelector('[data-test="icon--player__repeat-once"]')
    presenceData.smallImageKey = isRepeatOne ? Assets.RepeatOne : Assets.Repeat
    presenceData.smallImageText = isRepeatOne ? 'On loop' : 'Playlist on loop'
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