const presence = new Presence({
  clientId: '614903529240395782',
})

presence.on('UpdateData', async () => {
  if (document.location.pathname === '/translator') {
    presence.setActivity({
      details: document.querySelectorAll('.translate_from')[0]?.parentNode?.textContent,
      state: document.querySelectorAll('.translate_to')[0]?.parentNode?.textContent,
      largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/D/DeepL/assets/logo.png',
    })
  }
  else {
    presence.setActivity({
      largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/D/DeepL/assets/logo.png',
    })
  }
})
