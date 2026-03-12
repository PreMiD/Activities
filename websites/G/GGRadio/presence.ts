import { Assets } from 'premid'

const presence = new Presence({
  clientId: '730052820459454496',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/G/GGRadio/assets/logo.png',
  }
  const [format1, format2, elapsed, format, info, dj] = await Promise.all([
    presence.getSetting<string>('sFormatNoDj1'),
    presence.getSetting<string>('sFormatNoDj2'),
    presence.getSetting<boolean>('tElapsed'),
    presence.getSetting<string>('sFormat'),
    presence.getSetting<boolean>('sInfo'),
    presence.getSetting<boolean>('sDj'),
  ])

  if (elapsed)
    presenceData.startTimestamp = browsingTimestamp

  if (document.location.pathname.includes('/player')) {
    const title = document.querySelector('#title')?.textContent
    const artist = document.querySelector('#artist')?.textContent
    let djType = document
      .querySelector('#presenter-text')
      ?.textContent
      ?.replace('Currently playing: ', '')

    if (dj) {
      presenceData.details = format
        .replace('%song%', title ?? '')
        .replace('%artist%', artist ?? '')

      if (djType === '')
        djType = 'AutoDJ'

      presenceData.state = djType === 'AutoDJ'
        ? 'No DJ Currently Playing'
        : `Current DJ: ${djType}`
    }
    else {
      presenceData.details = format1
        .replace('%song%', title ?? '')
        .replace('%artist%', artist ?? '')
      presenceData.state = format2
        .replace('%song%', title ?? '')
        .replace('%artist%', artist ?? '')
    }

    presenceData.smallImageKey = document.querySelector('#play') !== null ? Assets.Pause : Assets.Play

    if (title === 'Welcome back!') {
      presenceData.details = 'Loading player...'
      delete presenceData.state
      delete presenceData.smallImageKey
    }
  }
  else if (info) {
    if (document.location.pathname.includes('/downloads')) {
      presenceData.details = 'Viewing the downloads'
    }
    else if (document.location.pathname.includes('/team')) {
      presenceData.details = 'Viewing the team'
    }
    else if (document.location.pathname.includes('/community')) {
      const title = document.querySelector(
        '#top > div.p-body > div > div.p-body-header > div.p-title > h1',
      )?.textContent

      if (title !== 'GGRadio') {
        presenceData.details = 'Forums - Viewing category:'
        presenceData.state = title
      }
      else {
        presenceData.details = 'Forums - Browsing...'
      }
    }
    else if (document.location.pathname.includes('/threads')) {
      presenceData.details = 'Forums - Reading thread:'
      presenceData.state = document.querySelector(
        '#top > div.p-body > div > div.p-body-header > div.p-title',
      )?.textContent
      presenceData.smallImageKey = Assets.Reading
    }
    else if (document.location.pathname.includes('/members')) {
      presenceData.details = 'Forums - Viewing member:'
      presenceData.state = document.querySelector(
        '#top > div.p-body > div > div.p-body-main > div > div > div > div > div > div > div.memberHeader-main > div > h1',
      )?.textContent
      presenceData.smallImageKey = Assets.Reading
    }
    else if (document.location.pathname.includes('/account')) {
      presenceData.details = 'Viewing their account'
      presenceData.smallImageKey = Assets.Reading
    }
    else if (document.location.pathname === '/') {
      presenceData.details = 'Browsing...'
    }
  }
  else {
    presenceData.details = 'Browsing...'
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
