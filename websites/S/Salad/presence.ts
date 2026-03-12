import { Assets } from 'premid'

const presence = new Presence({
  clientId: '911546577485725706',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/S/Salad/assets/0.gif',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const privacy = await presence.getSetting<boolean>('privacy')
  const { hostname, pathname } = document.location

  if (hostname.startsWith('support')) {
    if (pathname.includes('troubleshooting')) {
      presenceData.state = 'Troubleshooting'
    }
    else if (pathname.includes('app-guides')) {
      presenceData.state = 'App guides'
    }
    else if (pathname.includes('faq')) {
      presenceData.state = 'The faq'
    }
    else if (pathname.includes('company')) {
      presenceData.state = 'Company'
    }
    else if (pathname.includes('article')) {
      presenceData.details = privacy
        ? 'Support - reading an article'
        : 'Support - Reading article'
      presenceData.state = document.querySelector('.title')?.textContent
      presenceData.smallImageKey = Assets.Reading
    }
    else if (pathname.includes('category')) {
      presenceData.details = privacy
        ? 'Support - viewing an article category'
        : 'Support - viewing article category'
      presenceData.state = document.querySelector('.title')?.textContent
      presenceData.smallImageKey = Assets.Search
    }
    else {
      presenceData.state = 'Home'
    }

    if (!presenceData.details) {
      presenceData.details = privacy
        ? 'Support - viewing'
        : 'Support - browsing'
    }
  }
  else if (hostname.startsWith('community')) {
    if (pathname.includes('-')) {
      presenceData.details = privacy
        ? 'Community - reading a blog post'
        : 'Community - reading about'
      presenceData.state = document.querySelector('.xpro-post-title')?.textContent
      presenceData.smallImageKey = Assets.Reading
    }
    else {
      presenceData.details = 'Community - Browsing...'
      presenceData.smallImageKey = Assets.Search
    }
  }
  else if (pathname.includes('/earn/summary')) {
    presenceData.details = privacy
      ? 'Viewing their summary'
      : 'Summary - earnings'
    presenceData.state = `Balance: ${
      document.querySelector('.c0116')?.textContent
    }`
  }
  else if (pathname.includes('/account/')) {
    presenceData.details = privacy
      ? 'Viewing their account settings'
      : 'Account - viewing'
    if (pathname.endsWith('/summary'))
      presenceData.state = 'Account management'
    else if (pathname.endsWith('/referrals'))
      presenceData.state = 'Referrals'
    else if (pathname.endsWith('/bonuses'))
      presenceData.state = 'Bonuses'
  }
  else if (pathname.includes('/rewards/')) {
    presenceData.details = privacy
      ? 'Store - viewing all items'
      : 'Store - Viewing'
    presenceData.state = document?.title?.split('|')?.[0]
    presenceData.smallImageKey = Assets.Viewing
  }
  else if (pathname.endsWith('/store')) {
    presenceData.details = 'Store - browsing'
    presenceData.smallImageKey = Assets.Search
  }
  else if (pathname.includes('/search')) {
    presenceData.details = privacy
      ? 'Store - searching for something'
      : 'Store - searching for'
    presenceData.state = `Searching for ${
      document.querySelector<HTMLInputElement>('[placeholder="SEARCH"]')?.value
    }`
    presenceData.smallImageKey = Assets.Search
  }
  else if (pathname.endsWith('/download')) {
    presenceData.details = 'Viewing the download page'
  }
  else if (pathname.endsWith('/vault')) {
    presenceData.details = 'Vault - viewing their vault'
  }

  if (privacy && presenceData.state)
    delete presenceData.state
  presence.setActivity(presenceData)
})
