import { Assets } from 'premid'

const presence = new Presence({
  clientId: '709308577701036074',
})
const strings = presence.getStrings({
  play: 'general.playing',
  pause: 'general.paused',
  browsing: 'general.browsing',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)
const title1 = document.querySelector('body > div:nth-child(3) > div > div.col-lg-9 > div > div.panel-heading > h3')?.textContent ?? 'ไม่ทราบชื่อ'
const ep1 = document.querySelector('body > div:nth-child(3) > div > div.col-lg-9 > div > div.panel-body > center:nth-child(2) > h3')?.textContent ?? 'ไม่ทราบชื่อตอน'
const path = document.location

let video = {
  current: 0,
  duration: 0,
  paused: true,
}

presence.on(
  'iFrameData',
  (data: unknown) => {
    video = data as { current: number, duration: number, paused: boolean }
  },
)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/A/Anime-Sugoi/assets/logo.png',
  }

  // Presence
  if (path.hostname === 'anime-sugoi.com' || path.hostname.includes('www.')) {
    if (document.location.pathname === '/') {
      presenceData.startTimestamp = browsingTimestamp
      presenceData.details = 'อนิเมะอัพเดตล่าสุด'
    }
    else if (path.pathname.includes('index.html')) {
      presenceData.startTimestamp = browsingTimestamp
      presenceData.details = 'อนิเมะอัพเดตล่าสุด'
    }
    else if (path.pathname.includes('catalog')) {
      presenceData.startTimestamp = browsingTimestamp
      presenceData.details = 'หมวดหมู่ '
      presenceData.state = title1
    }
    else if (path.pathname.includes('tag')) {
      presenceData.startTimestamp = browsingTimestamp
      presenceData.details = 'หมวดหมู่ '
      presenceData.state = title1
    }
    else if (path.search.includes('search')) {
      presenceData.startTimestamp = browsingTimestamp
      presenceData.details = 'ค้นหา '
      presenceData.state = title1
    }
    else if (path.pathname.includes('play')) {
      let episode
      if (title1.includes('ตอนที่')) {
        const info = title1.split('ตอนที่')
        episode = info.pop()

        if (episode?.includes('ซับไทย'))
          episode = episode.replace('ซับไทย', '').trim()
        else if (episode?.includes('พากย์ไทย'))
          episode = episode.replace('พากย์ไทย', '').trim()

        episode = `ตอนที่ ${episode}`;
        [presenceData.state] = info
        presenceData.details = episode
      }
      else {
        let info
        if (title1.includes('ซับไทย'))
          info = title1.replace('ซับไทย', '').trim()
        else if (title1.includes('พากย์ไทย'))
          info = title1.replace('พากย์ไทย', '').trim()

        episode = 'Movie'
        presenceData.state = info
        presenceData.details = episode
      }

      presenceData.smallImageKey = video.paused ? Assets.Play : Assets.Pause
      presenceData.smallImageText = video.paused
        ? (await strings).pause
        : (await strings).play
      if (!video.paused) {
        [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(
          Math.floor(video.current),
          Math.floor(video.duration),
        )
      }
    }
    else if (path.href) {
      presenceData.startTimestamp = browsingTimestamp
      presenceData.details = 'เลือกตอน '
      presenceData.state = ep1
    }
    else {
      delete presenceData.startTimestamp
      delete presenceData.endTimestamp
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
