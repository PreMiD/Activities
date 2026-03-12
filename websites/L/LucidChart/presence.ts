const presence = new Presence({
  clientId: '650633388784615424',
})

presence.on('UpdateData', () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/L/LucidChart/assets/logo.png',
    startTimestamp: Date.now(),
  }
  const path = document.location.pathname

  if (path === '/pages' || path === '/pages/') {
    presenceData.details = 'Browsing LucidChart'
    presenceData.state = 'Home Page'
  }
  else if (path === '/pages/enterprise') {
    presenceData.details = 'Browsing LucidChart'
    presenceData.state = 'Enterprise plans'
  }
  else if (path.startsWith('/pages/solutions/')) {
    presenceData.details = 'Browsing LucidChart'
    presenceData.state = 'Solutions'
  }
  else {
    switch (path) {
      case '/pages/results': {
        presenceData.details = 'Browsing LucidChart'
        presenceData.state = 'Impact of LucidChart'

        break
      }
      case '/pages/integrations': {
        presenceData.details = 'Browsing LucidChart'
        presenceData.state = 'LucidChart Integrations'

        break
      }
      case '/pages/case-studies': {
        presenceData.details = 'Browsing LucidChart'
        presenceData.state = 'Viewing Case Studies'

        break
      }
      case '/pages/resource-center': {
        presenceData.details = 'Browsing LucidChart'
        presenceData.state = 'Resource Center'

        break
      }
      case '/blog':
      case '/blog/': {
        presenceData.details = 'Browsing LucidChart Blogs'
        presenceData.state = 'Viewing all blogs'

        break
      }
      default:
        if (path.startsWith('/blog/')) {
          presenceData.details = 'Reading a LucidChart Blog'
          presenceData.state = document
            .querySelectorAll('.main-article')[0]
            ?.querySelectorAll('h1')[0]
            ?.textContent
        }
        else if (path === '/pages/tour') {
          presenceData.details = 'Browsing LucidChart'
          presenceData.state = 'Viewing examples'
        }
        else if (path.startsWith('/users/registerLevel')) {
          presenceData.details = 'Browsing LucidChart'
          presenceData.state = 'Viewing plans'
        }
        else if (path === '/users/login') {
          presenceData.details = 'Browsing LucidChart'
          presenceData.state = 'Logging in...'
        }
        else if (path === '/documents') {
          presenceData.details = 'Editing a document'
          presenceData.state = 'Viewing documents'
        }
        else if (path.startsWith('/documents/edit/')) {
          presenceData.details = 'Editing a document'
          presenceData.state = document.title.replace(': Lucidchart', '')
        }
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
