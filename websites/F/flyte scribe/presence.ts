const presence = new Presence({
  clientId: '707632555612045413',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/F/flyte%20scribe/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }

  switch (document.location.pathname) {
    case '/': {
      presenceData.details = 'Viewing the homepage'
      break
    }
    case '/about/': {
      presenceData.details = 'Looking at the blog info'
      break
    }
    case '/flyte/': {
      presenceData.details = 'Getting to know edo/flyte'
      break
    }
    default: {
      presenceData.details = 'Looking at a blog post'
      presenceData.state = document.querySelector('h1.post-title')?.textContent
    }
  }

  presence.setActivity(presenceData)
})
