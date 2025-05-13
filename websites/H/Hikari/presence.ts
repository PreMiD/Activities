const presence = new Presence({
  clientId: '1371050079439425576',
});

let startTimestamp = Math.floor(Date.now() / 1000);

enum ActivityAssets {
  Logo = 'https://i.ibb.co/MxXVxv8J/logo-CP3f-Z956.jpg',
}

presence.on('UpdateData', async () => {
  const { pathname } = document.location;
  const pathList = pathname.split('/').filter(Boolean);

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp,
  };

  const cleanTitle = document.title.replace(/\s*[-|–]\s*Hikari\s*$/i, '').trim();

  if (pathname === '/') {
    presenceData.details = 'Browsing Hikari.gg';
  } else if (pathname.startsWith('/catalogue')) {
    presenceData.details = 'Browsing the catalogue';
  } else if (pathname.startsWith('/info')) {
    presenceData.details = 'Reading anime info';
    presenceData.state = cleanTitle || 'Anime Info';
  } else if (pathname.startsWith('/watch')) {
    presenceData.details = 'Watching an anime';
    presenceData.state = cleanTitle || 'Anime Episode';

    const video = document.querySelector<HTMLVideoElement>('video');
    if (video && !isNaN(video.currentTime)) {
      startTimestamp = Math.floor(Date.now() / 1000) - Math.floor(video.currentTime);
      presenceData.startTimestamp = startTimestamp;
    }
  } else {
    presenceData.details = 'Browsing Hikari.gg';
  }

  if (presenceData.details) {
    presence.setActivity(presenceData);
  } else {
    presence.clearActivity();
  }
});
