import { Assets } from 'premid'

const presence = new Presence({
  clientId: '503557087041683458',
})

presence.on('UpdateData', () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/D/Drama/assets/logo.png',
    smallImageKey: Assets.Search,
    smallImageText: 'Looking for a thread',
    details: 'Looking for drama!',
    state: 'Browsing',
    name: 'Drama',
  }

  switch (true) {
    case document.location.pathname.includes('/d/'):
      presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/D/Drama/assets/logo.png'
      presenceData.smallImageKey = Assets.Reading
      presenceData.smallImageText = 'Reading a thread'
      presenceData.details = `Viewing Thread: ${
        document.querySelector('h2.DiscussionHero-title')?.textContent
      }`
      presenceData.state = `${
        document.querySelector('span.Scrubber-index')?.textContent
      } / ${document.querySelector('span.Scrubber-count')?.textContent} Posts`
      presenceData.buttons = [
        {
          label: 'View Post',
          url: `${document.URL}`,
        },
      ]
      break
    case document.location.pathname.includes('/u/'):
      presenceData.smallImageKey = Assets.Reading
      presenceData.smallImageText = 'Viewing a profile'
      presenceData.details = `Viewing Profile: ${document.URL.split('/')[4]}`
      presenceData.state = `Posts: ${
        document.querySelector('span.Button-badge')?.textContent
      } `
      break
    case document.location.pathname.includes('/meta'):
      presenceData.smallImageKey = Assets.Search
      presenceData.smallImageText = 'Looking for a thread'
      presenceData.details = 'Looking for drama!'
      presenceData.state = 'Looking at meta threads'
      break
    case document.location.pathname.includes('/resolved'):
      presenceData.smallImageKey = Assets.Search
      presenceData.smallImageText = 'Looking for a thread'
      presenceData.details = 'Looking for drama!'
      presenceData.state = 'Looking at resolved threads'
      break
    case document.location.pathname.includes('/confirmed'):
      presenceData.smallImageKey = Assets.Search
      presenceData.smallImageText = 'Looking for a thread'
      presenceData.details = 'Looking for drama!'
      presenceData.state = 'Looking at confirmed threads'
      break
    case document.location.pathname.includes('/discussion'):
      presenceData.smallImageKey = Assets.Search
      presenceData.smallImageText = 'Looking for a thread'
      presenceData.details = 'Looking for drama!'
      presenceData.state = 'Looking at discussions'
      break
    case document.location.pathname.includes('/users'):
      presenceData.smallImageKey = Assets.Search
      presenceData.smallImageText = 'Looking at all users'
      presenceData.details = 'Looking for drama!'
      presenceData.state = 'Looking at all users'
      break
    case document.location.pathname.includes('/trinkets'):
      presenceData.smallImageKey = Assets.Search
      presenceData.smallImageText = 'Looking at trinkets'
      presenceData.details = 'Looking for drama!'
      presenceData.state = 'Looking at trinkets'
      break
    case document.querySelector('div.Composer.visible') !== null:
      presenceData.smallImageKey = Assets.Reading
      presenceData.smallImageText = 'Writing a thread'
      presenceData.details = 'Starting some drama!'
      presenceData.state = 'Writing a post'
      break
    default:
      presenceData.smallImageKey = Assets.Search
      presenceData.smallImageText = 'Looking for a thread'
      presenceData.details = 'Looking for drama!'
      presenceData.state = 'Browsing'
      break
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
