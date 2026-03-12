const presence = new Presence({
  clientId: '630505174032449537',
})

presence.on('UpdateData', () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/V/Virgin%20Media/assets/logo.png',
  }
  const pageTitle = document.title
  let currentPage

  presenceData.details = 'Viewing a page'

  if (pageTitle.includes('Virgin Media - ')) {
    currentPage = 'Homepage'
    presenceData.state = currentPage
  }
  else {
    currentPage = pageTitle.substring(0, pageTitle.length - 15)
    presenceData.state = currentPage
  }

  presence.setActivity(presenceData)
})
