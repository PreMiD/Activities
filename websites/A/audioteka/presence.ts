import { ActivityType } from 'premid'

const presence = new Presence({
  clientId: '1530841436822437999',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const strings = await presence.getStrings({
    play: 'general.playing',
    pause: 'general.paused',
    browse: 'general.browsing',
    listen: 'general.listeningTo',
    viewACategory: 'general.viewACategory',
    viewAPage: 'general.viewAPage',
    view: 'general.view',
    listenAlong: 'general.buttonListenAlong',
  })

  const presenceData: PresenceData = {
    startTimestamp: browsingTimestamp,
    type: ActivityType.Listening,
  }
  const pageTitle = document.querySelector('[class*="breadcrumbs_breadcrumbs_"] li:last-child > span')?.textContent?.trim() || 'Unknown Page'

  // check if audiobook is playing by checking the play/pause button
  const controlButtons = Array.from(document.querySelectorAll('button[class*="controls_control"]'))
  const playButton = controlButtons.find((btn) => {
    const label = btn.getAttribute('aria-label')
    const iconHref = btn.querySelector('use')?.getAttribute('href') || ''
    return label === 'Odtwórz' || label === 'Pauza' || iconHref.includes('play') || iconHref.includes('pause')
  })

  const isPlaying = playButton?.getAttribute('aria-label') === 'Pauza'
    || playButton?.querySelector('use')?.getAttribute('href')?.includes('pause')

  if (isPlaying) {
    const slider = document.querySelector('span[role="slider"]')
    const currentTime = Number.parseFloat(slider?.getAttribute('aria-valuenow') || '0')
    const duration = Number.parseFloat(slider?.getAttribute('aria-valuemax') || '0')

    const author = document.querySelector('[class*="author_link"]')?.textContent?.trim() || ''
    const title = document.querySelector('[class*="content-compact_title"]')?.textContent?.trim() || ''

    const coverImage = document.querySelector<HTMLImageElement>('img[class*="cover_image_"]')
    if (coverImage) {
      presenceData.largeImageKey = coverImage.src
    }

    // playing audiobook
    // replace {0} {1} with empty line and {2} with author
    presenceData.details = (strings.listen).replace('{0}', '\n').replace('{1}', title || '')
    presenceData.state = `Author: ${author}`
    if (duration > 0) {
      const now = Math.floor(Date.now() / 1000)
      presenceData.startTimestamp = Math.floor(now - currentTime)
      presenceData.endTimestamp = Math.floor(now + (duration - currentTime))
    }
  }

  else if (document.location.pathname.includes('/katalog') || document.location.pathname.includes('/catalog')) {
    presenceData.details = `${strings.viewACategory} ${pageTitle}`
  }
  else if (document.location.pathname.includes('/audiobook')) {
    const title = document.querySelector('[class*="product-top_title"]')?.textContent?.trim()
    const author = document.querySelector('[class*="authors_author"]')?.textContent?.trim()
    const coverImage = document.querySelector<HTMLImageElement>('[class*="product-top_cover"] img')

    if (coverImage) {
      presenceData.largeImageKey = coverImage.src
    }

    presenceData.details = `${strings.view} ${title}`
    presenceData.state = `Author: ${author}`
  }
  else if (document.location.pathname.includes('polka') || document.location.pathname.includes('shelf')) {
    // shelf page
    presenceData.details = `${strings.browse} ${pageTitle}`
  }
  else if (document.location.pathname.includes('cykl') || document.location.pathname.includes('cycle')) {
    // search page
    presenceData.details = `${strings.browse} ${pageTitle}`
  }
  else {
    // main page
    presenceData.details = strings.viewAPage
  }

  presence.setActivity(presenceData)
})
