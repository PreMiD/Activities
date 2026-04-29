import { ActivityType, Assets } from 'premid'
import { stringMap } from './i18n.js'

const presence = new Presence({
  clientId: '1498679440325083167',
})

enum ActivityAssets {
  FaceIt = 'https://i.imgur.com/n5ielUx.png',
  CounterStrike = 'https://i.imgur.com/DKS55vg.png',
  LevelUnranked = 'https://i.imgur.com/SbC23rK.jpeg', // Have to find this one yet
  LevelOne = 'https://i.imgur.com/1YNbcYo.jpeg',
  LevelTwo = 'https://i.imgur.com/3HZsPEd.jpeg',
  LevelThree = 'https://i.imgur.com/ywFpaEq.jpeg',
  LevelFour = 'https://i.imgur.com/yyfIjLa.jpeg',
  LevelFive = 'https://i.imgur.com/rF0Pfyz.jpeg',
  LevelSix = 'https://i.imgur.com/p7Nrv7o.jpeg',
  LevelSeven = 'https://i.imgur.com/ZiAAqWh.jpeg',
  LevelEight = 'https://i.imgur.com/ZjFZ9ME.jpeg',
  LevelNine = 'https://i.imgur.com/s9AtaVp.jpeg',
  LevelTen = 'https://i.imgur.com/iClJnOT.jpeg',
  LevelEleven = 'https://i.imgur.com/poEjdMY.jpeg',
}

function getLevelAsset(level: string): string | null {
  switch (level) {
    case '1': return ActivityAssets.LevelOne
    case '2': return ActivityAssets.LevelTwo
    case '3': return ActivityAssets.LevelThree
    case '4': return ActivityAssets.LevelFour
    case '5': return ActivityAssets.LevelFive
    case '6': return ActivityAssets.LevelSix
    case '7': return ActivityAssets.LevelSeven
    case '8': return ActivityAssets.LevelEight
    case '9': return ActivityAssets.LevelNine
    case '10': return ActivityAssets.LevelTen
    case '11': return ActivityAssets.LevelEleven
    case 'unranked': return ActivityAssets.LevelUnranked
    default: return null
  }
}

function getElapsedSeconds(timeStr?: string | null): number {
  const parts = timeStr?.split(':').map(Number)
  if (!parts || parts.some(val => Number.isNaN(val))) {
    return 0
  }
  const [s = 0, m = 0, h = 0] = [...parts].reverse()
  return h * 3600 + m * 60 + s
}

// Whether the given (user) element is the logged in user.
// FACEIT marks the logged in user with an orange color in
// the match overview page.
const SELF_USER_ORANGE = 'rgb(255, 85, 0)'
function isSelfUser(el: Element): boolean {
  const color = window.getComputedStyle(el).color
  return color === SELF_USER_ORANGE
}

// If the user is part of the match, we extract their team and
// rank to display in the presence.
function getSelfUser(): { team: 1 | 2 | null, levelAsset: string | null, elo: number } {
  const matchAreas = document.querySelectorAll('[name="roster1"], [name="roster2"], table')
  for (const area of matchAreas) {
    const nicks = area.querySelectorAll('[class*="Nickname__Name"]')
    for (const nick of nicks) {
      if (isSelfUser(nick)) {
        const isT1 = area.getAttribute('name') === 'roster1' || area === document.querySelectorAll('table')[0]
        const container = nick.closest('[class*="styles__Holder"], [class*="RosterItem"], tr')
        const skillSvg = container?.querySelector('svg[class*="SkillIcon"]')
        let titleText = ''

        if (skillSvg) {
          titleText = skillSvg.querySelector('title')?.textContent?.toLowerCase() || ''
          if (!titleText) {
            titleText = skillSvg.getAttribute('aria-label')?.toLowerCase() || ''
          }
        }

        let levelKey = 'unranked'
        const levelMatch = titleText.match(/\d+/)
        if (levelMatch) {
          levelKey = levelMatch[0]
        }

        const eloElement = container?.querySelector('[class*="Subtitle__Holder"], [class*="LevelAndElo"], [class*="SkillLevel__Elo"]')
        const eloText = eloElement?.textContent || ''
        const elo = Number(eloText.replace(/\D/g, '')) || 0

        return {
          team: (isT1 ? 1 : 2) as 1 | 2,
          levelAsset: getLevelAsset(levelKey),
          elo,
        }
      }
    }
  }
  return { team: null, levelAsset: null, elo: 0 }
}

const browsingTimestamp = Math.floor(Date.now() / 1000)
presence.on('UpdateData', async () => {
  const strings = await presence.getStrings(stringMap)

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.FaceIt,
    startTimestamp: browsingTimestamp,
  }

  const showBrowsing = await presence.getSetting<boolean>('browsing')
  if (showBrowsing) {
    presenceData.details = strings.browsingHome
  }

  const { pathname: rawPath } = document.location
  const pathname = rawPath.replace(/^\/[a-z]{2}(?:-[A-Z]{2})?\//, '/') // Remove locale from path

  // Hide all browsing states if disabled
  if (showBrowsing) {
    if (pathname.startsWith('/parties')) {
      presenceData.details = strings.browsingParties
    }
    else if (pathname.startsWith('/cs2/rank')) {
      presenceData.details = strings.browsingRank
    }
    else if (pathname.startsWith('/track')) {
      presenceData.details = strings.browsingTrack
    }
    else if (pathname.startsWith('/social-feed')) {
      presenceData.details = strings.browsingFeed
    }
    else if (pathname.startsWith('/clubs')) {
      presenceData.details = strings.browsingClubs
    }
    else if (pathname.startsWith('/players/')) {
      const username = pathname.split('/')[2]
      const gameAction = pathname.split('/')[4] ?? null

      let details = `${strings.viewingProfile} @${username}`
      if (gameAction === 'history') {
        details = `${strings.viewingMatchHistory} @${username}`
      }
      presenceData.details = details
    }
    else if (pathname.startsWith('/club')) {
      const name = document.querySelector('h6[class*="HeadingTruncated"]')?.textContent?.trim() ?? strings.unknownClub
      presenceData.details = `${strings.viewingClub} @${name}`
      presenceData.buttons = [{ label: 'View Club', url: document.location.href }]
    }
  }

  // Handle non-browsing states
  if (pathname.startsWith('/matchmaking')) {
    presenceData.details = strings.inLobby
    const playArea = document.querySelector('div[name="playbutton"]')

    if (playArea) {
      const timer = Array.from(playArea.querySelectorAll('span')).find(s => /\d{2}:\d{2}/.test(s.textContent ?? ''))
      const timerText = timer?.textContent?.trim() ?? null
      if (timerText) {
        presenceData.details = `${strings.inQueue}`
        presenceData.startTimestamp = Math.floor(Date.now() / 1000) - getElapsedSeconds(timerText)
      }
    }
  }
  else if (pathname.includes('/room/')) {
    const { team, levelAsset, elo } = getSelfUser()
    const vetoContainer = document.querySelector('[data-testid="matchroomVeto"]')

    presenceData.smallImageKey = levelAsset ?? (team ? Assets.Live : null)
    presenceData.smallImageText = team && elo > 0 ? `${strings.elo}: ${elo}` : (team ? strings.unranked : null)

    // Veto Phase
    if (vetoContainer) {
      presenceData.details = team ? strings.vetoingMaps : strings.watchingVeto
    }
    else { // Match Phase
      const mapImg = document.querySelector<HTMLImageElement>('img[class*="SelectedMapIcon"]')
      const mapName = mapImg?.nextElementSibling?.textContent?.trim() ?? strings.unknownMap

      const factionNames = document.querySelectorAll('[class*="FactionName"]')
      const header = factionNames[0]?.closest('[class*="styles__Container"]')
      const factions = header?.querySelectorAll('[class*="styles__Faction-"]')

      if (header && factions && factions.length >= 2) {
        const getFaction = (el: Element | undefined) => ({
          score: el?.querySelector('[class*="FactionScore"]')?.textContent?.trim() ?? '0',
          win: el?.textContent?.includes('Winner') || !!el?.querySelector('[class*="MatchOutcomeBadge"]'),
        })

        const t1 = getFaction(factions[0])
        const t2 = getFaction(factions[1])
        const [sL, sR] = team === 2 ? [t2.score, t1.score] : [t1.score, t2.score]
        const scoreDisplay = `[ ${sL} : ${sR} ]`

        const timerText = header.querySelector('[class*="MatchStateText"]')?.textContent?.trim() ?? null
        const isFinished = t1.win || t2.win

        if (team) { // We are playing
          presenceData.details = isFinished
            ? `${strings.matchResults} - ${mapName}`
            : `${strings.playing} on ${mapName}`

          // Live Match
          if (timerText && /\d{2}:\d{2}/.test(timerText)) {
            presenceData.name = 'Counter-Strike 2'
            presenceData.type = ActivityType.Competing
            presenceData.state = `${strings.competitive} ${scoreDisplay}`
            presenceData.startTimestamp = Math.floor(Date.now() / 1000) - getElapsedSeconds(timerText)
          }
          // Warmup or Finished
          else {
            let resultLabel = strings.inWarmup
            if (isFinished) {
              const didIWin = (team === 1 && t1.win) || (team === 2 && t2.win)
              resultLabel = didIWin ? strings.won : strings.lost
            }

            presenceData.state = `${resultLabel} ${scoreDisplay}`
            delete presenceData.startTimestamp
          }
        }
        else { // We are not playing
          const isLive = !!(timerText && /\d{2}:\d{2}/.test(timerText))

          presenceData.details = isFinished
            ? `${strings.matchResults} - ${mapName}`
            : `${strings.watching} ${mapName}`

          const resultLabel = isFinished ? strings.finished : strings.inWarmup
          presenceData.state = isLive ? `${strings.competitive} ${scoreDisplay}` : `${resultLabel} ${scoreDisplay}`

          if (isLive) {
            presenceData.startTimestamp = Math.floor(Date.now() / 1000) - getElapsedSeconds(timerText)
          }
          else {
            delete presenceData.startTimestamp
          }
        }
      }
    }

    presenceData.buttons = [{ label: strings.matchroom, url: document.location.href }]
  }

  presence.setActivity(presenceData)
})
