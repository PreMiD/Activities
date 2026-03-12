import { Assets } from 'premid'

const presence = new Presence({
  clientId: '700338425953386587',
})
const strings = presence.getStrings({
  play: 'general.playing',
  pause: 'general.paused',
  browsing: 'general.browsing',
  searching: 'general.searching',
  reading: 'general.reading',
})

function parseQueryString(queryString?: string) {
  queryString ??= window.location.search.substring(1)

  const params: { [queryKey: string]: string } = {}
  const queries = queryString.split('&')
  for (const indexQuery in queries) {
    const indexPair = indexQuery.split('=')
    params[decodeURIComponent(indexPair[0]!)] = decodeURIComponent(
      indexPair.length > 1 ? indexPair[1]! : '',
    )
  }
  return params
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/I/Issou%20TV/assets/logo.png',
  }
  const pageTitle = document.querySelector('title')?.textContent?.split(' | ') ?? []
  const browsingTimestamp = Math.floor(Date.now() / 1000)
  const route = document.location.pathname.split('/')
  const query = await parseQueryString(document.location.hash).search

  if (document.location.pathname === '/') {
    presenceData.details = (await strings).browsing
    presenceData.startTimestamp = browsingTimestamp
  }
  else if (document.location.pathname.includes('/videos/')) {
    if (document.location.pathname.includes('/category/')) {
      presenceData.details = query
        ? (await strings).searching
        : (await strings).browsing
      const routes = [
        'humour',
        'malaise',
        'game',
        'musique',
        'insolite',
        '18',
        '18-gore',
        '18-insolite',
        '18-vr',
      ]
      for (const r of routes) {
        if (route[3] === `${r}`) {
          presenceData.state = `${pageTitle?.[0]} - page ${
            route[4] ? route[5] : 1
          }`
        }
      }
      presenceData.startTimestamp = browsingTimestamp
    }
    else {
      const video = document.querySelector<HTMLVideoElement>(
        '.mejs-mediaelement > mediaelementwrapper > video',
      )!;
      [presenceData.details] = pageTitle
      presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
      presenceData.smallImageText = video.paused
        ? (await strings).pause
        : (await strings).play;
      [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(
        Math.floor(video.currentTime),
        Math.floor(video.duration),
      )
      if (video.paused) {
        delete presenceData.startTimestamp
        delete presenceData.endTimestamp
      }
    }
  }
  else if (document.location.pathname.includes('/upload')) {
    [presenceData.details] = pageTitle
    presenceData.smallImageKey = Assets.Uploading
  }
  else {
    [presenceData.details] = pageTitle
    presenceData.state = (await strings).reading
    presenceData.startTimestamp = browsingTimestamp
  }
  if (query) {
    presenceData.smallImageKey = Assets.Search
    presenceData.smallImageText = (await strings).searching
    presenceData.details = `${(await strings).searching} : ${query}`
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
