const presence = new Presence({
  clientId: '675322225490001924',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

let customData = false
let user: HTMLElement | null
let title: HTMLElement | null
let subtitle: HTMLElement | null
let countryrank: HTMLElement | null
let rank: HTMLElement | null
let pp: HTMLElement | null
let url: URL
let mode: number

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/O/osu%20kawata/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  customData = false

  if (document.location.pathname === '/') {
    presenceData.details = 'Home Page'
  }
  else if (document.location.pathname.includes('/leaderboard')) {
    presenceData.details = 'Browsing Leaderboard'

    url = new URL(document.location.href)
    mode = Number.parseInt(url.searchParams.get('mode') ?? '0')
    switch (mode) {
      case 1:
        presenceData.state = 'Taiko'
        break
      case 2:
        presenceData.state = 'Catch the Beat'
        break
      case 3:
        presenceData.state = 'osu!mania'
        break
      default:
        presenceData.state = 'osu! standard'
        break
    }
  }
  else if (document.location.pathname.includes('/clans')) {
    presenceData.details = 'Browsing Clans'

    url = new URL(document.location.href)
    mode = Number.parseInt(url.searchParams.get('mode') ?? '0')
    switch (mode) {
      case 1:
        presenceData.state = 'osu!taiko'
        break
      case 2:
        presenceData.state = 'osu!catch'
        break
      case 3:
        presenceData.state = 'osu!mania'
        break
      default:
        presenceData.state = 'osu!standard'
        break
    }
  }
  else if (document.location.pathname.includes('/register')) {
    presenceData.details = 'Registering account'
  }
  else if (document.location.pathname.includes('/u')) {
    user = document.querySelector(
      'body > div.ui.full.height.main.wrapper > div.h-container > div:nth-child(2) > div.ui.top.attached.segment.overflow.auto > div:nth-child(1) > div:nth-child(2) > h1',
    )
    pp = document.querySelector(
      'body > div.ui.full.height.main.wrapper > div.h-container > div:nth-child(2) > div:nth-child(5) > div > div > div:nth-child(3) > div:nth-child(1) > table > tbody > tr:nth-child(3) > td.right.aligned',
    )
    rank = document.querySelector(
      'body > div.ui.full.height.main.wrapper > div.h-container > div:nth-child(2) > div:nth-child(5) > div > div > div:nth-child(3) > div:nth-child(1) > table > tbody > tr:nth-child(1) > td.right.aligned',
    )
    subtitle = document.querySelector(
      'body > div.ui.full.height.main.wrapper > div.h-container > div:nth-child(2) > div:nth-child(5) > div > div > div:nth-child(1) > b:nth-child(2)',
    )
    countryrank = document.querySelector(
      'body > div.ui.full.height.main.wrapper > div.h-container > div:nth-child(2) > div:nth-child(5) > div > div > div:nth-child(3) > div:nth-child(1) > table > tbody > tr:nth-child(2) > td.right.aligned',
    )
    presenceData.details = `${user?.textContent}'s profile`
    presenceData.state = `${rank?.textContent} | ${pp?.textContent}pp | ${subtitle?.textContent}(${countryrank?.textContent})`
  }
  else if (document.location.pathname.includes('/c')) {
    title = document.querySelector(
      'body > div.ui.full.height.main.wrapper > div.h-container > div:nth-child(2) > div.ui.top.attached.segment.overflow.auto.aligned > div > div > h1',
    )
    pp = document.querySelector(
      'body > div.ui.full.height.main.wrapper > div.h-container > div:nth-child(2) > div:nth-child(3) > div.ui.two.column.divided.stackable.grid > div > div:nth-child(1) > table > tbody > tr:nth-child(3) > td.right.aligned',
    )
    rank = document.querySelector(
      'body > div.ui.full.height.main.wrapper > div.h-container > div:nth-child(2) > div:nth-child(3) > div.ui.two.column.divided.stackable.grid > div > div:nth-child(1) > table > tbody > tr:nth-child(2) > td.right.aligned',
    )
    subtitle = document.querySelector(
      'body > div.ui.full.height.main.wrapper > div.h-container > div:nth-child(2) > div.ui.top.attached.segment.overflow.auto.aligned > div > div > div',
    )
    presenceData.details = 'Viewing Clans'
    presenceData.state = `${title?.textContent}${subtitle?.textContent} | ${
      pp?.textContent
    }pp(${rank?.textContent})`
  }
  else if (document.location.pathname.includes('/about')) {
    presenceData.details = 'Viewing About'
  }
  else if (document.location.pathname.includes('/doc')) {
    title = document.querySelector(
      'body > div.ui.full.height.main.wrapper > div.h-container > div:nth-child(2) > div > div:nth-child(1) > h1',
    )
    presenceData.details = 'Viewing Documentation'
    presenceData.state = title?.textContent
  }
  else if (document.location.pathname === '/beatmaps') {
    presenceData.details = 'Viewing beatmaps'
  }
  else if (document.location.pathname.includes('/beatmaps/rank_request')) {
    presenceData.details = 'Viewing beatmaps'
    presenceData.state = 'Request beatmap ranking'
  }
  else if (document.location.pathname.includes('/friends')) {
    presenceData.details = 'Viewing friends'
  }
  else if (document.location.pathname.includes('/settings')) {
    presenceData.details = 'Viewing their settings'
  }

  if (!customData)
    presence.setActivity(presenceData)
})
