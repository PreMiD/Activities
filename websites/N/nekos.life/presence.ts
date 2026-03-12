const presence = new Presence({
  clientId: '607875991746117643',
})

presence.on('UpdateData', async () => {
  if (document.location.pathname === '/') {
    presence.setActivity({
      details: 'Looking at nekos',
      largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/N/nekos.life/assets/logo.png',
    })
  }
  else if (document.location.pathname === '/lewd') {
    presence.setActivity({
      details: 'Looking at lewd nekos',
      largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/N/nekos.life/assets/logo.png',
    })
  }
})
