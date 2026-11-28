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
    browsingList: 'drtv.browsing.list',
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
  'DRTV' = 'https://i.imgur.com/6u7cW8Z.png',
  'DR1' = 'https://i.imgur.com/TRW8PoU.png',
  'DR2' = 'https://i.imgur.com/Yrd7f2z.png',
  'P3' = 'https://i.imgur.com/zM2jlnL.png',
  'DR Minisjang' = 'https://i.imgur.com/OFjbT46.png',
  'DR Ramasjang' = 'https://i.imgur.com/DazDSly.png',
  'DR Ultra' = 'https://i.imgur.com/gPFRbbe.png',
  'TVA' = 'https://i.imgur.com/uutKhqP.png',
  'DRTV Ekstra' = 'https://i.imgur.com/zLYdpY1.png',
  'DR Gensyn' = 'https://i.imgur.com/kfAwYqJ.png',
}

presence.on('UpdateData', async () => {
  if (!document.location.pathname.includes('/drtv')) {
    return
  }

  const path = document.location.pathname.slice(6).split('/')[0]
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

    presenceData.name = data.title
    presenceData.details = data.episodeName || data.title
    // presenceData.state = data.episodeName
    // presenceData.largeImageKey = ActivityAssets.DRTV
    // presenceData.largeImageText = data.title

    if (data.season) {
      presenceData.state = strings.showsMetadata
        .replace('{0}', data.season)
        .replace('{1}', data.episode!)
    }

    if (data.channel) {
      presenceData.name = data.channel
      presenceData.details = data.title
      presenceData.state = data.episodeName
      presenceData.smallImageKey = ActivityAssets.DRTV
      presenceData.smallImageText = 'DRTV'
      presenceData.largeImageKey = (ActivityAssets as any)[data.channel]
    }
    else {
      if (paused) {
        presenceData.smallImageKey = Assets.Pause
        presenceData.smallImageText = strings.pause
      }
      else {
        presenceData.startTimestamp = startTimestamp
        presenceData.endTimestamp = endTimestamp
      }
    }

    if (data.title?.includes('TVA')) {
      presenceData.name = 'TVA'
      presenceData.largeImageKey = ActivityAssets.TVA
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
    const title = get('.page h1')
    if (title) {
      presenceData.details = strings.browsingList
      presenceData.state = title.textContent
    }
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
