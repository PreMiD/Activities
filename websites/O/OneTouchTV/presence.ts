import { Assets } from 'premid'

const presence = new Presence({
  clientId: '503557087041683458',
})

interface iframeData {
  paused: boolean
  duration: number
  currentTime: number
}
let video: iframeData | null = null

presence.on('iFrameData', (data: unknown) => {
  video = data as typeof video
})

const timestampCheck: {
  hash: string
  timestamp: number
} = {
  hash: '',
  timestamp: Math.floor(Date.now() / 1000),
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/O/OneTouchTV/assets/logo.png',
    startTimestamp: timestampCheck.timestamp,
    name: 'OneTouchTV',
  }
  const { href, pathname } = document.location
  const hash = href

  if (timestampCheck.hash !== hash) {
    timestampCheck.hash = hash
    timestampCheck.timestamp = Math.floor(Date.now() / 1000)
  }

  switch (true) {
    case pathname === '/': {
      presenceData.details = 'Viewing the homepage'
      break
    }
    case pathname === '/movie': {
      presenceData.details = 'Viewing all movies'
      break
    }
    case pathname === '/tvshow': {
      presenceData.details = 'Viewing all tv shows'
      break
    }
    case pathname === '/live': {
      presenceData.details = 'Viewing all live content'
      break
    }
    case pathname.includes('/search'): {
      const inputEl = document
        .querySelector('body > flt-glass-pane')
        ?.shadowRoot
        ?.querySelectorAll('input')[1]
        ?.value
      presenceData.smallImageKey = Assets.Search
      if (inputEl?.length !== 0) {
        presenceData.details = 'Searching for'
        presenceData.state = inputEl
      }
      else {
        presenceData.details = 'Looking something up'
      }

      break
    }
    case pathname.includes('/actor/'): {
      presenceData.details = 'Viewing actor'
      presenceData.state = document
        .querySelector('title')
        ?.textContent
        ?.replace(/ - OneTouch TV/g, '') ?? ''
      presenceData.buttons = [{ label: 'View Actor', url: href }]
      break
    }
    case pathname.includes('/detail/'): {
      const allElements = document
        .querySelector('body > flt-glass-pane')
        ?.shadowRoot
        ?.querySelectorAll('flt-paragraph')
      let title: string | undefined
      for (const [, element] of (allElements ?? []).entries()) {
        if (element.textContent?.includes(')') && !title)
          title = element.textContent
      }
      if (!title) {
        title = document
          .querySelector('title')
          ?.textContent
          ?.replace(/( - )|(OneTouch TV)/g, '')
      }

      if (title?.includes('Episode')) {
        presenceData.details = title.split('Episode')[0]
        presenceData.state = `Episode${title.split('Episode')[1]}`
      }
      else {
        presenceData.details = title
      }

      if (video) {
        delete presenceData.startTimestamp
        if (!video.paused) {
          [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(video.currentTime, video.duration)
        }
        presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
        presenceData.buttons = [{ label: 'Watch Video', url: href }]
      }
      else {
        presenceData.buttons = [{ label: 'View Content', url: href }]
      }
      break
    }
  }

  presence.setActivity(presenceData)
})
