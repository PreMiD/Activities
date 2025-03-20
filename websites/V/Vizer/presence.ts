import { Assets } from 'premid'

const presence = new Presence({
  clientId: '684199669424848970',
})
const strings = presence.getStrings({
  play: 'general.playing',
  pause: 'general.paused',
  search: 'general.searching',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

let iFrameVideo: boolean, currentTime: number, duration: number

interface IFrameData {
  iframeVideo: {
    iFrameVideo: boolean
    currTime: number
    dur: number | null
  }
}

presence.on('iFrameData', (inc: unknown) => {
  const data = inc as IFrameData
  if (data.iframeVideo.dur) {
    ({ iFrameVideo } = data.iframeVideo)
    currentTime = data.iframeVideo.currTime
    duration = data.iframeVideo.dur
  }
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/V/Vizer/assets/logo.png',
  }

  let title

  presenceData.startTimestamp = browsingTimestamp

  if (document.location.pathname.includes('/serie')) {
    title = document.querySelector('#lp > section > h2')

    if (title) {
      const season = document.querySelector(
        '#seasons > div > div:nth-child(2) > div > div > .owl-item.active > .item.active',
      )
      const episodeNumber = document.querySelector(
        '#episodes > div > div > div > div > .owl-item.active > div > .poster.active > .title',
      )
      const episodeName = document.querySelector(
        '#episodes > div > div > div > div > .owl-item.active > div > .poster.active > .title',
      )

      if (season) {
        if (episodeNumber && episodeName) {
          presenceData.details = title.textContent
          presenceData.state = `S${season.textContent}E${
            episodeNumber.textContent?.split('.')[0]
          } - ${episodeName.textContent?.split('.')[1]}`

          if (iFrameVideo && !Number.isNaN(duration)) {
            [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(
              Math.floor(currentTime),
              Math.floor(duration),
            )
            presenceData.smallImageKey = Assets.Play
            presenceData.smallImageText = (await strings).play
          }
          else {
            presenceData.smallImageKey = Assets.Pause
            presenceData.smallImageText = (await strings).pause
          }
        }
        else {
          presenceData.details = `Vendo temporada ${season.textContent} da série:`
          presenceData.state = title.textContent
        }
      }
      else {
        presenceData.details = 'Vendo série:'
        presenceData.state = title.textContent
      }
    }
    else {
      presenceData.details = 'Navegando pelas séries...'
    }
  }
  else if (document.location.pathname.includes('/filme')) {
    title = document.querySelector('#ms > div.wrap > section > h2')
    if (title) {
      if (
        document.querySelector('#watchMovieButton > div.tit')?.textContent
        === 'audio'
      ) {
        presenceData.details = title.textContent
        presenceData.state = `${
          document.querySelector('.year')?.textContent
        } - ${document.querySelector('.rating')?.textContent}`

        if (iFrameVideo && !Number.isNaN(duration)) {
          [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(
            Math.floor(currentTime),
            Math.floor(duration),
          )
          presenceData.smallImageKey = Assets.Play
          presenceData.smallImageText = (await strings).play
        }
        else {
          presenceData.smallImageKey = Assets.Pause
          presenceData.smallImageText = (await strings).pause
        }
      }
      else {
        presenceData.details = 'Vendo filme:'
        presenceData.state = title.textContent
      }
    }
    else {
      presenceData.details = 'Navegando pelos filmes...'
    }
  }
  else if (document.location.pathname.includes('/animes')) {
    presenceData.details = 'Navegando pelos animes...'
  }
  else if (document.location.pathname.includes('/aplicativo')) {
    presenceData.details = 'Vendo os aplicativos'
  }
  else if (document.location.pathname.includes('/pesquisar')) {
    presenceData.smallImageKey = Assets.Search
    presenceData.smallImageText = (await strings).search

    if (document.location.pathname.includes('/pesquisar/')) {
      presenceData.details = 'Procurando por:'
      presenceData.state = document.location.pathname.replace(
        '/pesquisar/',
        '',
      )
    }
    else {
      presenceData.details = 'Procurando por algo...'
    }
  }
  else if (document.location.pathname === '/') {
    presenceData.details = 'Navegando...'
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
