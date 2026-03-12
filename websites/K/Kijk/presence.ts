import { Assets } from 'premid'

const presence = new Presence({
  clientId: '503557087041683458',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/K/Kijk/assets/logo.png',
    startTimestamp: browsingTimestamp,
    name: 'Kijk',
  }
  const search = document.querySelector<HTMLInputElement>(
    '[data-testid="searchInput"]',
  )
  const { href, pathname } = window.location
  const [privacy, buttons, covers] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('covers'),
  ])
  const check = document.querySelector(
    '[class="NavItemstyle__ItemStyle-sc-1v7l1xb-1 hEDlux"]',
  )
  const title = document.querySelector('[data-testid="videoMetaDataTitle"]')
    ?.textContent
    ?? document.querySelector<HTMLMetaElement>('[name="og:title"]')?.content
  const video = document.querySelector('video')
  if (privacy) {
    presenceData.details = 'Browsing...'
  }
  else if (search?.value) {
    presenceData.details = 'Zoekt naar'
    presenceData.state = search.value
    presenceData.smallImageKey = Assets.Search
  }
  else {
    switch (pathname.split('/')[1]) {
      case '': {
        presenceData.details = 'Bekijkt de home pagina'
        break
      }
      case 'films': {
        if (check?.textContent === 'Films') {
          presenceData.details = 'Bekijkt alle films'
          presenceData.buttons = [
            {
              label: 'Bekijk Alle Films',
              url: href,
            },
          ]
        }
        else {
          delete presenceData.startTimestamp

          presenceData.buttons = [
            {
              label: 'Bekijk Film',
              url: href,
            },
          ]
          if (!video) {
            presenceData.largeImageKey = document
              .querySelector('[data-testid="imageMediaComponent"]')
              ?.getAttribute('src')
            presenceData.details = 'Bekijkt'
            presenceData.state = title
          }
          else {
            presenceData.largeImageKey = document.querySelector<HTMLMetaElement>(
              '[name="og:image"]',
            )?.content
            if (!video.paused) {
              [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestampsfromMedia(video)
              presenceData.smallImageKey = Assets.Play
            }
            else {
              presenceData.smallImageKey = Assets.Pause
            }
            if (
              !document
                .querySelector('[class="jw-text jw-reset-text jw-text-alt"]')
                ?.textContent
                ?.includes('Adv.')
            ) {
              presenceData.details = title
            }
            else {
              presenceData.details = 'Advertenties'
            }
          }
        }
        break
      }
      case 'programmas': {
        if (
          check?.textContent === 'Programma\'s'
          || check?.textContent === 'Gemist'
        ) {
          if (check?.textContent.includes('Gemist'))
            presenceData.details = 'Bekijkt alle gemiste programma\'s'
          else presenceData.details = `Bekijkt alle ${check?.textContent}`
          presenceData.buttons = [
            {
              label: 'Bekijk Programma\'s',
              url: href,
            },
          ]
        }
        else {
          delete presenceData.startTimestamp

          presenceData.buttons = [
            {
              label: 'Bekijk Programma',
              url: href,
            },
          ]
          if (!video) {
            presenceData.largeImageKey = document
              .querySelector('[data-testid="imageMediaComponent"]')
              ?.getAttribute('src')
            presenceData.details = 'Bekijkt'
            presenceData.state = title
          }
          else {
            presenceData.largeImageKey = document.querySelector<HTMLMetaElement>(
              '[name="og:image"]',
            )?.content
            if (!video.paused) {
              [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestampsfromMedia(video)
              presenceData.smallImageKey = Assets.Play
            }
            else {
              presenceData.smallImageKey = Assets.Pause
            }
            if (
              !document
                .querySelector('[class="jw-text jw-reset-text jw-text-alt"]')
                ?.textContent
                ?.includes('Adv.')
            ) {
              presenceData.details = title
            }
            else {
              presenceData.details = 'Advertenties'
            }
          }
        }
        break
      }
      case 'fragmenten': {
        presenceData.details = 'Bekijkt alle fragmenten'
        presenceData.buttons = [
          {
            label: 'Bekijk Alle Fragmenten',
            url: href,
          },
        ]
        break
      }
      default: {
        presenceData.details = `Bekijkt ${pathname.split('/')[1]}`
        break
      }
    }
  }

  if (!covers) {
    presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/K/Kijk/assets/logo.png'
  }
  if (!buttons)
    delete presenceData.buttons
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
