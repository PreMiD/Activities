import { Assets } from 'premid'

const presence = new Presence({
  clientId: '837985880408457217',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

function findElement(tagName: string, className: string) {
  return Array.from(document.querySelectorAll(tagName)).find(x =>
    x.className.includes(className),
  )
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/N/Neon/assets/logo.png',
    details: 'Browsing...',
    startTimestamp: browsingTimestamp,
  }
  const { pathname, search } = document.location

  if (pathname.includes('/series/')) {
    presenceData.details = 'Viewing series:'
    presenceData.state = document.querySelector(
      '[data-lbx-e2e="show-title"]',
    )?.textContent

    presenceData.buttons = [
      {
        label: 'View Series',
        url: document.URL,
      },
    ]
  }
  else if (pathname.includes('/movie/')) {
    presenceData.details = 'Viewing movie:'
    presenceData.state = document.querySelector(
      '[data-lbx-e2e="movie-title"]',
    )?.textContent
    presenceData.buttons = [
      {
        label: 'View Movie',
        url: document.URL,
      },
    ]
  }
  else if (pathname.includes('/trailer/')) {
    const video = document.querySelector('video')!

    presenceData.details = findElement('span', 'Tr-title')?.textContent
    presenceData.state = 'Trailer'

    presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
    presenceData.smallImageText = video.paused ? 'Paused' : 'Playing';

    [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestampsfromMedia(video)

    presenceData.buttons = [
      {
        label: 'Watch Trailer',
        url: document.URL,
      },
    ]

    if (video.paused) {
      delete presenceData.startTimestamp
      delete presenceData.endTimestamp
    }
  }
  else if (pathname.includes('/my-list')) {
    presenceData.details = 'Viewing their list'
  }
  else if (pathname.includes('/my-account')) {
    presenceData.details = 'Viewing their account'
  }
  else if (pathname.includes('/watch/')) {
    const video = document.querySelector('video')!
    const isSeries = !!findElement('span', 'Mr-text')

    presenceData.details = findElement('span', 'Tr-title')?.textContent

    presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
    presenceData.smallImageText = video.paused ? 'Paused' : 'Playing';

    [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestampsfromMedia(video)

    if (isSeries) {
      presenceData.state = `${findElement(
        'span',
        'Mr-text',
      )?.textContent?.replace('.', ':')} ${findElement('h3', 'so-name')
        ?.textContent
        ?.trim()
        .replace(/(\d+)\./, '')}`
    }
    else {
      presenceData.state = 'Movie'
    }

    presenceData.buttons = [
      {
        label: isSeries ? 'Watch Episode' : 'Watch Movie',
        url: document.URL,
      },
    ]

    if (video.paused) {
      delete presenceData.startTimestamp
      delete presenceData.endTimestamp
    }
  }
  else if (search.startsWith('?')) {
    presenceData.details = 'Searching for:'
    presenceData.state = new URLSearchParams(search).get('search')
  }

  if (!(await presence.getSetting<boolean>('buttons')) && presenceData.buttons)
    delete presenceData.buttons
  if (!(await presence.getSetting<boolean>('timestamp'))) {
    delete presenceData.startTimestamp
    delete presenceData.endTimestamp
  }

  presence.setActivity(presenceData)
})
