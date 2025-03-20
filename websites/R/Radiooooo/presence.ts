import { Assets } from 'premid'

const presence = new Presence({
  clientId: '812656134120931330',
})
async function getStrings() {
  return presence.getStrings(
    {
      play: 'general.playing',
      pause: 'general.paused',
    },

  )
}
const browsingTimestamp = Math.floor(Date.now() / 1000)

let oldLang: string | null = null
let strings: Awaited<ReturnType<typeof getStrings>>

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/R/Radiooooo/assets/logo.png',
    details: 'Idling',
    startTimestamp: browsingTimestamp,
  }
  const audio = document.querySelector('audio')

  if (audio) {
    const { paused } = audio
    const title = document.querySelector('div.info > div.title')?.textContent
    const artist = document.querySelector(
      'div.field.artist > span:nth-child(2)',
    )?.textContent
    const place = document.querySelector('div.head > div.place')?.textContent
    const year = document.querySelector('div.head > div.year')?.textContent
    const [songDetails, songState, newLang] = await Promise.all([
      presence.getSetting<string>('song1'),
      presence.getSetting<string>('song2'),
      presence.getSetting<string>('lang').catch(() => 'en'),
    ])

    if (oldLang !== newLang || !strings) {
      oldLang = newLang
      strings = await getStrings()
    }

    presenceData.smallImageKey = paused ? Assets.Pause : Assets.Play
    presenceData.smallImageText = paused ? strings.pause : strings.play

    presenceData.details = songDetails
      .replace('%title%', title ?? '')
      .replace('%artist%', artist ?? '')
      .replace('%place%', place ?? '')
      .replace('%year%', year ?? '')
    presenceData.state = songState
      .replace('%title%', title ?? '')
      .replace('%artist%', artist ?? '')
      .replace('%place%', place ?? '')
      .replace('%year%', year ?? '');

    [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestampsfromMedia(audio)

    if (paused) {
      delete presenceData.startTimestamp
      delete presenceData.endTimestamp
    }
  }

  presence.setActivity(presenceData)
})
