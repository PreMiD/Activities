import { Assets, ActivityType } from 'premid'

const presence = new Presence({
  clientId: '1530841436822437999',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets { // Other default assets can be found at index.d.ts
  Logo = '',
}

presence.on('UpdateData', async () => {

  const strings = await presence.getStrings({
    play: 'general.playing',
    pause: 'general.paused',
    browse: 'general.browsing',
    listen: 'general.listeningTo',
    viewACategory: 'general.viewACategory',
    viewAPage: 'general.viewAPage',
    view: 'general.view',
  })


  const presenceData: PresenceData = {
    startTimestamp: browsingTimestamp,
    type: ActivityType.Listening,
  }
  if (document.location.pathname.includes('/katalog') || document.location.pathname.includes('/catalog')) {
    const navs = document.querySelectorAll('nav');
    // get nav with class breadcrumbs_breadcrumbs_xxxx where xxxx is a random string
    const nav = Array.from(navs).find(nav => nav.className.startsWith('breadcrumbs_breadcrumbs_'));
    const catalogTitle = nav?.querySelector('li:last-child > span')?.textContent?.trim();
    presenceData.details = `${strings.viewACategory} ${catalogTitle}`
  }
  else if (document.location.pathname.includes('/audiobook')) {
    const title = document.querySelector('[class*="product-top_title"]')?.textContent?.trim();
    const author = document.querySelector('[class*="authors_author"]')?.textContent?.trim();

    //check if audiobook is playing by checking the play/pause button
    const buttons = document.querySelectorAll('button[class*="controls_control"]')
    const controlButton = Array.from(buttons).find(btn => {
      const label = btn.getAttribute('aria-label')
      const href = btn.querySelector('use')?.getAttribute('href') || ''
      return label === 'Odtwórz' || label === 'Pauza' || href.includes('play') || href.includes('pause')
    })

    const ariaLabel = controlButton?.getAttribute('aria-label')
    const svgHref = controlButton?.querySelector('use')?.getAttribute('href') || ''
    const isPlaying = ariaLabel === 'Pauza' || svgHref.includes('pause')

    if (isPlaying) {
      //playing audiobook
      //replace {0} {1} with empty line and {2} with author
      presenceData.details = (strings.listen).replace('{0}', '\n').replace('{1}', title || '');
      presenceData.state = `Author: ${author}`;
    }
    else {

      //not playing audiobook, just viewing page
      presenceData.details = `${strings.view} ${title}`
      presenceData.state = `Author: ${author}`
    }
  }
  else {
    //main page
    presenceData.details = strings.viewAPage;
  }

  presence.setActivity(presenceData)
})
