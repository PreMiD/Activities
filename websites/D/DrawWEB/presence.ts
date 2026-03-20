const presence = new Presence({
  clientId: '1111275267978178600',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://draw.web.tr/logo.png',
}

presence.on('UpdateData', async () => {
  // Sayfa başlığını çeker. Eğer boşsa varsayılan bir isim atar.
  const sayfaBasligi = document.title || 'Homepage'

  const presenceData: PresenceData = {
    details: 'Browsing the site',
    state: sayfaBasligi,
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  presence.setActivity(presenceData)
})
