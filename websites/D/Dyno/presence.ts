import { Assets } from 'premid'

const presence = new Presence({
  clientId: '633801594541965334',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/D/Dyno/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }

  if (document.location.pathname.includes('/bot')) {
    presenceData.details = 'Reading about the bot'
    presenceData.smallImageKey = Assets.Reading
  }
  else if (document.location.pathname.includes('/account')) {
    presenceData.details = 'Viewing their account'
  }
  else if (document.location.pathname.includes('/manage/')) {
    presenceData.details = 'Managing the settings of'
    const title = document.querySelector(
      '#dashboard-mount > div > div.column.nav-sidebar > aside > div.guild-header > h3 > div > div',
    )
    presenceData.state = `server: ${title?.textContent}`
    presenceData.smallImageKey = Assets.Writing
  }
  else if (document.location.pathname.includes('/servers')) {
    presenceData.details = 'Browsing through the'
    presenceData.state = 'server listings'
  }
  else if (document.location.pathname.includes('/commands')) {
    presenceData.details = 'Viewing all the commands'
  }
  else if (document.location.pathname.includes('faq')) {
    presenceData.details = 'Reading the FAQ'
    presenceData.smallImageKey = Assets.Reading
  }
  else if (document.location.pathname.includes('/status')) {
    presenceData.details = 'Viewing the status'
  }
  else if (document.location.pathname.includes('/upgrade')) {
    presenceData.details = 'Viewing Dyno Premium Plans'
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
