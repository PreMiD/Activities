import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1549514873711501364',
})

enum ActivityAssets {
  Logo = 'https://i.ibb.co/cG1v62y/6aaaf2912fe1c2-59830015-Processed.png',
}

let browsingTimestamp = Math.floor(Date.now() / 1000)
let wasWatching = false

interface IFrameData {
  video?: {
    paused: boolean
    ended: boolean
    readyState: number
    currentTime: number
    duration: number
  }
}
let iFrameData: IFrameData = {}
presence.on('iFrameData', (data: IFrameData) => {
  iFrameData = data
})

const SELECTORS = {
  homeTeam: '.team-home .team-name, .home-team .name',
  awayTeam: '.team-away .team-name, .away-team .name',
  score: '.match-score, .score',
  matchStatus: '.match-status, .live-badge',
}

function text(selector: string): string | null {
  return document.querySelector<HTMLElement>(selector)?.textContent?.trim() || null
}

function getMatchId(): string | null {
  return new URLSearchParams(document.location.search).get('match')
}

async function getStrings() {
  return presence.getStrings({
    live: 'general.live',
    paused: 'general.paused',
    browsing: 'general.browsing',
  })
}

function cleanTitle(title: string): string {
  const BRANDING = /si+r\s*tv|yas+ir\s*tv|سير|ياسر/i

  const parts = title
    .split(/\s*[|\u2013\u2014\u00BB\u00AB]\s*/)
    .map(part => part.trim())
    .filter(part => part && !BRANDING.test(part))

  if (!parts.length)
    return title.trim()

  return parts.reduce((a, b) => (b.length > a.length ? b : a))
}

function parseMinuteFromTitle(title: string): string | null {
  const match = title.match(/(\d{1,3}(?:\+\d{1,2})?)['\u2019\u02BC]/)
  return match ? `${match[1]}'` : null
}

presence.on('UpdateData', async () => {
  const strings = await getStrings()

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    type: ActivityType.Watching,
  }

  const matchId = getMatchId()
  const host = document.location.hostname
  const onFaborList = host === 'fabor.tv' || host === 'fabor-tv.to'
  const onMatchPage = (document.location.pathname.includes('/hard/') && matchId) || onFaborList
  if (onMatchPage) {
    const home = text(SELECTORS.homeTeam)
    const away = text(SELECTORS.awayTeam)
    const score = text(SELECTORS.score)
    const status = text(SELECTORS.matchStatus)
    const video = iFrameData.video

    if (onFaborList) {
      presenceData.details = 'Browsing...'
      presenceData.state = 'Looking for a Match'
      presenceData.largeImageKey = ActivityAssets.Logo
      presence.setActivity(presenceData)
      return
    }

    if (home && away) {
      presenceData.details = score ? `${home} ${score} ${away}` : `${home} vs ${away}`
    }
    else {
      presenceData.details = document.title
        ? cleanTitle(document.title)
        : `Match #${matchId}`
    }

    const minute = parseMinuteFromTitle(document.title)
    presenceData.state = minute || status || strings.live

    if (video) {
      const isBuffering = video.readyState < 3
      const isPlaying = !video.paused && !video.ended

      if (isPlaying && !isBuffering) {
        presenceData.smallImageKey = Assets.Live
        presenceData.smallImageText = strings.live
      }
      else if (!isPlaying) {
        presenceData.smallImageKey = Assets.Pause
        presenceData.smallImageText = strings.paused
      }
      else {
        presenceData.state = 'Loading…'
      }
    }
    wasWatching = true
  }
  else {
    if (wasWatching) {
      browsingTimestamp = Math.floor(Date.now() / 1000)
      wasWatching = false
    }
  }

  presence.setActivity(presenceData)
})
