const presence = new Presence({
  clientId: '655837567962447882',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/K/Kabal\'s/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const page = window.location.pathname

  if (page.endsWith('panel')) {
    presenceData.details = 'Bir sayfayı görüntülüyor:'
    presenceData.state = 'Panel'
  }
  else if (page.endsWith('yonetim')) {
    presenceData.details = 'Bir sayfayı görüntülüyor:'
    presenceData.state = 'Sunucularım'
  }
  else if (page.startsWith('/yonetim/')) {
    presenceData.details = 'Bir sunucuyu yönetiyor:'
    presenceData.state = document.querySelector(
      'body > div > div > div.col-4.col-sm-4.col-md-4.col-lg-4.col-xl-4 > div > div > h5 > center',
    )?.textContent
  }
  else if (page.endsWith('komutlar')) {
    presenceData.details = 'Bir sayfayı görüntülüyor:'
    presenceData.state = 'Komutlar'
  }
  else if (page.endsWith('irtibat')) {
    presenceData.details = 'Bir sayfayı görüntülüyor:'
    presenceData.state = 'İrtibat'
  }
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
