const presence = new Presence({
  clientId: '941798064694378557',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/H/Homestuck/assets/logo.png',
  Mspa = 'https://cdn.rcd.gg/PreMiD/websites/H/Homestuck/assets/0.png',
  Ryan = 'https://cdn.rcd.gg/PreMiD/websites/H/Homestuck/assets/1.png',
  Hellajeff = 'https://cdn.rcd.gg/PreMiD/websites/H/Homestuck/assets/2.png',
  Meat = 'https://cdn.rcd.gg/PreMiD/websites/H/Homestuck/assets/3.png',
  Candy = 'https://cdn.rcd.gg/PreMiD/websites/H/Homestuck/assets/4.png',
  Prologue = 'https://cdn.rcd.gg/PreMiD/websites/H/Homestuck/assets/5.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  const { pathname, href } = document.location
  const pathArr = pathname.split('/')
  const isReadingRegex = /^\d{6}$/

  const setReadingDefault = (comicName: string) => {
    presenceData.details = `Reading ${comicName}`
    presenceData.smallImageKey = ActivityAssets.Mspa
    presenceData.buttons = [
      {
        label: 'Read Along',
        url: href,
      },
    ]

    // Current page title
    presenceData.smallImageText = document.querySelector('h1')?.textContent
  }

  // If the user is reading Homestuck
  if (pathArr.length > 1 && pathArr[1]?.match(isReadingRegex)) {
    setReadingDefault('Homestuck')
    const pageNumber = Number.parseInt(pathArr[1])

    const ranges = [
      { min: 1901, max: 2148, text: 'In Act 1' },
      { min: 2148, max: 2659, text: 'In Act 2' },
      { min: 2659, max: 3054, text: 'In Act 3' },
      { min: 3054, max: 3258, text: 'In Intermission' },
      { min: 3258, max: 3889, text: 'In Act 4' },
      { min: 3889, max: 4526, text: 'In Act 5 Act 1' },
      { min: 4526, max: 4805, text: 'In Act 5 Act 2' }, // at the moment this is the last page avaible
    ]
    presenceData.state = ranges.find(r => pageNumber >= r.min && pageNumber < r.max)?.text ?? ''
    presence.setActivity(presenceData)
    return
  }

  switch (pathArr[1]) {
    case '':
      presenceData.details = 'Viewing home page'
      break

    // Homestuck
    case 'viewlog':
      presenceData.details = 'Viewing Homestuck adventure log'
      break

    case 'viewmap':
      presenceData.details = 'Viewing Homestuck adventure map'
      break

    case 'search':
      presenceData.details = 'Searching in Homestuck pages'
      break

    // Other comics that are not Homestuck
    case 'jailbreak':
      setReadingDefault('Jailbreak')
      break

    case 'bardquest':
      setReadingDefault('Bard Quest')
      break

    case 'problemsleuth':
      setReadingDefault('Problem Sleuth')
      break

    // Other misc pages
    case 'archive':
      presenceData.details = 'Viewing comics archive'
      break

    case 'newreader':
      presenceData.details = 'Viewing new reader page'
      break

    case 'unlock':
      presenceData.details = 'Viewing secrets page'
      break

    case 'credits':
      presenceData.details = 'Viewing credits'
      break

    case 'privacypolicy':
      presenceData.details = 'Viewing privacy policy'
      break

    default:
      presenceData.details = 'Viewing an unsupported page'
      break
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
