import { Assets } from 'premid'

const presence = new Presence({
  clientId: '503557087041683458',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/W/WayBack%20Machine/assets/logo.png',
    startTimestamp: browsingTimestamp,
    name: 'WayBack Machine',
  }
  const { pathname, href } = window.location
  const split = pathname.split('/')[2]
  const search = document.querySelector<HTMLInputElement>(
    '#react-wayback-search > div.search-toolbar > div.search-text-container > form > div > div > input.rbt-input-main.form-control.rbt-input',
  )
  const buttons = await presence.getSetting<boolean>('buttons')

  switch (pathname.split('/')[1]) {
    case '': {
      if (!search?.value) {
        presenceData.details = 'Viewing the home page'
      }
      else {
        presenceData.details = 'Searching for'
        presenceData.state = search.value
        presenceData.smallImageKey = Assets.Search
      }
      break
    }
    case 'web': {
      if (
        document.querySelector('[class="search-size"]')
        || document.querySelector('[class="captures-range-info"]')
      ) {
        // if calendar or results
        presenceData.details = 'Viewing results for'
        presenceData.state = document.querySelector('[class="snippet"]')?.textContent
          ?? document
            .querySelector('[title*="Calendar of "]')
            ?.getAttribute('title')
            ?.replace('Calendar of ', '')
            .split('/')[2]
      }
      else {
        // if on site
        presenceData.largeImageKey = document.querySelector<HTMLMetaElement>('[property="og:image"]')
          ?.content
          ?? 'https://cdn.rcd.gg/PreMiD/websites/W/WayBack%20Machine/assets/logo.png'
        presenceData.details = document.location.pathname
          .split('/')[5]
          ?.replace('www.', '')
        presenceData.state = `${split?.substring(6, 8)}/${split?.substring(
          4,
          6,
        )}/${split?.substring(0, 4)} ${split?.substring(8, 10)}:${split?.substring(
          10,
          12,
        )}:${split?.substring(12, 14)}`
      }
      presenceData.buttons = [
        {
          label: 'View Page',
          url: href,
        },
      ]
      break
    }
    case 'details': {
      presenceData.details = 'Viewing results for'
      presenceData.state = document
        .querySelector('[class="result-headline text-center"]')
        ?.textContent
        ?.slice(4)
      presenceData.buttons = [
        {
          label: 'View Page',
          url: href,
        },
      ]
      break
    }
  }

  if (!buttons)
    delete presenceData.buttons
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
