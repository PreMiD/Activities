const presence = new Presence({
  clientId: '1429435257504923719',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)
enum ActivityAssets {
<<<<<<< HEAD
  Logo = 'https://sidet.eu/images/sideteulogo-white_512.png',
}
presence.on('UpdateData', async () => {
  // 1. Získanie dát z DOMu tvojej stránky
  // Predpokladáme, že máš na webe napr. <img class="avatar" src="...">
  const avatarElement = document.querySelector<HTMLImageElement>('#premid-avatar')
  const userAvatar = avatarElement?.src
  const userName = document.querySelector('#premid-username')?.textContent || 'Používateľ'
  const pageTitle = (document.title.split('|')[0] || document.title).trim()

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    details: 'Viewing',
    state: pageTitle,
    smallImageKey: userAvatar, // Dynamický avatar
    smallImageText: userName,
    startTimestamp: browsingTimestamp,
  }
=======
  Logo = 'https://sidet.eu/images/sideteulogo-white.png',
}
presence.on('UpdateData', async () => {
    // 1. Získanie dát z DOMu tvojej stránky
    // Predpokladáme, že máš na webe napr. <img class="avatar" src="...">
    const avatarElement = document.querySelector<HTMLImageElement>('#premid-avatar');
    const userAvatar = avatarElement?.src;
    const userName = document.querySelector('#premid-username')?.textContent || 'Používateľ';
    const pageTitle = (document.title.split('|')[0] || document.title).trim();
    
    const presenceData: PresenceData = {
      largeImageKey: ActivityAssets.Logo,
      details: 'Viewing',
      state: pageTitle,
      smallImageKey: userAvatar, // Dynamický avatar
      smallImageText: userName,
      startTimestamp: browsingTimestamp
    };
>>>>>>> 77f8d79dfe00a7860c24d4710e1ccf00598da862

  presence.setActivity(presenceData)
})
