import { Assets } from 'premid'
import {
  fetchGuideMetadata,
  guideMetadata,
} from './functions/fetchGuideMetadata.js'
import { getClosestStep } from './functions/getClosestStep.js'

const presence = new Presence({
  clientId: '1323729326696566835',
})

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
  const [thumbnailType, iconType, showStepTitle, privacy] = await Promise.all([
    presence.getSetting<number>('thumbnailType'),
    presence.getSetting<number>('iconType'),
    presence.getSetting<boolean>('showStepTitle'),
    presence.getSetting<boolean>('privacy'),
  ])
  const { pathname, search, href } = document.location
  const path = pathname.split('/').filter(x => x)

  if (['en-eu', 'en-ca', 'fr-fr', 'en-gb', 'de-de'].includes(path[0]!))
    path.shift()

  switch (path[0]) {
    case '':
      return await presence.setActivity({
        details: 'Browsing: Home',
      })
    case 'Search':
      return await presence.setActivity({
        details: privacy ? 'Searching' : 'Searching:',
        ...(!privacy && {
          state: decodeURIComponent(
            search.match(/query=([A-Za-z0-9%]+)/)?.[1] ?? '',
          ),
        }),
        smallImageKey: Assets.Search,
        smallImageText: 'Searching',
      })
    case 'Guide':
      if (path.length > 1) {
        await fetchGuideMetadata(path[2]!)

        if (guideMetadata?.data) {
          const { data } = guideMetadata
          const { title, category: device, steps, image, url } = data
          const { stepLink, stepImage, stepNumber, stepTitle }
            = await getClosestStep()

          return await presence.setActivity({
            details: privacy ? 'Following a Guide' : device,
            ...(!privacy && {
              name: title.replaceAll(device, ''),
              state: (await showStepTitle)
                ? `${stepTitle} (${stepNumber?.replace(/\D/g, '')}/${
                  steps.length
                }) `
                : `${stepNumber} out of ${steps.length}`,
              ...((await thumbnailType) && {
                largeImageKey:
                  (await thumbnailType) === 1
                    ? image.standard
                    : (stepImage as HTMLImageElement),
              }),

              ...((await iconType) && {
                smallImageKey:
                  (await iconType) === 1
                    ? Icons.Time
                    : Icons[
                      `${document
                        .querySelector('.guide-difficulty')
                        ?.textContent
                        ?.replaceAll(' ', '')
                        .toLowerCase()}` as keyof typeof Icons
                    ],
                smallImageText:
                  (await iconType) === 1
                    ? document.querySelector('.guide-time-required')
                      ?.textContent
                    : document.querySelector('.guide-difficulty')?.textContent,
              }),
              buttons: [
                {
                  label: 'View guide',
                  url: url.split('#')[0]! + stepLink,
                },
                {
                  label: 'View device',
                  url: `https://www.ifixit.com/Device/${device.replaceAll(
                    ' ',
                    '_',
                  )}`,
                },
              ],
            }),
          })
        }
      }

      return await presence.setActivity({
        details: 'Browsing: Guides',
      })
    case 'Device': {
      const deviceDetails = privacy
        ? 'Devices'
        : decodeURIComponent(
            pathname.replace('/Device/', '').replaceAll('_', ' '),
          )
      return await presence.setActivity({
        details: `Browsing: ${deviceDetails}`,
        ...(!privacy && {
          largeImageKey: (await thumbnailType)
            ? document
              .querySelector('.banner-small-photo img')
              ?.getAttribute('src')
            : PresenceImages.Logo,
          buttons: [
            {
              label: 'View device',
              url: href,
            },
          ],
        }),
      })
    }
    case 'Troubleshooting':
      return await presence.setActivity({
        name: path[2]?.replaceAll('+', ' '),
        details: privacy
          ? 'Troubleshooting'
          : `Troubleshooting: ${path[1]?.replaceAll('_', ' ')}`,
        ...(!privacy && {
          state:
            (await showStepTitle)
            && document.querySelector('a.css-1fppiwp div')?.textContent !== ''
              ? `${
                document.querySelector('a.css-1fppiwp .css-0')?.textContent
              } (${
                document.querySelector('a.css-1fppiwp div')?.textContent ?? 1
              }/${
                Array.from(document.querySelectorAll('div .css-ptse8o')).pop()?.textContent ?? 1
              }) `
              : `Step ${
                document.querySelector('a.css-1fppiwp div')?.textContent ?? 1
              } out of ${
                Array.from(document.querySelectorAll('div .css-ptse8o')).pop()?.textContent ?? 1
              }`,
          ...(thumbnailType && {
            largeImageKey: document
              .querySelector('[data-testid*=\'troubleshooting-header\'] img')
              ?.getAttribute('src'),
          }),
          buttons: [
            {
              label: 'View troubleshooting',
              url:
                href.split('#')[0]!
                + document.querySelector('a.css-1fppiwp')?.getAttribute('href'),
            },
          ],
        }),
      })

      // case "Wiki":
      // case "Teardown":
      // case "News":
      // case "User":
      // case "Team":

    case 'Answers':
      switch (path[1]) {
        case 'View':
          return await presence.setActivity({
            details: privacy
              ? 'Viewing an answer'
              : `by ${
                document.querySelector('.post-author-username')?.textContent
              }`,
            ...(!privacy && {
              name:
                document.querySelector('.post-title')?.textContent ?? 'iFixit',
              state:
                document.querySelector('.post-answers-header h2')
                  ?.textContent ?? 'No answers',
              largeImageKey: thumbnailType
                ? document.querySelector('.device-image')?.getAttribute('src')
                : PresenceImages.Logo,
              smallImageKey: document.querySelector('.fa-check')
                ? Icons.Answered
                : Assets.Question,
              smallImageText: document.querySelector('.fa-check')
                ? 'Answered'
                : 'Not answered',
              buttons: [
                {
                  label: 'View question',
                  url: href,
                },
              ],
            }),
          })
        case 'Ask':
          return await presence.setActivity({
            name:
              document.querySelector('.sc-fiCwYx.eDiGoK')?.textContent
              ?? 'iFixit',
            details: privacy ? 'Asking a question' : 'Asking: ',
            state: (
              document.querySelector('#questionTitle input') as HTMLInputElement
            )?.value,
            ...(thumbnailType && {
              largeImageKey: document
                .querySelector('.css-fzd5vm img')
                ?.getAttribute('src'),
            }),
            smallImageKey: Assets.Question,
            smallImageText: 'Asking',
          })
      }

      return await presence.setActivity({
        details: 'Browsing: Answers',
      })
    case 'Community':
      return await presence.setActivity({
        details: 'Browsing: Community',
      })

    case 'Store':
      return await presence.setActivity({
        details: 'Browsing: Store',
      })
    case 'Parts':
    case 'Tools':
      return await presence.setActivity({
        details: privacy ? 'Shopping' : 'Shopping:',
        ...(!privacy && {
          state: `${path[1]?.replaceAll('_', ' ') ?? ''} ${path[0]}`,
        }),
      })
    case 'products': {
      const image = document.querySelector(
        'div[data-testid*=\'product-gallery-desktop\'] img',
      )

      return await presence.setActivity({
        details: privacy ? 'Buying' : `Buying: ${image?.getAttribute('alt')}`,
        ...(!privacy && {
          largeImageKey: thumbnailType
            ? image?.getAttribute('src')
            : PresenceImages.Logo,
          buttons: [
            {
              label: 'View product',
              url: href,
            },
          ],
        }),
      })
    }
  }
})
