import { Assets } from 'premid'

const presence = new Presence({
  clientId: '607719679011848220',
})
const strings = presence.getStrings({
  play: 'general.playing',
  pause: 'general.paused',
  live: 'general.live',
  search: 'general.searching',
})

function capitalize(text: string): string {
  text = text.toLowerCase()
  return text.charAt(0).toUpperCase() + text.slice(1)
}

let elapsed: number, oldUrl: string, header, title, item

presence.on('UpdateData', async () => {
  let video: HTMLVideoElement | null = null
  let details
  let state
  let smallImageKey
  let smallImageText
  let startTimestamp
  let endTimestamp

  const { href, pathname: path } = window.location
  if (href !== oldUrl) {
    oldUrl = href
    elapsed = Math.floor(Date.now() / 1000)
  }

  details = 'Browsing'
  startTimestamp = elapsed

  if (path.includes('/hub')) {
    header = document.querySelector('.Hub__title')
    title = document.querySelector('.SimpleModalNav__title')
    details = 'Viewing Category'
    if (header) {
      state = header.textContent
      if (title)
        state = `${state} (${title.textContent})`
    }
  }
  else if (path.includes('/genre')) {
    header = document.querySelector('.Hub__title')
    title = document.querySelector('.SimpleModalNav__title')
    details = 'Viewing Genre'
    if (header) {
      state = header.textContent
      if (title)
        state = `${state} (${title.textContent})`
    }
  }
  else if (path.includes('/series')) {
    title = document.querySelector('.Masthead__title')
    item = document.querySelector('.Subnav__item.active')
    details = 'Viewing Series'
    if (title) {
      state = title.textContent
      if (item)
        state = `${state}'s ${item.textContent}`
    }
  }
  else if (path.includes('/movie')) {
    title = document.querySelector('.Masthead__title')
    item = document.querySelector('.Subnav__item.active')
    details = 'Viewing Movie'
    if (title) {
      state = title.textContent
      if (item)
        state = `${state}'s ${item.textContent}`
    }
  }
  else if (path.includes('/network')) {
    const brand = document.querySelector<HTMLImageElement>(
      '.SimpleModalNav__brandImage',
    )
    item = document.querySelector('.Subnav__item.active')
    details = 'Viewing Network'
    if (brand) {
      state = brand.alt
      if (item)
        state = `${state}'s ${item.textContent}`
    }
  }
  else if (path.includes('/sports_episode')) {
    title = document.querySelector('.Masthead__title')
    item = document.querySelector('.Subnav__item.active')
    details = 'Viewing Sports Episode'
    if (title) {
      state = title.textContent
      if (item)
        state = `${state}'s ${item.textContent}`
    }
  }
  else if (path.includes('/sports_team')) {
    title = document.querySelector('.Masthead__title')
    item = document.querySelector('.Subnav__item.active')
    details = 'Viewing Sports Team'
    if (title) {
      state = title.textContent
      if (item)
        state = `${state}'s ${item.textContent}`
    }
  }
  else if (path.includes('/search')) {
    const input = document.querySelector<HTMLInputElement>('.cu-search-input')
    details = 'Searching'
    smallImageKey = Assets.Search
    smallImageText = (await strings).search
    if (input && input.value.length > 0)
      state = input.value
  }
  else if (path.includes('/live')) {
    const category = document.querySelector(
      '.LiveGuide__filter-item--selected',
    )
    title = document.querySelector('.ModalHeader__showname')
    details = 'Viewing Live'
    if (category) {
      state = capitalize(category.textContent!)
      if (title)
        state = `${state} (${title.textContent})`
    }
  }
  else if (path.includes('/my-stuff')) {
    details = 'Viewing My Stuff'
  }
  else if (path.includes('/manage-dvr')) {
    item = document.querySelector('.Subnav__item.active')
    details = 'Viewing My DVR'
    if (item)
      state = capitalize(item.textContent!)
  }
  else if (path.includes('/watch')) {
    video = document.querySelector('.content-video-player')
    if (video) {
      title = document.querySelector('.metadata-area__second-line')
      const content = document.querySelector('.metadata-area__third-line')
      const timestamps = presence.getTimestamps(
        Math.floor(video.currentTime),
        Math.floor(video.duration),
      )
      const live = timestamps[1] === Infinity
      details = 'Watching'
      if (title)
        details = title.textContent

      if (content?.textContent && content.textContent.length > 0)
        state = content.textContent

      smallImageKey = live
        ? Assets.Live
        : video.paused
          ? Assets.Pause
          : Assets.Play
      smallImageText = live
        ? (await strings).live
        : video.paused
          ? (await strings).pause
          : (await strings).play
      if (!video.paused) {
        if (!live)
          [startTimestamp, endTimestamp] = timestamps
        else startTimestamp = elapsed
      }
    }
    else {
      video = document.querySelector('video#content-video-player')
      details = 'Viewing Watch History'
      if (video) {
        title = document.querySelector(
          '#web-player-app div.PlayerMetadata__titleText',
        )
        const content = document.querySelector(
          '#web-player-app div.PlayerMetadata__subTitle',
        )
        const timestamps = presence.getTimestamps(
          Math.floor(video.currentTime),
          Math.floor(video.duration),
        )
        const live = timestamps[1] === Infinity
        details = 'Watching'
        if (title)
          details = title.textContent

        if (content?.textContent && content.textContent.length > 0)
          state = content.textContent

        smallImageKey = live
          ? Assets.Live
          : video.paused
            ? Assets.Pause
            : Assets.Play
        smallImageText = live
          ? (await strings).live
          : video.paused
            ? (await strings).pause
            : (await strings).play
        if (!video.paused) {
          if (!live)
            [startTimestamp, endTimestamp] = timestamps
          else startTimestamp = elapsed
        }
      }
    }
  }

  presence.setActivity(
    {
      details,
      state,
      largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/H/Hulu/assets/logo.png',
      smallImageKey,
      smallImageText,
      startTimestamp,
      endTimestamp,
    },
    video ? !video.paused : true,
  )
})
