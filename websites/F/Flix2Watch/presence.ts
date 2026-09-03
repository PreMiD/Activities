import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '1544891110734954587',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://flix2watch.com/flix2watch-premid-logo-512-v231.png',
}

function pageState(pathname: string): string {
  if (pathname === '/') return 'Browsing the homepage'
  if (pathname.startsWith('/movies')) return 'Browsing movies'
  if (pathname.startsWith('/tv')) return 'Browsing TV shows'
  if (pathname.startsWith('/genres')) return 'Browsing genres'
  if (pathname.startsWith('/leaderboard')) return 'Viewing the leaderboard'
  if (pathname.startsWith('/profile')) return 'Viewing a profile'
  if (pathname.startsWith('/favorites')) return 'Viewing favorites'
  if (pathname.startsWith('/notifications')) return 'Checking notifications'
  if (pathname.startsWith('/support')) return 'Viewing support'
  if (pathname.startsWith('/account')) return 'Managing their account'
  if (pathname.startsWith('/staff')) return 'Managing Flix2Watch'
  return 'Browsing Flix2Watch'
}

presence.on('UpdateData', async () => {
  const showBrowsing = await presence.getSetting<boolean>('showBrowsing')
  const showTimestamp = await presence.getSetting<boolean>('showTimestamp')
  const showButtons = await presence.getSetting<boolean>('showButtons')
  const showPoster = await presence.getSetting<boolean>('showPoster')

  const { pathname, href } = document.location
  const bridge = document.querySelector<HTMLElement>('#f2w-premid-state')

  if (pathname.startsWith('/watch')) {
    const title =
      bridge?.dataset.title?.trim()
      || document.querySelector('#detail-title')?.textContent?.trim()
      || 'Loading title…'

    const mediaType = bridge?.dataset.mediaType === 'tv' ? 'tv' : 'movie'
    const status = bridge?.dataset.status || 'watching'
    const position = Number(bridge?.dataset.position || 0)
    const duration = Number(bridge?.dataset.duration || 0)
    const season = Number(bridge?.dataset.season || 0)
    const episode = Number(bridge?.dataset.episode || 0)
    const poster = bridge?.dataset.poster || ''

    const presenceData: PresenceData = {
      name: 'Flix2Watch',
      type: ActivityType.Watching,
      details: title,
      largeImageKey: showPoster && poster ? poster : ActivityAssets.Logo,
      largeImageText: `Flix2Watch • ${title}`,
    }

    if (mediaType === 'tv' && season > 0 && episode > 0)
      presenceData.state = `Season ${season}, Episode ${episode}`
    else
      presenceData.state = 'Watching a movie'

    if (status === 'playing') {
      presenceData.smallImageKey = Assets.Play
      presenceData.smallImageText = 'Playing'

      if (
        showTimestamp
        && Number.isFinite(position)
        && Number.isFinite(duration)
        && position >= 0
        && duration > position
      ) {
        const now = Math.floor(Date.now() / 1000)
        presenceData.startTimestamp = now - Math.floor(position)
        presenceData.endTimestamp = now + Math.floor(duration - position)
      }
    }
    else if (status === 'paused') {
      presenceData.smallImageKey = Assets.Pause
      presenceData.smallImageText = 'Paused'
    }
    else if (status === 'buffering') {
      presenceData.smallImageKey = Assets.Play
      presenceData.smallImageText = 'Buffering'
    }
    else {
      presenceData.smallImageKey = Assets.Play
      presenceData.smallImageText = 'Watching'
    }

    if (showButtons) {
      presenceData.buttons = [{
        label: 'Watch on Flix2Watch',
        url: href,
      }]
    }

    presence.setActivity(presenceData)
    return
  }

  if (!showBrowsing) {
    presence.clearActivity()
    return
  }

  const presenceData: PresenceData = {
    name: 'Flix2Watch',
    details: 'Browsing Flix2Watch',
    state: pageState(pathname),
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  presence.setActivity(presenceData)
})
