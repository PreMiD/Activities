const presence = new Presence({
  clientId: '1291708616952512613',
})

let startTimestamp = Math.floor(Date.now() / 1000)
let previousPath: string | null = null

const ActivityAssets = {
  Logo: 'https://i.ibb.co/nMYwMd6t/latest-1504957980-512x512.png',
}

presence.on('UpdateData', async () => {
  const currentPath = document.location.pathname

  if (currentPath !== previousPath) {
    startTimestamp = Math.floor(Date.now() / 1000)
    previousPath = currentPath
  }

  if (
    currentPath === '/wiki/Main_Page'
    || currentPath === '/wiki/Main_Page/'
    || document.title === 'Main Page - Ween Wiki'
  ) {
    presence.setActivity({
      details: 'Browsing the homepage',
      state: 'On the homepage',
      largeImageKey: ActivityAssets.Logo,
      startTimestamp,
    })
    return
  }

  const titleElement
    = document.querySelector('#firstHeading')
      || document.querySelector('.firstHeading')
      || document.querySelector('h1')

  const rawTitle = titleElement?.textContent?.trim()
  const pageTitle = rawTitle || document.title

  presence.setActivity({
    details: 'Reading an article',
    state: pageTitle,
    largeImageKey: ActivityAssets.Logo,
    startTimestamp,
  })
})
