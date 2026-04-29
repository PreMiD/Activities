import { ActivityType, Assets } from 'premid'
import { stringMap } from './i18n.js'

const presence = new Presence({
    clientId: '1498679440325083167',
})

enum ActivityAssets {
    FaceIt = 'https://i.imgur.com/n5ielUx.png',
    CounterStrike = 'https://i.imgur.com/DKS55vg.png',
    LevelUnranked = 'https://i.imgur.com/9SgqYFm.png', // Have to find this one yet
    LevelOne = 'https://i.imgur.com/6rN5cuh.png',
    LevelTwo = 'https://i.imgur.com/vENOEdq.png',
    LevelThree = 'https://i.imgur.com/8kluHJ0.png',
    LevelFour = 'https://i.imgur.com/IERNixS.png',
    LevelFive = 'https://i.imgur.com/Xy95TsF.png',
    LevelSix = 'https://i.imgur.com/bJtZMTZ.png',
    LevelSeven = 'https://i.imgur.com/GNacaVX.png',
    LevelEight = 'https://i.imgur.com/wurmgAc.png',
    LevelNine = 'https://i.imgur.com/aBZIzCx.png',
    LevelTen = 'https://i.imgur.com/qx8irJg.png',
    LevelEleven = 'https://i.imgur.com/s7nR1iZ.png'
}

const getLevelAsset = (level: string): string | null => {
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

const getElapsedSeconds = (timeStr?: string | null): number => {
    const parts = timeStr?.split(':').map(Number)
    if (!parts || parts.some(isNaN)) return 0
    const [s = 0, m = 0, h = 0] = [...parts].reverse()
    return h * 3600 + m * 60 + s
}

// Whether the given (user) element is the logged in user.
// FACEIT marks the logged in user with an orange color in 
// the match overview page.
const SELF_USER_ORANGE = 'rgb(255, 85, 0)'
const isSelfUser = (el: Element): boolean => {
    const color = window.getComputedStyle(el).color
    return color === SELF_USER_ORANGE
}

// If the user is part of the match, we extract their team and
// rank to display in the presence.
const getSelfUser = (): { team: 1 | 2 | null, levelAsset: string | null, elo: number } => {
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
                    if (!titleText) titleText = skillSvg.getAttribute('aria-label')?.toLowerCase() || ''
                }

                
                let levelKey = 'unranked'
                const levelMatch = titleText.match(/\d+/)
                if (levelMatch) levelKey = levelMatch[0]

                const eloElement = container?.querySelector('[class*="Subtitle__Holder"], [class*="LevelAndElo"], [class*="SkillLevel__Elo"]')
                const eloText = eloElement?.textContent || ''
                const elo = Number(eloText.replace(/[^0-9]/g, '')) || 0

                return {
                    team: (isT1 ? 1 : 2) as 1 | 2,
                    levelAsset: getLevelAsset(levelKey),
                    elo
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
        details: null,
        state: null,
        smallImageKey: null
    }

    const showBrowsing = await presence.getSetting<boolean>('browsing')
    if (showBrowsing) presenceData.details = strings.browsingHome

    const { pathname: rawPath } = document.location
    const pathname = rawPath.replace(/^\/[a-z]{2}(-[A-Z]{2})?\//, '/') // Remove locale from path

    // Hide all browsing states if disabled
    if (showBrowsing) {
        if (pathname.startsWith('/parties')) presenceData.details = strings.browsingParties
        else if (pathname.startsWith('/cs2/rank')) presenceData.details = strings.browsingRank
        else if (pathname.startsWith('/track')) presenceData.details = strings.browsingTrack
        else if (pathname.startsWith('/social-feed')) presenceData.details = strings.browsingFeed
        else if (pathname.startsWith('/clubs')) presenceData.details = strings.browsingClubs
        else if (pathname.startsWith('/players/')) {

            const username = pathname.split('/')[2]
            const gameAction = pathname.split('/')[4] ?? null;

            let details = `${strings.viewingProfile} @${username}`
            if (gameAction === 'history') details = `${strings.viewingMatchHistory} @${username}`
            presenceData.details = details

        } else if (pathname.startsWith('/club')) {

            const name = document.querySelector('h6[class*="HeadingTruncated"]')?.textContent?.trim() ?? 'Unknown Club'
            presenceData.details = `${strings.viewingClub} @${name}`
            presenceData.buttons = [{ label: 'View Club', url: document.location.href }]

        }
    }

    // Handle non-browsing states
    if (pathname.startsWith('/matchmaking')) {

        presenceData.details = strings.inLobby
        const modal = document.querySelector('[role="dialog"][data-dialog-type="MODAL"]')
        const playArea = document.querySelector('div[name="playbutton"]')

        if (modal) {
            presenceData.details = strings.matchFound
        } else if (playArea) {
            const timer = Array.from(playArea.querySelectorAll('span')).find(s => /\d{2}:\d{2}/.test(s.textContent ?? ''))
            const timerText = timer?.textContent?.trim() ?? null
            if (timerText) {
                presenceData.details = `${strings.inQueue}`
                presenceData.startTimestamp = Math.floor(Date.now() / 1000) - getElapsedSeconds(timerText)
            }
        }

    } else if (pathname.includes('/room/')) {
        const { team, levelAsset, elo } = getSelfUser()
        const vetoContainer = document.querySelector('[data-testid="matchroomVeto"]')

        presenceData.smallImageKey = levelAsset ?? (team ? Assets.Live : null)
        presenceData.smallImageText = team && elo > 0 ? `${strings.elo}: ${elo}` : (team ? "Unranked" : null)

        // Veto Phase
        if (vetoContainer) {
            presenceData.details = team ? strings.vetoingMaps : strings.watchingVeto
        }

        // Match Phase
        else {
            const mapImg = document.querySelector('img[class*="SelectedMapIcon"]') as HTMLImageElement | null
            const mapName = mapImg?.nextElementSibling?.textContent?.trim() ?? 'Unknown Map'

            const factionNames = document.querySelectorAll('[class*="FactionName"]')
            const header = factionNames[0]?.closest('[class*="styles__Container"]')
            const factions = header?.querySelectorAll('[class*="styles__Faction-"]')

            if (header && factions && factions.length >= 2) {
                const getFaction = (el: Element | undefined) => ({
                    score: el?.querySelector('[class*="FactionScore"]')?.textContent?.trim() ?? '0',
                    win: el?.textContent?.includes('Winner') || !!el?.querySelector('[class*="MatchOutcomeBadge"]')
                })

                const t1 = getFaction(factions[0]), t2 = getFaction(factions[1])
                const [sL, sR] = team === 2 ? [t2.score, t1.score] : [t1.score, t2.score]
                const scoreDisplay = `[ ${sL} : ${sR} ]`


                const timerText = header.querySelector('[class*="MatchStateText"]')?.textContent?.trim() ?? null

                if (team) { // We are playing
                    
                    // Live Match
                    if (timerText && /\d{2}:\d{2}/.test(timerText)) {
                        presenceData.name = 'Counter-Strike 2'
                        presenceData.type = ActivityType.Competing
                        presenceData.details = `${strings.playing} on ${mapName}`
                        presenceData.state = `${strings.competitive} ${scoreDisplay}`
                        presenceData.startTimestamp = Math.floor(Date.now() / 1000) - getElapsedSeconds(timerText)
                    } else {
                        const didIWin = (team === 1 && t1.win) || (team === 2 && t2.win);
                        const resultLabel = didIWin ? strings.won : strings.lost;
                        presenceData.details = `${strings.matchroom} - ${mapName}`
                        presenceData.state = `${resultLabel} ${scoreDisplay}`
                        presenceData.startTimestamp = null
                    }

                } else { // We are not playing

                    // Live Match
                    if (timerText && /\d{2}:\d{2}/.test(timerText)) {
                        presenceData.details = `${strings.watching} - ${mapName}`
                        presenceData.state = `${strings.competitive} ${scoreDisplay}`
                        presenceData.startTimestamp = Math.floor(Date.now() / 1000) - getElapsedSeconds(timerText)
                    } else {
                        presenceData.details = `${strings.matchroom} - ${mapName}`
                    }

                }
            }
        }

        presenceData.buttons = [{ label: strings.matchroom, url: document.location.href }]
    }

    presence.setActivity(presenceData)
})