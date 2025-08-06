import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1402290319273234462',
})

let currentPath = window.location.pathname
let browseTimestamp: number | null = null

const ActivityAssets = {
  Logo: 'https://mangadex.dev/content/images/2021/08/icon.png',
  Reading: Assets.Reading,
  Searching: Assets.Search,
}

function getChapterData() {
  const name = document.querySelector('.reader--header-manga')?.textContent?.trim()
  const chapName = document.querySelector('.reader--header-title')?.textContent?.trim()
  const chapNum = document.querySelector('.reader--meta.chapter')?.textContent?.trim()
  return {
    smallImageKey: ActivityAssets.Reading,
    details: `Reading: ${name || '...'}`,
    state: `${chapNum || ''} - ${chapName || '...'}`,
    buttons: [{ label: 'Read Chapter', url: window.location.href }],
  }
}

function getSlicedTitleData(prefix: string, label: string) {
  return {
    details: `${prefix}: ${document.title.slice(0, -11)}`,
    buttons: [{ label, url: window.location.href }],
  }
}

const routes = [
  { path: '/chapter/', data: getChapterData },
  { path: '/title/', data: () => ({ details: `Viewing title: ${document.querySelector('div.title p')?.textContent?.trim() || '...'}`, buttons: [{ label: 'View Manga', url: window.location.href }] }) },
  { path: '/titles/feed', data: () => ({ smallImageKey: ActivityAssets.Searching, details: 'Viewing Updates tab' }) },
  { path: '/titles/follows', data: () => ({ details: 'Viewing Library' }) },
  { path: '/my/history', data: () => ({ details: 'Viewing History' }) },
  { path: '/titles', data: () => ({ smallImageKey: ActivityAssets.Searching, details: 'Searching Manga' }) },
  { path: '/user/', data: () => getSlicedTitleData('Viewing User Profile', 'View User') },
  { path: '/users', data: () => ({ details: 'Finding Users', smallImageKey: ActivityAssets.Searching }) },
  { path: '/group/', data: () => getSlicedTitleData('Viewing Group', 'View Group') },
  { path: '/groups', data: () => ({ details: 'Finding Groups', smallImageKey: ActivityAssets.Searching }) },
  { path: '/settings', data: () => ({ details: 'Changing Settings' }) },
]

async function updatePresence() {
  if (!browseTimestamp) {
    presence.setActivity()
    return
  }

  const path = window.location.pathname
  const route = routes.find(r => path.includes(r.path))

  const partialData = route
    ? route.data()
    : {
        details: 'Browse MangaDex',
        state: 'Discovering new titles',
      }

  const presenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browseTimestamp,
    ...partialData,
  }

  presence.setActivity(presenceData)
}

setInterval(() => {
  if (window.location.pathname !== currentPath) {
    currentPath = window.location.pathname
    browseTimestamp = Math.floor(Date.now() / 1000)
    updatePresence()
  }
}, 1000)

browseTimestamp = Math.floor(Date.now() / 1000)
presence.on('UpdateData', updatePresence)
updatePresence()
