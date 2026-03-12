import { Assets } from 'premid'

const presence = new Presence({
  clientId: '872712888375193680',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/R/Red%20Bull/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const { pathname, href } = document.location
  const buttons = await presence.getSetting<boolean>('buttons')
  const heading = document.querySelector<HTMLHeadingElement>('.content-hub-hero__title')
    || document.querySelector<HTMLHeadingElement>('h1.collection-hero__title')
  const splitPath = pathname.split('/')
  const search = document.querySelector<HTMLInputElement>(
    'input.search-header__search-input',
  )

  if (search) {
    presenceData.details = `Searching for ${search.value}`
  }
  else if (pathname.includes('discover')) {
    presenceData.details = 'Discovering videos'
  }
  else if (heading) {
    presenceData.details = `Looking for ${heading.textContent}`
  }
  else if (pathname.includes('energydrink')) {
    presenceData.details = 'Looking at product info'
    const heading = document.querySelector<HTMLHeadingElement>('h1')
      || document.querySelector<HTMLHeadingElement>('h2')
    if (heading)
      presenceData.state = heading.textContent
  }
  else if (splitPath.length === 3 && splitPath[2] !== '') {
    const title = document.querySelector<HTMLHeadingElement>(
      '.unified-story-hero__title',
    ) || document.querySelector<HTMLHeadingElement>('.story-hero__title')
    if (title) {
      const video = document.querySelector('video')
      if (video) {
        [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestampsfromMedia(video)
        presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
        presenceData.details = 'Watching'
        presenceData.state = title.textContent
      }
      else {
        presenceData.details = 'Looking at article'
        presenceData.state = title.textContent
      }
    }
    if (buttons) {
      presenceData.buttons = [
        {
          label: 'View Article',
          url: href,
        },
      ]
    }
  }
  else if (splitPath.length === 3) {
    presenceData.details = 'At homepage'
  }
  else if (pathname.includes('events')) {
    const title = document.querySelector<HTMLHeadingElement>(
      '.event-hero__series-and-title__title',
    )
    if (title) {
      presenceData.details = 'Looking at event'
      presenceData.state = title.textContent
    }
    if (buttons) {
      presenceData.buttons = [
        {
          label: 'View Event',
          url: href,
        },
      ]
    }
  }
  else if (pathname.includes('athlete')) {
    const name = document.querySelector<HTMLHeadingElement>('.person-hero__name')
    if (name) {
      presenceData.details = 'Looking at Athlete'
      presenceData.state = name.textContent
    }
    if (buttons) {
      presenceData.buttons = [
        {
          label: 'View Athlete',
          url: href,
        },
      ]
    }
  }
  else if (
    pathname.includes('films')
    || pathname.includes('videos')
    || pathname.includes('channels')
    || pathname.includes('live')
  ) {
    const container = document.querySelector('.rbPlyr-container')
    const video = container ? container.querySelector('video') : null
    const heading = document.querySelector<HTMLHeadingElement>('h1.tv-hero__title')
      || document.querySelector<HTMLHeadingElement>('h2.rbPlyr-headline')
    const subheading = document.querySelector<HTMLHeadingElement>('h2.tv-hero__subheading')
      || document.querySelector<HTMLDivElement>('div.rbPlyr-subheadline')
    const live = pathname.includes('channels')

    if (heading)
      presenceData.details = `Watching ${heading.textContent}`
    if (subheading)
      presenceData.state = subheading.textContent

    if (video) {
      if (!live) {
        [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestampsfromMedia(video)
      }
      presenceData.smallImageText = presenceData.smallImageKey = live
        ? Assets.Live
        : video.paused
          ? Assets.Pause
          : Assets.Play
    }

    if (buttons) {
      presenceData.buttons = [
        {
          label: 'Watch Video',
          url: href,
        },
      ]
    }
  }

  if (!presenceData.details) {
    /* Sometimes some elements don't load but video works, the site is weird */
    presenceData.details = document.title
  }

  presence.setActivity(presenceData)
})
