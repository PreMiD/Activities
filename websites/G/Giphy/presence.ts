const presence = new Presence({
  clientId: '630507230852022273',
})

enum ActivityAssets {
  Browsing = 'https://cdn.rcd.gg/PreMiD/websites/G/Giphy/assets/0.png',
  Creating = 'https://cdn.rcd.gg/PreMiD/websites/G/Giphy/assets/1.png',
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/G/Giphy/assets/logo.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/G/Giphy/assets/logo.png',
  }

  if (document.location.pathname === '/') {
    presenceData.details = 'Browsing Gifs...'
    presenceData.state = 'at Homepage'
    presenceData.smallImageKey = ActivityAssets.Browsing
    presenceData.smallImageText = 'browsing'
  }
  else if (document.location.pathname.includes('create/gifmaker')) {
    presenceData.details = 'Creating a Gif'
    presenceData.state = 'at Creation page'
    presenceData.smallImageKey = ActivityAssets.Creating
    presenceData.smallImageText = 'creating'
  }
  else {
    const at = document.location.pathname
    let doing
    if (at.includes('entertainment'))
      doing = 'Entertainment'
    else if (at.includes('sports'))
      doing = 'Sports'
    else if (at.includes('stickers'))
      doing = 'Stickers'
    else if (at.includes('artist'))
      doing = 'Artists'
    else if (at.includes('reaction'))
      doing = 'Reactions'

    presenceData.details = 'Browsing Gifs...'
    presenceData.state = `at ${doing} page`
    presenceData.smallImageKey = ActivityAssets.Browsing
    presenceData.smallImageText = 'browsing'
  }

  presence.setActivity(presenceData)
})
