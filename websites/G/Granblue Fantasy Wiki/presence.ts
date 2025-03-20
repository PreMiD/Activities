import { Assets } from 'premid'

const presence = new Presence({
  clientId: '914354609370329098',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/G/Granblue%20Fantasy%20Wiki/assets/logo.png',
  Tierlist = 'https://cdn.rcd.gg/PreMiD/websites/G/Granblue%20Fantasy%20Wiki/assets/0.png',
  Login = 'https://cdn.rcd.gg/PreMiD/websites/G/Granblue%20Fantasy%20Wiki/assets/1.png',
  Newaccount = 'https://cdn.rcd.gg/PreMiD/websites/G/Granblue%20Fantasy%20Wiki/assets/2.png',
}

presence.on('UpdateData', () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  if (document.location.pathname === '/Main_Page') {
    presenceData.details = 'Viewing Wiki home page'
  }
  else if (document.querySelector('#wpLoginAttempt')) {
    presenceData.details = 'Logging in'
    presenceData.smallImageKey = ActivityAssets.Login
    presenceData.smallImageText = 'Logging in'
  }
  else if (document.querySelector('#wpCreateaccount')) {
    presenceData.details = 'Creating an account'
    presenceData.smallImageKey = ActivityAssets.Newaccount
    presenceData.smallImageText = 'Creating an account'
  }
  else if (document.location.pathname.startsWith('/Character_Tier_List')) {
    presenceData.details = 'Viewing the character tier list'
    presenceData.smallImageKey = ActivityAssets.Tierlist
    presenceData.smallImageText = 'Viewing tier list'
  }
  else if (document.location.pathname === '/Collection_Tracker') {
    presenceData.details = 'Making a collection tracker'
  }
  else if (document.location.pathname.startsWith('/search')) {
    presenceData.details = 'Making a collection tracker'
  }
  else if (document.querySelector('.searchresults')) {
    presenceData.details = 'Searching for:'
    presenceData.state = (
      document.querySelector('input[type=search]') as HTMLInputElement
    ).value
    presenceData.smallImageKey = Assets.Search
    presenceData.smallImageText = 'Searching'
  }
  else if (document.location.href.includes('Special:Preferences')) {
    presenceData.details = 'Editing preferences'
  }
  else if (document.location.href.includes('Special:Watchlist')) {
    presenceData.details = 'Viewing watchlist'
  }
  else if (document.location.href.includes('Special:Contributions')) {
    presenceData.details = 'Looking up contributions'
  }
  else if (document.location.href.includes('history')) {
    presenceData.details = 'Viewing revision history of:'
    presenceData.state = document.querySelector('.firstHeading')?.textContent
  }
  else if (document.location.href.includes('edit')) {
    presenceData.details = 'Editing:'
    presenceData.state = document.querySelector('.firstHeading')?.textContent
    presenceData.smallImageKey = Assets.Writing
    presenceData.smallImageText = 'Editing'
  }
  else if (document.querySelector('.firstHeading')) {
    presenceData.details = 'Viewing page:'
    presenceData.state = document.querySelector('.firstHeading')?.textContent
    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = 'Reading'
  }

  presence.setActivity(presenceData)
})
