import { Assets } from 'premid'

const presence = new Presence({
  clientId: '724289548015763578',
})
const strings = presence.getStrings({
  play: 'general.playing',
  pause: 'general.paused',
  browsing: 'general.browsing',
})

let video = {
  current: 0,
  duration: 0,
  paused: true,
}

// Const thing
const browsingTimestamp = Math.floor(Date.now() / 1000)
const path = document.location

presence.on(
  'iFrameData',
  (data: unknown) => {
    video = data as typeof video
  },
)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/F/FairyAnime/assets/logo.png',
  }

  // Presence
  if (path.hostname === 'fairyanime.com' || path.hostname.includes('www.')) {
    if (document.location.pathname === '/') {
      presenceData.startTimestamp = browsingTimestamp
      presenceData.details = (await strings).browsing
    }
    else if (path.pathname.includes('watch')) {
      const title = document.querySelector(
        '#section-opt > div > div > div > div > div.movie-heading.overflow-hidden > span',
      )?.textContent ?? 'ไม่ทราบเรื่อง'
      let episode
      if (title.includes('ตอนที่')) {
        const info = title.split('ตอนที่')
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
        if (title.includes('ซับไทย'))
          info = title.replace('ซับไทย', '').trim()
        else if (title.includes('พากย์ไทย'))
          info = title.replace('พากย์ไทย', '').trim()

        episode = 'Movie'
        presenceData.state = info
        presenceData.details = episode
      }

      presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
      presenceData.smallImageText = video.paused
        ? (await strings).pause
        : (await strings).play
      if (!video.paused) {
        [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(
          Math.floor(video.current),
          Math.floor(video.duration),
        )
      }
      else {
        delete presenceData.startTimestamp
        delete presenceData.endTimestamp
      }
    }
    else {
      const ep = document.querySelector(
        '#section-opt > div > div > div > div > div.movie-heading.overflow-hidden > span',
      )
      const rate = document.querySelector('#home > p > span')
      if (!rate || !ep) {
        presenceData.startTimestamp = browsingTimestamp
        presenceData.details = (await strings).browsing
      }
      else {
        presenceData.startTimestamp = browsingTimestamp
        presenceData.details = 'เลือกตอน '
        presenceData.state = `${rate.textContent}⭐ -${ep?.textContent
          ?.replace('ตอนของ', ' ')
          .replace(/"/g, ' ')}`
      }
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
