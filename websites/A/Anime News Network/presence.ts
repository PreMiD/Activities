const presence = new Presence({
  clientId: '631523770988888074',
})

function capitalize(string: string): string {
  return string.charAt(0).toUpperCase() + string.substring(1)
}

const browsingTimestamp = Math.floor(Date.now() / 1000)
let data

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/A/Anime%20News%20Network/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }

  if (document.location.pathname === '/') {
    presenceData.details = 'Browsing Anime News'
    presenceData.state = 'at Homepage'
  }
  else if (
    document.location.pathname.startsWith('/news/')
    || document.location.pathname.startsWith('/interest/')
    || document.location.pathname.startsWith('/convention/')
    || document.location.pathname.startsWith('/press-release/')
    || document.location.pathname.startsWith('/feature/')
    || document.location.pathname.startsWith('/interview/')
  ) {
    data = document.location.pathname.split('/')
    presenceData.details = `Browsing ${data[1]}`
    presenceData.state = `Title: ${capitalize(data[3]?.split('-').join(' ') ?? '')} (${
      data[2]
    })`
  }
  else if (
    document.location.pathname.startsWith('/this-week-in-anime/')
    || document.location.pathname.startsWith('/the-list/')
    || document.location.pathname.startsWith('/anncast/')
    || document.location.pathname.startsWith('/the-x-button/')
    || document.location.pathname.startsWith('/preview-guide/')
    || document.location.pathname.startsWith('/episode-review/')
  ) {
    presenceData.details = 'Browsing Animes'
    presenceData.state = `in ${capitalize(
      document.location.pathname.split('/')[1]?.split('-').join(' ') ?? '',
    )}`
  }
  else if (document.location.pathname.startsWith('/review/')) {
    data = document.location.pathname.split('/')
    presenceData.details = 'Browsing Reviews'
    presenceData.state = `for ${capitalize(
      data[2]?.split('-').join(' ') ?? '',
    )} (${data[3]?.split('-').join(' ')})`
  }
  else if (document.location.pathname.startsWith('/encyclopedia/')) {
    presenceData.details = 'Browsing Encyclopedia'
    presenceData.state = `for ${
      document.querySelector('#page_header')?.textContent
    }`
  }
  else if (document.location.pathname.startsWith('/MyAnime/')) {
    presenceData.details = 'Browsing Animes'
    presenceData.state = `for ${
      document.querySelector('#page_header')?.textContent
    }`
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
