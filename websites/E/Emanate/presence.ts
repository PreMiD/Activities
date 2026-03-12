import { Assets } from 'premid'

class Emanate extends Presence {
  constructor(options: PresenceOptions) {
    super(options)
  }

  get startTime() {
    return ~~(Date.now() / 1000)
  }

  isListening() {
    return document
      .querySelector('[id="GlobalPlayer"]')
      ?.className
      .startsWith('active')
  }

  getSong() {
    if (!this.isListening())
      return

    return {
      author: document
        .querySelector('span.author')
        ?.textContent
        ?.replace(' _ ', ''),
      title: document.querySelector('span.title')?.textContent,
      duration: this.timestampFromFormat(
        document
          .querySelector('div.position-duration')
          ?.textContent
          ?.split(' / ')[1] ?? '',
      ),
      currentTime: this.timestampFromFormat(
        document
          .querySelector('div.position-duration')
          ?.textContent
          ?.split(' / ')[0] ?? '',
      ),
      paused: !document.querySelector('img.pause-button'),
      href: document.querySelector<HTMLAnchorElement>('a.track-link')?.href,
    }
  }
}

const emanate = new Emanate({
  clientId: '843206620355625031',
})

emanate.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/E/Emanate/assets/logo.png',
    startTimestamp: emanate.startTime,
  }
  const pages = {
    '/dashboard/': () => {
      presenceData.details = 'Viewing page:'

      switch (location.pathname.split('/')[2]) {
        case 'profile':
          presenceData.state = 'Account'
          break
        case 'tracks':
          presenceData.state = 'My Tracks'
          break
        case 'earnings':
          presenceData.state = 'Earnings'
          break
        case 'subscription':
          presenceData.state = 'Subscription'
          break
        case 'drops':
          presenceData.state = 'Drops'
          break
        default:
          presenceData.state = 'Account'
          break
      }
    },
    '/me': () => {
      presenceData.details = 'Viewing their profile'
    },
    '/listen': () => {
      presenceData.details = 'Browsing...'
    },
  }

  for (const [pathname, setData] of Object.entries(pages)) {
    if (location.pathname.includes(pathname) && !emanate.isListening()) {
      setData()
      break
    }
    else if (emanate.isListening()) {
      const songData = emanate.getSong()
      presenceData.details = (await emanate.getSetting<string>('song_1'))
        ?.replace('%title%', songData?.title ?? '')
        ?.replace('%author%', songData?.author ?? '')
      presenceData.state = (await emanate.getSetting<string>('song_2'))
        ?.replace('%title%', songData?.title ?? '')
        ?.replace('%author%', songData?.author ?? '');

      [presenceData.startTimestamp, presenceData.endTimestamp] = emanate.getTimestamps(songData?.currentTime ?? 0, songData?.duration ?? 0)

      presenceData.smallImageKey = songData?.paused ? Assets.Pause : Assets.Play
      presenceData.smallImageText = songData?.paused ? 'Paused' : 'Playing'

      presenceData.buttons = [
        {
          label: 'Listen Along',
          url: songData?.href ?? '',
        },
      ]

      if (songData?.paused) {
        delete presenceData.startTimestamp
        delete presenceData.endTimestamp
      }

      break
    }
  }

  if (location.hostname === 'dashboard.emanate.live')
    presenceData.details = 'Viewing their dashboard'

  if (document.querySelector('input')?.value && !emanate.isListening()) {
    presenceData.details = 'Searching for:'
    presenceData.state = document.querySelector('input')?.value
  }

  if (!(await emanate.getSetting<boolean>('buttons')) && presenceData.buttons)
    delete presenceData.buttons

  if (!presenceData.details)
    emanate.setActivity()
  else emanate.setActivity(presenceData)
})
