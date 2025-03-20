const presence = new Presence({
  clientId: '651145049811451924',
})

presence.on('UpdateData', async () => {
  if (document.location.pathname.startsWith('/wiki/')) {
    const [page] = document.querySelectorAll('.page-header__title')
    let pageText
    if (!page)
      pageText = 'Unknown Page'
    else pageText = page.textContent

    presence.setActivity({
      details: 'Viewing a page...',
      state: pageText,
      largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/B/BanG%20Dream%20Wikia/assets/logo.png',
    })
  }
})
