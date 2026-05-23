const presence = new Presence({
  clientId: '1324398869416513638',
})

let startTimestamp = Math.floor(Date.now() / 1000)
let previousPath: string | null = null

const ActivityAssets = {
  Logo: 'https://cdn.rcd.gg/PreMiD/websites/T/TMBW/assets/logo.png',
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
    || document.title === 'Main Page - This Might Be A Wiki'
  ) {
    presence.setActivity({
      details: 'Browsing the homepage',
      state: 'Checking out featured content',
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
