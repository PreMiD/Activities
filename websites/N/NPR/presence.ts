import {
  ActivityType,
  Assets,
  getTimestamps,
  timestampFromFormat,
} from 'premid'

const presence = new Presence({
  clientId: '503557087041683458',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://i.imgur.com/BdabueB.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const { pathname, hostname, href } = document.location
  const pathList = pathname.split('/').filter(Boolean)
  switch (hostname) {
    case 'text.npr.org': {
      switch (true) {
        case pathname === '/': {
          presenceData.details = 'Browsing home page'
          break
        }
        case /^\d{0,4}$/.test(pathList[0] ?? '') && !pathList[1]: {
          presenceData.details = 'Browsing articles by section'
          presenceData.state = document.querySelector('h1')
          break
        }
        case /^(?:nx|g)-/.test(pathList[0] ?? '') && !pathList[1]:
        case /^\d{0,4}$/.test(pathList[0] ?? '') && !!pathList[3]: {
          presenceData.details = 'Reading an article'
          presenceData.state = document.querySelector('h1')
          presenceData.buttons = [{ label: 'Read Article', url: href }]
          break
        }
        default: {
          presenceData.details = 'Viewing a page'
          presenceData.state = document.querySelector('h1, h3')
          break
        }
      }
      break
    }
    default: {
      const player = document.querySelector('.player-basic')
      if (player) {
        const isPlaying = !!player.classList.contains('is-playing')
        const isLive = !!player.querySelector('.icn-stop')
        const playerTitle = player.querySelector(
          '.audio-program-label, .audio-info .program-text',
        )
        const playerEpisode = player.querySelector(
          '.audio-title, .audio-info .title',
        )
        const timeElapsed = player.querySelector('.time-elapsed')
        const timeTotal = player.querySelector('.time-total')
        ;(presenceData as PresenceData).type = ActivityType.Listening
        presenceData.smallImageKey = isPlaying
          ? isLive
            ? Assets.Live
            : Assets.Play
          : Assets.Pause
        presenceData.smallImageText = playerTitle
          ? `${playerTitle.textContent} - ${playerEpisode?.textContent}`
          : playerEpisode
        if (timeTotal && timeElapsed) {
          [presenceData.startTimestamp, presenceData.endTimestamp]
            = getTimestamps(
              timestampFromFormat(timeElapsed.textContent ?? ''),
              timestampFromFormat(timeTotal.textContent ?? ''),
            )
        }
      }

      switch (pathList[0] ?? '/') {
        case '/': {
          presenceData.details = 'Browsing home page'
          break
        }
        case 'about-npr': {
          presenceData.details = 'Reading about NPR'
          presenceData.state = document.querySelector('h1')
          break
        }
        case 'artists': {
          presenceData.details = 'Browing articles featuring artist'
          presenceData.state = document.querySelector('h1')
          presenceData.buttons = [{ label: 'View Artist', url: href }]
          break
        }
        case 'music': {
          presenceData.details = 'Browsing music'
          break
        }
        case 'people': {
          presenceData.details = 'Browsing articles by author'
          presenceData.state = document.querySelector('h1')
          presenceData.buttons = [{ label: 'View Author', url: href }]
          break
        }
        case 'programs': {
          presenceData.details = 'Viewing a program'
          presenceData.state = document.querySelector('h1')
          presenceData.buttons = [{ label: 'View Program', url: href }]
          break
        }
        case 'podcasts-and-shows': {
          presenceData.details = 'Browsing podcasts and shows'
          break
        }
        case 'search': {
          presenceData.details = 'Searching articles'
          break
        }
        case 'sections': {
          if (Number(pathList[2]) > 0) {
            presenceData.details = 'Reading an article'
            presenceData.state = document.querySelector('h1')
            presenceData.buttons = [{ label: 'Read Article', url: href }]
          }
          else {
            presenceData.details = 'Browsing articles by section'
            presenceData.state = document.querySelector('h1')
          }
          break
        }
        case 'series': {
          presenceData.details = 'Browing articles by series'
          presenceData.state = document.querySelector('h1')
          break
        }
        case 'transcripts': {
          const titleLink = document.querySelector<HTMLAnchorElement>('h1 a')
          presenceData.details = 'Reading a transcript'
          presenceData.state = titleLink?.lastChild
          presenceData.buttons = [
            { label: 'View Transcript', url: href },
            { label: 'View Podcast', url: titleLink },
          ]
          break
        }
        default: {
          if (Number(pathList[0]) > 0) {
            presenceData.details = 'Reading an article'
            presenceData.state = document.querySelector('h1')
            presenceData.buttons = [{ label: 'Read Article', url: href }]
          }
          else {
            presenceData.details = 'Browsing...'
          }
        }
      }
    }
  }

  presence.setActivity(presenceData)
})
