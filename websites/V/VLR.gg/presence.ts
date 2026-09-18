import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '1534332534660268115',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/V/VLR.gg/assets/logo.png',
}

// vlr.gg is a plain server-rendered site (confirmed live, not just from saved
// captures) - matches and news articles both live at the same `/{id}/{slug}`
// URL shape, distinguished only by which header block is on the page.
const STATIC_LABELS: Record<string, string> = {
  matches: 'Browsing Matches',
  rankings: 'Browsing Rankings',
  stats: 'Browsing Stats',
  news: 'Browsing News',
  forums: 'Browsing Forums',
  events: 'Browsing Events',
  threads: 'Browsing Forums',
}

function getText(selector: string): string | undefined {
  return document.querySelector(selector)?.textContent?.replace(/\s+/g, ' ').trim() || undefined
}

// Event pages show a label/value grid (Dates, Prize, Region) with no class
// tying a value to its label besides sibling position, so match on the
// label text itself rather than assuming a fixed order.
function getEventMetaValue(label: string): string | undefined {
  for (const item of document.querySelectorAll('.event-header-main-meta > div')) {
    if (item.querySelector('.label')?.textContent?.trim() === label)
      return item.querySelector('.value')?.textContent?.replace(/\s+/g, ' ').trim() || undefined
  }
  return undefined
}

presence.on('UpdateData', async () => {
  try {
    await updateActivity()
  }
  catch (e) {
    presence.error(`VLR.gg activity failed: ${e}`)
    presence.setActivity({
      largeImageKey: ActivityAssets.Logo,
      startTimestamp: browsingTimestamp,
      details: 'Browsing...',
    })
  }
})

async function updateActivity(): Promise<void> {
  const [privacy, showBrowsingStatus, showScore, showCover, showSmallImage, showButtons] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('showBrowsingStatus'),
    presence.getSetting<boolean>('showScore'),
    presence.getSetting<boolean>('showCover'),
    presence.getSetting<boolean>('showSmallImage'),
    presence.getSetting<boolean>('showButtons'),
  ])

  const [firstSegment] = document.location.pathname.split('/').filter(Boolean)
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    details: 'Browsing...',
  }

  // Matches, articles, and forum threads (including Pick'em posts) all share
  // this same `/{id}/{slug}` URL shape, told apart only by which header
  // block is on the page.
  const isIdSlugPage = !!firstSegment && /^\d+$/.test(firstSegment)
  let hasSpecificContent = false

  if (firstSegment === 'event') {
    hasSpecificContent = true

    // The Pick'em bracket page reuses the exact same .event-header markup as
    // the plain event overview, with nothing in the header itself to tell
    // them apart - only the URL (`/event/pickem/...`) does.
    const isPickem = document.location.pathname.split('/').filter(Boolean)[1] === 'pickem'

    const eventName = getText('h1.event-header-main-title')
    const dates = getEventMetaValue('Dates')
    const prize = getEventMetaValue('Prize')
    const eventLogo = document.querySelector<HTMLImageElement>('.event-header-thumb img')?.src

    presenceData.details = privacy
      ? (isPickem ? 'Viewing a Pick\'em bracket' : 'Viewing an event')
      : (eventName ? `${isPickem ? 'Pick\'em: ' : ''}${eventName}` : 'Viewing an event')

    if (!privacy) {
      const stateParts = [dates, prize].filter(Boolean)
      if (stateParts.length > 0)
        presenceData.state = stateParts.join(' • ')
    }

    if (!privacy && showCover && eventLogo)
      presenceData.largeImageKey = eventLogo

    if (showSmallImage) {
      presenceData.smallImageKey = Assets.Viewing
      presenceData.smallImageText = isPickem ? 'Pick\'em' : 'Event'
    }

    delete presenceData.startTimestamp

    if (showButtons && !privacy) {
      presenceData.buttons = [
        {
          label: isPickem ? 'View Pick\'em' : 'View Event',
          url: document.location.href,
        },
      ]
    }
  }
  else if (firstSegment === 'team') {
    hasSpecificContent = true

    const teamName = getText('.team-header-name h1.wf-title')
    const country = getText('.team-header-country')
    const teamLogo = document.querySelector<HTMLImageElement>('.team-header-logo img')?.src

    presenceData.details = privacy ? 'Viewing a team' : (teamName || 'Viewing a team')

    if (!privacy && country)
      presenceData.state = country

    if (!privacy && showCover && teamLogo)
      presenceData.largeImageKey = teamLogo

    if (showSmallImage) {
      presenceData.smallImageKey = Assets.Viewing
      presenceData.smallImageText = 'Team'
    }

    delete presenceData.startTimestamp

    if (showButtons && !privacy) {
      presenceData.buttons = [
        {
          label: 'View Team',
          url: document.location.href,
        },
      ]
    }
  }
  else if (firstSegment === 'pickem') {
    hasSpecificContent = true

    const eventName = getText('h1.wf-title a')
    const author = getText('a[href^="/user/"]')

    presenceData.details = privacy ? 'Viewing a Pick\'em' : (eventName ? `Pick'em: ${eventName}` : 'Viewing a Pick\'em')

    if (!privacy && author)
      presenceData.state = `by ${author}`

    if (showSmallImage) {
      presenceData.smallImageKey = Assets.Viewing
      presenceData.smallImageText = 'Pick\'em'
    }

    delete presenceData.startTimestamp

    if (showButtons && !privacy) {
      presenceData.buttons = [
        {
          label: 'View Pick\'em',
          url: document.location.href,
        },
      ]
    }
  }
  else if (firstSegment === 'player') {
    hasSpecificContent = true

    const playerName = getText('.player-header h1.wf-title')
    const realName = getText('.player-header h2.player-real-name')
    const country = document.querySelector('.player-header i.flag')?.parentElement?.textContent?.replace(/\s+/g, ' ').trim()
    const photo = document.querySelector<HTMLImageElement>('.player-header .wf-avatar img')?.src

    presenceData.details = privacy ? 'Viewing a player' : (playerName || 'Viewing a player')

    if (!privacy) {
      const stateParts = [realName, country].filter(Boolean)
      if (stateParts.length > 0)
        presenceData.state = stateParts.join(' • ')
    }

    if (!privacy && showCover && photo)
      presenceData.largeImageKey = photo

    if (showSmallImage) {
      presenceData.smallImageKey = Assets.Viewing
      presenceData.smallImageText = 'Player'
    }

    delete presenceData.startTimestamp

    if (showButtons && !privacy) {
      presenceData.buttons = [
        {
          label: 'View Player',
          url: document.location.href,
        },
      ]
    }
  }
  else if (isIdSlugPage && document.querySelector('.match-header')) {
    hasSpecificContent = true
    const team1 = getText('.match-header-link.mod-1 .match-header-link-name .wf-title-med')
    const team2 = getText('.match-header-link.mod-2 .match-header-link-name .wf-title-med')
    const eventName = getText('.match-header-event > div > div:first-child')
    const eventLogo = document.querySelector<HTMLImageElement>('.match-header-event img')?.src
    // The live/upcoming indicator is a <span> that re-uses the same
    // "match-header-vs-note" class as its own wrapping <div>, so the format
    // note (Bo3/Bo5) isn't reliably at a fixed index - it's always the last
    // one, whether there are 2 notes (finished) or 3 (live/upcoming, thanks
    // to that extra nested span).
    const notes = document.querySelectorAll('.match-header-vs-note')
    const stateNote = notes[0]
    const format = notes[notes.length - 1]?.textContent?.replace(/\s+/g, ' ').trim()

    const isLive = !!stateNote?.querySelector('.mod-live')
    const isUpcoming = !!stateNote?.querySelector('.mod-upcoming')
    const countdown = stateNote?.querySelector('.mod-upcoming')?.textContent?.trim()

    const scoreSpans = [...document.querySelectorAll('.match-header-vs-score .sp-hide span:not(.match-header-vs-score-colon)')]
    const score1 = scoreSpans[0]?.textContent?.trim()
    const score2 = scoreSpans[1]?.textContent?.trim()

    const matchup = team1 && team2 ? `${team1} vs ${team2}` : 'a Valorant match'

    if (isLive)
      (presenceData as PresenceData).type = ActivityType.Watching

    presenceData.details = privacy
      ? `${isLive ? 'Watching' : 'Viewing'} a Valorant match`
      : matchup

    if (!privacy) {
      const stateParts: string[] = []
      if (isLive) {
        if (showScore && score1 && score2)
          stateParts.push(`${score1}-${score2}`)
      }
      else if (isUpcoming) {
        if (countdown)
          stateParts.push(countdown)
      }
      else {
        if (showScore && score1 && score2)
          stateParts.push(`${score1}-${score2} (Final)`)
      }
      if (format)
        stateParts.push(format)
      if (eventName)
        stateParts.push(eventName)
      if (stateParts.length > 0)
        presenceData.state = stateParts.join(' • ')
    }

    if (!privacy && showCover && eventLogo)
      presenceData.largeImageKey = eventLogo

    if (showSmallImage) {
      if (isLive) {
        presenceData.smallImageKey = Assets.Live
        presenceData.smallImageText = 'Live'
      }
      else if (isUpcoming) {
        presenceData.smallImageKey = Assets.Premiere
        presenceData.smallImageText = 'Upcoming'
      }
      else {
        presenceData.smallImageKey = Assets.Viewing
        presenceData.smallImageText = 'Final'
      }
    }

    // VLR only exposes the *scheduled* kickoff time, not when the match
    // actually went live - esports matches routinely start late, so using
    // the schedule as an elapsed-time anchor would show a wrong duration
    // whenever a match starts behind schedule. No reliable data, no timestamp.
    delete presenceData.startTimestamp

    if (showButtons && !privacy) {
      presenceData.buttons = [
        {
          label: 'View Match',
          url: document.location.href,
        },
      ]
    }
  }
  else if (isIdSlugPage && document.querySelector('.article-header')) {
    hasSpecificContent = true
    const headline = getText('h1.wf-title.mod-article-title')
    const eventName = getText('.article-header-event')
    const author = getText('.article-meta-author')

    presenceData.details = privacy ? 'Reading VLR.gg news' : (headline || 'Reading an article')

    if (!privacy) {
      const state = eventName || author
      if (state)
        presenceData.state = state
    }

    if (showSmallImage) {
      presenceData.smallImageKey = Assets.Reading
      presenceData.smallImageText = 'Reading'
    }

    delete presenceData.startTimestamp

    if (showButtons && !privacy) {
      presenceData.buttons = [
        {
          label: 'Read Article',
          url: document.location.href,
        },
      ]
    }
  }
  else if (isIdSlugPage && document.querySelector('.thread-header')) {
    hasSpecificContent = true
    const title = getText('.thread-header-title h1')
    const category = getText('.thread-header-desc a')

    presenceData.details = privacy ? 'Reading a forum thread' : (title || 'Reading a forum thread')

    if (!privacy && category)
      presenceData.state = category

    if (showSmallImage) {
      presenceData.smallImageKey = Assets.Reading
      presenceData.smallImageText = 'Forum Thread'
    }

    delete presenceData.startTimestamp

    if (showButtons && !privacy) {
      presenceData.buttons = [
        {
          label: 'View Thread',
          url: document.location.href,
        },
      ]
    }
  }

  if (!hasSpecificContent) {
    const staticLabel = firstSegment ? STATIC_LABELS[firstSegment] : undefined
    if (staticLabel)
      presenceData.details = staticLabel

    if (!showBrowsingStatus)
      return presence.clearActivity()
  }

  presence.setActivity(presenceData)
}
