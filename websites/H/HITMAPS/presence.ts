const presence = new Presence({
  clientId: '842704573877714974',
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/H/HITMAPS/assets/logo.png',
  }

  if (document.location.hostname === 'roulette.hitmaps.com') {
    presenceData.details = 'Playing HITMAPS™ Roulette'
    if (document.querySelector('h1')?.textContent?.includes('SELECT MISSION'))
      presenceData.state = 'Choosing a mission'
    if (document.querySelector('h1')?.textContent?.includes('CURRENT MISSION')) {
      presenceData.state = `Mission:${
        document.querySelector('h1')?.textContent?.split('CURRENT MISSION:')[1]
      }`
    }
  }
  else {
    switch (document.location.pathname) {
      case '/': {
        presenceData.details = 'Viewing home page'
        break
      }
      case '/support-the-site': {
        presenceData.details = 'Viewing donation page'
        break
      }
      case '/brand': {
        presenceData.details = 'Viewing branding page'
        break
      }
      case '/privacy-policy': {
        presenceData.details = 'Reading the privacy policy'
        break
      }
      case '/terms-of-use': {
        presenceData.details = 'Reading the terms of use'
        break
      }
    }
  }

  if (document.location.pathname.split('/games/')[1]) {
    switch (document.location.pathname.split('/games/')[1]!.split('/')[0]) {
      case 'hitman':
        presenceData.details = 'Viewing HITMAN™'
        break
      case 'hitman2':
        presenceData.details = 'Viewing HITMAN™ 2'
        break
      case 'hitman3':
        presenceData.details = 'Viewing HITMAN 3'
        break
      case 'sniper-assassin':
        presenceData.details = 'Viewing HITMAN™ 2: Sniper Assassin'
        break
      case 'absolution':
        presenceData.details = 'Viewing Hitman: Absolution'
        break
      default:
        presenceData.details = 'Viewing a game'
        break
    }
  }

  if (
    document.location.pathname.split('/games/')[1]
    && document.location.pathname.split('/')[3]
  ) {
    presenceData.state = capitaliseEachWord(
      document.location.pathname
        .split('/')[3]!
        .replace(/\d/g, '')
        .replaceAll('-', ' '),
    )

    if (document.title.includes(' | HITMAPS™')) {
      presenceData.state += ` - ${document.title.split(' | HITMAPS™')[0]}`
    }
    else if (document.location.pathname.split('/')[4]) {
      presenceData.state += ` - ${capitaliseEachWord(
        document.location.pathname.split('/')[4]!.replaceAll('-', ' '),
      )}`
    }
    if (
      document.querySelector('meta[property="og:image"]')
      && document
        .querySelector('meta[property="og:image"]')
        ?.getAttribute('content')
        ?.includes('elusive')
    ) {
      presenceData.state += ' (Elusive Target)'
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})

function capitaliseEachWord(string: string) {
  const words = string.split(' ')
  for (let i = 0; i < words.length; i++)
    words[i] = words[i]![0]!.toUpperCase() + words[i]!.substr(1)

  return words.join(' ')
}
