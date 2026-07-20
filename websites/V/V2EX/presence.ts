const presence = new Presence({
  clientId: '699318388270301284',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/V/V2EX/assets/logo.png',
  Famous = 'https://cdn.rcd.gg/PreMiD/websites/V/V2EX/assets/0.png',
  Tongue = 'https://cdn.rcd.gg/PreMiD/websites/V/V2EX/assets/1.png',
  Happy = 'https://cdn.rcd.gg/PreMiD/websites/V/V2EX/assets/2.png',
  Curious = 'https://cdn.rcd.gg/PreMiD/websites/V/V2EX/assets/3.png',
  Famous2 = 'https://cdn.rcd.gg/PreMiD/websites/V/V2EX/assets/4.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const path = document.location.pathname

  if (path === '/') {
    presenceData.state = 'Home'
    presenceData.details = 'Browsing Thread'
    presenceData.smallImageKey = ActivityAssets.Curious
  }
  else if (path.includes('/t/')) {
    const title = document.querySelector('#Main > div.box > div.header > h1')
    presenceData.state = title?.textContent?.trim()
    presenceData.smallImageKey = ActivityAssets.Famous

    if (
      document
        .querySelector('#reply-box')
        ?.classList
        .contains('reply-box-sticky')
    ) {
      presenceData.details = 'Replying post'
    }
    else {
      presenceData.details = 'Reading post'
    }
  }
  else if (path.includes('/member/')) {
    const title = document.querySelector('#Main > div.box h1')
    presenceData.state = title?.textContent?.trim()
    presenceData.details = 'Viewing Profile'
    presenceData.smallImageKey = ActivityAssets.Happy
  }
  else if (path.includes('/go/')) {
    const title = document.querySelector('head > title')
    presenceData.state = title?.textContent
      ?.replace('V2EX', '')
      ?.replace('›', '')
      ?.trim()
    presenceData.details = 'Browsing node'
    presenceData.smallImageKey = ActivityAssets.Tongue
  }
  else if (path === '/new') {
    presenceData.state = 'Compose'
    presenceData.details = 'New post'
    presenceData.smallImageKey = ActivityAssets.Famous2
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
