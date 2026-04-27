const presence = new Presence({
  clientId: '1498049243368390736',
});

const browsingTimestamp = Math.floor(Date.now() / 1000);

presence.on('UpdateData', async () => {
  const path = document.location.pathname;

  let details = 'Using ccLeaf';
  let state = 'In the app';

  // Homepage
  if (path === '/') {
    details = 'Viewing homepage';
    state = 'Exploring ccLeaf';
  }

  // Animations list
  else if (path === '/animations') {
    details = 'Browsing animations';
    state = 'Selecting a template';
  }

  // Editor page
  else if (/^\/animations\/\d+\/.+/.test(path)) {
    const animationSlug = path.match(/^\/animations\/\d+\/(.+)$/)?.[1];

    if (animationSlug) {
      const animationName = animationSlug
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());

      details = 'Editing animation';
      state = animationName;
    }
  }

  presence.setActivity({
    details,
    state,
    startTimestamp: browsingTimestamp,
    largeImageKey: 'https://i.imgur.com/fv1VJQR.png',
  });
});
