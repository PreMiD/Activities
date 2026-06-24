import { Assets, getTimestampsFromMedia } from 'premid'

const presence = new Presence({
  clientId: '629428243061145640',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Likes = 'https://cdn.rcd.gg/PreMiD/websites/P/Pinterest/assets/0.png',
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/P/Pinterest/assets/logo.png',
  Loading = 'https://cdn.rcd.gg/PreMiD/websites/P/Pinterest/assets/1.gif',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const { pathname, hostname, href } = document.location
  const pathList = pathname.split('/').filter(Boolean)
  const buttons = await presence.getSetting<boolean>('buttons')
  const ideasHubPage = document.querySelector('[data-test-id="ideas-hub-page-header"]')
    || document.querySelector('[data-test-id="control-ideas-redesign-header"]')
  const search = document.querySelector<HTMLInputElement>(
    'input[aria-label="Search"],input[aria-label="search"]',
  )
  const video = document.querySelector<HTMLVideoElement>('video')

  if (hostname === 'help.pinterest.com') {
    presenceData.details = 'Viewing the help center'
    presence.setActivity(presenceData)
    return
  }
  switch (true) {
    case document.readyState !== 'complete': {
      presenceData.details = 'Loading'
      presenceData.smallImageKey = ActivityAssets.Loading
      break
    }
    case !!search?.value: {
      presenceData.details = !pathname.includes('/search/')
        ? 'Searching for'
        : 'Viewing search results for'
      presenceData.state = search.value
      presenceData.smallImageKey = Assets.Search
      break
    }
    case !!document.querySelector(
      '[data-test-id="profile-name"]',
    ): {
      presenceData.details = 'Viewing profile of'
      presenceData.state = `${document.querySelector(
        '[data-test-id="profile-name"]',
      )?.textContent} (@${pathList[0]})`
      presenceData.buttons = [{ label: 'View Profile', url: href }]
      break
    }

    case pathname.includes('/pin/'): {
      const creatorProfile = document
        .querySelector('[data-test-id="official-user-attribution"]')
        ?.querySelector<HTMLAnchorElement>('a')
        ?.href
      const likesEl = document.querySelector(
        '[data-test-id="Reaction"]',
      )?.textContent
      presenceData.details = JSON.parse(
        document.querySelector('[data-test-id="leaf-snippet"]')?.textContent ?? '{}',
      )?.headline ?? 'Viewing a pin'

      if (video && !Number.isNaN(video.duration)) {
        delete presenceData.startTimestamp
        if (!video.paused) {
          [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestampsFromMedia(video)
        }
        presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
        presenceData.smallImageText = video.paused ? 'Paused' : 'Playing back'
        presenceData.state = `Viewing a video pin by: ${
          document.querySelector(
            '[data-test-id="creator-profile-name"],[data-test-id="username"]',
          )?.textContent
        }`
        presenceData.buttons = creatorProfile
          ? [
              { label: 'Watch Video Pin', url: href },
              {
                label: 'View Creator\'s Profile',
                url: creatorProfile,
              },
            ]
          : [{ label: 'Watch Video Pin', url: href }]
      }
      else {
        if (likesEl) {
          presenceData.smallImageKey = ActivityAssets.Likes
          presenceData.smallImageText = `${likesEl} likes`
        }
        presenceData.state = `Viewing pin by: ${
          document.querySelector(
            '[data-test-id="creator-profile-name"],[data-test-id="username"]',
          )?.textContent
        }`
        presenceData.buttons = creatorProfile
          ? [
              { label: 'View Pin', url: href },
              {
                label: 'View Creator\'s Profile',
                url: creatorProfile,
              },
            ]
          : [{ label: 'View Pin', url: href }]
      }
      break
    }
    case pathname.includes('/ideas/')
      && !!pathname.match(/\d{12}/g)?.length: {
      presenceData.details = `Browsing through ideas about: ${ideasHubPage?.textContent}`
      presenceData.state = Array.from(
        document.querySelectorAll('[data-test-id="breadcrumb"]') || [],
      )
        .map(x => x?.textContent)
        .join(' => ')
      presenceData.buttons = [{ label: 'Browse Through Ideas', url: href }]
      break
    }
    case pathname.includes('/videos/'): {
      presenceData.details = 'Browsing through videos'
      break
    }
    case pathname.startsWith('/today'): {
      presenceData.details = 'Browsing today ideas'
      if (pathList.length > 1)
        presenceData.state = document.querySelector('div h1')?.textContent?.trim()
      break
    }
    case pathname.startsWith('/idea-pin-builder'):
    case pathname.startsWith('/pin-creation-tool'): {
      presenceData.details = 'Creating a pin'
      break
    }
    case pathname.startsWith('/collage-creation-tool'): {
      presenceData.details = 'Creating a collage'
      break
    }
    case pathname === '/': {
      presenceData.details = 'Viewing the homepage'
      break
    }
    default: {
      presenceData.details = 'Browsing...'
    }
  }

  if (!buttons && presenceData.buttons)
    delete presenceData.buttons
  if (presenceData.details)
    presence.setActivity(presenceData)
})
