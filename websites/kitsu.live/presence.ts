const presence = new Presence({ clientId: '1515251988646989854' });

presence.on('UpdateData', async () => {
  const el = document.getElementById('kitsu-presence-data');
  
  if (!el || !el.getAttribute('data-active')) {
    presence.setActivity(); // Clear activity
    return;
  }

  const details = el.getAttribute('data-details') || undefined;
  const state = el.getAttribute('data-state') || undefined;
  const largeImageKey = el.getAttribute('data-large-image') || undefined;
  const largeImageText = el.getAttribute('data-large-image-text') || undefined;
  const startTimestampStr = el.getAttribute('data-start-timestamp');
  const endTimestampStr = el.getAttribute('data-end-timestamp');

  const startTimestamp = startTimestampStr ? parseInt(startTimestampStr) * 1000 : undefined;
  const endTimestamp = endTimestampStr ? parseInt(endTimestampStr) * 1000 : undefined;

  presence.setActivity({
    details,
    state,
    largeImageKey,
    largeImageText,
    smallImageKey: 'kitsu_logo',
    smallImageText: 'kitsu.live',
    startTimestamp,
    endTimestamp,
    buttons: [
      {
        label: 'Watch on kitsu.live',
        url: window.location.href
      }
    ]
  });
});
