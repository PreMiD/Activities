import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '640194732718292992',
})
const strings = presence.getStrings({
  play: 'general.playing',
  pause: 'general.paused',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/%23/%E5%B7%B4%E5%93%88%E5%A7%86%E7%89%B9%E5%8B%95%E7%95%AB%E7%98%8B/assets/logo.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    type: ActivityType.Playing,
    largeImageKey: ActivityAssets.Logo,
  } as PresenceData

  if (document.location.hostname === 'ani.gamer.com.tw') {
    if (document.location.pathname === '/') {
      presenceData.startTimestamp = browsingTimestamp
      presenceData.details = 'Viewing home page'
    }
    else if (document.querySelector('#ani_video_html5_api')) {
      const video = document.querySelector<HTMLVideoElement>(
        '#ani_video_html5_api',
      )!;
      [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestampsfromMedia(video)
      if (!Number.isNaN(video.duration)) {
        presenceData.type = ActivityType.Watching
        presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
        presenceData.smallImageText = video.paused
          ? (await strings).pause
          : (await strings).play

        const title = document.querySelector<HTMLElement>(
          '#BH_background > div.container-player > div.anime-title > div.anime-option > section.videoname > div.anime_name > h1',
        )
        presenceData.details = title?.textContent

        const user = document.querySelector<HTMLElement>(
          '#BH_background > div.container-player > div.anime-title > div.anime-option > section.videoname > div.anime_name > div > p',
        )

        if (user)
          presenceData.state = user.textContent

        if (video.paused) {
          delete presenceData.startTimestamp
          delete presenceData.endTimestamp
        }
      }
      else if (Number.isNaN(video.duration)) {
        presenceData.startTimestamp = browsingTimestamp
        presenceData.details = 'Looking at: '
        const title = document.querySelector(
          '#BH_background > div.container-player > div.anime-title > div.anime-option > section.videoname > div.anime_name > h1',
        )
        presenceData.state = title?.textContent
        presenceData.smallImageKey = Assets.Reading
      }
    }
    else if (document.location.pathname.includes('/animeList')) {
      presenceData.startTimestamp = browsingTimestamp
      presenceData.details = 'Viewing all animes'
    }
  }

  if (!presenceData.details) {
    presenceData.startTimestamp = browsingTimestamp
    presenceData.details = 'Viewing page:'
    presenceData.state = document
      .querySelector('head > title')
      ?.textContent
      ?.replace(' - 巴哈姆特動畫瘋', '')
    presence.setActivity(presenceData)
  }
  else {
    presence.setActivity(presenceData)
  }
})
