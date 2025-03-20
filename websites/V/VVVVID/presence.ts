import { Assets } from 'premid'

const presence = new Presence({
  clientId: '639916600031707149',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

let hour: number,
  min: number,
  sec: number,
  time: number,
  hour2: number,
  min2: number,
  sec2: number,
  time2: number,
  paused: boolean

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/V/VVVVID/assets/logo.png',
  }

  if (document.location.hostname === 'www.vvvvid.it') {
    if (
      document.querySelector(
        '#pl_controls > div.ppcontroltime > div.pptimeleft',
      ) !== null
    ) {
      hour = Number.parseInt(
        document.querySelector(
          '#pl_controls > div.ppcontroltime > div.pptimeleft > span.pphr_elp',
        )?.textContent ?? '',
      )
      min = Number.parseInt(
        document.querySelector(
          '#pl_controls > div.ppcontroltime > div.pptimeleft > span.ppmin_elp',
        )?.textContent ?? '',
      )
      sec = Number.parseInt(
        document.querySelector(
          '#pl_controls > div.ppcontroltime > div.pptimeleft > span.ppsec_elp',
        )?.textContent ?? '',
      )
      hour = hour * 60 * 60
      min = min * 60
      time = hour + min + sec

      hour2 = Number.parseInt(
        document.querySelector(
          '#pl_controls > div.ppcontroltime > div.pptimeduration > span.pphr_dur',
        )?.textContent ?? '',
      )
      min2 = Number.parseInt(
        document.querySelector(
          '#pl_controls > div.ppcontroltime > div.pptimeduration > span.ppmin_dur',
        )?.textContent ?? '',
      )
      sec2 = Number.parseInt(
        document.querySelector(
          '#pl_controls > div.ppcontroltime > div.pptimeduration > span.ppsec_dur',
        )?.textContent ?? '',
      )
      hour2 = hour2 * 60 * 60
      min2 = min2 * 60
      time2 = hour2 + min2 + sec2

      paused = document.querySelector(
        '#pl_controls > div:nth-child(1) > div.pppause.active',
      ) === null
      if (paused === true) {
        presenceData.smallImageKey = Assets.Pause
        presenceData.smallImageText = 'In pausa'
      }
      else {
        const [startTimestamp, endTimestamp] = presence.getTimestamps(
          time,
          time2,
        );
        [presenceData.startTimestamp, presenceData.endTimestamp] = [
          startTimestamp,
          endTimestamp,
        ]
        presenceData.smallImageKey = Assets.Play
        presenceData.smallImageText = 'Riproducendo'
      }

      presenceData.details = document.querySelector(
        '#player-video-info > div.player-info-container > div.player-info-publisher.player-info-show',
      )?.textContent
      presenceData.state = document.querySelector(
        '#player-video-info > div.player-info-container > div.player-info-title',
      )?.textContent
    }
    else if (document.location.pathname.includes('/show/')) {
      presenceData.startTimestamp = browsingTimestamp
      presenceData.details = 'Guardando una serie:'
      presenceData.state = document.querySelector(
        '#content-body > div.show-container.fillParent > div > div > div.show-inside-container > div.show-top-container > div.show-title',
      )?.textContent
    }
    else if (document.location.pathname.includes('/fandom')) {
      presenceData.startTimestamp = browsingTimestamp
      presenceData.details = 'Guardando un fandom:'
      presenceData.state = document.querySelector(
        '#content-body > div.show-container.fillParent > div > div > div.show-inside-container > div.show-top-container > div.show-title',
      )?.textContent
    }
    else if (document.location.pathname.includes('/profile/')) {
      presenceData.startTimestamp = browsingTimestamp
      presenceData.details = 'Visualizzando un utente:'
      presenceData.state = document.querySelector(
        '#content-body > div.profile-container-opaque.text-shadow.open > div.profile-friend-content > div > div.profile-friend-top > div.profile-friend-top-right > div.profile-friend-name-container > div',
      )?.textContent
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
