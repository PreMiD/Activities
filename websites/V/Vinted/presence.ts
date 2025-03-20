import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '1342972122443546674',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/V/Vinted/assets/logo.jpeg',
    smallImageKey: Assets.Reading,
    smallImageText: 'Shopping',
    startTimestamp: browsingTimestamp,
    type: ActivityType.Playing,
  }

  function getTags(): string[] {
    const tagsElements = document.querySelectorAll<HTMLElement>('.web_ui__Chip__filled')
    if (tagsElements.length === 0) {
      return []
    }
    const tags = Array.from(tagsElements).map(tagElement => tagElement.textContent?.trim()).filter(Boolean)
    return tags as string[]
  }

  function getRating(): string {
    const ratingElement = document.querySelector<HTMLParagraphElement>('.rating-score-huge-text')
    if (ratingElement) {
      return ratingElement.textContent as string
    }
    return ''
  }

  if (document.location.pathname === '/') {
    presenceData.state = 'Shopping'

    if (document.location.search.includes('?tab=designer')) {
      presenceData.state = 'Browsing designer items'
    }
    else if (document.location.search.includes('?tab=electronics')) {
      presenceData.state = 'Browsing electronics'
    }
  }
  else if (document.location.pathname.includes('/member/items/favourite_list')) {
    presenceData.state = 'Viewing favourite items'
  }
  else if (document.location.pathname.includes('/member/notifications')) {
    presenceData.state = 'Viewing notifications'
  }
  else if (document.location.pathname.includes('/inbox')) {
    presenceData.state = 'Viewing inbox'
    const articleTitle = document.querySelectorAll<HTMLAnchorElement>('.web_ui__Cell__content h2.web_ui__Text__text.web_ui__Text__title.web_ui__Text__left')[1]?.textContent
    if (articleTitle) {
      presenceData.state = `Viewing inbox: ${articleTitle}`
    }
  }
  else if (document.location.pathname.includes('/member/items')) {
    presenceData.state = 'Viewing items'
  }
  else if (document.location.pathname.includes('/homepage/block') && document.location.search.includes('?block_name=recommended_items')) {
    presenceData.state = 'Viewing recommended items'
  }
  else if (document.location.pathname.includes('/homepage/block') && document.location.search.includes('?block_name=recently_viewed_items')) {
    presenceData.state = 'Viewing recently viewed items'
  }
  else if (document.location.pathname.includes('/catalog') && document.location.search.includes('?brand_ids')) {
    presenceData.state = 'Viewing items from a brand'
    const brand = document.querySelector<HTMLAnchorElement>('h1.web_ui__Text__text')?.textContent
    if (brand) {
      presenceData.state = `Viewing items from ${brand}`
      const tags = getTags()
      if (tags.length > 1) {
        presenceData.details = `Viewing items from ${brand}`
        tags.shift()
        presenceData.state = `Tags: ${tags.join(', ')}`
      }
    }
  }
  else if (document.location.search.includes('?search_text') || document.location.pathname.includes('/search')) {
    const searchTypeElement = document.querySelector<HTMLSelectElement>('[data-testid*="search-bar-search-type"] .web_ui__Button__label')
    const searchType = (searchTypeElement?.firstChild as HTMLElement)?.id

    if (!searchType) {
      return
    }

    presenceData.smallImageKey = Assets.Search

    if (searchType === 'search-item') {
      presenceData.details = 'Searching for an item'
      presence.setActivity(presenceData)
      presenceData.state = `Tags: ${getTags().join(', ')}`
    }
    else if (searchType === 'search-user') {
      presenceData.state = 'Searching for a user'
    }
    else if (searchType === 'search-faq') {
      presenceData.state = 'Searching for an answer in the FAQ'
    }
  }
  else if (document.location.pathname.includes('/catalog')) {
    const tags = getTags()
    const category = tags[0]
    presenceData.state = 'Viewing category'
    if (category) {
      presenceData.state = `Viewing category: ${category}`
      if (tags.length > 1) {
        presenceData.details = `Viewing category: ${category}`
        tags.shift()
        presenceData.state = `Tags: ${tags.join(', ')}`
      }
    }
  }
  else if (document.location.pathname.includes('/items') && !document.location.pathname.includes('/new') && !document.location.pathname.includes('/edit')) {
    presenceData.state = 'Viewing an item'
    const itemTitle = document.querySelector<HTMLSpanElement>('span.web_ui__Text__title')?.textContent
    const summaryElement = document.querySelectorAll<HTMLDivElement>('div.summary-max-lines-4')[1]
    const summary = summaryElement ? Array.from(summaryElement.querySelectorAll<HTMLSpanElement>('span')).map(span => span.textContent?.trim()).filter(Boolean).join(' ') : ''
    const itemPrice = document.querySelector<HTMLDivElement>('div.web_ui__Text__title')?.textContent // Price of the item all taxes included
    const editButton = document.querySelector<HTMLButtonElement>('[data-testid*="item-edit-button"]')
    const isMyItem = editButton ? 'my ' : ''
    if (itemTitle) {
      presenceData.state = `Viewing ${isMyItem}item: ${itemTitle}`
      if (itemPrice) {
        presenceData.state += ` (${itemPrice})`
      }
      if (summary) {
        presenceData.details = `Viewing ${isMyItem}item: ${itemTitle}${itemPrice ? ` (${itemPrice})` : ''}`
        presenceData.state = summary
      }
    }
  }
  else if (document.location.pathname.includes('/member') && !document.location.pathname.includes('/bundles/new') && !document.location.pathname.includes('/personalization')) {
    presenceData.state = 'Viewing a user profile'
    const username = document.querySelector<HTMLAnchorElement>('h1.web_ui__Text__text')?.textContent
    if (username) {
      presenceData.state = `Viewing user profile: ${username}`
    }
    const ratingScore = getRating()
    if (ratingScore) {
      presenceData.details = `Viewing user profile: ${username}`
      presenceData.state = `Reading reviews (${ratingScore}/5⭐)`
    }

    if (document.querySelector<HTMLAnchorElement>('a.web_ui__Button__outlined')) {
      presenceData.state = `Viewing my profile: ${username}`
      if (document.location.search.includes('?tab=insights')) {
        presenceData.details = `Viewing my profile: ${username}`
        presenceData.state = 'Viewing insights'
      }
      else if (document.location.search.includes('?tab=feedback')) {
        presenceData.details = `Viewing my profile: ${username}`
        presenceData.state = 'Reading my reviews'
        if (ratingScore) {
          presenceData.state = `Reading my reviews (${ratingScore}/5⭐)`
        }
      }
    }
  }
  else if (document.location.pathname.includes('/bundles/new')) {
    presenceData.state = 'Creating a bundle'
    const bundlePrice = document.querySelector<HTMLSpanElement>('div.web_ui__Cell__image span.web_ui__Text__text')?.textContent // Price of the bundle all taxes included
    if (bundlePrice) {
      presenceData.state = `Creating a bundle (${bundlePrice})`
    }
  }
  else if (document.location.pathname.includes('/items/new')) {
    presenceData.details = 'Selling an item'
    const articleTitle = document.querySelector<HTMLInputElement>('#title')?.value
    const articlePrice = document.querySelector<HTMLInputElement>('#price')?.value
    if (articlePrice && articleTitle) {
      presenceData.state = `${articleTitle} (${articlePrice})`
    }
    else if (articleTitle) {
      presenceData.state = `${articleTitle}`
    }
    else if (articlePrice) {
      presenceData.state = `Unknown title (${articlePrice})`
    }
  }
  else if (document.location.pathname.includes('/items') && document.location.pathname.includes('/edit')) {
    presenceData.details = 'Editing an item'
    const itemTitle = document.querySelector<HTMLInputElement>('#title')?.value
    const itemPrice = document.querySelector<HTMLInputElement>('#price')?.value
    if (itemPrice && itemTitle) {
      presenceData.state = `${itemTitle} (${itemPrice})`
    }
    else if (itemTitle) {
      presenceData.state = `${itemTitle}`
    }
    else if (itemPrice) {
      presenceData.state = `Unknown title (${itemPrice})`
    }
  }
  else if (document.location.pathname.includes('/settings') || document.location.pathname.includes('/personalization')) {
    presenceData.state = 'Account settings'
  }
  else if (document.location.pathname.includes('/my_orders')) {
    presenceData.state = 'Viewing orders history'
  }
  else if (document.location.pathname.includes('/wallet/balance')) {
    presenceData.state = 'Viewing wallet balance and transactions'
  }

  if (!presenceData.state && !presenceData.details) {
    presenceData.state = 'Shopping'
  }
  presence.setActivity(presenceData)
})
