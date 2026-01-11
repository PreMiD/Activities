const browsingTimestamp = Math.floor(Date.now() / 1000)

const presence = new Presence({
  clientId: '1432152324163502130',
})

presence.on('UpdateData', async () => {
  const { pathname, search } = document.location
  const params = new URLSearchParams(search)

  let articleName: string | null = null

  // /w/index.php?title=ArticleName
  if (params.has('title')) {
    articleName = decodeURIComponent(params.get('title')!)
      .replace(/_/g, ' ')
      .trim()
  }
  // /wiki/ArticleName
  else if (pathname.startsWith('/wiki/')) {
    articleName = decodeURIComponent(pathname.slice(6))
      .replace(/_/g, ' ')
      .trim()
  }

  const action = params.get('action')
  const isEditing =
    params.has('veaction') ||
    action === 'edit' ||
    action === 'submit'

  const presenceData: PresenceData = {
    largeImageKey: 'https://i.imgur.com/GPxHYOV.png',
    startTimestamp: browsingTimestamp,
  }

  if (isEditing) {
    presenceData.details = articleName
      ? `Editing article "${articleName}"`
      : 'Editing article'
  }
  else if (pathname === '/wiki/Main_Page') {
    presenceData.details = 'Browsing the Main Page'
  }
  else if (articleName) {
    presenceData.details = `Browsing the article "${articleName}"`
  }
  else {
    presenceData.details = 'Browsing the Wiki'
  }

  presence.setActivity(presenceData)
})
