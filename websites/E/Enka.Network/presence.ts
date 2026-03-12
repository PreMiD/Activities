const presence = new Presence({
  clientId: '1385584175167312005',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/E/Enka.Network/assets/logo.png',
  genshinIcon = 'https://cdn.rcd.gg/PreMiD/websites/E/Enka.Network/assets/0.png',
  hsrIcon = 'https://cdn.rcd.gg/PreMiD/websites/E/Enka.Network/assets/1.png',
  zzzIcon = 'https://cdn.rcd.gg/PreMiD/websites/E/Enka.Network/assets/2.png',
}

function fetchPlayerDetails(): { name: string, level: string } {
  return {
    name: document.querySelector('div.PlayerInfo div.details h1')!.textContent!,
    level: document.querySelector('div.PlayerInfo div.details div.ar')!.textContent!.split(' ').slice(0, 2).join(' '),
  }
}

presence.on('UpdateData', async () => {
  const page = document.location.pathname
  const [, ...hrefRest] = document.location.href.split('//')
  const href = hrefRest.join('')

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  // Genshin Impact
  if (
    href.includes('enka.network/u/')
    && href.match(/enka\.network\/u\/(\d+)/)
  ) {
    const UID = href.match(/enka\.network\/u\/(\d+)/)![1]
    const characterName = document.querySelector('div.name')?.childNodes[0]?.nodeValue?.trim()
    const player = fetchPlayerDetails()

    presenceData.details = `Viewing ${characterName} build`
    presenceData.state = `${player.name} | ${player.level}`
    presenceData.smallImageText = `UID: ${UID}` || `Genshin Impact`
    presenceData.smallImageKey = ActivityAssets.genshinIcon
  }

  // Honkai: Star Rail
  else if (
    href.includes('enka.network/hsr/')
    && href.match(/enka\.network\/hsr\/(\d+)/)
  ) {
    const UID = href.match(/enka\.network\/hsr\/(\d+)/)![1]
    const characterName = document.querySelector('div.name')?.textContent
    const player = fetchPlayerDetails()

    presenceData.details = `Viewing ${characterName} build`
    presenceData.state = `${player.name} | ${player.level}`
    presenceData.smallImageText = `UID: ${UID}` || `Honkai: Star Rail`
    presenceData.smallImageKey = ActivityAssets.hsrIcon
  }

  // Zenless Zone Zero
  else if (
    href.includes('enka.network/zzz/')
    && href.match(/enka\.network\/zzz\/(\d+)/)
  ) {
    const UID = href.match(/enka\.network\/zzz\/(\d+)/)![1]
    const characterName = document.querySelector('div.name')?.textContent
    const player = fetchPlayerDetails()

    presenceData.details = `Viewing ${characterName} build`
    presenceData.state = `${player.name} | ${player.level}`
    presenceData.smallImageText = `UID: ${UID}` || `Zenless Zone Zero`
    presenceData.smallImageKey = ActivityAssets.zzzIcon
  }

  // Homepage
  else if (
    page === '/'
  ) {
    presenceData.details = 'Viewing homepage'
    if (document.querySelector('div.hero h1')?.textContent?.includes('Genshin Impact')) {
      presenceData.state = 'Genshin Impact'
    }
    else if (document.querySelector('div.hero h1')?.textContent?.includes('Honkai: Star Rail')) {
      presenceData.state = 'Honkai: Star Rail'
    }
    else if (document.querySelector('div.hero h1')?.textContent?.includes('ZZZ')) {
      presenceData.state = 'Zenless Zone Zero'
    }
  }

  // Profile
  else if (
    href.match(/enka\.network\/u\/[^/]+/)
  ) {
    const username = href.match(/enka\.network\/u\/([^/]+)/)![1]
    presenceData.details = 'Viewing a profile'
    presenceData.state = username
  }

  // Settings
  else if (
    href.includes('enka.network/profile/settings/')
  ) {
    presenceData.details = 'Viewing profile settings'
  }

  presence.setActivity(presenceData)
})
