const presence = new Presence({
  clientId: '786770326234464256',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Homepage = 'https://cdn.rcd.gg/PreMiD/websites/M/MDN%20Web%20Docs/assets/0.png',
  Extension = 'https://cdn.rcd.gg/PreMiD/websites/M/MDN%20Web%20Docs/assets/1.png',
  Mathml = 'https://cdn.rcd.gg/PreMiD/websites/M/MDN%20Web%20Docs/assets/2.png',
  Css = 'https://cdn.rcd.gg/PreMiD/websites/M/MDN%20Web%20Docs/assets/3.png',
  Html = 'https://cdn.rcd.gg/PreMiD/websites/M/MDN%20Web%20Docs/assets/4.png',
  Javascript = 'https://cdn.rcd.gg/PreMiD/websites/M/MDN%20Web%20Docs/assets/5.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    startTimestamp: browsingTimestamp,
  }
  const paths = document.location.pathname.split('/')

  if (!paths[2]) {
    presenceData.largeImageKey = ActivityAssets.Homepage
    presenceData.details = 'Looking at the main page...'
  }
  else if (!paths[3]) {
    presenceData.largeImageKey = ActivityAssets.Homepage
    presenceData.details = 'Looking at Web Technologies'
  }
  else {
    switch (paths[4]) {
      case 'JavaScript': {
        presenceData.largeImageKey = ActivityAssets.Javascript

        if (paths[5]) {
          paths.splice(0, 5)
          presenceData.details = `JavaScript: Looking at ${paths[0]}`
          if (paths[1]) {
            paths.splice(0, 1)
            presenceData.state = `Topic: ${paths.join(', ')}`
          }
        }
        else {
          presenceData.details = 'Looking at JavaScript Technologie'
        }

        break
      }
      case 'HTML': {
        presenceData.largeImageKey = ActivityAssets.Html

        if (paths[5]) {
          paths.splice(0, 5)
          presenceData.details = `HTML: Looking at ${paths[0]}`
          if (paths[1]) {
            paths.splice(0, 1)
            presenceData.state = `Topic: ${paths.join(', ')}`
          }
        }
        else {
          presenceData.details = 'Looking at HTML Technologie'
        }

        break
      }
      case 'CSS': {
        presenceData.largeImageKey = ActivityAssets.Css

        if (paths[5]) {
          paths.splice(0, 5)
          presenceData.details = `CSS: Looking at ${paths[0]}`
          if (paths[1]) {
            paths.splice(0, 1)
            presenceData.state = `Topic: ${paths.join(', ')}`
          }
        }
        else {
          presenceData.details = 'Looking at CSS Technologie'
        }

        break
      }
      case 'MathML': {
        presenceData.largeImageKey = ActivityAssets.Mathml

        if (paths[5]) {
          paths.splice(0, 5)
          presenceData.details = `MathML: Looking at ${paths[0]}`
          if (paths[1]) {
            paths.splice(0, 1)
            presenceData.state = `Topic: ${paths.join(', ')}`
          }
        }
        else {
          presenceData.details = 'Looking at MathML Technologie'
        }

        break
      }
      case 'WebExtensions': {
        presenceData.largeImageKey = ActivityAssets.Extension

        if (paths[4]) {
          paths.splice(0, 5)
          presenceData.details = `Web Extensions: Looking at ${paths[0]}`
          if (paths[1]) {
            paths.splice(0, 1)
            presenceData.state = `Topic: ${paths.join(', ')}`
          }
        }
        else {
          presenceData.details = 'Looking at Web Extensions Technologies'
        }

        break
      }
      default: {
        presenceData.largeImageKey = ActivityAssets.Homepage

        const tech = paths[4]

        if (paths[5]) {
          paths.splice(0, 5)
          presenceData.details = `${tech}: Looking at ${paths[0]}`
          if (paths[1]) {
            paths.splice(0, 1)
            presenceData.state = `Topic: ${paths.join(', ')}`
          }
        }
        else {
          presenceData.details = `Looking at ${tech}`
        }

        break
      }
    }
  }

  presence.setActivity(presenceData)
})
