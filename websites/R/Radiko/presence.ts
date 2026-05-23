import { Assets } from 'premid'

const presence = new Presence({
  clientId: '736620343279484959',
})
async function getStrings() {
  return presence.getStrings(
    {
      play: 'general.playing',
      pause: 'general.paused',
      browsing: 'general.browsing',
    },

  )
}
let strings: Awaited<ReturnType<typeof getStrings>>
// Pre-declare variable
let oldLang: string | null = null
let radioStation = ''
let startTimeStamp = Date.now()

presence.on('UpdateData', async () => {
  const [codeChannel] = document.location.hash.split('/').slice(-1)
  // code
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/R/Radiko/assets/logo.png',
    buttons: [
      { label: `Listen to ${codeChannel}`, url: document.location.href },
    ],
  }
  const [newLang, isTimeVisible] = await Promise.all([
    presence.getSetting<string>('lang').catch(() => 'en'),
    presence.getSetting<boolean>('isTimeVisible'),
  ])
  if (oldLang !== newLang || !strings) {
    oldLang = newLang
    strings = await getStrings()
  }
  // In Radio
  if (
    (document.querySelector('#stream-player') as HTMLElement).style.display
    === 'block'
  ) {
    // If play
    if (document.querySelector('.icon--play-02')?.classList.contains('on')) {
      // This logic make timestamp can't changed.
      if (codeChannel && codeChannel !== radioStation) {
        radioStation = codeChannel
        startTimeStamp = Date.now()
      }

      presenceData.details = `Listening to ${radioStation} channel.`
      presenceData.state = document.querySelector(
        '#now-programs-list > h1',
      )?.textContent
      presenceData.smallImageKey = Assets.Play
      presenceData.smallImageText = strings.play
      presenceData.startTimestamp = isTimeVisible ? startTimeStamp : null
    }
    else {
      // If pause
      if (codeChannel !== '___PAUSED___') {
        radioStation = '___PAUSED___'
        startTimeStamp = Date.now()
      }

      presenceData.details = 'Paused.'
      presenceData.state = `${codeChannel} channel.`
      presenceData.smallImageKey = Assets.Pause
      presenceData.smallImageText = strings.pause
    }
  }
  else {
    // Idling state
    presenceData.details = 'Idling'
    presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/R/Radiko/assets/0.png'
    presenceData.smallImageText = strings.browsing
  }

  presence.setActivity(presenceData)
})
