const presence = new Presence({
  clientId: '772232490445176842',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

const logoURL = 'https://i.imgur.com/LOGO.png'

enum ActivityAssets {
  Logo = logoURL,
}

function sectionName(id: string): string | undefined {
  switch (id) {
    case 'converter':
      return 'the converter'
    case 'how-it-works':
      return 'how it works'
    case 'formats':
      return 'supported formats'
    case 'privacy':
      return 'the privacy notes'
    default:
      return undefined
  }
}

presence.on('UpdateData', async () => {
  const [privacy, timestamp, buttons] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('timestamp'),
    presence.getSetting<boolean>('buttons'),
  ])

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    largeImageText: 'Exist B&W',
  }

  if (timestamp)
    presenceData.startTimestamp = browsingTimestamp

  if (privacy) {
    presenceData.details = 'Converting photos to black & white'
    presence.setActivity(presenceData)
    return
  }

  const queue = document.querySelectorAll('#converter ul li').length
  const visibleSection = [...document.querySelectorAll('section[id]')]
    .map(section => ({ id: section.id, top: section.getBoundingClientRect().top }))
    .filter(section => section.top < window.innerHeight * 0.4)
    .sort((a, b) => b.top - a.top)[0]

  const viewing = visibleSection ? sectionName(visibleSection.id) : undefined

  if (queue > 0) {
    presenceData.details = queue === 1
      ? 'Converting 1 photo'
      : `Converting ${queue} photos`
    presenceData.state = viewing ? `Reading ${viewing}` : 'In the browser'
  }
  else if (viewing) {
    presenceData.details = 'Browsing Exist B&W'
    presenceData.state = `Reading ${viewing}`
  }
  else {
    presenceData.details = 'Browsing Exist B&W'
    presenceData.state = 'Make every image timeless'
  }

  if (buttons) {
    presenceData.buttons = [
      {
        label: 'Open Exist B&W',
        url: 'https://existye4t.github.io/exist-bw/',
      },
    ]
  }

  presence.setActivity(presenceData)
})
