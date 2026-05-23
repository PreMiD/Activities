import { ActivityType, Assets, getTimestampsFromMedia } from 'premid'

const presence = new Presence({
  clientId: '809748404963770398',
})
async function getStrings() {
  return presence.getStrings(
    {
      play: 'general.playing',
      pause: 'general.paused',
      browse: 'general.browsing',
      episode: 'general.episode',
      searchFor: 'general.searchFor',
      watchVideo: 'general.buttonWatchVideo',
      watchMovie: 'general.buttonViewMovie',
      watchEpisode: 'general.buttonViewEpisode',
      browsingThrough: 'discord.browseThrough',
      viewingSettings: 'discord.settings',
      viewingHistory: 'amazon.history',
      viewingList: 'netflix.viewList',
      viewAccount: 'general.viewAccount',
      viewPage: 'general.viewPage',
    },
  )
}
const browsingTimestamp = Math.floor(Date.now() / 1000)

let strings: Awaited<ReturnType<typeof getStrings>>
let oldLang: string | null = null

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/I/iQIYI/assets/0.png',
  Logo2 = 'https://cdn.rcd.gg/PreMiD/websites/I/iQIYI/assets/1.png',
}

presence.on('UpdateData', async () => {
  const [newLang, showButtons, searchQuery, logo, cover] = await Promise.all([
    presence.getSetting<string>('lang').catch(() => 'en'),
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('searchQuery'),
    presence.getSetting<number>('logo'),
    presence.getSetting<boolean>('cover'),
  ])
  const { pathname, search } = document.location

  if (oldLang !== newLang || !strings) {
    oldLang = newLang
    strings = await getStrings()
  }

  const presenceData: PresenceData = {
    largeImageKey: [ActivityAssets.Logo2, ActivityAssets.Logo][logo],
    details: strings.browse,
    smallImageKey: Assets.Search,
    startTimestamp: browsingTimestamp,
  }

  if (pathname === '/') {
    presenceData.details = strings.browsingThrough
    presenceData.state = Object.values(document.querySelectorAll('.row-title')).find(isInViewport)?.textContent || 'Home page'
  }
  else if (
    pathname.includes('/play')
    || pathname.includes('/intl-common/')
  ) {
    const data = {
      title: (
        document.querySelector('h1 > a > span > span')
        || document.querySelector('title')
      )?.textContent?.trim(),
      ep: (
        document.querySelector('h1')
        || document.querySelector('.topice-source-list-item.item-active')
      )?.textContent?.replace(
        document.querySelector('h1 a')?.textContent || '',
        '',
      ),
    }
    const coverImage: string = JSON.parse(
      document.querySelector('script[type="application/ld+json"]')
        ?.textContent || '{}',
    )[0]?.thumbnailUrl?.[0]?.replace(/\d{3}_\d{3}/, '1024_1024')
    const URLItem: string = JSON.parse(
      document.querySelectorAll('script[type="application/ld+json"]')[1]
        ?.textContent || '{}',
    )[0]
      ?.itemListElement
      .map(
        (x: {
          item: {
            '@id': string
            'name': string
          }
        }) => `${x.item.name.toLowerCase()} ${x.item['@id']}`,
      )
      .join(' ') ?? ''
    const video = document.querySelector('video')
    const isMovie = URLItem.includes('movie')
    const isVShow = URLItem.includes('variety-show')
    const possiblyVShow = pathname.includes('/intl-common/')
    const isTrial = document.querySelector(
      '.iqp-player-g.iqp-player .iqp-tip-stream .iqp-txt-vip',
    )?.textContent
    const lastestEp: string[] = document
      .querySelector('div.broken-line')
      ?.nextSibling
      ?.nextSibling
      ?.nextSibling
      ?.textContent
      ?.match(
        /[1-9]\d{0,2}/g,
      ) ?? []
    const contentEp: string[] = possiblyVShow
      ? data.ep?.match(/[1-9]\d{0,2} ?\([1-9]\d?\)/g) ?? []
      : data.ep?.match(/[1-9]\d{0,2}/g) ?? []
    const isPreview = lastestEp && contentEp && !isVShow && !possiblyVShow
      ? Number.parseInt(contentEp[0]!, 10) > Number.parseInt(lastestEp[0]!, 10)
      : data.ep?.toLowerCase().includes('preview')

    if (!data.ep && !isVShow && isMovie)
      data.ep = 'Movie'
    if (possiblyVShow) {
      if (contentEp?.length) {
        data.ep = `${strings.episode} ${contentEp[0]?.match(/.+?(?=\()/g)?.[0]} ${
          contentEp[0]?.includes('(')
            ? `- ${contentEp[0]?.match(/\([1-9]\d?\)/g)?.[0]}`
            : 'Variety show'
        }`
      }
      else {
        data.ep = 'Variety show'
      }

      [data.title] = data.title?.match(/.+?(?=\s{2})/g) || []
    }
    if (isVShow && !possiblyVShow)
      data.ep = 'Variety show'
    if (!isVShow && !possiblyVShow && !isMovie && contentEp)
      data.ep = `${strings.episode} ${contentEp[0]}`
    else if (!isVShow && !possiblyVShow && !isMovie)
      data.ep = 'Highlight'

    if (isTrial && !isPreview)
      data.ep = `${data.ep} (Trial)`

    if (video && !Number.isNaN(Number(video.duration))) {
      if (isPreview && !isMovie)
        data.ep = `${data.ep} preview`
      else if (video.duration < 270 && !isMovie && !isPreview && !isTrial)
        data.ep = 'Highlight'

      presenceData.details = data.title
      presenceData.state = data.ep

      if (cover && coverImage)
        presenceData.largeImageKey = coverImage

      presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
      presenceData.smallImageText = video.paused ? strings.pause : strings.play;
      (presenceData as PresenceData).type = ActivityType.Watching;
      [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestampsFromMedia(video)

      if (showButtons) {
        presenceData.buttons = [
          {
            label: isVShow
              ? strings.watchVideo
              : isMovie
                ? strings.watchMovie
                : strings.watchEpisode,
            url: `https://www.iq.com/play/${
              document.URL.split('?')[0]?.split('/')[4]
            }`,
          },
        ]
      }
      else {
        delete presenceData.buttons
      }

      if (video.paused) {
        delete presenceData.startTimestamp
        delete presenceData.endTimestamp
      }
    }
    else if (data.title) {
      presenceData.details = 'Looking at:'
      presenceData.state = data.title
    }
  }
  else if (pathname.includes('/search')) {
    const result = document
      .querySelector('div.has-result')
      ?.textContent
      ?.match(/\d{1,4}/)?.[0]

    presenceData.details = `${strings.searchFor} ${
      searchQuery
        ? decodeURI(new URLSearchParams(search).get('query')!)
        : '( Hidden )'
    }`
    presenceData.smallImageKey = Assets.Search

    if (result) {
      presenceData.state = `${result} matching ${
        Number.parseInt(result, 10) > 1 ? 'results' : 'result'
      }`
    }
    else {
      presenceData.state = 'No matching result'
    }
  }
  else if (pathname.includes('/personal')) {
    switch (new URLSearchParams(search).get('type')) {
      case 'settings':
        presenceData.details = strings.viewingSettings
        break

      case 'history':
        presenceData.details = strings.viewingHistory
        break

      case 'favorite':
        presenceData.details = strings.viewingList
        break

      case 'translation':
        presenceData.details = 'Viewing their subtitle translation'
        presenceData.state = `All: ${
          document.querySelector(
            'div.trans-contributions-detail > span:nth-child(1) > i',
          )?.textContent
        } • Passed: ${
          document.querySelector(
            'div.trans-contributions-detail > span:nth-child(2) > i',
          )?.textContent
        } • Adopted: ${
          document.querySelector(
            'div.trans-contributions-detail > span:nth-child(3) > i',
          )?.textContent
        }`
        break

      default:
        presenceData.details = strings.viewAccount
        break
    }
  }
  else if (pathname.includes('/vip/')) {
    presenceData.details = strings.viewPage
    presenceData.state = 'VIP membership'
  }

  presence.setActivity(presenceData)
})

/**
 * Check whether the given `Element` is in viewport.
 */

function isInViewport(element: Element) {
  const clientRect = element.getBoundingClientRect()
  return (
    clientRect.top >= 0
    && clientRect.left >= 0
    && clientRect.bottom
    <= (window.innerHeight || document.documentElement.clientHeight)
    && clientRect.right
    <= (window.innerWidth || document.documentElement.clientWidth)
  )
}
