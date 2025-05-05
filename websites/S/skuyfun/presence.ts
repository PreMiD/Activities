import { Assets, ActivityType } from 'premid';

const presence = new Presence({
  clientId: '1369034572859445399', // Ganti dengan clientId yang benar
});

const browsingTimestamp = Math.floor(Date.now() / 1000);

enum ActivityAssets {
  Logo = 'favicon',
}

presence.on('UpdateData', async () => {
  // Mendapatkan judul halaman
  const title = document.querySelector('title')?.textContent?.trim();

  // Mendapatkan nama episode
  const episode = document.querySelector('h4 span:nth-child(2)')?.textContent;

  // Mengambil elemen gambar berdasarkan class
  const imgElement = document.querySelector('img.rounded-md') as HTMLImageElement;

  // Mengatur data aktivitas
  let presenceData;

  if (title && episode && imgElement) {
    // Pastikan imgElement tersedia jika menggunakan sebagai largeImageKey
    presenceData = {
      type: ActivityType.Watching,
      details: `Watching: ${title}`,
      state: `Episode: ${episode}`,
      largeImageKey: imgElement, // Gunakan src untuk URL gambar
      smallImageKey: Assets.Play,
      smallImageText: 'You hovered me, and what now?',
      startTimestamp: browsingTimestamp,
      endTimestamp: browsingTimestamp + 1800,
    };
  } else {
    presenceData = {
      type: ActivityType.Watching,
      details: 'Browsing skuy.fun',
      state: "Chillin' on the web",
      largeImageKey: ActivityAssets.Logo,
      smallImageKey: Assets.Play,
      smallImageText: 'Browse with me!',
      startTimestamp: browsingTimestamp,
      endTimestamp: browsingTimestamp + 1800,
    };
  }

  console.log(presenceData); // Cek data yang dikirimkan

  // Mengatur aktivitas
  presence.setActivity(presenceData);
});
