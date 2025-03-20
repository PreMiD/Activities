const presence = new Presence({
  clientId: '747683982279180359',
})

presence.on('UpdateData', async () => {
  const browsingTimestamp = Math.floor(Date.now() / 1000)
  const presenceData: PresenceData = {
    details: 'Rustlabs',
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/R/Rustlabs/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }

  switch (window.location.pathname.split('/').slice(1)[0]) {
    // Weapons
    case 'group=weapons':
      presenceData.details = 'Browsing Weapons'
      break
      // Construction
    case 'group=build':
      presenceData.details = 'Browsing Construction'
      break
      // Items
    case 'group=items':
      presenceData.details = 'Browsing Items'
      break
      // Resources
    case 'group=resources':
      presenceData.details = 'Browsing Resources'
      break
      // Attire
    case 'group=clothing':
      presenceData.details = 'Browsing Attire'
      break
      // Tools
    case 'group=tools':
      presenceData.details = 'Browsing Tools'
      break
      // Medical
    case 'group=medical':
      presenceData.details = 'Browsing Medical'
      break
      // Food
    case 'group=food':
      presenceData.details = 'Browsing Food'
      break
      // Ammo
    case 'group=ammo':
      presenceData.details = 'Browsing Ammo'
      break
      // Traps
    case 'group=traps':
      presenceData.details = 'Browsing Traps'
      break
      // Misc
    case 'group=misc':
      presenceData.details = 'Browsing Misc'
      break
      // Components
    case 'group=components':
      presenceData.details = 'Browsing Components'
      break
      // Electrical
    case 'group=electrical':
      presenceData.details = 'Browsing Electrical'
      break
      // Fun
    case 'group=fun':
      presenceData.details = 'Browsing Fun'
      break
      // Skins
    case 'skins':
      presenceData.details = 'Looking at Skins '
      break
      // About
    case 'about':
      presenceData.details = 'Browsing About'
      break
      // Unknown
    default:
      presence.setActivity()
      return
  }

  presence.setActivity(presenceData)
})
