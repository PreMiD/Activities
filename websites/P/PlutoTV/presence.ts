import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '640292045117980713',
})
const strings = presence.getStrings({
  play: 'general.playing',
  pause: 'general.paused',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

let playing: boolean,
  paused: boolean,
  progress: number | undefined,
  lastState: string | null | undefined,
  oldTitle: string | null | undefined

lastState = null
oldTitle = null

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/P/PlutoTV/assets/logo.png',
    type: ActivityType.Watching,
  }

  if (document.location.hostname === 'pluto.tv') {
    if (document.location.pathname.includes('/live-tv/')) {
      const newProgress = document.querySelector<HTMLStyleElement>(
        '#root > div.jss1.withHeader.withGuide > div.Player__Wrapper-kxPlPT.cCxNsj > div > div > div > div.PlayerOverlay__Wrapper-kMDJbl.dZAJEx > div > div > div.VideoControls__videoControls-irCOHX.frYEBe > div.VideoControls__bottomPanel-gpACgQ.jiJGDj > div > div > div > div',
      )?.style.cssText.replace('width: ', '').replace('%;', '')

      if (lastState === newProgress && newProgress !== '0' && newProgress !== '100') {
        playing = true
        paused = true
      }
      else if (newProgress === '0' || newProgress === '100') {
        playing = false
        paused = true
      }
      else {
        lastState = newProgress
        playing = true
        paused = false
      }
      progress = Math.round(Number(newProgress))
    }

    if (playing === true && paused === false) {
      const title = document.querySelector(
        '#root > div.jss1.withHeader.withGuide > div.Player__Wrapper-kxPlPT.cCxNsj > div > div > div > div.PlayerOverlay__Wrapper-kMDJbl.dZAJEx > div > div > div.Overlay__copyWrapper-cCOfPR.dWHpCz > div.Overlay__title-kcjStc.NnGyI',
      )
      presenceData.details = title?.textContent
      presenceData.state = `${progress}% progressed`
      presenceData.smallImageKey = Assets.Play
      presenceData.smallImageText = 'Playing'
    }
    else if (playing === true && paused === true) {
      const title = document.querySelector(
        '#root > div.jss1.withHeader.withGuide > div.Player__Wrapper-kxPlPT.cCxNsj > div > div > div > div.PlayerOverlay__Wrapper-kMDJbl.dZAJEx > div > div > div.Overlay__copyWrapper-cCOfPR.dWHpCz > div.Overlay__title-kcjStc.NnGyI',
      )
      presenceData.details = title?.textContent
      presenceData.state = `${progress}% progressed`
      presenceData.smallImageKey = Assets.Play
      presenceData.smallImageText = 'Playing'
    }
    else if (document.location.pathname.includes('/on-demand/movies/')) {
      const video = document.querySelector<HTMLVideoElement>(
        '#root > div.jss1.withHeader.withGuide > div.Player__Wrapper-kxPlPT.cCxNsj > div > div > div > div.Player__VideoWrapper-iChBud.eNibdw > div > div:nth-child(1) > div > div.container.chromeless.pointer-enabled > video',
      )!
      const { currentTime, duration, paused } = video;

      [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(Math.floor(currentTime), Math.floor(duration))
      if (!Number.isNaN(duration)) {
        presenceData.smallImageKey = paused ? Assets.Pause : Assets.Play
        presenceData.smallImageText = paused
          ? (await strings).pause
          : (await strings).play

        const title = document.querySelector(
          '#root > div.jss1.withHeader.withGuide > div.Player__Wrapper-kxPlPT.ktRSHs > div > div > div > div.PlayerOverlay__Wrapper-kMDJbl.dZAJEx > div > div > div.Overlay__copyWrapper-cCOfPR.dWHpCz > div.Overlay__title-kcjStc.krcxuL',
        ) ?? document.querySelector(
          '#root > div.jss1.withHeader.withGuide > div.Player__Wrapper-kxPlPT.cCxNsj > div > div > div > div.PlayerOverlay__Wrapper-kMDJbl.dZAJEx > div > div > div.Overlay__copyWrapper-cCOfPR.dWHpCz > div.Overlay__title-kcjStc.krcxuL',
        )

        if (!title && oldTitle) {
          presenceData.details = oldTitle
        }
        else {
          presenceData.details = title?.textContent
          oldTitle = title?.textContent
        }

        if (paused) {
          delete presenceData.startTimestamp
          delete presenceData.endTimestamp
        }
      }
      else if (Number.isNaN(duration)) {
        presenceData.startTimestamp = browsingTimestamp
        presenceData.details = 'Looking at: '
        const title = document.querySelector(
          '#root > div.jss1.withHeader.withGuide > div.Player__Wrapper-kxPlPT.ktRSHs > div > div > div > div.PlayerOverlay__Wrapper-kMDJbl.dZAJEx > div > div > div.Overlay__copyWrapper-cCOfPR.dWHpCz > div.Overlay__title-kcjStc.krcxuL',
        ) ?? document.querySelector(
          '#root > div.jss1.withHeader.withGuide > div.Player__Wrapper-kxPlPT.cCxNsj > div > div > div > div.PlayerOverlay__Wrapper-kMDJbl.dZAJEx > div > div > div.Overlay__copyWrapper-cCOfPR.dWHpCz > div.Overlay__title-kcjStc.krcxuL',
        )
        if (!title && oldTitle) {
          presenceData.details = oldTitle
        }
        else {
          presenceData.details = title?.textContent
          oldTitle = title?.textContent
        }

        presenceData.smallImageKey = Assets.Reading
      }
    }
    else if (document.location.pathname.includes('/trending')) {
      presenceData.startTimestamp = browsingTimestamp
      presenceData.details = 'Viewing what\'s trending'
    }
    else if (document.location.pathname.includes('/on-demand')) {
      presenceData.details = 'Browsing on'
      presenceData.state = 'demand shows...'
      presenceData.startTimestamp = browsingTimestamp
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
