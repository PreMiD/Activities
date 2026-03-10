// import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1111275267978178600',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://draw.web.tr/logo.png',
}

presence.on('UpdateData', async () => {
  // Sayfa başlığını çeker. Eğer boşsa varsayılan bir isim atar.
  const sayfaBasligi = document.title || 'Ana Sayfa'

  const presenceData = {
    details: 'Sitede geziniyor',           // Üst satırda yazacak sabit metin
    state: sayfaBasligi,                   // Alt satırda yazacak sayfa adı
    largeImageKey: ActivityAssets.Logo,    // Logonun adresi
    largeImageText: 'draw.web.tr',         // Logonun üstüne gelince çıkacak yazı
    startTimestamp: browsingTimestamp,     // Geçen süreyi gösteren sayaç
    // smallImageKey: ActivityAssets.Logo,
    // smallImageText: 'draw.web.tr'
  }

  // TypeScript'in (TS2322) tip hatasına takılmasını engellemek için "as any" ile gönderiyoruz.
  presence.setActivity(presenceData as any)
})