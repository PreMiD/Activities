const presence = new Presence({ clientId: '952854435711819796' })
const browsingStamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const { title } = document
  const { href, pathname } = document.location
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/L/Light%20Novel%20Pub/assets/logo.png',
    details: 'Browsing...',
    startTimestamp: browsingStamp,
  }
  if (pathname.startsWith('/novel/')) {
    presenceData.largeImageKey = document
      .querySelector('meta[property="og:image"]')
      ?.getAttribute('content')
    presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/L/Light%20Novel%20Pub/assets/logo.png'
    switch (true) {
      case pathname.endsWith('-12032016'):
        presenceData.details = 'Viewing a Novel'
        presenceData.state = title.split(' | Light')[0]
        presenceData.buttons = [
          {
            label: title.split(' | Light')[0]!.length >= 30
              ? 'View Novel'
              : title.split(' | Light')[0]!,
            url: `${document.location}`,
          },
        ]
        break
      case pathname.endsWith('/reviews'):
        presenceData.details = 'Viewing the Reviews'
        presenceData.state = title.split(' | Light')[0]!.split('Novel User')[0]
        presenceData.buttons = [
          {
            label: presenceData.state!.length >= 30
              ? 'View Novel'
              : presenceData.state!,
            url: `${document.location}`,
          },
        ]
        break
      case pathname.endsWith('/chapters'):
        presenceData.details = 'Viewing the Chapters'
        presenceData.state = title
          .split(' | Light')[0]!
          .split('Novel Chapters')[0]
        presenceData.buttons = [
          {
            label: presenceData.state!.length >= 30
              ? 'View Novel'
              : presenceData.state!,
            url: `${document.location}`,
          },
        ]
        break
      default:
        presenceData.details = title
          .split(' | Light')[0]!
          .split('- Chapter ')[0]
        presenceData.state = `Chapter ${
          title.split(' | Light')[0]?.split('- Chapter ')[1]?.split(' | ')[0]
        }`
        presenceData.buttons = [
          {
            label: presenceData.details!.length >= 30
              ? 'View Novel'
              : presenceData.details!,
            url: `${href.split('12032016/')[0]}12032016`,
          },
          {
            label: presenceData.state.length >= 30
              ? 'View Chapter'
              : presenceData.state,
            url: href,
          },
        ]
        break
    }
  }
  presence.setActivity(presenceData)
})
