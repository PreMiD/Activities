import { Assets } from 'premid'

const presence = new Presence({
  clientId: '503557087041683458',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/D/Deno/assets/logo.png',
  NewsLogo = 'https://cdn.rcd.gg/PreMiD/websites/D/Deno/assets/0.png',
  MerchLogo = 'https://cdn.rcd.gg/PreMiD/websites/D/Deno/assets/1.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    name: 'Deno',
  }
  const { href, hostname, pathname } = document.location
  const [privacy, buttons] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('buttons'),
  ])
  const args = pathname.split('/')
  if (privacy) {
    presenceData.largeImageKey = ActivityAssets.Logo
    presenceData.details = 'Browsing'
    presence.setActivity(presenceData)
    return
  }
  if (hostname === 'deno.com') {
    presenceData.details = 'Exlporing deno.com'
    if (args[1] === '') {
      presenceData.details = 'Viewing homepage'
    }
    if (args[1] === 'blog') {
      presenceData.buttons = [
        {
          label: 'View Blog',
          url: href,
        },
      ]
      presenceData.smallImageKey = Assets.Reading
      presenceData.smallImageText = 'Reading'
      if (document.querySelector('article')) {
        presenceData.details = 'Reading an article about'
        presenceData.state = document.title
      }
      else {
        presenceData.details = 'Viewing blog posts list'
      }
    }
    if (args[1] === 'deploy') {
      presenceData.buttons = [
        {
          label: 'View The Deploy™ Page',
          url: href,
        },
      ]
      presenceData.details = 'Viewing the Deploy™ page'
      if (args[2] === 'subhosting') {
        presenceData.buttons = [
          {
            label: 'View Subhosting',
            url: href,
          },
        ]
        presenceData.details = 'Viewing the subhosting page'
      }
      if (args[2] === 'pricing') {
        presenceData.buttons = [
          {
            label: 'View Pricing',
            url: href,
          },
        ]
        presenceData.details = 'Viewing Deploy™\'s pricing'
      }
    }
  }
  if (hostname === 'docs.deno.com') {
    presenceData.buttons = [
      {
        label: 'View Documentation',
        url: href,
      },
    ]
    presenceData.details = 'Exploring Deno\'s documentation'
    if (args[1] === '') {
      presenceData.details = 'Viewing the documentation homepage'
    }
    presenceData.details = 'Viewing a documentation'
    presenceData.state = document.title
  }
  if (hostname === 'denostatus.com') {
    presenceData.buttons = [
      {
        label: 'View Deno\'s Status',
        url: href,
      },
    ]
    presenceData.details = 'Viewing deno\'s status'
  }
  if (!buttons)
    delete presenceData.buttons
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
