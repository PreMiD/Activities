import { Assets } from 'premid'

const presence = new Presence({
  clientId: '503557087041683458',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/A/Armorgames/assets/logo.png',
    startTimestamp: browsingTimestamp,
    name: 'Armorgames',
  }
  const { pathname, href } = window.location
  const buttons = await presence.getSetting('buttons')
  const search = document.querySelector<HTMLInputElement>('[id="search-input"]')
  if (search?.value || pathname.includes('/search')) {
    presenceData.details = 'Searching for'
    if (
      document.querySelector<HTMLInputElement>('[class="input-xlarge"]')?.value
    ) {
      presenceData.state = document.querySelector<HTMLInputElement>(
        '[class="input-xlarge"]',
      )?.value
    }
    else if (search?.value) {
      presenceData.state = search?.value
    }
    else {
      delete presenceData.details
    }

    presenceData.smallImageKey = Assets.Search
  }
  else if (pathname === '/') {
    presenceData.details = 'Viewing the Home page'
  }
  else if (pathname.includes('/category/')) {
    if (pathname === '/category/all') {
      presenceData.details = 'Viewing All Categories'
    }
    else {
      presenceData.details = 'Viewing Category'
      presenceData.state = document.querySelector(
        '#content-canvas > div.cap > div > h2 > a > span',
      )?.textContent
      presenceData.buttons = [{ label: 'View Category', url: href }]
    }
  }
  else if (pathname === '/community') {
    presenceData.details = 'Viewing the forums'
  }
  else if (pathname.includes('/forum/')) {
    presenceData.details = 'Viewing forum'
    presenceData.state = document
      .querySelector('#content-canvas > main > h1')
      ?.textContent
      ?.replace('Forums → ', '')
    presenceData.buttons = [{ label: 'View Forum', url: href }]
  }
  else if (pathname.includes('thread')) {
    presenceData.details = 'Reading a forum thread'
    presenceData.state = document.querySelector('#thread-title')?.textContent
    presenceData.buttons = [{ label: 'View Thread', url: href }]
  }
  else if (pathname.includes('/user/')) {
    presenceData.details = 'Viewing a user\'s profile'
    presenceData.state = document.querySelector('#user-data > h1')?.textContent
    presenceData.buttons = [{ label: 'View Profile', url: href }]
  }
  else if (pathname.includes('/author/')) {
    presenceData.details = 'Viewing games created by'
    presenceData.state = document.querySelector(
      '#categorylisting > h2 > a',
    )?.textContent
    presenceData.buttons = [{ label: 'View Profile', url: href }]
  }
  else if (pathname.includes('/register')) {
    presenceData.details = 'Registering'
  }
  else if (pathname.includes('/settings')) {
    presenceData.details = 'Viewing'
    presenceData.state = `${
      document.querySelector('[class="active"]')?.textContent
    } settings`
  }
  else if (pathname.includes('/games/')) {
    presenceData.details = 'Browsing'
    presenceData.state = 'All Games'
    presenceData.buttons = [{ label: 'Browse Games', url: href }]
  }
  else if (pathname.includes('game')) {
    presenceData.details = 'Playing'
    presenceData.state = document.querySelector(
      '#content-canvas > section.game-header.clearfix > h1',
    )?.textContent
    presenceData.buttons = [{ label: 'Play Game', url: href }]
  }
  else {
    presenceData.details = 'Page Not Found'
  }

  if (!buttons)
    delete presenceData.buttons
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
