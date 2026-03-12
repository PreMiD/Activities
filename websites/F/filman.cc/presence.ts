const presence = new Presence({
  clientId: '966334543789424781',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/F/filman.cc/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const path = document.location.pathname.toLowerCase()
  if (path === '/' || path === '/online') {
    presenceData.details = 'Przegląda stronę główną...'
  }
  else if (path.includes('/movies')) {
    presenceData.details = 'Ogląda film:'
    presenceData.state = document.title.split(' ').slice(0, -9).join(' ')
  }
  else if (path.includes('/serial-online/') && path.split('/').length === 5) {
    presenceData.details = 'Ogląda serial:'
    presenceData.state = `${document.title.split(' ').slice(0, -9).join(' ')}`
  }
  else if (path.includes('/serial-online')) {
    presenceData.details = 'Sprawdza serial:'
    presenceData.state = document.title.split(' ').slice(0, -9).join(' ')
  }
  else if (path.includes('/filmy-online-pl')) {
    presenceData.details = 'Przegląda listę filmów'
  }
  else if (path.includes('/seriale-online-pl')) {
    presenceData.details = 'Przegląda listę seriali'
  }
  else if (path.includes('/dla-dzieci-pl')) {
    presenceData.details = 'Przegląda "Dla dzieci"'
  }
  else if (path.includes('/popularne')) {
    presenceData.details = 'Przegląda popularne filmy i seriale'
  }
  else if (path.includes('/tag')) {
    presenceData.details = 'Przegląda tag:'
    presenceData.state = path.split('/')[2]
  }
  else if (path.includes('/wyszukiwarka')) {
    presenceData.details = 'Szuka:'
    presenceData.state = document.title.split(' ').slice(4, -9).join(' ')
  }
  else if (path.includes('/regulamin')) {
    presenceData.details = 'Czyta regulamin'
  }
  else if (path.includes('/pomoc')) {
    presenceData.details = 'Czyta FAQ'
  }
  else if (path.includes('/poszukiwane')) {
    presenceData.details = 'Przegląda poszukiwane filmy i seriale...'
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
