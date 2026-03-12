import { Assets } from 'premid'

const presence = new Presence({
  clientId: '503557087041683458',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/N/Novelfull/assets/logo.jpg',
    startTimestamp: browsingTimestamp,
    name: 'Novelfull',
  }
  const { hostname, pathname, href } = window.location
  const [covers, buttons] = await Promise.all([
    presence.getSetting<boolean>('covers'),
    presence.getSetting<boolean>('buttons'),
  ])
  const search = document.querySelector<HTMLInputElement>('#search-input')
  if (search?.value) {
    presenceData.details = 'Searching for'
    presenceData.state = search.value
  }
  else if (pathname === '/') {
    presenceData.details = 'Viewing the homepage'
  }
  else if (pathname.includes('genre')) {
    presenceData.details = 'Viewing Novels with Genre'
    presenceData.state = pathname.replace('/genre/', '')
    presenceData.buttons = [{ label: 'Browse Genre', url: href }]
  }
  else if (pathname.includes('chapter')) {
    const split = document
      .querySelector<HTMLMetaElement>('[name="title"]')
      ?.content
      .split('-') ?? []
    presenceData.details = split[0]
    presenceData.state = split[1]?.replace('online free', '')
    presenceData.buttons = [
      { label: 'Read Chapter', url: href },
      {
        label: 'View Novel',
        url: `http://${hostname}${document
          .querySelector('[class="truyen-title"]')
          ?.getAttribute('href')}`,
      },
    ]
  }
  else if (pathname.includes('-novel')) {
    presenceData.details = `Viewing all ${
      document.querySelector('[class="active"]')?.textContent
    }s`
  }
  else if (document.querySelector('[class="book"]')) {
    if (covers) {
      presenceData.largeImageKey = `http://${hostname}${document
        .querySelector('[class="book"]')
        ?.firstElementChild
        ?.getAttribute('src')}`
    }
    presenceData.details = `Viewing ${
      document.querySelector('[class="title"]')?.textContent
    }`
    presenceData.buttons = [{ label: 'View Novel', url: href }]
    presenceData.smallImageKey = Assets.Reading
  }
  if (!buttons)
    delete presenceData.buttons
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
