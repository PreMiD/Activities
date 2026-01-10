import { ActivityType } from 'premid'

const presence = new Presence({
  clientId: '1459651066508345394'
})

const startTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    largeImageKey: 'logo',
    largeImageText: 'Moodle UTC',
    startTimestamp
  }

  const path = document.location.pathname;

  if (path.includes('/course/view.php')) {
    const courseTitle = document.querySelector('h1')?.textContent || 'Un cours';
    presenceData.details = courseTitle;
    presenceData.state = 'En train d\'étudier';
  } else if (path === '/' || path.includes('/my/')) {
    presenceData.details = 'Sur l\'accueil';
    presenceData.state = 'Choisit son prochain cours';
  } else {
    presenceData.details = 'Navigue sur Moodle';
    presenceData.state = 'UTC - Compiègne';
  }

  presence.setActivity(presenceData);
});
