import { Assets } from 'premid'

const presence = new Presence({
  clientId: '939893108827635712',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const [timestamps, buttons, cover] = await Promise.all([
    presence.getSetting<boolean>('timestamps'),
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('cover'),
  ])
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/C/Cytoid/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }

  if (document.location.pathname === '/')
    presenceData.details = 'Viewing Homepage'
  if (document.location.pathname.startsWith('/levels')) {
    if (document.location.pathname === '/levels') {
      presenceData.details = 'Browsing Levels'
      presenceData.state = `${
        document.querySelector('div.dropdown > div.btn')?.textContent
      } ${
        new URL(document.location.href).searchParams.get('order') === 'asc'
          ? '↑'
          : '↓'
      }`
      const previewedCard = document.querySelector(
        '.btn-ghost > div.radial-progress',
      )?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement
      if (previewedCard) {
        presenceData.details = previewedCard.querySelector('.card-title')?.textContent
        presenceData.state = previewedCard.querySelector(
          '.card-title',
        )?.nextElementSibling?.textContent
        presenceData.largeImageKey = previewedCard
          .querySelector<HTMLDivElement>('.base-card-bg')
          ?.style
          .backgroundImage
          .slice(5, -2)
        presenceData.smallImageKey = Assets.Play
        presenceData.smallImageText = 'Playing Preview'
        presenceData.buttons = [
          {
            label: 'View Level',
            url: previewedCard.parentElement as HTMLAnchorElement,
          },
        ]
      }
    }
    else {
      presenceData.details = document.querySelector('#contentTitle > h1')?.textContent
      presenceData.state = document.querySelector('#contentTitle > p')?.textContent
      presenceData.largeImageKey = document.querySelector<HTMLMetaElement>(
        'head > meta[property=\'og:image\']',
      )?.content
      presenceData.buttons = [
        {
          label: 'View Level',
          url: document.location.href,
        },
        {
          label: 'View Uploader',
          url: document.querySelector<HTMLAnchorElement>('.card-body > a')!.href,
        },
      ]
    }
  }
  if (document.location.pathname.startsWith('/collections')) {
    if (document.location.pathname === '/collections') {
      presenceData.details = 'Browsing Collections'
    }
    else {
      presenceData.details = 'Viewing Collection'
      presenceData.state = document.querySelector('#contentTitle > h1')?.textContent
      presenceData.largeImageKey = document.querySelector<HTMLMetaElement>(
        'head > meta[property=\'og:image\']',
      )?.content
      presenceData.buttons = [
        {
          label: 'View Collection',
          url: document.location.href,
        },
        {
          label: 'View Uploader',
          url: document.querySelector<HTMLAnchorElement>('.card-body > a')!.href,
        },
      ]
    }
  }
  if (document.location.pathname.startsWith('/posts')) {
    if (document.location.pathname === '/posts') {
      presenceData.details = 'Browsing Posts'
    }
    else {
      presenceData.details = 'Viewing Post'
      presenceData.state = document.querySelector('#contentTitle > h1')?.textContent
      presenceData.buttons = [
        {
          label: 'View Post',
          url: document.location.href,
        },
      ]
    }
  }
  if (document.location.pathname.startsWith('/profile')) {
    presenceData.details = 'Viewing Profile'
    presenceData.state = document.querySelector('p.card-title')?.textContent
    presenceData.largeImageKey = document.querySelector<HTMLImageElement>(
      '#contentTitle img',
    )?.src
    presenceData.buttons = [
      {
        label: 'View Profile',
        url: document.location.href,
      },
    ]
  }
  if (document.location.pathname.startsWith('/studio')) {
    presenceData.details = 'Viewing Studio'
    presenceData.state = document.querySelector('#StudioMenu .active')?.textContent
  }
  if (document.location.pathname.startsWith('/settings')) {
    presenceData.details = 'Viewing Settings'
    presenceData.state = document.querySelector(
      '#StudioMenu .active',
    )?.textContent
  }
  if (document.location.pathname === '/library')
    presenceData.details = 'Viewing Library'
  if (document.location.pathname.startsWith('/pages/')) {
    presenceData.details = `Viewing ${
      document.querySelector('h1')?.textContent
    }`
  }
  if (document.location.pathname === '/credits')
    presenceData.details = 'Viewing Credits'

  if (!timestamps) {
    delete presenceData.startTimestamp
    delete presenceData.endTimestamp
  }
  if (!cover) {
    presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/C/Cytoid/assets/logo.png'
  }
  if (!buttons && presenceData.buttons)
    delete presenceData.buttons

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
