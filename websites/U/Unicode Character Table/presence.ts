const presence = new Presence({
  clientId: '1024322774782713977',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/U/Unicode%20Character%20Table/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const { pathname, href, search } = window.location
  const pathSplit = pathname
    .split('/')
    .filter(x => x)
    .slice(1)

  switch (pathSplit[0] ?? '') {
    case '': {
      presenceData.details = 'Browsing list of unicode characters'
      presenceData.state = document.querySelector<HTMLSpanElement>('.box__title')?.textContent
      break
    }
    case 'alphabets': {
      if (pathSplit[1]) {
        presenceData.details = 'Browsing alphabet'
        presenceData.state = document.querySelector<HTMLSpanElement>('h1')?.textContent
      }
      else {
        presenceData.details = 'Browsing'
        presenceData.state = 'Alphabets'
      }
      break
    }
    case 'blocks': {
      if (pathSplit[1]) {
        presenceData.details = 'Browsing unicode block'
        presenceData.state = `${
          document.querySelector<HTMLHeadingElement>('h1')?.textContent
        } (${
          document
            .querySelector<HTMLSpanElement>('.page-content__info-range')
            ?.textContent
            ?.match(/([A-Z0-9]{4,6}—[A-Z0-9]{4,6})/)?.[1]
        })`
      }
      else {
        presenceData.details = 'Browsing'
        presenceData.state = 'Unicode blocks'
      }
      break
    }
    case 'emoji': {
      if (pathSplit[1]) {
        presenceData.details = 'Browsing emojis'
        presenceData.state = document.querySelector<HTMLHeadingElement>('h1')?.textContent
      }
      else {
        presenceData.details = 'Browsing'
        presenceData.state = 'Emojis'
      }
      break
    }
    case 'holidays': {
      if (pathSplit[1]) {
        presenceData.details = 'Browsing holiday symbols'
        presenceData.state = document.querySelector<HTMLHeadingElement>('h1')?.textContent
      }
      else {
        presenceData.details = 'Browsing'
        presenceData.state = 'Holiday sets'
      }
      break
    }
    case 'search': {
      presenceData.details = 'Searching for characters'
      presenceData.state = new URLSearchParams(search).get('q')
      break
    }
    case 'sets': {
      if (pathSplit[1]) {
        presenceData.details = 'Browsing symbol set'
        presenceData.state = document.querySelector<HTMLHeadingElement>('h1')?.textContent
      }
      else {
        presenceData.details = 'Browsing'
        presenceData.state = 'Symbol sets'
      }
      break
    }
    case 'tools': {
      if (pathSplit[1]) {
        presenceData.details = `Using the ${document
          .querySelector<HTMLHeadingElement>('h1')
          ?.textContent
          ?.trim()} tool`
      }
      else {
        presenceData.details = 'Browsing'
        presenceData.state = 'Tools'
      }
      break
    }
    default: {
      if (/^[0-9A-F]{4,6}$/.test(pathSplit[0]!)) {
        presenceData.details = 'Viewing a unicode character'
        presenceData.state = document.querySelector<HTMLHeadingElement>(
          '#symbol-title',
        )?.textContent
        presenceData.smallImageKey = document.querySelector<HTMLImageElement>(
          '.symbol__item-symbol',
        )?.src
        presenceData.buttons = [
          {
            label: 'View character',
            url: href,
          },
        ]
      }
      else {
        presenceData.details = 'Browsing'
        presenceData.state = document.querySelector<HTMLHeadingElement>('h1')?.textContent
          ?? document.title.match(/(.+) - Unicode Character Table$/)?.[1]
      }
      break
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
