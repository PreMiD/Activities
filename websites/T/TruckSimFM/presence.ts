import { Assets } from 'premid'

const presence = new Presence({
  clientId: '640538683392655370',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/T/TruckSimFM/assets/logo.png',
  }
  // presenceData.startTimestamp = browsingTimestamp;
  const player = document.querySelector<HTMLAudioElement>('#player')
  if (!player?.paused) {
    const title = document.querySelector('#song')
    const dj = document.querySelector('#djname')
    const listeners = document.querySelector('#listeners')
    presenceData.details = title?.textContent
    presenceData.state = `DJ: ${
      dj?.textContent
    } Listeners: ${listeners?.textContent?.replace(' Listeners', '')}`
    presenceData.smallImageKey = Assets.Play
  }
  else if (document.location.pathname.includes('/recent')) {
    presenceData.startTimestamp = browsingTimestamp
    presenceData.details = 'Viewing the recently'
    presenceData.state = 'played songs'
    presenceData.smallImageKey = Assets.Reading
  }
  else if (document.location.pathname.includes('/team')) {
    presenceData.startTimestamp = browsingTimestamp
    presenceData.details = 'Viewing the staff team'
  }
  else if (document.location.pathname.includes('/request')) {
    presenceData.startTimestamp = browsingTimestamp
    presenceData.details = 'Requesting a song'
  }
  else if (document.location.pathname.includes('/applications')) {
    presenceData.startTimestamp = browsingTimestamp
    presenceData.details = 'Applying for staff'
  }
  else if (document.location.pathname.includes('/about')) {
    presenceData.startTimestamp = browsingTimestamp
    presenceData.details = 'Reading about TSFM'
    presenceData.smallImageKey = Assets.Reading
  }
  else if (document.location.pathname.includes('/schedule')) {
    presenceData.startTimestamp = browsingTimestamp
    presenceData.details = 'Viewing the schedule'
  }
  else if (document.location.pathname.includes('/convoys')) {
    presenceData.startTimestamp = browsingTimestamp
    presenceData.details = 'Viewing the convoys'
  }
  else if (document.location.pathname.includes('/streamers')) {
    presenceData.startTimestamp = browsingTimestamp
    presenceData.details = 'Viewing the streamers'
  }
  else if (document.location.pathname.includes('/partner')) {
    presenceData.startTimestamp = browsingTimestamp
    presenceData.details = 'Viewing the partners'
  }
  else if (document.location.pathname.includes('/vtc')) {
    presenceData.startTimestamp = browsingTimestamp
    presenceData.details = 'Viewing the VTC'
  }
  else if (document.location.pathname.includes('/weekly')) {
    presenceData.startTimestamp = browsingTimestamp
    presenceData.details = 'Viewing the weekly'
    presenceData.state = 'shows on TSFM'
  }
  else if (document.location.pathname.includes('/tuneoftheweek')) {
    presenceData.startTimestamp = browsingTimestamp
    presenceData.details = 'Viewing the tune'
    presenceData.state = 'of the week'
  }
  else if (document.location.pathname.includes('/contact')) {
    presenceData.startTimestamp = browsingTimestamp
    presenceData.details = 'Contacting TSR'
    presenceData.smallImageKey = Assets.Writing
  }
  else if (document.location.pathname.includes('/modifications')) {
    presenceData.startTimestamp = browsingTimestamp
    presenceData.details = 'Viewing the offical'
    presenceData.state = 'modifications list'
  }
  else if (document.location.pathname.includes('/advertisements')) {
    presenceData.startTimestamp = browsingTimestamp
    presenceData.details = 'Viewing the'
    presenceData.state = 'advertisements packages'
  }
  else if (document.location.pathname === '/') {
    presenceData.startTimestamp = browsingTimestamp
    presenceData.details = 'Browsing...'
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
