import { ActivityType, Assets, getTimestampsFromMedia } from 'premid'

const presence = new Presence({
  clientId: '1369465791132729425',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets { // Other default assets can be found at index.d.ts
  Logo = 'https://cdn.snipp.gg/favicon.ico',
}

presence.on('UpdateData', async () => {
  const { pathname } = document.location

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    type: ActivityType.Watching,
  }
  if (document.location.hostname.startsWith('docs.')) {
    presenceData.state = 'Reading the docs'
    presenceData.smallImageKey = Assets.Search
  }
  else if (pathname === '/upload') {
    presenceData.state = 'Uploading a file'
    presenceData.smallImageKey = Assets.Uploading
  }
  else if (pathname.includes('/discover')) {
    presenceData.state = 'Browsing discover'
    presenceData.smallImageKey = Assets.Viewing
    presenceData.buttons = [
      {
        label: 'View discover',
        url: 'https://snipp.gg/discover',
      },
    ]
    presenceData.detailsUrl = 'https://snipp.gg/discover'
  }
  else if (pathname.startsWith('/p/')) {
    const title = document.querySelector('#__next > div > div.w-full.bg-transparent.relative.z-10 > section > div > div > div.relative.flex-1.min-w-0.rounded-3xl.bg-white\\/50.dark\\:bg-\\[\\#101010\\]\\/50.backdrop-blur.shadow-lg.p-6.transition.duration-300.outline.outline-white\\/5 > div.mt-4.flex.flex-col.gap-3 > div.flex.items-start.justify-between.gap-4 > h1')
    const avatar: HTMLImageElement | null = document.querySelector('#__next > div > div.w-full.bg-transparent.relative.z-10 > section > div > div > div.relative.flex-1.min-w-0.rounded-3xl.bg-white\\/50.dark\\:bg-\\[\\#101010\\]\\/50.backdrop-blur.shadow-lg.p-6.transition.duration-300.outline.outline-white\\/5 > div.mt-4.flex.flex-col.gap-3 > div.flex.flex-col.sm\\:flex-row.sm\\:items-center.justify-between.gap-4.pt-4.border-t.border-black\\/10.dark\\:border-white\\/10 > div.flex.gap-3.items-center.min-w-0 > span > div > div > img')
    const video: HTMLVideoElement | null = document.querySelector('#__next > div > div.w-full.bg-transparent.relative.z-10 > section > div > div > div.relative.flex-1.min-w-0.rounded-3xl.bg-white\\/50.dark\\:bg-\\[\\#101010\\]\\/50.backdrop-blur.shadow-lg.p-6.transition.duration-300.outline.outline-white\\/5 > div.relative > div > video')
    // const image: HTMLImageElement | null = document.querySelector('#__next > div > div.w-full.bg-transparent.relative.z-10 > section > div > div > div.relative.flex-1.min-w-0.rounded-3xl.bg-white\\/50.dark\\:bg-\\[\\#101010\\]\\/50.backdrop-blur.shadow-lg.p-6.transition.duration-300.outline.outline-white\\/5 > div.relative > div > img')
    const author = document.querySelector('#__next > div > div.w-full.bg-transparent.relative.z-10 > section > div > div > div.relative.flex-1.min-w-0.rounded-3xl.bg-white\\/50.dark\\:bg-\\[\\#101010\\]\\/50.backdrop-blur.shadow-lg.p-6.transition.duration-300.outline.outline-white\\/5 > div.mt-4.flex.flex-col.gap-3 > div.flex.flex-col.sm\\:flex-row.sm\\:items-center.justify-between.gap-4.pt-4.border-t.border-black\\/10.dark\\:border-white\\/10 > div.flex.gap-3.items-center.min-w-0 > div > span:nth-child(2) > span > button > p')
    if (video) {
      if (!video.paused) {
        [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestampsFromMedia(video)
      }
      presenceData.details = title ? `${title.textContent}` : 'Watching a post'
      presenceData.largeImageKey = video.poster || ActivityAssets.Logo
      presenceData.buttons = [
        {
          label: 'Watch on Snipp',
          url: `https://snipp.gg${pathname}`,
        },
      ]
      presenceData.detailsUrl = `https://snipp.gg${pathname}`
    }
    else {
      presenceData.details = title ? `${title.textContent}` : 'Viewing a post'
      presenceData.largeImageKey = ActivityAssets.Logo
      presenceData.buttons = [
        {
          label: 'View on Snipp',
          url: `https://snipp.gg${pathname}`,
        },
      ]
    }
    presenceData.state = author ? `by ${author.textContent}` : 'Unknown author'
    presenceData.smallImageKey = avatar ? avatar.src : Assets.Viewing
    presenceData.buttons = [
      {
        label: 'View on Snipp',
        url: `https://snipp.gg${pathname}`,
      },
    ]
  }
  else if (pathname.includes('/gallery')) {
    presenceData.state = 'Viewing gallery'
    presenceData.smallImageKey = Assets.Viewing
    presenceData.detailsUrl = `https://snipp.gg${pathname}`
  }
  else if (pathname.includes('/u')) {
    const username = document.querySelector('#__next > div > div.w-full.bg-transparent.relative.z-10 > section > div > div.relative.rounded-3xl.bg-white\\/50.dark\\:bg-\\[\\#101010\\]\\/50.backdrop-blur.shadow-lg.overflow-hidden > div.relative.px-6.pb-6.pt-4 > div.flex.flex-col.sm\\:flex-row.sm\\:items-center.gap-3 > div.flex.flex-col.items-start.gap-3.text-left.flex-1.min-w-0.w-full > div > span > h1')
    presenceData.state = username ? `Viewing ${username.textContent}'s profile` : 'Viewing a profile'
    presenceData.smallImageKey = Assets.Viewing
    presenceData.detailsUrl = `https://snipp.gg${pathname}`
  }
  else if (pathname.includes('/settings')) {
    const subpath = pathname.replace('/settings', '')
    presenceData.state = subpath ? `Changing ${subpath.slice(1).replace(/-/g, ' ')} settings` : 'Changing settings'
    presenceData.smallImageKey = Assets.Writing
  }
  else if (pathname.includes('/about')) {
    presenceData.state = 'Reading about us'
    presenceData.smallImageKey = Assets.Reading
  }
  else if (pathname.includes('/support')) {
    presenceData.state = 'Contacting support'
    presenceData.smallImageKey = Assets.Question
  }

  // Set the activity
  if (presenceData.state) {
    presence.setActivity(presenceData)
  }
  else {
    presence.clearActivity()
  }
})
