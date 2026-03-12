const presence = new Presence({
  clientId: '629413852391669791',
})
const presenceData: PresenceData = {
  largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/K/Kitsu/assets/logo.png',
}

const strings = presence.getStrings({
  browsing: 'general.browsing',
})

presence.on('UpdateData', async () => {
  const path = window.location.pathname

  if (path === '/' || path.startsWith('/explore')) {
    presenceData.details = (await strings).browsing
    delete presenceData.state
  }
  else if (path.includes('/users')) {
    const user = document.querySelector('.cover-username')?.textContent?.trim()
    presenceData.details = `Viewing ${user} profile`

    switch (path.split('/')[3]) {
      case 'library':
        presenceData.state = 'Viewing their library'
        break
      case 'reactions':
        presenceData.state = 'Viewing their reactions'
        break
      case 'followers':
        presenceData.state = 'Viewing their followers'
        break
      case 'following':
        presenceData.state = 'Viewing who they follow'
        break
      case 'groups':
        presenceData.state = 'Viewing their groups'
        break
      default:
        presenceData.state = 'Viewing their activity'
    }
  }
  else if (path.startsWith('/anime')) {
    presenceData.details = 'Looking through anime'
    if (path.split('/')[2]) {
      presenceData.state = `Viewing ${document
        .querySelector('h3')
        ?.textContent
        ?.trim()}`
    }
    else {
      delete presenceData.state
    }
  }
  else if (path.startsWith('/manga')) {
    presenceData.details = 'Looking through manga'
    if (path.split('/')[2]) {
      presenceData.state = `Viewing ${document
        .querySelector('h3')
        ?.textContent
        ?.trim()}`
    }
    else {
      delete presenceData.state
    }
  }
  else if (path.startsWith('/groups')) {
    presenceData.details = 'Looking through groups'
    if (path.split('/')[2]) {
      presenceData.state = `Viewing ${document
        .querySelector('.cover-username')
        ?.textContent
        ?.trim()}`
    }
    else {
      delete presenceData.state
    }
  }
  else if (path.startsWith('/feedback')) {
    presenceData.details = 'Browsing feedback section'
    switch (path.split('/')[2]) {
      case 'bugs':
        presenceData.state = 'Viewing bugs'
        break
      case 'feature-requests':
        presenceData.state = 'Viewing feature requests'
        break
      case 'database-requests':
        presenceData.state = 'Viewing database requests'
        break
      case 'mobile-bugs':
        presenceData.state = 'Viewing mobile bugs'
        break
      case 'mobile-features':
        presenceData.state = 'Viewing mobile features'
        break
      default:
        presenceData.state = 'some unknown place'
    }
  }
  else if (path.startsWith('/api')) {
    presenceData.details = 'Messing with the kitsu API'

    delete presenceData.state
  }

  presence.setActivity(presenceData, true)
})
