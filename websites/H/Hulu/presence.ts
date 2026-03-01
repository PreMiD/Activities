import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '607719679011848220',
})
const strings = presence.getStrings({
  play: 'general.playing',
  pause: 'general.paused',
  live: 'general.live',
  search: 'general.searchFor',
  viewMovie: 'general.viewMovie',
  viewCategory: 'general.viewCategory',
  viewGenre: 'general.viewGenre',
  viewSeries: 'general.viewSeries',
  watchingLive: 'general.watchingLive',
  watching: 'general.watching',
  browsing: 'general.browsing',
  viewNetwork: 'Hulu.viewNetwork',
  viewSportEpisode: 'Hulu.viewSportEpisode',
  viewSportTeam: 'Hulu.viewSportTeam',
  viewMyStuff: 'Hulu.viewMyStuff',
  viewMyDVR: 'Hulu.viewMyDVR',
  onHulu: 'Hulu.onHulu',
  viewWatchHistory: 'Hulu.viewWatchHistory',
  buttonViewEpisode: 'general.buttonViewEpisode',
})

function capitalize(text: string): string {
  text = text.toLowerCase()
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function parseTimeString(timeStr: string): number {
  return timeStr
    .split(':')
    .map(Number)
    .reverse()
    .reduce((total, value, index) => total + value * 60 ** index, 0)
}

let oldUrl: string, header, title, item

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/H/Hulu/assets/logo.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: Math.floor(Date.now() / 1000),
    type: ActivityType.Watching,
  }

  const { href, pathname: path } = window.location
  if (href !== oldUrl)
    oldUrl = href

  presenceData.details = (await strings).browsing

  switch (true) {
    case path.includes('/hub'):
      header = document.querySelector('.NavBar__item--selected')
      title = document.querySelector('.SimpleModalNav__title')
      presenceData.details = (await strings).viewCategory
      if (header)
        presenceData.state = header.textContent
      else if (title)
        presenceData.state = title.textContent
      break
    case path.includes('/genre'):
      header = document.querySelector('.SimpleModalNav__title')
      presenceData.details = (await strings).viewGenre
      if (header) {
        presenceData.state = header.textContent
      }
      break
    case path.includes('/series'):
      title = document.querySelector('.SimpleModalNav__title')
      item = document.querySelector('.Subnav__item.active')
      presenceData.details = (await strings).viewSeries
      if (title && item)
        presenceData.state = `${title.textContent}: ${item.textContent}`
      else if (title && !item)
        presenceData.state = title.textContent
      break
    case path.includes('/movie'):
      title = document.querySelector('.SimpleModalNav__title')
      item = document.querySelector('.Subnav__item.active')
      presenceData.details = (await strings).viewMovie
      if (title && item)
        presenceData.state = `${title.textContent}: ${item.textContent}`
      else if (title && !item)
        presenceData.state = title.textContent
      break
    case path.includes('/network'): {
      const brand = (document.querySelector('.SimpleModalNav__brandImage')
        ?? document.querySelector('.SimpleModalNav__title')) as HTMLImageElement | null
      item = document.querySelector('.Subnav__item.active')
      presenceData.details = (await strings).viewNetwork
      if (brand && item)
        presenceData.state = `${brand.alt}: ${item.textContent}`
      else if (brand && !item)
        presenceData.state = brand.alt
      break
    }
    case path.includes('/sports_episode'):
      title = document.querySelector('.SimpleModalNav__title')
      item = document.querySelector('.Subnav__item.active')
      presenceData.details = (await strings).viewSportEpisode
      if (title && item)
        presenceData.state = `${title.textContent}: ${item.textContent}`
      else if (title && !item)
        presenceData.state = title.textContent
      break
    case path.includes('/sports_team'):
      title = document.querySelector('.SimpleModalNav__title')
      item = document.querySelector('.Subnav__item.active')
      presenceData.details = (await strings).viewSportTeam
      if (title && item)
        presenceData.state = `${title.textContent}: ${item.textContent}`
      else if (title && !item)
        presenceData.state = title.textContent
      break
    case path.includes('/search'): {
      const input = document.querySelector<HTMLInputElement>('.cu-search-input')
      presenceData.details = (await strings).search
      presenceData.smallImageKey = Assets.Search
      presenceData.smallImageText = (await strings).search
      if (input && input.value.length > 0)
        presenceData.state = input.value
      break
    }
    case path.includes('/live'): {
      const category = document.querySelector(
        '[class*="LiveGuideFilters_LiveGuideFilterItemSelected__"]',
      )
      title = document.querySelector('.LiveGuideProgram--is-playing div.LiveGuideProgram__title')
      presenceData.details = (await strings).watchingLive
      if (category && title)
        presenceData.state = `${capitalize(category.textContent!)} (${title.textContent})`
      else if (category && !title)
        presenceData.state = capitalize(category.textContent!)
      break
    }
    case path.includes('/my-stuff'):
      presenceData.details = (await strings).viewMyStuff
      break
    case path.includes('/manage-dvr'):
      item = document.querySelector('.Subnav__item.active')
      presenceData.details = (await strings).viewMyDVR
      if (item)
        presenceData.state = capitalize(item.textContent!)
      break
    case path.includes('/watch'): {
      const videoEl = document.querySelector('video#content-video-player')
      if (videoEl) {
        const title = document.querySelector(
          '#web-player-app div.PlayerMetadata__titleText',
        )
        const content = document.querySelector(
          '#web-player-app div.PlayerMetadata__subTitle',
        )

        const currentTimeEl = document.querySelector(
          '.Timeline__currentTimestamp',
        )
        const sliderEl = document.querySelector(
          '.Timeline__slider[role="slider"]',
        )
        const playButton = document.querySelector(
          '[data-testid="playButton"].PlayButton',
        )
        const liveIndicator = document.querySelector(
          '.BottomUiControls__playbackControls div[aria-label*="LIVE"]',
        )
        const isPaused = !!playButton
        const live = !!liveIndicator

        const currentSeconds = currentTimeEl
          ? parseTimeString(currentTimeEl.textContent!)
          : 0
        const durationSeconds = sliderEl
          ? Number(sliderEl.getAttribute('aria-valuemax'))
          : 0

        presenceData.details = (await strings).watching
        if (title) {
          presenceData.details = (await strings).onHulu
          presenceData.name = title?.textContent as string | undefined
        }

        if (content?.textContent && content.textContent.length > 0)
          presenceData.state = content.textContent

        presenceData.smallImageKey = live
          ? Assets.Live
          : isPaused
            ? Assets.Pause
            : Assets.Play
        presenceData.smallImageText = live
          ? (await strings).live
          : isPaused
            ? (await strings).pause
            : (await strings).play
        if (live) {
          presenceData.startTimestamp = Math.floor(Date.now() / 1000)
          presenceData.endTimestamp = null
        }
        else if (!isPaused && durationSeconds > 0) {
          const timestamps = getTimestamps(currentSeconds, durationSeconds)
          ;[presenceData.startTimestamp, presenceData.endTimestamp] = timestamps
        }
        else {
          presenceData.startTimestamp = null
          presenceData.endTimestamp = null
        }
        const seasonAndEpisode = content?.textContent?.match(/S(\d+) E(\d+)-/)
        if (seasonAndEpisode && seasonAndEpisode?.length > 2) {
          presenceData.largeImageText = `Season ${seasonAndEpisode[1]}, Episode ${seasonAndEpisode[2]}`
          presenceData.state = content?.textContent
            ?.replace(/^S\d+\s*E\d+[-–]\s*/i, '')
            .replace(/\s*[•|].*$/, '')
            .trim() as string
          presenceData.buttons = [
            {
              label: (await strings).buttonViewEpisode,
              url: href,
            },
          ]
        }
      }
      else {
        presenceData.details = (await strings).viewWatchHistory
      }
      break
    }
  }

  presence.setActivity(
    presenceData,
  )
})
