import { ActivityType, Assets, getTimestamps, getTimestampsFromMedia } from 'premid'

//* I think this is a browser bug because the custom element does not have any properties when accessing it directly...

let imageId: string | undefined
window.addEventListener('message', (e) => {
  if (e.data.type === 'pmd-receive-image-id')
    ({ imageId } = e.data as { imageId?: string })
})

const script = document.createElement('script')
script.textContent = `
setInterval(() => {
const images = document.querySelector("disney-web-player")?.mediaPlayer?.mediaPlaybackCriteria?.metadata?.images_experience?.standard?.tile
ratios = Object.keys(images),
goal = 100;

const closest = ratios.reduce(function(prev, curr) {
return (Math.abs((100 / curr) - goal) < Math.abs((100 / prev) - goal) ? curr : prev);
});

window.postMessage({ type: "pmd-receive-image-id", imageId: images?.[closest]?.imageId }, "*");
}, 100);
`
document.head.appendChild(script)

const presence: Presence = new Presence({
  clientId: '630236276829716483',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

async function getStrings() {
  return presence.getStrings(
    {
      play: 'general.playing',
      pause: 'general.paused',
      browsing: 'general.browsing',
      watchingMovie: 'general.watchingMovie',
      watchingSeries: 'general.watchingSeries',
      watchEpisode: 'general.buttonViewEpisode',
      watchVideo: 'general.buttonWatchVideo',
      searchFor: 'general.searchFor',
      searchSomething: 'general.searchSomething',
    },
  )
}

presence.on('UpdateData', async () => {
  const [usePresenceName, privacy, time, buttons] = await Promise.all([
    presence.getSetting<boolean>('usePresenceName'),
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('time'),
    presence.getSetting<number>('buttons'),
  ])
  const { hostname, href, pathname } = document.location
  const presenceData: PresenceData & {
    partySize?: number
    partyMax?: number
  } = { startTimestamp: browsingTimestamp, type: ActivityType.Watching }
  const strings = await getStrings()

  switch (true) {
    case /(?:www\.)?disneyplus\.com/.test(hostname): {
      presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/D/Disney%2B/assets/logo.png'
      switch (true) {
        case pathname.includes('play'): {
          const video = document.querySelector<HTMLVideoElement>('video#hivePlayer')

          //* Wait for elements to load to prevent setactivity spam
          if (!video || !imageId)
            return
          presenceData.largeImageKey = `https://disney.images.edge.bamgrid.com/ripcut-delivery/v2/variant/disney/${imageId}/compose?format=png&width=512`

          if (!privacy) {
            if (presenceData.startTimestamp)
              delete presenceData.startTimestamp
            usePresenceName
              ? presenceData.name = document.querySelector(
                '.title-field.body-copy',
              )?.textContent || 'Disney+'
              : presenceData.details = document.querySelector(
                '.title-field.body-copy',
              )?.textContent

            const { paused } = video

            if (!paused) {
              const sliderEl = document.querySelector(
                '.progress-bar .slider-container',
              )
              const timestamps = getTimestamps(
                Number.parseInt(sliderEl?.getAttribute('aria-valuenow') ?? '0'),
                Number.parseInt(sliderEl?.getAttribute('aria-valuemax') ?? '0'),
              )
              presenceData.startTimestamp = timestamps[0]
              presenceData.endTimestamp = timestamps[1]
            }
            else {
              presenceData.smallImageKey = Assets.Pause
              presenceData.smallImageText = strings.pause
            }

            const parts = document
              .querySelector('.subtitle-field')
              ?.textContent
              ?.match(/S(\d+):E(\d+) /)
            if (parts && parts.length > 2)
              presenceData.largeImageText = `Season ${parts[1]}, Episode ${parts[2]}`

            usePresenceName
              ? presenceData.details = document
                .querySelector('.subtitle-field')
                ?.textContent
                ?.replace(/S\d+:E\d+ /, '')
                || document.querySelector(
                  '.title-field.body-copy',
                )?.textContent
              : presenceData.state = document
                .querySelector('.subtitle-field')
                ?.textContent
                ?.replace(/S\d+:E\d+ /, '')

            presenceData.buttons = [
              {
                label: parts && parts.length > 2 ? 'Watch Episode' : 'Watch Movie',
                url: href,
              },
            ]
          }
          else {
            presenceData.details = 'Watching content'
          }
          break
        }
        case pathname.includes('entity'): {
          if (document.querySelector('#episodes_control') !== null) {
            presenceData.details = privacy
              ? 'Viewing a series'
              : 'Viewing series'
            presenceData.buttons = [
              {
                label: 'View Series',
                url: href,
              },
            ]
          }
          else {
            presenceData.details = privacy
              ? 'Viewing a movie'
              : 'Viewing movie'
            presenceData.buttons = [
              {
                label: 'View Movie',
                url: href,
              },
            ]
          }
          const titleImg = document.querySelector(
            '[data-testid="details-title-treatment"] img, .explore-ui-main-content-container img',
          )
          if (titleImg)
            presenceData.state = titleImg.getAttribute('alt')
          else if (document.title.includes('|'))
            presenceData.state = document.title.split('|')[0]?.trim()
          else presenceData.state = document.title
          break
        }
        case pathname.includes('search'): {
          const search = document.querySelector<HTMLInputElement>(
            'input[type="search"]',
          )
          if (search?.value) {
            presenceData.details = privacy
              ? strings.searchSomething
              : strings.searchFor
            presenceData.state = search.value
            presenceData.smallImageKey = Assets.Search
          }
          else {
            presenceData.details = strings.browsing
          }
          break
        }
        case pathname.includes('home'): {
          presenceData.details = strings.browsing
          break
        }
        case pathname.includes('watchlist'): {
          presenceData.details = privacy
            ? strings.browsing
            : 'Browsing their watchlist'

          break
        }
        case pathname.includes('series'): {
          presenceData.details = privacy ? strings.browsing : 'Browsing series'
          const sortingChoice = document
            .querySelector(
              '[id="explore-ui-main-content-container"] div div [aria-selected="true"]',
            )
            ?.textContent
            ?.toLowerCase()
          if (sortingChoice !== null)
            presenceData.state = `Sorted by ${sortingChoice}`
          break
        }
        case pathname.includes('movies'): {
          presenceData.details = privacy ? strings.browsing : 'Browsing movies'
          const sortingChoice = document
            .querySelector(
              '[id="explore-ui-main-content-container"] div div [aria-selected="true"]',
            )
            ?.textContent
            ?.toLowerCase()
          if (sortingChoice !== null)
            presenceData.state = `Sorted by ${sortingChoice}`
          break
        }
        case pathname.includes('page'): {
          presenceData.details = privacy
            ? 'Browsing videos'
            : `Viewing ${document.title
              ?.match(
                /(pixar)|(marvel)|(star wars)|(national geographic)|(star)|(disney)/i,
              )?.[0]
              ?.toLowerCase()} content`
          break
        }
        default: {
          if (!privacy) {
            if (document.title.includes('|')) {
              presenceData.details = `Page: ${document.title
                .split('|')[0]
                ?.trim()}`
            }
            else {
              presenceData.details = `Page: ${document.title}`
            }
          }
          else {
            presenceData.details = 'No information'
          }
          break
        }
      }
      break
    }
    case /(?:www\.)?hotstar\.com/.test(hostname): {
      const video = document.querySelector<HTMLVideoElement>('video')
      presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/D/Disney%2B/assets/0.png'

      if (video && !Number.isNaN(video.duration)) {
        [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestampsFromMedia(video)

        const title = document.querySelector(
          'h1.ON_IMAGE.BUTTON1_MEDIUM',
        )?.textContent
        const subtitle = document.querySelector(
          'p.ON_IMAGE_ALT2.BUTTON3_MEDIUM',
        )?.textContent

        if (!title)
          presence.error('Unable to get the title')

        if (privacy) {
          presenceData.state = subtitle
            ? strings.watchingSeries
            : strings.watchingMovie
        }
        else {
          usePresenceName ? presenceData.name = title || 'Disney+' : presenceData.details = title
          usePresenceName ? presenceData.details = subtitle || 'Movie' : presenceData.state = subtitle || 'Movie'
        }
        presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
        presenceData.smallImageText = video.paused
          ? strings.pause
          : strings.play

        if (video.paused || !time) {
          delete presenceData.startTimestamp
          delete presenceData.endTimestamp
        }

        if (!privacy && buttons) {
          presenceData.buttons = [
            {
              label: strings.watchVideo,
              url: href,
            },
          ]
        }

        if (title)
          presence.setActivity(presenceData)
      }
      break
    }
  }
  if ((presenceData.startTimestamp || presenceData.endTimestamp) && !time) {
    delete presenceData.startTimestamp
    delete presenceData.endTimestamp
  }
  if (privacy && presenceData.state)
    delete presenceData.state
  if ((!buttons || privacy) && presenceData.buttons)
    delete presenceData.buttons

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
