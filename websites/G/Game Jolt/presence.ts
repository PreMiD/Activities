import { Assets } from 'premid'

const presence = new Presence({
  clientId: '633419305836347393',
})
const pages: { [k: string]: string } = {
  '/games': 'Games',
  '/login': 'Login',
  '/join': 'Register',
  '/terms': 'Terms of Use',
  '/privacy': 'Privacy Policy',
  '/cookies': 'Cookie Policy',
  '/welcome': 'Just Registered!',
  '/discover': 'Explore',
  '/client': 'Client',
  '/forums': 'Forums',
  '/notifications': 'Notifications',
  '/library': 'Game Library',
  '/dashboard/profile/edit': 'Edit Profile',
  '/settings': 'Settings',
  '/dashboard/games/add': 'Add a Game',
  '/firesides': 'Searching for a Fireside',
  '/dashboard/fireside/add': 'Staring a Fireside',
}
const creatingNow = [
  'Gathering Wood',
  'Lighting the Fire',
  'Getting the Flint & Steel',
  'Searching how to start a campfire',
  'Creating',
][Math.floor(Math.random() * (4 - 0 + 1)) + 0]

presence.on('UpdateData', async () => {
  const page = document.location.pathname
  const gameName = document.querySelector(
    '#content > div > div > div > div > header > section > div.container > div.row > div > div > h1 > a',
  ) as HTMLElement
  const author = document.querySelector(
    '#content > div > div > div > div > header > section > div.container > div.row > div > div > div > a > small',
  ) as HTMLElement
  const profile = document.querySelector(
    '#content > div > div > header > section > div > div.row > div > div > h1 > small',
  ) as HTMLElement
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/G/Game%20Jolt/assets/logo.png',
    startTimestamp: Math.floor(Date.now() / 1000),
  }

  if (page.includes('/games/tag-')) {
    const tagName = page.replace('/games/tag-', '')

    presenceData.details = 'Browsing games by tag:'
    presenceData.state = tagName[0]?.toUpperCase() + tagName.slice(1)
  }
  else if (page.includes('/dashboard/fireside/add')) {
    presenceData.details = pages[page]
    presenceData.state = creatingNow
  }
  else if (page.startsWith('/firesides') || page.startsWith('/fireside')) {
    if (page.slice('/firesides'.length) !== '') {
      const firesideOwner = document
        .querySelector('#content > div > div > div > div > h2 > small > a')
        ?.getAttribute('href')
        ?.slice(1)
      presenceData.details = `Sitting By ${firesideOwner?.slice(1)}'s Fireside`
      presenceData.state = `Fireside name: ${document
        .querySelector('#content > div > div > div > div > h2')
        ?.textContent
        ?.replace(/(\t|\n)/g, '')
        ?.replace(firesideOwner ?? '', '')
        ?.slice(13)}`
      presenceData.buttons = [
        {
          label: 'Join Them!',
          url: `https://gamejolt.com${page}`,
        },
      ]
    }
    else {
      presenceData.details = pages[page]
      presenceData.state = 'Searching'
    }
  }
  else if (
    page.includes('/games/')
    && gameName
    && gameName.textContent !== ''
  ) {
    presenceData.details = `Viewing a game${
      author && author.textContent !== '' ? ` by ${author.textContent}` : ''
    }:`
    presenceData.state = gameName.textContent?.trim()
  }
  else if (pages[page] || pages[page.slice(0, -1)]) {
    presenceData.details = 'Viewing a page:'
    presenceData.state = pages[page] || pages[page.slice(0, -1)]
  }
  else if (page.includes('/search')) {
    const fixedSearchName = document.title
      .replace(' - Game Jolt', '')
      .replace('Search results for ', '')

    presenceData.details = `Searching for${
      page.includes('/search/users')
        ? ' a user'
        : `${page.includes('/search/games') ? ' a game' : ''}`
    }:`
    presenceData.state = fixedSearchName[0]?.toUpperCase() + fixedSearchName.slice(1)
    presenceData.smallImageKey = Assets.Search
  }
  else if (profile && profile.textContent !== '') {
    presenceData.details = 'Viewing a user:'
    presenceData.state = profile.textContent
  }
  else {
    presenceData.details = 'Viewing a page:'
    presenceData.state = 'Home'
  }

  if (presenceData.details && presenceData.state)
    presence.setActivity(presenceData)
})
