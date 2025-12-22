import Presence from '../../presence';

const presence = new Presence({
  clientId: '1444556736647397476'
});

presence.on('UpdateData', async () => {
  const videoTitle =
    document.querySelector('.video-title')?.textContent || null;

  const paused =
    document.querySelector('.play-button.paused') !== null;

  presence.setActivity({
    details:
      videoTitle ||
      'Explore a vast collection of movies and TV shows across all genres.',
    state: paused ? 'Paused' : 'BEECH.WATCH',
    largeImageKey: 'beech',
    instance: false
  });
});
