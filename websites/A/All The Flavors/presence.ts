import { Assets } from 'premid'

const presence = new Presence({
  clientId: '631122124630654979',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/A/All%20The%20Flavors/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }

  if (document.location.pathname === '/') {
    presenceData.details = 'Browing Homepage'
    presenceData.state = 'at Homepage'
    presenceData.smallImageKey = Assets.Search
    presenceData.smallImageText = 'browsing'
  }
  else if (
    [
      '/flavors',
      '/recipes',
      '/users',
      '/contests',
      '/vendors',
      '/top100',
    ].includes(document.location.pathname)
  ) {
    let dstate

    if (document.location.search !== '') {
      dstate = `searching for ${new URLSearchParams(
        document.location.search,
      ).get('name_like')}`
    }
    else {
      dstate = 'browsing list'
    }

    presenceData.details = `Browing ${document.location.pathname.replace(
      '/',
      '',
    )} `
    presenceData.state = dstate
    presenceData.smallImageKey = Assets.Search
    presenceData.smallImageText = 'browsing'
  }
  else if (
    [
      '/getting_started',
      '/help/how_to_mix',
      '/go_pro',
      '/help/report_recipe',
    ].includes(document.location.pathname)
  ) {
    presenceData.details = 'Browing help '
    presenceData.state = `on ${document.location.pathname
      .replace('/help', '')
      .split('_')
      .join(' ')
      .replace('/', '')}`
    presenceData.smallImageKey = Assets.Search
    presenceData.smallImageText = 'browsing'
  }
  else if (document.location.pathname.startsWith('/flavors/')) {
    presenceData.details = 'Browing Flavors '
    presenceData.state = `flavor: ${document.location.pathname
      .replace(/\d/, '')
      .replace(/\d/, '')
      .split('_')
      .join(' ')
      .replace('/flavors/', '')
      .split('-')
      .join(' ')
      .replace('/', '')}`
    presenceData.smallImageKey = Assets.Search
    presenceData.smallImageText = 'browsing'
  }
  else if (document.location.pathname.startsWith('/recipes/')) {
    const data = document.location.hash
      .replace(/\d/, '')
      .replace('#', '')
      .split('_by_')
    presenceData.details = `Recipe : ${data[0]?.split('_').join(' ')} `
    presenceData.state = `Creator: ${data[1]?.split('_').join(' ')}`
    presenceData.smallImageKey = Assets.Search
    presenceData.smallImageText = 'browsing'
  }
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
