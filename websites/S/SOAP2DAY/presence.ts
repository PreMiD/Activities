import { Assets } from 'premid'

const presence = new Presence({
  clientId: '828549761376059441',
})
const { href } = window.location
function getAction(): string {
  if (href.includes('movielist'))
    return 'movielist'
  else if (href.includes('sportlist'))
    return 'sportlist'
  else if (href.includes('tvlist'))
    return 'tvlist'
  else if (href.includes('Tczo'))
    return 'tvshow'
  else if (href.includes('Mczo'))
    return 'movie'
  else if (href.includes('Sczo'))
    return 'sport'
  else if (href.includes('faq'))
    return 'faq'
  else if (href.includes('Eczo'))
    return 'tv'
  else return 'home'
}
function getText(text: string) {
  return document.querySelector(text)?.textContent?.trim()
}
function getStatus(): string {
  const element = document.querySelector('#t3')?.textContent?.trim()
  if (!element)
    return 'Loading'
  else return element
}
const constructAction: Record<string, string> = {
  movielist: 'Searching for a movie',
  sportlist: 'Keeping up with sports',
  tvlist: 'Looking for a TV show',
  tvshow: 'Perusing through some episodes',
  movie: 'Watching a movie',
  sport: 'Enjoying some sports',
  home: 'Checking out the home page',
  faq: 'Reading the FAQ',
  tv: 'Relaxing to some TV',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/S/SOAP2DAY/assets/logo.png',
    details: constructAction[getAction()],
  }
  const showTitle = await presence.getSetting<boolean>('title')

  if (!['movie', 'tv', 'sport'].includes(getAction())) {
    presenceData.startTimestamp = Math.floor(Date.now() / 1000)
    presence.setActivity(presenceData)
    return
  }

  if (showTitle) {
    presenceData.details = document.querySelector('.alert > a:nth-child(3)')?.textContent
      ?? document.querySelector('.alert')?.textContent?.split('>>')[2]?.trim()
  }

  if (getStatus() !== 'Pause') {
    [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestampsfromMedia(document.querySelector('video')!)
    presenceData.smallImageKey = Assets.Play
  }
  else {
    presenceData.smallImageKey = Assets.Pause
  }

  presenceData.state = `${getStatus()} | ${getText(
    '[class~=player-title-bar]',
  )}`.replace(`| ${presenceData.details}`, '')

  presence.setActivity(presenceData)
})
