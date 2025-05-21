import { Assets } from 'premid'
import {
  fetchGuideMetadata,
  guideMetadata,
} from './functions/fetchGuideMetadata.js'
import { getClosestStep } from './functions/getClosestStep.js'

const presence = new Presence({
  clientId: '1323729326696566835',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum PresenceImages {
  Logo = 'https://raw.githubusercontent.com/iuriineves/ifixit-icons/refs/heads/main/ifixit.png',
}

enum Icons {
  VeryEasy = 'https://raw.githubusercontent.com/iuriineves/ifixit-icons/refs/heads/main/diff/very_easy.png',
  Easy = 'https://raw.githubusercontent.com/iuriineves/ifixit-icons/refs/heads/main/diff/easy.png',
  Moderate = 'https://raw.githubusercontent.com/iuriineves/ifixit-icons/refs/heads/main/diff/intermediate.png',
  Difficult = 'https://raw.githubusercontent.com/iuriineves/ifixit-icons/refs/heads/main/diff/difficult.png',
  Time = 'https://raw.githubusercontent.com/iuriineves/ifixit-icons/refs/heads/main/time.png',
  Answered = 'https://raw.githubusercontent.com/iuriineves/premid-assets/refs/heads/main/answered.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    startTimestamp: browsingTimestamp,
  }
  const [thumbnailType, iconType, showStepTitle, privacy] = await Promise.all([
    presence.getSetting<number>('thumbnailType'),
    presence.getSetting<number>('iconType'),
    presence.getSetting<boolean>('showStepTitle'),
    presence.getSetting<boolean>('privacy'),
  ])
  const { pathname, search, href } = document.location
  const searchParams = new URLSearchParams(search)
  const path = pathname.split('/').filter((x) => x)
  const strings = await presence.getStrings({
    viewHome: 'general.viewHome',
    search: 'general.search',
    searchFor: 'general.searchFor',
    followGuide: 'ifixit.followGuide',
  })

  if (/^[a-z]{2}-[a-z]{2}$/.test(path[0] ?? '')) {
    path.shift()
  }

  switch (path[0]) {
    case '': {
      presenceData.details = strings.viewHome
      break
    }
    case 'Search': {
      presenceData.details = privacy ? strings.search : strings.searchFor
      if (!privacy) {
        presenceData.state = searchParams.get('query')
        presenceData.smallImageKey = Assets.Search
        presenceData.smallImageText = strings.search
      }
      break
    }
    case 'Guide': {
      if (path[2]) {
        await fetchGuideMetadata(path[2])

        if (guideMetadata?.data) {
          const { data } = guideMetadata
          const { title, category: device, steps, image, url } = data
          const { stepLink, stepImage, stepNumber, stepTitle } =
            await getClosestStep()

          presenceData.details = privacy ? strings.followGuide : device
          if (!privacy) {
            presenceData.name = title.replaceAll(device, '')
            presenceData.state = showStepTitle
              ? `${stepTitle} (${stepNumber?.replace(/\D/g, '')}/${
                  steps.length
                }) `
              : `${stepNumber} out of ${steps.length}`
            presenceData.largeImageKey =
              thumbnailType === 1 ? image.standard : stepImage
            presenceData.smallImageKey =
              iconType === 1
                ? Icons.Time
                : Icons[
                    `${document
                      .querySelector('.guide-difficulty')
                      ?.textContent?.replaceAll(' ', '')
                      .toLowerCase()}` as keyof typeof Icons
                  ]
            presenceData.smallImageText =
              iconType === 1
                ? document.querySelector('.guide-time-required')?.textContent
                : document.querySelector('.guide-difficulty')?.textContent
            presenceData.buttons = [
              {
                label: 'View Guide',
                url: `${url.split('#')[0]}${stepLink}`,
              },
              {
                label: 'View Device',
                url: `https://www.ifixit.com/Device/${device.replaceAll(
                  ' ',
                  '_',
                )}`,
              },
            ]
          }
          break
        }
      }
      presenceData.details = 'Browsing: Guides'
      break
    }
    case 'Device': {
      const deviceDetails = privacy
        ? 'Devices'
        : decodeURIComponent(
            pathname.replace('/Device/', '').replaceAll('_', ' '),
          )
      presenceData.details = `Browsing: ${deviceDetails}`
      if (!privacy) {
        presenceData.largeImageKey = thumbnailType
          ? document
              .querySelector('.banner-small-photo img')
              ?.getAttribute('src')
          : PresenceImages.Logo
        presenceData.buttons = [
          {
            label: 'View device',
            url: href,
          },
        ]
      }
      break
    }
    case 'Troubleshooting': {
      presenceData.name = path[2]?.replaceAll('+', ' ')
      presenceData.details = privacy
        ? 'Troubleshooting'
        : `Troubleshooting: ${path[1]?.replaceAll('_', ' ')}`
      if (!privacy) {
        if (showStepTitle) {
          presenceData.state =
            document.querySelector('a.css-1fppiwp div')?.textContent !== ''
              ? `${
                  document.querySelector('a.css-1fppiwp .css-0')?.textContent
                } (${
                  document.querySelector('a.css-1fppiwp div')?.textContent ?? 1
                }/${
                  Array.from(document.querySelectorAll('div .css-ptse8o')).pop()
                    ?.textContent ?? 1
                }) `
              : `Step ${
                  document.querySelector('a.css-1fppiwp div')?.textContent ?? 1
                } out of ${
                  Array.from(document.querySelectorAll('div .css-ptse8o')).pop()
                    ?.textContent ?? 1
                }`
        }
        if (thumbnailType) {
          presenceData.largeImageKey = document
            .querySelector("[data-testid*='troubleshooting-header'] img")
            ?.getAttribute('src')
        }
        presenceData.buttons = [
          {
            label: 'View troubleshooting',
            url: `${href.split('#')[0]}${document.querySelector('a.css-1fppiwp')?.getAttribute('href')}`,
          },
        ]
      }
      break
    }

    // case "Wiki":
    // case "Teardown":
    // case "News":
    // case "User":
    // case "Team":

    case 'Answers':
      switch (path[1]) {
        case 'View': {
          presenceData.details = privacy
            ? 'Viewing an answer'
            : `by ${
                document.querySelector('.post-author-username')?.textContent
              }`
          if (!privacy) {
            presenceData.name =
              document.querySelector('.post-title')?.textContent ?? 'iFixit'
            presenceData.state =
              document.querySelector('.post-answers-header h2')?.textContent ??
              'No answers'
            presenceData.largeImageKey = thumbnailType
              ? document.querySelector('.device-image')?.getAttribute('src')
              : PresenceImages.Logo
            presenceData.smallImageKey = document.querySelector('.fa-check')
              ? Icons.Answered
              : Assets.Question
            presenceData.smallImageText = document.querySelector('.fa-check')
              ? 'Answered'
              : 'Not answered'
            presenceData.buttons = [
              {
                label: 'View question',
                url: href,
              },
            ]
          }
          break
        }
        case 'Ask': {
          presenceData.name =
            document.querySelector('.sc-fiCwYx.eDiGoK')?.textContent ?? 'iFixit'
          presenceData.details = privacy ? 'Asking a question' : 'Asking: '
          presenceData.state = document.querySelector<HTMLInputElement>(
            '#questionTitle input',
          )?.value
          if (thumbnailType) {
            presenceData.largeImageKey =
              document.querySelector<HTMLImageElement>('.css-fzd5vm img')
            presenceData.smallImageKey = Assets.Question
            presenceData.smallImageText = 'Asking'
          }
          break
        }
        default: {
          presenceData.details = 'Browsing: Answers'
        }
      }
      break
    case 'Community': {
      presenceData.details = 'Browsing: Community'
      break
    }
    case 'Store': {
      presenceData.details = 'Browsing: Store'
      break
    }
    case 'Parts':
    case 'Tools': {
      presenceData.details = privacy ? 'Shopping' : 'Shopping:'
      if (!privacy) {
        presenceData.state = `${path[1]?.replaceAll('_', ' ') ?? ''} ${path[0]}`
      }
      break
    }
    case 'products': {
      const image = document.querySelector(
        "div[data-testid*='product-gallery-desktop'] img",
      )

      presenceData.details = privacy
        ? 'Buying'
        : `Buying: ${image?.getAttribute('alt')}`
      if (!privacy) {
        presenceData.largeImageKey = thumbnailType
          ? image?.getAttribute('src')
          : PresenceImages.Logo
        presenceData.buttons = [
          {
            label: 'View product',
            url: href,
          },
        ]
      }
      break
    }
  }
  presence.setActivity(presenceData)
})
