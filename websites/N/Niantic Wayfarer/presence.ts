import { Assets } from 'premid'

const presence = new Presence({
  clientId: '684174415415476240',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/N/Niantic%20Wayfarer/assets/logo.png',
  Pin = 'https://cdn.rcd.gg/PreMiD/websites/N/Niantic%20Wayfarer/assets/0.png',
}

const shortenedURLs: Record<string, string> = {}
async function getShortURL(url: string) {
  if (url.length < 256)
    return url
  if (shortenedURLs[url])
    return shortenedURLs[url]
  try {
    shortenedURLs[url] = ActivityAssets.Logo
    const pdURL = await (
      await fetch(`https://pd.premid.app/create/${url}`)
    ).text()
    shortenedURLs[url] = pdURL
    return pdURL
  }
  catch (err) {
    presence.error(err as string)
    return url
  }
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const { pathname } = document.location

  if (pathname.includes('/review')) {
    const title = document.querySelector(
      'app-title-and-description-b .wf-review-card__body a > div',
    )
    const description = document.querySelector(
      'app-title-and-description-b .wf-review-card__body a+div',
    )
    const location = document.querySelector(
      'app-photo-b .wf-review-card__body > div > div:last-child',
    )
    if (title && description && location) {
      presenceData.largeImageKey = await getShortURL(
        document.querySelector<HTMLImageElement>(
          'app-photo-b .wf-image-modal > img',
        )?.src ?? '',
      )
      presenceData.smallImageKey = ActivityAssets.Pin
      presenceData.details = `Reviewing: ${title.childNodes[0]?.textContent?.trim()}`
      presenceData.state = `Description: ${description.textContent?.trim()}`
      presenceData.smallImageText = `Address: ${location.textContent
        ?.split(':')[1]
        ?.trim()}`
    }
    else if (document.querySelector('app-review-photo')) {
      presenceData.details = 'Reviewing photos'
      presenceData.state = `for ${
        document.querySelector(
          'app-review-photo .review-photo__info > div > div:first-child',
        )?.textContent
      }`
    }
    else if (document.querySelector('app-review-edit')) {
      presenceData.details = 'Reviewing a Wayspot edit'
      presenceData.state = `for ${document
        .querySelector('app-review-edit-info .review-edit-info__info')
        ?.textContent
        ?.trim()}`
    }
    else {
      presenceData.details = 'Getting ready to'
      presenceData.state = 'review a location'
    }
  }
  else if (pathname.includes('/settings')) {
    presenceData.details = 'Managing settings'
  }
  else if (pathname.includes('/help')) {
    const article = document
      .querySelector('wf-page-header h2 a + span')
      ?.textContent
      ?.split('>')[1]
      ?.trim()
    presenceData.smallImageKey = Assets.Reading
    if (article) {
      presenceData.details = 'Reading article:'
      presenceData.state = article
    }
    else {
      presenceData.details = 'Browsing the Help Center'
    }
  }
  else if (pathname.includes('/criteria')) {
    presenceData.details = 'Reading criteria'
    presenceData.state = document
      .querySelector('wf-subnavigation li li[class*=selected]')
      ?.textContent
      ?.trim()
  }
  else if (pathname.includes('/login')) {
    presenceData.details = 'Logging in'
  }
  else if (pathname.includes('/profile')) {
    presenceData.details = 'Viewing their profile'
    presenceData.state = `Rating: ${document
      .querySelector('wf-rating-bar section[class*=active]')
      ?.textContent
      ?.trim()}`
    presenceData.smallImageKey = await getShortURL(
      document.querySelector<SVGImageElement>('wf-upgrade-visualization image')
        ?.href
        ?.baseVal ?? '',
    )
    const agreements = [
      ...document.querySelectorAll(
        'wf-profile-stats > div > div:not([class]):not(:last-child) .wf-profile-stats__stat',
      ),
    ].reduce((value, element) => {
      return value + +(element.children[1]?.textContent?.trim() ?? 0)
    }, 0)
    const total = +(document
      .querySelector(
        'wf-profile-stats > div > .wf-profile-stats__stat > div:last-child',
      )
      ?.textContent
      ?.trim() ?? 0)
    presenceData.smallImageText = `Total: ${total}, Agreements: ${agreements} (${(
      (agreements / total)
      * 100
    ).toFixed(1)}%)`
  }
  else if (pathname.includes('/nominations')) {
    presenceData.details = 'Viewing their nominations'
  }
  else if (pathname.includes('/showcase')) {
    presenceData.details = 'Viewing the showcased wayspots'
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
