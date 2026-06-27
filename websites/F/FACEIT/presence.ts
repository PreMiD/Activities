import { ActivityType, Assets } from 'premid'
import { stringMap } from './i18n.js'

const presence = new Presence({
  clientId: '1498679440325083167',
})

enum ActivityAssets {
  FaceIt = 'https://cdn.rcd.gg/PreMiD/websites/F/FACEIT/assets/logo.png',
  CounterStrike = 'https://cdn.rcd.gg/PreMiD/websites/F/FACEIT/assets/0.png',
  LevelUnranked = 'https://cdn.rcd.gg/PreMiD/websites/F/FACEIT/assets/1.jpeg', // Have to find this one yet
  LevelOne = 'https://i.imgur.com/zfPjOpW.png',
  LevelTwo = 'https://i.imgur.com/uGg07ME.png',
  LevelThree = 'https://i.imgur.com/rBZNQw1.png',
  LevelFour = 'https://i.imgur.com/332osDz.png',
  LevelFive = 'https://i.imgur.com/r467Gdi.png',
  LevelSix = 'https://i.imgur.com/QIokBiU.png',
  LevelSeven = 'https://i.imgur.com/lpKwHTa.png',
  LevelEight = 'https://i.imgur.com/LLrEhec.png',
  LevelNine = 'https://i.imgur.com/QuVe40E.png',
  LevelTen = 'https://i.imgur.com/H8bBSgU.png',
  LevelEleven = 'https://i.imgur.com/P1QjPqd.png',
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

function getPartySize(): { partySize: number, maxPartySize: number } | null {
  for (const container of document.querySelectorAll('[class*="CardContainer"]')) {
    const slots = Array.from(container.children).filter(child =>
      child.matches('[class*="PlayerCardWrapper"]'),
    )

    if (!slots.length) {
      continue
    }

    const partySize = slots.filter(slot =>
      slot.querySelector('img[aria-label="avatar"]'),
    ).length

    if (partySize > 0) {
      return { partySize, maxPartySize: slots.length }
    }
  }

  return null
}

function getSkillLevelAsset(container: Element | null | undefined): string | null {
  const skillSvg = container?.querySelector('svg[class*="SkillIcon"]')
  let titleText = ''

  if (skillSvg) {
    titleText = skillSvg.querySelector('title')?.textContent?.toLowerCase() || ''
    if (!titleText) {
      titleText = skillSvg.getAttribute('aria-label')?.toLowerCase() || ''
    }
  }

  const levelMatch = titleText.match(/\d+/)
  return getLevelAsset(levelMatch?.[0] ?? 'unranked')
}

function getElo(container: Element | null | undefined): number {
  const eloElement = container?.querySelector(
    '[class*="EloText"], [class*="Subtitle__Holder"], [class*="LevelAndElo"], [class*="SkillLevel__Elo"]',
  )
  const eloText = eloElement?.textContent || ''

  return Number(eloText.replace(/\D/g, '')) || 0
}

function getSelfPartyUser(): { levelAsset: string | null, elo: number } | null {
  for (const container of document.querySelectorAll('[class*="CardContainer"]')) {
    const slots = Array.from(container.children).filter(child =>
      child.matches('[class*="PlayerCardWrapper"]')
      && child.querySelector('img[aria-label="avatar"]')
      && child.querySelector('[class*="Nickname"]'),
    )

    if (!slots.length) {
      continue
    }

    const nonKickableSlots = slots.filter(slot =>
      !slot.querySelector('button[aria-label="Kick"], [data-testid="close-icon"][aria-label="Kick"]'),
    )
    const selfSlot = nonKickableSlots.length === 1 ? nonKickableSlots[0] : slots[0]

    return {
      levelAsset: getSkillLevelAsset(selfSlot),
      elo: getElo(selfSlot),
    }
  }

  return null
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

        return {
          team: (isT1 ? 1 : 2) as 1 | 2,
          levelAsset: getSkillLevelAsset(container),
          elo: getElo(container),
        }
      }
    }
  }

  return { team: null, levelAsset: null, elo: 0 }
}

const browsingTimestamp = Math.floor(Date.now() / 1000)
presence.on('UpdateData', async () => {
  const strings = await presence.getStrings(stringMap)
  const [showElo, showParty, ingameFormat, showBrowsing] = await Promise.all([
    presence.getSetting<boolean>('showElo'),
    presence.getSetting<boolean>('showParty'),
    presence.getSetting<number>('gameFormat'),
    presence.getSetting<boolean>('browsing'),
  ])

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.FaceIt,
    startTimestamp: browsingTimestamp,
  }

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

      let details = `${strings.viewingProfile}: ${username}`
      if (gameAction === 'history') {
        details = `${strings.viewingMatchHistory}: ${username}`
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
    if (showElo) {
      const partyUser = getSelfPartyUser()
      if (partyUser) {
        presenceData.smallImageKey = partyUser.levelAsset
        presenceData.smallImageText = partyUser.elo > 0
          ? `${strings.elo}: ${partyUser.elo}`
          : strings.unranked
      }
    }

    if (showParty) {
      const party = getPartySize()
      if (party) {
        presenceData.state = strings.inParty
        presenceData.party = party
      }
    }

    // Look for the countdown timer anywhere on the page
    const timer = Array.from(document.querySelectorAll('span')).find(s => /\d{2}:\d{2}/.test(s.textContent ?? ''))
    const timerText = timer?.textContent?.trim() ?? null
    if (timerText) {
      presenceData.details = `${strings.inQueue}`
      presenceData.startTimestamp = Math.floor(Date.now() / 1000) - getElapsedSeconds(timerText)
    }
  }
  else if (pathname.includes('/room/')) {
    const { team, levelAsset, elo } = getSelfUser()
    const vetoContainer = document.querySelector('[data-testid="matchroomVeto"]')

    presenceData.smallImageKey = !showElo ? null : levelAsset ?? (team ? Assets.Live : null)
    presenceData.smallImageText = !showElo ? null : elo > 0 ? `${strings.elo}: ${elo}` : (team ? strings.unranked : null)

    // Veto Phase
    if (vetoContainer) {
      presenceData.details = strings.matchroom
      presenceData.state = team ? strings.vetoingMaps : strings.watchingVeto
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
            ? `${strings.matchResults}`
            : `${strings.playing} on ${mapName}`

          // Live Match
          if (timerText && /\d{2}:\d{2}/.test(timerText)) {
            switch (ingameFormat) {
              case 0:
                presenceData.name = `FACEIT: Counter-Strike 2`
                break
              case 1:
                presenceData.name = `Counter-Strike 2`
                break
              case 2:
                presenceData.name = 'FACEIT'
                break
            }

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
              resultLabel += ` on ${mapName}`
            }

            presenceData.state = `${resultLabel} ${scoreDisplay}`
            delete presenceData.startTimestamp
          }
        }
        else { // We are not playing
          const isLive = !!(timerText && /\d{2}:\d{2}/.test(timerText))

          presenceData.details = isFinished
            ? `${strings.matchResults}`
            : `${strings.watching} ${mapName}`

          const resultLabel = isFinished ? strings.finished : strings.inWarmup
          presenceData.state = isLive ? `${strings.competitive} ${scoreDisplay}` : `${resultLabel} ${mapName} ${scoreDisplay}`

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
