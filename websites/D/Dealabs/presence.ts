import type { DealabsSettings, Resolver, Translation } from './util/interfaces.js'
import { ActivityType } from 'premid'
import dealResolver from './sources/deal.js'
import discussionResolver from './sources/discussion.js'
import groupResolver from './sources/group.js'
import listingResolver from './sources/listing.js'
import merchantResolver from './sources/merchant.js'

const presence = new Presence({
  clientId: '1456698196767277128',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/D/Dealabs/assets/logo.png',
}

presence.on('UpdateData', async () => {
  const settings: DealabsSettings = {
    privacyMode: await presence.getSetting('privacyMode'),
    hideDealTitles: await presence.getSetting('hideDealTitles'),
    hideDiscussionTitles: await presence.getSetting('hideDiscussionTitles'),
    hideImages: await presence.getSetting('hideImages'),
    hidePrices: await presence.getSetting('hidePrices'),
  }

  const strings = await presence.getStrings({
    navigating: 'dealabs.navigating',
    hunting: 'dealabs.hunting',
    viewDeal: 'dealabs.viewDeal',
    onDealabs: 'dealabs.onDealabs',
    onForum: 'dealabs.onForum',
    readDiscuss: 'dealabs.readDiscuss',
    searchCode: 'dealabs.searchCode',
    viewCodes: 'dealabs.viewCodes',
    browseDiscuss: 'dealabs.browseDiscuss',
    detail: 'dealabs.detail',
    free: 'dealabs.free',
    hiddenDeal: 'dealabs.hiddenDeal',
    hiddenTopic: 'dealabs.hiddenTopic',
    viewPage: 'dealabs.viewPage',
    exploreCat: 'dealabs.exploreCat',
    homepage: 'dealabs.homepage',
    forYou: 'dealabs.forYou',
    searchDeal: 'dealabs.searchDeal',
    newDeals: 'dealabs.newDeals',
    hotDeals: 'dealabs.hotDeals',
    topDeals: 'dealabs.topDeals',
    searching: 'dealabs.searching',
    searchingEllipsis: 'dealabs.searchingEllipsis',
    unknown: 'dealabs.unknown',
    unknownCategory: 'dealabs.unknownCategory',
  })

  const t = strings as unknown as Translation

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    type: ActivityType.Watching,
    details: strings.navigating,
    state: strings.hunting,
  }

  const pathname = document.location.pathname

  if (settings.privacyMode) {
    if (pathname.includes('/bons-plans/') || pathname.includes('/codes-promo/')) {
      presenceData.details = strings.viewDeal
      presenceData.state = strings.onDealabs
    }
    else if (pathname.includes('/discussions/') || pathname.includes('/groupe/')) {
      presenceData.details = strings.onForum
      presenceData.state = strings.readDiscuss
    }
    else {
      presenceData.details = strings.navigating
      presenceData.state = strings.hunting
    }
    presence.setActivity(presenceData)
    return
  }

  const resolvers: Resolver[] = [
    merchantResolver,
    dealResolver,
    discussionResolver,
    groupResolver,
    listingResolver,
  ]

  const activeResolver = resolvers.filter(r => r.isActive(pathname))[0]

  if (activeResolver) {
    const state = activeResolver.getState(t, settings)
    const details = activeResolver.getDetails(t, settings)

    if (state)
      presenceData.state = state
    if (details)
      presenceData.details = details

    if (!settings.hideImages && activeResolver.getLargeImage) {
      const img = activeResolver.getLargeImage()
      if (img)
        presenceData.largeImageKey = img
    }

    if (activeResolver.getButtons) {
      presenceData.buttons = activeResolver.getButtons(t)
    }

    presenceData.smallImageKey = ActivityAssets.Logo
    presenceData.smallImageText = 'Dealabs'
  }

  if (!presenceData.state || (typeof presenceData.state === 'string' && presenceData.state.length < 2)) {
    presenceData.state = strings.hunting
  }
  if (!presenceData.details || (typeof presenceData.details === 'string' && presenceData.details.length < 2)) {
    presenceData.details = strings.onDealabs
  }

  presence.setActivity(presenceData)
})
