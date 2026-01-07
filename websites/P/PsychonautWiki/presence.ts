const browsingTimestamp = Math.floor(Date.now() / 1000)

const presence = new Presence({
  clientId: '1432152324163502130',
})

presence.on('UpdateData', async () => {
  if (document.location.hostname !== 'psychonautwiki.org') return

  
  const pathname = document.location.pathname

  const presenceData: PresenceData = {
    largeImageKey: 'https://i.imgur.com/GPxHYOV.png',
    startTimestamp: browsingTimestamp,
    details:
      pathname === '/wiki/Main_Page'
        ? 'Browsing the Main Page'
        : pathname.startsWith('/wiki/')
          ? `Browsing the article "${decodeURIComponent(pathname.replace('/wiki/', '').replace(/_/g, ' '))}"`
          : 'Browsing the Wiki',
  }

  presence.setActivity(presenceData)
})
