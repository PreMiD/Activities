import { Assets } from 'premid'

const presence = new Presence({
  clientId: '613628090219757599',
})
const timeElapsed = Math.floor(Date.now() / 1000)
let stationStatus,
  listeningCheck: boolean

presence.on('UpdateData', async () => {
  switch (document.location.pathname) {
    case '/player': {
      const otherListeners = document.querySelector(
        'html > body > #playerContent > #about > div > div.col-sm-12 > h4 > small',
      )
      if (
        !document.querySelector(
          'html > body > #playerContent > #about > div.row > div.col-sm-12 > div.sm2-bar-ui.textured.full-width.playing',
        )
      ) {
        stationStatus = 'Paused on PVFM One'
        listeningCheck = false
      }
      else {
        stationStatus = `Listening on PVFM One with${otherListeners?.textContent} others`
        listeningCheck = true
      }
      const onAir = document.querySelector(
        'html > body > div#playerContent.content > div#about.container.ng-scope > div.row > div.col-sm-12 > h3#mane_onair.ng-binding',
      )
      if (!listeningCheck) {
        presence.setActivity({
          details: stationStatus,
          largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/P/PonyvilleFM/assets/logo.png',
          smallImageKey: Assets.Pause,
        })
      }
      else {
        const presenceData: PresenceData = {
          details: stationStatus,
          state: `On air: ${onAir?.textContent}`,
          largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/P/PonyvilleFM/assets/logo.png',
          smallImageKey: Assets.Play,
          startTimestamp: timeElapsed,
        }
        presence.setActivity(presenceData)
      }

      break
    }
    case '/player/two': {
      const otherListeners = document.querySelector(
        'html > body > #playerContent > #about > div > div.col-sm-12 > h4 > small',
      )
      if (
        !document.querySelector(
          'html > body > #playerContent > #about > div.row > div.col-sm-12 > div.sm2-bar-ui.textured.full-width.playing',
        )
      ) {
        stationStatus = 'Paused on PVFM Two'
        listeningCheck = false
      }
      else {
        stationStatus = `Listening on PVFM Two with${otherListeners?.textContent} others`
        listeningCheck = true
      }
      const onAir = document.querySelector(
        'html > body > div#playerContent.content > div#about.container.ng-scope > div.row > div.col-sm-12 > h3',
      )
      if (!listeningCheck) {
        presence.setActivity({
          details: stationStatus,
          largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/P/PonyvilleFM/assets/logo.png',
          smallImageKey: Assets.Pause,
        })
      }
      else {
        const presenceData: PresenceData = {
          details: stationStatus,
          state: `On air: ${onAir?.textContent}`,
          largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/P/PonyvilleFM/assets/logo.png',
          smallImageKey: Assets.Play,
          startTimestamp: timeElapsed,
        }
        presence.setActivity(presenceData)
      }

      break
    }
    case '/player/free': {
      const otherListeners = document.querySelector(
        'html > body > #playerContent > #about > div > div.col-sm-12 > h4 > small',
      )
      if (
        !document.querySelector(
          'html > body > #playerContent > #about > div.row > div.col-sm-12 > div.sm2-bar-ui.textured.full-width.playing',
        )
      ) {
        stationStatus = 'Paused on PVFM Free'
        listeningCheck = false
      }
      else {
        stationStatus = `Listening on PVFM Free with${otherListeners?.textContent} others`
        listeningCheck = true
      }
      const onAir = document.querySelector(
        'html > body > div#playerContent.content > div#about.container.ng-scope > div.row > div.col-sm-12 > h3',
      )
      if (!listeningCheck) {
        presence.setActivity({
          details: stationStatus,
          largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/P/PonyvilleFM/assets/logo.png',
          smallImageKey: Assets.Pause,
        })
      }
      else {
        const presenceData: PresenceData = {
          details: stationStatus,
          state: `On air: ${onAir?.textContent}`,
          largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/P/PonyvilleFM/assets/logo.png',
          smallImageKey: Assets.Play,
          startTimestamp: timeElapsed,
        }
        presence.setActivity(presenceData)
      }

      break
    }
  }
})
