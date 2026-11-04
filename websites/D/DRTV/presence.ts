import { ActivityType, Assets, getTimestampsFromMedia } from 'premid'
import { get, getVideoDetails } from './helpers.js'

const presence = new Presence({
  clientId: '1567024687127470111',
})

async function getStrings() {
  return presence.getStrings({
    play: 'general.playing',
    pause: 'general.paused',
    browsingCategories: 'drtv.browsing.categories',
    browsingCategory: 'drtv.browsing.category',
    browsingGenerally: 'drtv.browsing.general',
    discordWatch: 'drtv.discord.watch',
    myList: 'drtv.myList',
    profile: 'drtv.profile',
    searching: 'drtv.searching',
    showsMetadata: 'drtv.show.metadata',
    showsDetails: 'drtv.show.viewDetails',
    tvGuide: 'drtv.tvGuide',
  })
}

enum ActivityAssets {
  'DRTV' = '1567306342195003476',
  'DR1' = '1567303667898650705',
  'DR2' = '1567304723508240466',
  'P3' = '1567372675188396132',
  'DR Minisjang' = '1567373345991819304',
  'DR Ramasjang' = '1567307279923945543',
  'DR Ultra' = '1567308017840685116',
  'TVA' = '1567308533668515930',
  'DRTV Ekstra' = '1567320193544487054',
  'DR Gensyn' = '1567373120761761812',
}

presence.on('UpdateData', async () => {
  const path = location.pathname.slice(6).split('/')[0]
  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    largeImageKey: ActivityAssets.DRTV,
  }
  const strings = await getStrings()
  const video = get('#drtv_videojs_html5_api') as HTMLVideoElement | undefined

  if (video) {
    const data = getVideoDetails()
    const { paused } = video
    const [startTimestamp, endTimestamp] = getTimestampsFromMedia(video)

    presenceData.name = data.title.includes('TVA')
      ? 'TVA'
      : data.channel
        ?? data.title
    presenceData.details = data.channel
      ? data.title
      : data.episodeName
        ?? data.title
    presenceData.state = data.season
      ? strings.showsMetadata
          .replace('{0}', data.season)
          .replace('{1}', data.episode!)
      : data.episodeName
    presenceData.largeImageKey = (ActivityAssets as any)[
      data.title.includes('TVA')
        ? 'TVA'
        : data.channel
          ?? 'DRTV'
    ]
    presenceData.largeImageText = data.title
    if (!data.channel) {
      if (paused) {
        presenceData.smallImageKey = Assets.Pause
      }
      else {
        presenceData.startTimestamp = startTimestamp
        presenceData.endTimestamp = endTimestamp
      }
    }
    if (data.channel) {
      presenceData.smallImageKey = ActivityAssets.DRTV
      presenceData.smallImageText = 'DRTV'
    }
    presenceData.buttons = [
      {
        label: strings.discordWatch,
        url: window.location.href.split('?')[0]!,
      },
    ]
  }

  if (get('.item-detail')) {
    presenceData.details = strings.showsDetails
    presenceData.state = get('.page h1')!.textContent
  }

  if (get('.list-pg')) {
    presenceData.details = strings.browsingCategories
  }

  if (get('.pg-category')) {
    presenceData.details = strings.browsingCategory
      .replace('{0}', document.title.split(' - ')[0]!)
  }

  if (path === 'tv-guide') {
    presenceData.details = strings.tvGuide
  }

  if (path === 'mit-indhold') {
    presenceData.details = strings.myList
  }

  if (get('#profile-header')) {
    presenceData.details = strings.profile
  }

  if (path === 'soeg') {
    presenceData.details = strings.searching
  }

  if (presenceData.details) {
    presence.setActivity(presenceData)
  }
  else {
    presenceData.details = strings.browsingGenerally
    presence.setActivity(presenceData)
  }
})
