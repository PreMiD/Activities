import { Assets } from 'premid'

const presence = new Presence({
  clientId: '684410680392286247',
})
const strings = presence.getStrings({
  play: 'general.playing',
  pause: 'general.paused',
  search: 'general.searching',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

let iFrameVideo: boolean,
  currentTime: number,
  duration: number,
  playback: boolean

presence.on(
  'iFrameData',
  (inc: unknown) => {
    const data = inc as {
      iframeVideo: {
        duration: number
        iFrameVideo: boolean
        currentTime: number
      }
    }
    playback = !!data.iframeVideo.duration

    if (playback)
      ({ iFrameVideo, currentTime, duration } = data.iframeVideo)
  },
)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/T/TopFlix/assets/logo.png',
  }

  let title

  presenceData.startTimestamp = browsingTimestamp

  if (document.location.pathname.includes('/serie')) {
    title = document.querySelector('.bd-hd')

    if (title) {
      title = title.textContent?.replace(
        document.querySelector('.bd-hd > span')?.textContent ?? '',
        '',
      )

      const season = document.querySelector('.accordion > li.open > div')

      if (
        document
          .querySelector('.tabs > ul > li.active')
          ?.textContent
          ?.includes('Temporadas')
          && season
      ) {
        if (document.querySelector('body > .modal.fade.in')) {
          presenceData.details = title
          presenceData.state = season.textContent

          if (iFrameVideo === true && !Number.isNaN(duration)) {
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
          presenceData.details = `Vendo temporada ${season.textContent?.replace(
            'ª Temporada',
            '',
          )} da série:`
          presenceData.state = title
        }
      }
      else {
        presenceData.details = 'Vendo série:'
        presenceData.state = title
      }
    }
    else {
      presenceData.details = 'Navegando pelas séries...'
    }
  }
  else if (document.location.pathname.includes('/filme')) {
    title = document.querySelector('.bd-hd')
    if (title) {
      const year = document.querySelector('.bd-hd > span')
      let rating = document.querySelector('.rate > p > span')?.textContent
      rating = `${rating}/10`
      title = title.textContent?.replace(year?.textContent ?? '', '')

      if (document.querySelector('body > .modal.fade.in')) {
        presenceData.details = title
        presenceData.state = `${year?.textContent} - ${rating}`

        if (iFrameVideo === true && !Number.isNaN(duration)) {
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
        presenceData.state = title
      }
    }
    else {
      presenceData.details = 'Navegando pelos filmes...'
    }
  }
  else if (document.location.pathname.includes('/lancamentos')) {
    presenceData.details = 'Navegando lançamentos...'
  }
  else if (document.location.pathname.includes('/app')) {
    presenceData.details = 'Vendo os aplicativos'
  }
  else if (document.location.pathname.includes('/imdb')) {
    presenceData.details = 'Navegando IMDb...'
  }
  else if (document.location.pathname === '/') {
    presenceData.details = 'Navegando...'
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
