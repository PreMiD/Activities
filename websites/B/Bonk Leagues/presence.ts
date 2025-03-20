const presence = new Presence({
  clientId: '779118675491815434',
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/B/Bonk%20Leagues/assets/logo.png',
  }

  if (document.location.pathname.startsWith('/skins.html')) {
    presenceData.details = 'in Skin Manager'
    if (
      document.querySelector(
        '#smpskinscat[style*="block"],#smpskins[style*="block"]',
      )
    ) {
      const skinCategory = document.querySelector(
        '#smpskins[style*="block"] #smpcatid',
      )
      presenceData.state = skinCategory
        ? `Adding a ${skinCategory.textContent} skin`
        : 'Adding a skin'
    }
    else if (document.querySelector('#addskinslot[style*="block"]')) {
      presenceData.state = 'Adding a bonk2.io skin'
    }
  }
  else if (document.location.pathname.startsWith('/editor.html')) {
    presenceData.details = 'in Skin Editor'
  }
  else if (document.location.pathname.startsWith('/xpchecker.html')) {
    presenceData.details = 'in Player XP Checker'
  }
  else if (document.location.pathname.startsWith('/mapchecker.html')) {
    presenceData.details = 'in Quick Play Map Checker'
  }
  else if (document.location.pathname.startsWith('/serverstatus.html')) {
    presenceData.details = 'Viewing Server Status'
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
