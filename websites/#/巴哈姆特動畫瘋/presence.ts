import { ActivityType, Assets, getTimestampsFromMedia } from 'premid'

const presence = new Presence({
  clientId: '640194732718292992',
})
const strings = presence.getStrings({
  play: 'general.playing',
  pause: 'general.paused',
  browsing: 'general.browsing',
  browseanime: 'general.buttonViewAnime',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/%23/%E5%B7%B4%E5%93%88%E5%A7%86%E7%89%B9%E5%8B%95%E7%95%AB%E7%98%8B/assets/logo.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    type: ActivityType.Watching,
  } as PresenceData

  if (document.location.hostname === 'ani.gamer.com.tw') {
    if (document.location.pathname === '/') {
      presenceData.startTimestamp = browsingTimestamp
      presenceData.details = '首頁'
    }
    else if (document.querySelector('#ani_video_html5_api')) {
      const video = document.querySelector<HTMLVideoElement>(
        '#ani_video_html5_api',
      )!;
      [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestampsFromMedia(video)
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
        presenceData.name = title?.textContent || '巴哈姆特動畫瘋'

        const score = document.querySelector<HTMLElement>(
          '.score-overall-number',
        )

        const views = document.querySelector<HTMLElement>(
          '.newanime-count span',
        )

        const image = document.querySelector<HTMLImageElement>('.data-file .data-img')?.getAttribute('data-src')
        presenceData.largeImageKey = image || ActivityAssets.Logo
        presenceData.largeImageText = 'PreMiD - 巴哈姆特動畫瘋'

        if (score && views)
          presenceData.state = `動畫瘋 | ✩${score.textContent} | ${views?.textContent}觀看`

        presenceData.buttons = [
          {
            label: (await strings).browseanime,
            url: document.location.href,
          },
        ]

        if (video.paused) {
          delete presenceData.startTimestamp
          delete presenceData.endTimestamp
        }
      }
      else if (Number.isNaN(video.duration)) {
        presenceData.startTimestamp = browsingTimestamp
        presenceData.details = (await strings).browsing
        const title = document.querySelector(
          '#BH_background > div.container-player > div.anime-title > div.anime-option > section.videoname > div.anime_name > h1',
        )
        presenceData.state = title?.textContent
        presenceData.smallImageKey = Assets.Reading
      }
    }
    else if (document.querySelector('#partyPlayer_html5_api')) {
      const video = document.querySelector<HTMLVideoElement>(
        '#partyPlayer_html5_api',
      )!;
      [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestampsFromMedia(video)
      if (!Number.isNaN(video.duration)) {
        presenceData.type = ActivityType.Watching
        presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
        presenceData.smallImageText = video.paused
          ? (await strings).pause
          : (await strings).play

        const data = document.querySelector<HTMLImageElement>(
          '.ani-play-queue-item.is-playing .img-block img',
        )

        presenceData.largeImageKey = data?.getAttribute('data-src') || ActivityAssets.Logo
        presenceData.largeImageText = 'PreMiD - 巴哈姆特動畫瘋'
        presenceData.details = data?.getAttribute('alt')
        presenceData.name = data?.getAttribute('alt') || '巴哈姆特動畫瘋'

        const onlineViewers = document.querySelector<HTMLElement>(
          '.people-count',
        )
        const queueList = document.querySelector('.ani-queue-list')
        const upcomingEpisodes = queueList ? queueList.querySelectorAll('.ani-play-queue-item').length : 0
        presenceData.state = `動畫派對 | ${onlineViewers?.textContent || ''}| ${upcomingEpisodes}集待看`

        if (video.paused) {
          delete presenceData.startTimestamp
          delete presenceData.endTimestamp
        }
      }
    }
  }

  if (!presenceData.details) {
    presenceData.startTimestamp = browsingTimestamp
    presenceData.details = (await strings).browsing
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
