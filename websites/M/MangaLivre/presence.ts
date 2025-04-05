import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1358046741634617504',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)
enum ActivityAssets {
  Logo = 'https://i.imgur.com/8DAVgZT.png',
}
presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const [privacy, buttons] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('buttons'),
  ])

  const search = document.querySelector<HTMLInputElement>('.manga-search-field')?.value

  const { pathname, href } = document.location

  switch (true) {
    case !!search: {
      presenceData.details = privacy ? 'Searching for something' : 'Searching for'
      presenceData.state = search
      presenceData.smallImageKey = Assets.Search
      break
    }
    case pathname === '':
    case pathname === '/': {
      presenceData.details = 'Viewing the homepage'
      break
    }
    case !pathname.includes('/capitulo-') && pathname.includes('/manga/'): {
      presenceData.details = privacy ? 'Viewing a mange' : 'Viewing manga'
      presenceData.state = document.querySelector('h1')?.textContent
      presenceData.buttons = [{
        label: 'View Manga',
        url: href,
      }]
      break
    }
    case pathname.includes('/capitulo-') && pathname.includes('/manga/'): {
      const title = document.querySelector('.chap-item')?.textContent?.trim()
      presenceData.details = privacy ? 'Reading a manga' : `Reading managa: ${title ?? 'unknown title'}`
      presenceData.smallImageKey = Assets.Reading
      presenceData.state = document.querySelector('h1')?.textContent
      presenceData.buttons = [{
        label: 'Read Manga',
        url: href,
      }]
      break
    }
  }

  if (privacy && presenceData.state)
    delete presenceData.state

  if ((!buttons || privacy) && presenceData.buttons)
    delete presenceData.buttons

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
