const presence = new Presence({
  clientId: '952575137180442626',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/P/PHP.net/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const route = document.location.pathname.split('/')

  switch (route[1]) {
    case '':
      presenceData.details = 'Browsing the main page...'
      break
    case 'downloads':
    case 'downloads.php':
      presenceData.details = 'Browsing the download section'
      break
    case 'docs.php':
      presenceData.details = 'Browsing the documentation'
      break
    case 'download-docs.php':
      presenceData.details = 'Downloading the documentation'
      break
    case 'download-logos.php':
      presenceData.details = 'Viewing the official logos'
      break
    case 'manual-lookup.php':
      presenceData.details = 'Searching the documentation'
      break
    case 'manual': {
      presenceData.details = 'Viewing the documentation: '
      const manualTitle = document.title
        .replaceAll('PHP: ', '')
        .replaceAll(' - Manual', '')
      presenceData.buttons = [
        { label: 'Open Documentation', url: document.location.href },
      ]
      if (route[3]?.includes('function.')) {
        presenceData.state = `Function: ${manualTitle}`
        presenceData.buttons = [
          { label: 'View Function', url: document.location.href },
        ]
      }
      else if (route[3]?.includes('language.')) {
        const c = route[3]!.split('.')[1]
        presenceData.state = `${
          c!.charAt(0).toUpperCase() + c!.slice(1)
        }: ${manualTitle}`
      }
      else {
        presenceData.state = manualTitle
      }
      break
    }
    case 'releases':
      if (route[2]) {
        presenceData.details = 'Viewing an release version:'
        presenceData.state = `PHP v${route[2]}`
      }
      else {
        presenceData.details = 'Viewing the releases'
      }
      break
    default:
      presenceData.details = 'Browsing the website'
  }

  if (route[1]?.toLowerCase().includes('changelog'))
    presenceData.details = 'Reading the changelogs'

  presence.setActivity(presenceData)
})
