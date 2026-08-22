import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '503557087041683458',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/B/Brawl%20Stars%20Championship/assets/logo.png',
}

function getText(selector: string): string | undefined {
  const el = document.querySelector(selector)
  const text = el?.textContent?.trim()
  return text && text.length > 0 ? text : undefined
}

presence.on('UpdateData', async () => {
  const { pathname } = document.location

  if (!pathname.includes('/brawlstars')) {
    presence.clearActivity()
    return
  }

  const [privacy, showButtons] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('showButtons'),
  ])

  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    largeImageKey: ActivityAssets.Logo,
    largeImageText: 'Brawl Stars Championship',
    startTimestamp: browsingTimestamp,
  }

  if (privacy) {
    presenceData.details = 'Browsing...'
    presenceData.state = 'Brawl Stars Championship'
    presence.setActivity(presenceData)
    return
  }

  const isLiveRewards = pathname.includes('/live/rewards') || (pathname.includes('/live') && !!document.querySelector('.baseModal .pointsBar__label, .videoControls__rewardsButton--active'))

  if (isLiveRewards) {
    const points = getText('.pointsBar__label')
    const match = getText('.eventIndicator__text')

    presenceData.details = 'Viewing Live Rewards'
    presenceData.state = points ? `Points: ${points}` : (match || 'Brawl Stars Championship')
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = 'Rewards'

    if (showButtons) {
      presenceData.buttons = [
        {
          label: 'Watch Live',
          url: 'https://event.supercell.com/brawlstars/en/live/',
        },
      ]
    }
  }
  else if (pathname.includes('/rewards')) {
    const points = getText('.pointsBar__label')
    presenceData.details = 'Viewing Rewards Track'
    presenceData.state = points ? `Points: ${points}` : 'Brawl Stars Championship'
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = 'Rewards'

    if (showButtons) {
      presenceData.buttons = [
        {
          label: 'Event Hub',
          url: 'https://event.supercell.com/brawlstars/en/',
        },
      ]
    }
  }
  else if (pathname.includes('/live')) {
    const streamer = getText('.streamerInfo__title')
    const match = getText('.eventIndicator__text')

    presenceData.details = match || streamer || 'Watching Live Stream'
    presenceData.smallImageKey = Assets.Live
    presenceData.smallImageText = 'Live'

    if (match && streamer && match !== streamer) {
      presenceData.state = streamer
    }
    else {
      presenceData.state = 'Brawl Stars Championship'
    }

    if (showButtons) {
      presenceData.buttons = [
        {
          label: 'Watch Live',
          url: document.location.href,
        },
      ]
    }
  }
  else if (pathname.includes('/schedule')) {
    const stageHeader = getText('.leaderboardSection__header h2') || getText('h1') || getText('h2')
    presenceData.details = 'Viewing Event Schedule'
    presenceData.state = stageHeader || 'Brawl Stars Championship'
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = 'Schedule'

    if (showButtons) {
      presenceData.buttons = [
        {
          label: 'View Schedule',
          url: document.location.href,
        },
      ]
    }
  }
  else if (pathname.includes('/leaderboard')) {
    const leaderboardRegion = getText('.select--leaderboard .select__label') || getText('.leaderboardSection__header h2')
    presenceData.details = 'Viewing Leaderboard'
    presenceData.state = leaderboardRegion || 'Brawl Stars Championship'
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = 'Leaderboard'

    if (showButtons) {
      presenceData.buttons = [
        {
          label: 'Leaderboards',
          url: document.location.href,
        },
      ]
    }
  }
  else {
    const heroTitle = getText('h1') || getText('.events__title')
    presenceData.details = 'Browsing Event Hub'
    presenceData.state = heroTitle || 'Brawl Stars Championship'
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = 'Browsing'

    if (showButtons) {
      presenceData.buttons = [
        {
          label: 'Watch Live',
          url: 'https://event.supercell.com/brawlstars/en/live/',
        },
      ]
    }
  }

  presence.setActivity(presenceData)
})
