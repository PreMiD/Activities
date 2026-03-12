import { Assets } from 'premid'

const presence = new Presence({
  clientId: '503557087041683458',
})
const timestampCheck: {
  hash: string
  timestamp: number
} = {
  hash: '',
  timestamp: Math.floor(Date.now() / 1000),
}

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/M/Marktplaats/assets/logo.png',
  Loading = 'https://cdn.rcd.gg/PreMiD/websites/M/Marktplaats/assets/0.gif',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: timestampCheck.timestamp,
    name: 'Marktplaats',
  }
  const [privacy, buttons] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('buttons'),
  ])
  const { pathname, hostname, href } = document.location
  const active = document.querySelector('[class=\'hz-TabNext hz-TabNext--active\']')
  const search = document.querySelector<HTMLInputElement>(
    '[data-role="searchForm-autocomplete"]',
  ) || document.querySelector<HTMLInputElement>('[role="combobox"]')
  const hash: string = href

  if (timestampCheck.hash !== hash) {
    timestampCheck.hash = hash
    timestampCheck.timestamp = Math.floor(Date.now() / 1000)
  }

  switch (hostname) {
    case 'www.marktplaats.nl': {
      switch (true) {
        case document.readyState !== 'complete': {
          presenceData.details = 'Marktplaats is aan het laden'
          presenceData.smallImageKey = ActivityAssets.Loading
          break
        }
        case pathname.includes('/q/'):
        case !!search?.value: {
          const script = JSON.parse(
            document.querySelector('[type=\'application/ld+json\']')?.textContent ?? '{}',
          )?.itemListElement[1]?.name
          if (pathname.includes('/q/') && search?.value === script) {
            presenceData.details = privacy
              ? 'Bekijkt zoekresultaten'
              : 'Bekijkt resultaten voor:'
            presenceData.state = script
          }
          else {
            presenceData.details = privacy ? 'Zoekt iets op' : 'Zoekt naar'
            presenceData.state = search?.value
            presenceData.smallImageKey = Assets.Search
          }
          break
        }
        case pathname === '/': {
          presenceData.details = 'Bekijkt de homepagina'
          presenceData.state = active?.textContent
          break
        }
        case pathname.includes('auto'): {
          presenceData.details = privacy
            ? 'Bekijkt items'
            : `Bekijkt ${active?.textContent?.toLowerCase()}`
          break
        }
        case pathname.includes('/v/'): {
          presenceData.details = privacy ? 'Bekijkt een item' : 'Bekijkt item'
          presenceData.state = document.querySelector(
            '[class="Listing-title"]',
          )?.textContent
          presenceData.smallImageKey = Assets.Viewing
          presenceData.smallImageText = `${
            document.querySelector('[class="Stats-summary"]')?.textContent
          } weergaven`
          presenceData.buttons = [
            {
              label: 'Bekijk item',
              url: href,
            },
          ]
          break
        }
        case pathname.includes('/l/'): {
          presenceData.details = privacy
            ? 'Bekijkt specifieke items'
            : 'Bekijkt items in categorie'

          presenceData.state = [
            ...document.querySelector('[class="innerWrapper"]')?.children ?? [],
          ]
            .map(div => div.textContent)
            .join(' => ')
          presenceData.smallImageKey = Assets.Search
          presenceData.smallImageText = document.querySelector(
            '[data-testid="breadcrumb-last-item"]',
          )?.textContent
          presenceData.buttons = [
            {
              label: 'Bekijk items In Categorie',
              url: href,
            },
          ]
          break
        }
        case pathname.includes('/plaats'): {
          const input = document.querySelectorAll(
            '[name="title_nl-NL"],[id="category-keywords"]',
          )?.[0] as HTMLInputElement
          presenceData.details = privacy
            ? 'Advertentie plaatsen'
            : 'Advertentie plaatsen voor'
          presenceData.state = input?.value ?? 'Onbekend'
          presenceData.smallImageKey = Assets.Writing
          break
        }
        case pathname.includes('/cp/'): {
          presenceData.details = privacy
            ? 'Bekijkt catogorieën'
            : 'Bekijkt categorie'
          presenceData.state = document.querySelector(
            '[class="page-header heading heading-1"]',
          )?.textContent
          presenceData.buttons = [
            {
              label: 'Bekijk Categorie',
              url: href,
            },
          ]
          break
        }
        case pathname === '/messages': {
          presenceData.details = 'Bekijkt alle berichten'
          break
        }
        case pathname.includes('/messages'): {
          const itemURL = document
            .querySelector('[class="AdvertisementSnippet-module-root"]')
            ?.getAttribute('href')
          const verkoperURL = document
            .querySelector('[class="ConversationTopic-module-title"] > a')
            ?.getAttribute('href')
          presenceData.details = privacy
            ? 'Bekijkt een gesprek'
            : `Bekijkt gesprek met ${
              document.querySelector('[data-sem="otherParticipant"]')
                ?.textContent
            }`
          presenceData.state = `Over: ${
            document.querySelector(
              '[class*="AdvertisementSnippet-module-title"]',
            )?.textContent
          }`
          presenceData.buttons = itemURL
            ? [
                {
                  label: 'Bekijk Verkoper',
                  url: verkoperURL ?? '',
                },
                {
                  label: 'Bekijk Item',
                  url: itemURL,
                },
              ]
            : [
                {
                  label: 'Bekijk Verkoper',
                  url: verkoperURL ?? '',
                },
              ]
          break
        }
        case pathname.includes('my-account'): {
          presenceData.details = 'Mijn Marktplaats'
          presenceData.state = document.querySelector(
            '[class*="Tab is-selected"]',
          )?.textContent
          break
        }
        case pathname.includes('/u/'): {
          presenceData.details = privacy
            ? 'Bekijkt een gebruiker'
            : 'Bekijkt gebruiker'
          presenceData.state = document.querySelector(
            '[class="hz-TopSection-TitleWrap-Name"]',
          )?.textContent
          presenceData.buttons = [
            {
              label: 'Bekijk Verkoper',
              url: href,
            },
          ]
          break
        }
        case pathname === '/notifications': {
          presenceData.details = 'Bekijkt notificaties'
        }
      }

      break
    }
    case 'help.marktplaats.nl': {
      switch (true) {
        case document.readyState !== 'complete': {
          presenceData.details = 'Marktplaats help is aan het laden'
          presenceData.smallImageKey = ActivityAssets.Loading
          break
        }
        case !!search?.value: {
          presenceData.details = privacy ? 'Zoekt iets op' : 'Zoekt naar'
          presenceData.state = search.value
          presenceData.smallImageKey = Assets.Search
          break
        }
        case pathname.includes('/s/'): {
          presenceData.details = privacy
            ? 'Leest een help artikel'
            : 'Leest help artikel over'
          presenceData.state = document.querySelector('[class="content-title"]')?.textContent
            ?? document.querySelector('[class="uiOutputText"]')?.textContent
          presenceData.smallImageKey = Assets.Reading
          presenceData.buttons = [
            {
              label: 'Lees Help Artikel',
              url: href,
            },
          ]
          break
        }
      }
      break
    }
  }

  if (privacy && presenceData.smallImageText)
    delete presenceData.smallImageText

  if (privacy && presenceData.state)
    delete presenceData.state

  if ((!buttons || privacy) && presenceData.buttons)
    delete presenceData.buttons

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
