const presence = new Presence({
  clientId: '722549030244057161',
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/T/Taco/assets/logo.png',
  }
  switch (location.pathname.split('/')[1]) {
    case 'guide':
      presenceData.details = 'Reading the guide'
      presenceData.state = [
        document.querySelector('.sidebar-links > li > a.active')?.textContent,
        document.querySelector('.sidebar-sub-header > a.active')?.textContent,
      ]
        .filter(a => !!a)
        .join(' ― ')
      break
    default:
      presenceData.details = 'Homepage'
      break
  }
  presence.setActivity(presenceData)
})
