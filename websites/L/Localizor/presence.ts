import { Assets } from 'premid'

const presence = new Presence({
  clientId: '938606998650519663',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    details: 'Viewing an unsupported page',
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/L/Localizor/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const page = document.location.pathname
  const [time, buttons, images] = await Promise.all([
    presence.getSetting<boolean>('time'),
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('images'),
  ])

  if (page === '/') {
    presenceData.details = 'Browsing home page'
  }
  else if (page.includes('/user')) {
    presenceData.details = 'Viewing profile:'
    presenceData.state = document.querySelector<HTMLHeadingElement>(
      'div.username',
    )?.firstChild?.textContent
    presenceData.largeImageKey = document.querySelector<HTMLImageElement>('.avatar img')?.src
    presenceData.buttons = [
      {
        label: 'View Profile',
        url: document.URL,
      },
    ]
  }
  else if (page.includes('/leaderboard')) {
    presenceData.details = 'Viewing Leaderboard'
  }
  else if (page.includes('/rewards')) {
    presenceData.details = 'Viewing Rewards'
  }
  else if (page.includes('/profile')) {
    presenceData.details = 'Editing Profile'
  }
  else if (
    document.querySelector<HTMLHeadingElement>(
      'div.col-lg-6 div.text-center h3',
    )
  ) {
    const gameImage = document
      .querySelector<HTMLImageElement>('div.game-card__image')
      ?.style
      .backgroundImage
      .slice(4, -1)
      .replaceAll('"', '')
    presenceData.details = 'Viewing game:'
    presenceData.state = document.querySelector<HTMLHeadingElement>(
      'div.col-lg-6 div.text-center h3',
    )?.textContent
    if (gameImage !== 'null')
      presenceData.largeImageKey = gameImage
    presenceData.buttons = [
      {
        label: 'View Game',
        url: document.URL,
      },
    ]
  }
  else if (page.includes('/activity')) {
    presenceData.details = 'Viewing game activity:'
    presenceData.state = document.querySelectorAll<HTMLAnchorElement>(
      'div.card-body.pt-2.pb-2 a.active',
    )[1]?.textContent
    presenceData.buttons = [
      {
        label: 'View Game Activity',
        url: document.URL,
      },
    ]
  }
  else if (
    page.includes('/translate')
    && !document.querySelector<HTMLDivElement>(
      'div.align-items-center.d-flex div.alert.alert-warning',
    )
  ) {
    presenceData.details = `Translating ${
      document.querySelector<HTMLHeadingElement>('div.mx-md-2.m-0 a')
        ?.textContent
    }`
    presenceData.state = `Key: ${
      document.querySelector<HTMLDivElement>(
        'div.d-flex.align-items-center.mt-2 div.text-break',
      )?.textContent
    }`
    presenceData.largeImageKey = document.querySelector<HTMLImageElement>('img.image')?.src
    presenceData.smallImageKey = Assets.Writing
    presenceData.smallImageText = `Translating to${
      document.querySelector<HTMLDivElement>(
        'div.og-multi-select__content__selection',
      )?.textContent
    }`
    presenceData.buttons = [
      {
        label: 'View Game',
        url: document.URL.split('/translate').join(''),
      },
    ]
  }

  if (!time)
    delete presenceData.startTimestamp
  if (!images && presenceData.largeImageKey) {
    presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/L/Localizor/assets/logo.png'
  }
  if (!buttons && presenceData.buttons)
    delete presenceData.buttons
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
