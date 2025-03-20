import { Assets } from 'premid'

const presence = new Presence({
  clientId: '631803867708915732',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

function lowercaseIt(str: string) {
  if (!str)
    return ''
  else return str.toLowerCase()
}
async function getStrings() {
  return presence.getStrings(
    {
      browse: 'general.browsing',
      buttonViewProfile: 'general.buttonViewProfile',
      buttonViewEpisode: 'general.buttonViewEpisode',
      paused: 'general.paused',
      play: 'general.playing',
      search: 'general.searchSomething',
      searchFor: 'general.searchFor',
      viewCategory: 'general.viewCategory',
      viewHome: 'general.viewHome',
      viewMovie: 'general.viewMovie',
      viewShow: 'general.viewShow',
      live: 'general.live',
      buttonWatchStream: 'general.buttonWatchStream',
      buttonWatchVideo: 'general.buttonWatchVideo',
      viewAProfile: 'general.viewAProfile',
      viewProfileOf: 'general.viewProfileOf',
      watchingLive: 'general.watchingLive',
      watchingVid: 'general.watchingVid',
      ofUser: 'general.ofUser',
    },
    'en',
  )
}

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/F/Facebook/assets/logo.png',
  MessengerLogo = 'https://cdn.rcd.gg/PreMiD/websites/F/Facebook/assets/0.png',
  WatchLogo = 'https://cdn.rcd.gg/PreMiD/websites/F/Facebook/assets/1.png',
  ReelLogo = 'https://cdn.rcd.gg/PreMiD/websites/F/Facebook/assets/2.png',
  GamingLogo = 'https://cdn.rcd.gg/PreMiD/websites/F/Facebook/assets/3.png',
  MarketplaceLogo = 'https://cdn.rcd.gg/PreMiD/websites/F/Facebook/assets/4.png',
}
let strings: Awaited<ReturnType<typeof getStrings>>,
  cached: { id: string, element: HTMLVideoElement },
  playingVid: HTMLVideoElement | null | undefined,
  playingVidClose: Element | null | undefined

presence.on('UpdateData', async () => {
  let presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const { pathname, href } = document.location
  const [
    privacyMode,
    showCover,
    showTimestamp,
    showSeachQuery,
    messagerUsername,
    showButtons,
  ] = await Promise.all([
    presence.getSetting<boolean>('privacyMode'),
    presence.getSetting<boolean>('cover'),
    presence.getSetting<boolean>('timestamp'),
    presence.getSetting<boolean>('searchQuery'),
    presence.getSetting<boolean>('messagerUsername'),
    presence.getSetting<boolean>('buttons'),
  ])
  const video = document.querySelector('video')
  const liveCheck = document
    .querySelector('[class="x78zum5 xxk0z11 x10l6tqk x1i5ckhj xoyzfg9"]')
    ?.querySelector('span')
    ?.textContent

  let dontShowTmp = false

  if (!strings)
    strings = await getStrings()

  switch (true) {
    case pathname === '/': {
      presenceData.details = 'Viewing home page'
      break
    }
    case pathname.includes('/stories/'): {
      const storyUser = document
        .querySelector('[class=" x15w6uyq"]')
        ?.querySelector('span')
        ?.textContent
      if (pathname.match(/\d{15}/g)) {
        presenceData.details = privacyMode || !storyUser
          ? 'Viewing a story'
          : `Viewing ${storyUser}'s story`
      }
      break
    }
    case pathname.includes('/messages'): {
      presenceData.largeImageKey = ActivityAssets.MessengerLogo
      switch (true) {
        case pathname.includes('/t/'): {
          const username = document
            .querySelector('div.t6p9ggj4.tkr6xdv7')
            ?.querySelector('span > span')
            ?.textContent
          if (document.querySelector('[data-text="true"]')?.textContent) {
            presenceData.details = privacyMode
              ? 'Writing to someone'
              : 'Writing to:'
            presenceData.state = messagerUsername ? username : '(Hidden)'
          }
          else {
            presenceData.details = privacyMode
              ? 'Reading messages'
              : 'Reading messages from:'
            presenceData.state = messagerUsername ? username : '(Hidden)'
          }
          break
        }
        case pathname.includes('/new'): {
          presenceData.details = privacyMode
            ? 'Browsing messages'
            : 'Composing a new message'
          break
        }
        case pathname.includes('/groupcall/'): {
          presenceData.details = privacyMode
            ? 'Browsing groupchats'
            : 'In a group call'
          break
        }
        case !!video && !!liveCheck: {
          const parseInfo = JSON.parse(
            document.querySelector('[data-content-len="40325"]')?.innerHTML ?? '',
          )
          presenceData.smallImageKey = Assets.Live
          presenceData.details = `Watch - ${strings.watchingLive}`
          presenceData.state = `${strings.ofUser} ${
            parseInfo
              ? parseInfo.require[0][3][0].__bbox.require[3][3][1].__bbox.result.data.node.section_renderer.section.section_components.edges[1].node.feed_unit.attachments[0].media.owner.name?.trim()
              : document
                .querySelector('[class="x1lliihq x6ikm8r x10wlt62 x1n2onr6"]')
                ?.textContent
                ?.trim()
          }`
          break
        }
        case video && pathname.includes('/videos/'): {
          presenceData.details = privacyMode
            ? `Watching a ${strings.watchingVid}`
            : 'Watching a video on:'
          presenceData.state = `${
            document.querySelector('span.x193iq5w > strong > span')
              ?.textContent
              ?? document.querySelector(
                'span.x193iq5w > h2 > span > a > strong > span',
              )?.textContent
          }'s profile`

          presenceData.smallImageKey = video.paused
            ? Assets.Pause
            : Assets.Play
          presenceData.smallImageText = video.paused
            ? strings.paused
            : strings.play

          if (video.paused) {
            dontShowTmp = true
          }
          else {
            [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestampsfromMedia(video)
          }

          presenceData.buttons = [
            {
              label: strings.buttonWatchVideo,
              url: href,
            },
          ]
          break
        }
      }
      break
    }
    case pathname.includes('/photo'): {
      presenceData.details = privacyMode
        ? 'Viewing a photo'
        : 'Viewing a photo on:'
      presenceData.state = `${
        document.querySelector('span.nc684nl6 > span')?.textContent
        ?? document.querySelector('span.nc684nl6 > a > strong > span')
          ?.textContent
          ?? document.querySelector('[href*="?__tn__=-UC*F"]')?.textContent
      }'s profile`

      presenceData.buttons = [
        {
          label: 'View photo',
          url: href,
        },
      ]
      break
    }
    case pathname.includes('/watch'): {
      presenceData.largeImageKey = ActivityAssets.WatchLogo
      const hrefReplaced = href
        .replace(/\/\?ref=.*/g, '')
        .replace('web.facebook.com', 'www.facebook.com')
      switch (true) {
        case !!hrefReplaced.match(/watch\?v=\d{15}/g)?.[0]: {
          delete presenceData.startTimestamp
          playingVid = document.querySelector<HTMLVideoElement>('video')
          presenceData.details = `Watch - ${strings.watchingVid} ${
            document.querySelector('[class="xzueoph x1k70j0n"]')?.textContent
          }`
          presenceData.smallImageKey = playingVid?.paused
            ? Assets.Pause
            : Assets.Play
          presenceData.state = `Uploaded by ${
            document
              .querySelector('[id="watch_feed"]')
              ?.querySelector('[class="x78zum5 xdt5ytf xz62fqu x16ldp7u"]')
              ?.querySelector('[class="xt0psk2"]')
              ?.textContent ?? 'Unknown'
          }`
          if (playingVid && !playingVid.paused) {
            [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestampsfromMedia(playingVid)
          }
          presenceData.buttons = [
            {
              label: strings.buttonWatchVideo,
              // short link:
              url: document
                .querySelector('[class="xh99ass"]')
                ?.parentElement
                ?.querySelector('a')
                ?.getAttribute('href') ?? '',
            },
          ]
          break
        }
        case hrefReplaced === 'https://www.facebook.com/watch': {
          switch (true) {
            case !!document
              .querySelector('[aria-label*="ause"]')
              ?.closest('[class="x78zum5 xdt5ytf"]')
              ?.querySelector('video'): {
              playingVid = document
                .querySelector('[aria-label*="ause"]')
                ?.closest('[class="x78zum5 xdt5ytf"]')
                ?.querySelector<HTMLVideoElement>('video')
              break
            }
            default: {
              const allVideos: NodeListOf<HTMLVideoElement> = document.querySelectorAll('video')
              const videoArray: HTMLVideoElement[] = []
              let vidElement: HTMLVideoElement
              for (const i in allVideos)
                videoArray.push(allVideos[i] as HTMLVideoElement)

              for (vidElement of videoArray) {
                if (!vidElement.paused)
                  playingVid = vidElement
              }
            }
          }

          switch (true) {
            case cached?.element && !!cached?.id: {
              delete presenceData.startTimestamp
              playingVidClose = cached.element.closest(
                'div[class="x78zum5 xdt5ytf"]',
              )
              presenceData.details = `Watch - ${strings.watchingVid} ${
                playingVidClose?.querySelector('[class="x14vqqas"]')
                  ?.textContent
              }`
              presenceData.smallImageKey = cached.element.paused
                ? Assets.Pause
                : Assets.Play
              presenceData.state = `Uploaded by ${playingVidClose
                ?.querySelector('[class="xh8yej3"]')
                ?.querySelector('a[aria-label*=" "]')
                ?.getAttribute('aria-label')}`
              if (!cached.element.paused) {
                [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestampsfromMedia(cached.element)
              }
              presenceData.buttons = [
                {
                  label: strings.buttonWatchVideo,
                  // short link:
                  url: `https://www.facebook.com/watch/?v=${
                    playingVidClose
                      ?.querySelector('[class="xh8yej3"]')
                      ?.querySelector('[class="xh99ass"]')
                      ?.parentElement
                      ?.firstElementChild
                      ?.getAttribute('href')
                      ?.split('?v=')[1]
                      ?.split('_')[0]
                  }`,
                },
              ]
              break
            }
            case playingVid && !!playingVid.getAttribute('src')
              && (!cached
                || cached.id !== playingVid.getAttribute('src')
                || cached.element !== playingVid): {
              cached = {
                id: playingVid.getAttribute('src')!,
                element: playingVid,
              }
              playingVidClose = playingVid.closest(
                'div[class="x78zum5 xdt5ytf"]',
              )

              presenceData.details = `Watch - ${strings.watchingVid}: ${
                playingVidClose?.querySelector('[class="x14vqqas"]')
                  ?.textContent
              }`
              presenceData.smallImageKey = playingVid.paused
                ? Assets.Pause
                : Assets.Play
              presenceData.state = `Uploaded by: ${playingVidClose
                ?.querySelector('[class="xh8yej3"]')
                ?.querySelector('a[aria-label*=" "]')
                ?.getAttribute('aria-label')}`
              break
            }
            default: {
              presenceData.details = `Watch - ${strings.browse}`
            }
          }

          break
        }
        case hrefReplaced === 'https://www.facebook.com/watch/saved': {
          presenceData.details = 'Watch - Viewing saved videos'
          break
        }
        case hrefReplaced === 'https://www.facebook.com/watch/shows': {
          presenceData.details = 'Watch - Browsing shows'
          break
        }
        case hrefReplaced === 'https://www.facebook.com/watch/live': {
          const parseInfo = document.querySelector(
            '[data-bootloader-hash="UhexK6g"]',
          )?.nextElementSibling?.nextElementSibling?.nextElementSibling?.nextElementSibling?.innerHTML
          presenceData.smallImageKey = Assets.Live
          presenceData.details = `Watch - ${strings.watchingLive}`
          presenceData.state = `${strings.ofUser} ${
            document
              .querySelector(
                '[class="x14ctfv x1nxh6w3 x10l6tqk xoie2o3 xfyf068"]',
              )
              ?.closest('[class="x78zum5 x1n2onr6 xh8yej3"]')
              ?.querySelector('[class*="xi81zsa xo1l8bm"]')
              ?.textContent
              ?.trim()
              ?? JSON.parse(
                parseInfo ?? '',
              )?.require?.[0]?.[3]?.[0]?.__bbox?.require?.[15]?.[3]?.[1]?.__bbox?.result?.data?.video_home_www_live?.video_home_sections?.edges?.[0]?.node?.section_renderer?.section?.section_components?.edges?.[0]?.node?.feed_unit?.attachments?.[0]?.media?.owner?.name?.trim()
              ?? document
                .querySelector('[class="x1lliihq x6ikm8r x10wlt62 x1n2onr6"]')
                ?.textContent
                ?.trim()
          }`
          break
        }
        default: {
          // profile while /watch
          if (
            href.includes('/profile.php?id=')
            || document.querySelector(
              '[data-imgperflogname="profileCoverPhoto"]',
            )
            || document.querySelector(
              '[aria-label="Link to open profile cover photo"]',
            )
            || document.querySelector('[style*="padding-top: 37"]')
            || document.querySelector('[style*="padding-top:37"]')
          ) {
            const selected = document.querySelector(
              '[style=\'background-color: var(--accent);\']',
            )?.parentElement?.textContent
            const profileUsername = document.querySelector(
              '[class="xy1j3rs xurb0ha x1n2onr6"]',
            )?.parentElement?.textContent
            if (profileUsername) {
              if (privacyMode)
                presenceData.details = strings.viewAProfile
              else if (selected)
                presenceData.details = `Viewing ${profileUsername}'s ${selected}`
              else
                presenceData.details = `Viewing ${profileUsername}'s Profile`
            }
          }
          break
        }
      }
      break
    }
    case pathname.includes('/reel'): {
      presenceData.details = 'Watching a reel'
      presenceData.largeImageKey = ActivityAssets.ReelLogo
      presenceData.state = `From ${document
        .querySelector<HTMLLinkElement>('h2 > span > span > a.oajrlxb2')
        ?.textContent
        ?.trim()}`
      presenceData.buttons = [
        {
          label: 'Watch Reel',
          url: href,
        },
      ]
      break
    }
    case pathname.includes('/marketplace'): {
      presenceData.largeImageKey = ActivityAssets.MarketplaceLogo

      switch (true) {
        case pathname.includes('/search/'): {
          presenceData.smallImageKey = Assets.Search

          presenceData.details = `Marketplace - ${lowercaseIt(
            strings.searchFor,
          )}:`
          presenceData.state = showSeachQuery
            ? decodeURI(new URLSearchParams(location.search).get('q')!)
            : '(Hidden)'
          break
        }
        case pathname.includes('/item/'): {
          presenceData.details = privacyMode
            ? 'Marketplace - Viewing item'
            : 'Marketplace - Viewing item:'
          presenceData.state = document
            .querySelector('[class="x1s85apg x4fpnxs"]')
            ?.previousElementSibling
            ?.querySelector('span')
            ?.textContent
            ?? document
              .querySelector('head > title')
              ?.textContent
              ?.split(' | Facebook')[0]
              ?.split('– ')[1]
          break
        }
        default: {
          presenceData.details = `Marketplace - ${strings.browse}`
        }
      }
      break
    }
    case pathname.includes('/groups/'): {
      switch (pathname.split('/')[2]) {
        case 'discover':
          presenceData.details = privacyMode
            ? 'Browsing groups'
            : 'Groups - Discover'
          break
        case 'feed':
          presenceData.details = privacyMode
            ? 'Browsing groups'
            : 'Groups - Feed'
          break
        case 'notifications':
          presenceData.details = privacyMode
            ? 'Browsing groups'
            : 'Groups - Notifications'
          break
        default: {
          const groupName = document.querySelector(
            'div:nth-child(1) > div div:nth-child(1) > h1 > span > div',
          )?.textContent

          if (groupName && !privacyMode) {
            presenceData.details = 'Viewing group:'
            presenceData.state = groupName
          }
          else {
            presenceData.details = 'Browsing groups'
          }
        }
      }
      break
    }
    case pathname.includes('/friends'): {
      presenceData.details = 'Friends'
      switch (true) {
        case pathname.includes('/friends/requests'): {
          if (
            document.querySelector(
              'div.cjfnh4rs.l9j0dhe7.du4w35lb.j83agx80.cbu4d94t',
            )
          ) {
            presenceData.details = privacyMode
              ? 'Friends'
              : 'Friends - Sent requests'
          }
          else {
            presenceData.state = privacyMode ? 'Friends' : 'Friends - Requests'
          }
          break
        }
        case pathname === '/friends/suggestions': {
          presenceData.details = presenceData.state = privacyMode
            ? 'Friends'
            : 'Friends - Requests'
          break
        }
        case pathname.includes('/friends/suggestions/'): {
          presenceData.details = 'Friends - Suggestions'
          presenceData.state = `${strings.viewProfileOf} ${document
            .querySelector('head > title')
            ?.innerHTML
            .replace(/(\(.*\))/g, '')
            .replace('| Facebook', '')
            .trim()}`
          break
        }
        case pathname.includes('/friends/list'): {
          presenceData.details = presenceData.state = privacyMode
            ? 'Friends'
            : 'Friends - All Friends'
          break
        }
        case pathname.includes('/friends/birthdays'): {
          presenceData.details = presenceData.state = privacyMode
            ? 'Friends'
            : 'Friends - Birthdays'
          break
        }
        case pathname.includes('/friends/friendlist'): {
          presenceData.details = presenceData.state = privacyMode
            ? 'Friends'
            : 'Friends - Custom lists'
          break
        }
      }

      break
    }
    case pathname.includes('/events'): {
      if (/events\/\d/.test(pathname)) {
        presenceData.details = privacyMode
          ? 'Events - Viewing an event'
          : 'Events - Viewing event:'
        presenceData.state = document.querySelector(
          'span > span.a8c37x1j.ni8dbmo4.stjgntxs.l9j0dhe7.pby63qed',
        )?.textContent

        presenceData.buttons = [
          {
            label: 'View Event',
            url: `https://www.facebook.com/events/${pathname.replace(
              /^\D+/g,
              '',
            )}`,
          },
        ]
      }
      else {
        presenceData.details = privacyMode
          ? 'Events - Home '
          : `Events - ${strings.browse}`
      }
      break
    }
    case pathname.includes('/gaming/'): {
      presenceData.largeImageKey = ActivityAssets.GamingLogo
      presenceData.details = 'Gaming'
      switch (true) {
        case /gaming\/play\/\d/.test(pathname): {
          if (!privacyMode) {
            presenceData.state = document.querySelector(
              'span > span.a8c37x1j.ni8dbmo4.stjgntxs.l9j0dhe7.ltmttdrg.g0qnabr5.ojkyduve',
            )?.textContent

            presenceData.buttons = [
              {
                label: 'Play Game',
                url: `https://www.facebook.com/gaming/play/${pathname.replace(
                  /^\D+/g,
                  '',
                )}`,
              },
            ]
          }
          else {
            presenceData.details = 'Gaming - Playing'
          }

          break
        }
        case pathname.includes('gaming/play'): {
          presenceData.details = 'Gaming - Playing'
          break
        }
      }

      break
    }
    case pathname.includes('/search'): {
      presenceData.smallImageKey = Assets.Search
      presenceData.details = privacyMode ? strings.search : strings.searchFor
      presenceData.state = showSeachQuery
        ? new URLSearchParams(location.search).get('q')
        : '(Hidded)'
      break
    }
    // if post is open
    case !!document.querySelector(
      'h2.gmql0nx0.l94mrbxd.p1ri9a11.lzcic4wl.d2edcug0.hpfvmrgz span.d2edcug0.hpfvmrgz.qv66sw1b.c1et5uql.lr9zc1uh.a8c37x1j.keod5gw0.nxhoafnm.aigsh9s9.fe6kdd0r.mau55g9w.c8b282yb.embtmqzv.hrzyx87i.m6dqt4wy.h7mekvxk.hnhda86s.oo9gr5id.hzawbc8m > span',
    )
    || !!document.querySelector(
      'span.d2edcug0.hpfvmrgz.qv66sw1b.c1et5uql.lr9zc1uh.a8c37x1j.keod5gw0.nxhoafnm.aigsh9s9.fe6kdd0r.mau55g9w.c8b282yb.l1jc4y16.rwim8176.mhxlubs3.p5u9llcw.hnhda86s.oo9gr5id.hzawbc8m > h1',
    )
    || !!document.querySelectorAll('[data-pagelet="ProfileActions"]')[0]: {
      const hasCommentInput = document.querySelector(
        'div.m9osqain.a5q79mjw.gy2v8mqq.jm1wdb64.k4urcfbm.qv66sw1b span.a8c37x1j.ni8dbmo4.stjgntxs.l9j0dhe7',
      )

      presenceData.details = `Viewing ${hasCommentInput ? 'user' : 'page'}${
        privacyMode ? '' : ':'
      }`
      presenceData.state = document.title.slice(0, -11) || 'Unknown'
      break
    }
    // if profile is open
    case href.includes('/profile.php?id=')
      || !!document.querySelector('[data-imgperflogname="profileCoverPhoto"]')
      || !!document.querySelector(
        '[aria-label="Link to open profile cover photo"]',
      )
      || !!document.querySelector('[style*="padding-top: 37"]')
      || !!document.querySelector('[style*="padding-top:37"]'): {
      const selected = document.querySelector(
        '[style=\'background-color: var(--accent);\']',
      )?.parentElement?.textContent
      const profileUsername = document
        .querySelector('head > title')
        ?.innerHTML
        .replace(/(\(.*\))/g, '')
        .replace('| Facebook', '')
        .trim()

      presenceData.largeImageKey = privacyMode || !showCover
        ? ActivityAssets.Logo
        : document
          .querySelector('[mask*="url(#js"]')
          ?.firstElementChild
          ?.getAttribute('xlink:href') ?? ActivityAssets.Logo
      if (profileUsername) {
        if (privacyMode) {
          presenceData.details = strings.viewAProfile
        }
        else if (selected) {
          presenceData.details = `Viewing ${profileUsername}'s profile`
          presenceData.state = selected
        }
        else {
          presenceData.details = `Viewing ${profileUsername}'s Profile`
        }
        presenceData.buttons = [
          {
            label: 'View Profile',
            url: href,
          },
        ]
      }
      else {
        presenceData.details = strings.viewAProfile
      }
      break
    }
  }
  const pages: Record<string, PresenceData> = {
    '/events/calendar/': {
      details: privacyMode ? `Events - ${strings.browse}` : 'Events - Calendar',
    },
    '/events/going/': {
      details: privacyMode
        ? `Events - ${strings.browse}`
        : 'Events - Confirmed',
    },
    '/events/invites/': {
      details: privacyMode ? `Events - ${strings.browse}` : 'Events - Invires',
    },
    '/events/interested/': {
      details: privacyMode
        ? `Events - ${strings.browse}`
        : 'Events - Interested',
    },
    '/events/birthdays/': {
      details: privacyMode
        ? `Events - ${strings.browse}`
        : 'Events - Birthdays',
    },
    '/events/notifications/': {
      details: privacyMode
        ? `Events - ${strings.browse}`
        : 'Events - Notifcations',
    },
    '/events/create/': {
      details: privacyMode
        ? `Events - ${strings.browse}`
        : 'Events - Creating an event',
    },
    '/events/search/': {
      details: privacyMode
        ? `Events - ${strings.browse}`
        : `Events - ${strings.search}`,
    },
    '/pages/': {
      details: privacyMode
        ? `Pages - ${strings.browse}`
        : `Pages - ${lowercaseIt(strings.browse)}`,
    },
    '/oculus/': {
      details: privacyMode
        ? 'Ocoulus - Browsing oculus'
        : `Oculus - ${lowercaseIt(strings.browse)}`,
    },
    '/gaming/instantgames': {
      details: privacyMode
        ? `Gaming - ${strings.browse}`
        : 'Gaming - Instant games',
    },
    '/salesgroups/': {
      details: `SaleGroups - ${strings.browse}`,
    },
    '/jobs/': {
      details: `Jobs - ${strings.browse}`,
    },
    '/ads/': {
      details: `Ads - ${strings.browse}`,
    },
    '/weather/': {
      details: privacyMode
        ? `Weather - ${strings.browse}`
        : 'Weather - Viewing today',
    },
    '/saved/': {
      details: `Saved - ${strings.browse}`,
    },
    '/offers/': {
      details: `Offers - ${strings.browse}`,
    },
    '/recommendations/': {
      details: `Recommendations - ${strings.browse}`,
    },
    '/bookmarks': {
      details: `Bookmarks - ${strings.browse}`,
    },
    '/news': {
      details: `News - ${strings.browse}`,
    },
    '/gaming/feed': {
      details: privacyMode
        ? `Gaming - ${strings.browse}`
        : 'Gaming - Browsing the feed',
    },
    '/gaming/following': {
      details: privacyMode
        ? `Gaming - ${strings.browse}`
        : 'Gaming - Viewing following list',
    },
    '/gaming/browse': {
      details: `Gaming - ${strings.browse}`,
    },
    '/gaming/browse/live': {
      details: privacyMode
        ? `Gaming videos - ${strings.browse}`
        : 'Gaming - Browsing livestreams',
    },
    '/gaming/browse/streamers': {
      details: privacyMode
        ? `Gaming videos - ${strings.browse}`
        : 'Gaming - Browsing streamers',
    },
    '/gaming/recent': {
      details: privacyMode
        ? `Gaming - ${strings.browse}`
        : 'Gaming - Browsing livestreams',
    },
    '/gaming/recent/activity': {
      details: privacyMode
        ? `Gaming - ${strings.browse}`
        : 'Gaming - Browsing in recent livestreams',
    },
    '/gaming/recent/steamers': {
      details: privacyMode
        ? `Gaming - ${strings.browse}`
        : 'Gaming - Browsing in recent streamers',
    },
    '/gaming/recent/history': {
      details: privacyMode
        ? `Gaming - ${strings.browse}`
        : 'Gaming - Browsing in recent history',
    },
    '/games/recent': {
      details: privacyMode
        ? `Gaming - ${strings.browse}`
        : 'Gaming - Browsing in recent games',
    },
    '/gaming/tournaments/hosted': {
      details: privacyMode
        ? `Gaming tournaments - ${strings.browse}`
        : 'Gaming tournaments - Hosted',
    },
    '/gaming/tournaments/registered': {
      details: privacyMode
        ? `Gaming tournaments - ${strings.browse}`
        : 'Gaming tournaments - Registered',
    },
    '/gaming/tournaments/completed': {
      details: privacyMode
        ? `Gaming tournaments - ${strings.browse}`
        : 'Gaming tournaments - Completed',
    },
    '/gaming/play/registered': {
      details: privacyMode
        ? `Gaming - ${strings.browse}`
        : 'Gaming - Registered',
    },
    '/gaming/tournaments': {
      details: `Gaming tournaments - ${strings.browse}`,
    },
    '/gaming/play/completed': {
      details: privacyMode
        ? `Gaming - ${strings.browse}`
        : 'Gaming - Completed',
    },
    '/marketplace/you': {
      details: privacyMode
        ? `Marketplace - ${strings.browse}`
        : 'Marketplace - Viewing your recent activity',
    },
    '/marketplace/groups': {
      details: privacyMode
        ? `Marketplace - ${strings.browse}`
        : 'Marketplace - Viewing groups',
    },
    '/marketplace/stores': {
      details: privacyMode
        ? `Marketplace - ${strings.browse}`
        : 'Marketplace - Viewing stores',
    },
    '/marketplace/you/buying': {
      details: privacyMode
        ? `Marketplace - ${strings.browse}`
        : 'Marketplace - Viewing buying',
    },
    '/marketplace/you/selling': {
      details: privacyMode
        ? `Marketplace - ${strings.browse}`
        : 'Marketplace - Viewing selling',
    },
    '/marketplace/you/saved': {
      details: privacyMode
        ? `Marketplace - ${strings.browse}`
        : 'Marketplace - Viewing saved',
    },
    '/marketplace/you/dashboard': {
      details: privacyMode
        ? `Marketplace - ${strings.browse}`
        : 'Marketplace - Viewing the dashboard',
    },
    '/marketplace/notifications': {
      details: privacyMode
        ? `Marketplace - ${strings.browse}`
        : 'Marketplace - Viewing notifications',
    },
    '/marketplace/you/seller_announcement_center': {
      details: privacyMode
        ? `Marketplace - ${strings.browse}`
        : 'Marketplace - Viewing seller announcement center',
    },
    '/marketplace/you/insights': {
      details: privacyMode
        ? `Marketplace - ${strings.browse}`
        : 'Marketplace - Viewing seller insights',
    },
    '/settings': {
      details: `Settings - ${strings.browse}`,
    },
    '/places': {
      details: `Places - ${strings.browse}`,
    },
  }
  for (const [path, data] of Object.entries(pages)) {
    if (pathname.includes(path))
      presenceData = { ...presenceData, ...data } as PresenceData
  }

  if (!showTimestamp || dontShowTmp || privacyMode) {
    delete presenceData.startTimestamp
    delete presenceData.endTimestamp
  }

  if ((!showButtons || privacyMode) && presenceData.buttons)
    delete presenceData.buttons

  if (privacyMode && presenceData.state)
    delete presenceData.state
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
