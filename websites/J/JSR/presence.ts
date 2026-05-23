const presence = new Presence({
  clientId: '1341778656762134538',
})

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/J/JSR/assets/logo.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
  }

  presenceData.details = 'Exploring JSR'

  if (document.location.pathname === '/') {
    presenceData.details = 'Viewing the homepage'
  }

  const args = document.location.pathname.split('/')

  if (args[1] === 'docs') {
    presenceData.details = 'Viewing JSR documentation'
    presenceData.state = document.title
  }
  else if (args[1]?.startsWith('@')) {
    if (args[2] === undefined) {
      presenceData.details = 'Viewing scope'
      presenceData.state = args[1]
    }
    else if (args[2] === '~' && args[3]) {
      presenceData.details = `Viewing scope ${args[3]}`
      presenceData.state = args[1]
    }
    else if (/[-a-z](?:@\d+\.\d+\.\d.*)*/.test(args[2])) {
      const packageName = [args[1], args[2]].join('/')
      presenceData.details = `Viewing package`
      presenceData.state = packageName

      if (args[3] === 'doc') {
        presenceData.details = `Viewing package documentation`

        if (args[4] === '~' && args[5]) {
          presenceData.details = `Viewing package documentation`
          presenceData.state = `${packageName}: ${args[5]}`
        }
      }
      else if (args[3] === 'versions') {
        presenceData.details = `Viewing package versions`
      }
      else if (args[3] === 'dependencies') {
        presenceData.details = `Viewing package dependencies`
      }
      else if (args[3] === 'dependents') {
        presenceData.details = `Viewing package dependents`
      }
      else if (args[3] === 'score') {
        presenceData.details = `Viewing package score`

        const score = document.querySelector('[style^="background-image: conic-gradient"]')?.textContent
        if (score) {
          presenceData.state = `${packageName} (${score})`
        }
      }
      else if (args[3] && /\d+\.\d+\.\d.*/.test(args[3])) {
        presenceData.details = `Viewing package files`

        if (args[4]) {
          const [,,,,...fileLocation] = args
          const filePath = fileLocation.join('/')
          presenceData.details = `Viewing package file`
          presenceData.state = filePath
        }
      }
    }
  }

  presence.setActivity(presenceData)
})
