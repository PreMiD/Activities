import { ActivityType, Assets, getTimestampsFromMedia } from 'premid'

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
      buttonViewEpisode: 'general.buttonViewEpisode',
      buttonViewProfile: 'general.buttonViewProfile',
      buttonWatchStream: 'general.buttonWatchStream',
      buttonWatchVideo: 'general.buttonWatchVideo',
      live: 'general.live',
      ofUser: 'general.ofUser',
      onProfileOf: 'facebook.onProfileOf',
      paused: 'general.paused',
      play: 'general.playing',
      search: 'general.searchSomething',
      searchFor: 'general.searchFor',
      viewAProfile: 'general.viewAProfile',
      viewCategory: 'general.viewCategory',
      viewHome: 'general.viewHome',
      viewMovie: 'general.viewMovie',
      viewProfileOf: 'general.viewProfileOf',
      viewShow: 'general.viewShow',
      watchingLive: 'general.watchingLive',
      watchingVid: 'general.watchingVid',
    },
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
    vidDetail,
    vidState,
  ] = await Promise.all([
    presence.getSetting<boolean>('privacyMode'),
    presence.getSetting<boolean>('cover'),
    presence.getSetting<boolean>('timestamp'),
    presence.getSetting<boolean>('searchQuery'),
    presence.getSetting<boolean>('messagerUsername'),
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<string>('vidDetail'),
    presence.getSetting<string>('vidState'),
  ])
  const video = document.querySelector<HTMLVideoElement>('video')
  const liveCheck = document
    .querySelector('[class="x78zum5 xxk0z11 x10l6tqk x1i5ckhj xoyzfg9"]')
    ?.querySelector('span')
    ?.textContent ?? document.querySelector<HTMLElement>('.x1b0d499.x1d2xfc3')?.style

  let dontShowTmp = false

  if (!strings)
    strings = await getStrings()

  switch (true) {
    case pathname === '/': {
      presenceData.details = 'Viewing home page'
      break
    }
    case pathname.includes('/watch') && !!video:
    case pathname.includes('/videos') && !!video: {
      (presenceData as PresenceData).type = ActivityType.Watching

      const options = {
        title: document.querySelector('.x78zum5.xdt5ytf.xtp0wl1')?.querySelector('.xzueoph.x1k70j0n')?.textContent ?? document.querySelector('a[aria-label] > span > [class*="x1n2onr6"]')?.textContent ?? document.querySelector('[class="xzueoph x1k70j0n"]')?.textContent ?? 'unknown title',
        creator: document.querySelector('.xjp7ctv > span')?.querySelector('a')?.textContent ?? document.querySelector('h1')?.textContent?.trim() ?? 'unknown creator',
        watching: !liveCheck ? strings.watchingVid : strings.watchingLive,
        onprofile: strings.onProfileOf,
      }
      presenceData.name = 'Facebook Watch'

      presenceData.details = privacyMode
        ? options.watching
        : vidDetail.replace('%title%', options.title).replace('%creator%', options.creator).replace('%watching%', options.watching).replace('%onprofile%', options.onprofile)

      presenceData.state = !privacyMode && vidState !== '{0}' ? vidState.replace('%title%', options.title).replace('%creator%', options.creator).replace('%watching%', options.watching).replace('%onprofile%', options.onprofile) : ''
      switch (true) {
        case !!liveCheck: {
          presenceData.smallImageKey = video.paused
            ? Assets.Pause
            : Assets.Live
          presenceData.smallImageText = video.paused
            ? strings.paused
            : strings.live

          presenceData.buttons = [
            {
              label: strings.buttonWatchStream,
              url: href,
            },
          ]
          break
        }
        case pathname.includes('/videos/'): {
          const allVideos = document.querySelectorAll('video')
          const currVideo = allVideos[allVideos.length - 1] ?? video
          presenceData.smallImageKey = currVideo.paused
            ? Assets.Pause
            : Assets.Play
          presenceData.smallImageText = currVideo.paused
            ? strings.paused
            : strings.play

          if (currVideo.paused) {
            dontShowTmp = true
          }
          else {
            [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestampsFromMedia(currVideo)
          }

          break
        }
        default: {
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
            [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestampsFromMedia(video)
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
      presenceData.name = 'Facebook Messenger'
      presenceData.largeImageKey = ActivityAssets.MessengerLogo
      switch (true) {
        case pathname.includes('/t/'): {
          const username = document
            .querySelector('div.t6p9ggj4.tkr6xdv7')
            ?.querySelector('span > span')
            ?.textContent
          if (document.querySelector('[data-text="true"]')?.textContent) {
            presenceData.details = privacyMode
              ? 'Writing a message to someone'
              : messagerUsername ? 'Writing a message to:' : 'Writing a message to someone'
            presenceData.state = messagerUsername ? username : '(Hidden)'
          }
          else {
            presenceData.details = privacyMode
              ? 'Reading messages'
              : messagerUsername ? 'Reading messages from:' : 'Reading messages'
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

        case video && pathname.includes('/videos/'): {
          presenceData.details = privacyMode
            ? `Watching a ${strings.watchingVid}`
            : 'Watching a video on:'
          presenceData.state = `${document.querySelector('.xzueoph.x1k70j0n')?.textContent
          ?? document.querySelector('span.x193iq5w > strong > span')
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
            [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestampsFromMedia(video)
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
          presenceData.details = `Watch ${strings.watchingVid} ${
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
            [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestampsFromMedia(playingVid)
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
          presenceData.name = 'Facebook Watch'
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
              presenceData.details = `${strings.watchingVid}: ${
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
                [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestampsFromMedia(cached.element)
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
              presenceData.details = `${strings.watchingVid}: ${playingVidClose?.querySelector('[class="x14vqqas"]')
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
              presenceData.details = `Watch ${strings.browse}`
            }
          }

          break
        }
        case hrefReplaced === 'https://www.facebook.com/watch/saved': {
          presenceData.details = 'Viewing saved videos'
          break
        }
        case hrefReplaced === 'https://www.facebook.com/watch/shows': {
          presenceData.details = 'Browsing shows'
          break
        }
        case hrefReplaced === 'https://www.facebook.com/watch/live': {
          const parseInfo = document.querySelector(
            '[data-bootloader-hash="UhexK6g"]',
          )?.nextElementSibling?.nextElementSibling?.nextElementSibling?.nextElementSibling?.innerHTML
          presenceData.smallImageKey = Assets.Live
          presenceData.details = strings.watchingLive
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
              'h1',
            )?.textContent
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
      presenceData.name = 'Facebook Reels'
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
      presenceData.name = 'Facebook Marketplace'
      presenceData.largeImageKey = ActivityAssets.MarketplaceLogo

      switch (true) {
        case pathname.includes('/search/'): {
          presenceData.smallImageKey = Assets.Search

          presenceData.details = `${lowercaseIt(
            strings.searchFor,
          )}:`
          presenceData.state = showSeachQuery
            ? decodeURI(new URLSearchParams(location.search).get('q')!)
            : '(Hidden)'
          break
        }
        case pathname.includes('/item/'): {
          presenceData.details = privacyMode
            ? 'Viewing an item'
            : 'Viewing item:'
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
          presenceData.details = `${strings.browse}`
        }
      }
      break
    }
    case pathname.includes('/groups/'): {
      presenceData.name = 'Facebook Groups'
      switch (pathname.split('/')[2]) {
        case 'discover':
          presenceData.details = privacyMode
            ? strings.browse
            : 'Discover'
          break
        case 'feed':
          presenceData.details = privacyMode
            ? strings.browse
            : 'Feed'
          break
        case 'notifications':
          presenceData.details = privacyMode
            ? strings.browse
            : 'Notifications'
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
            presenceData.details = strings.browse
          }
        }
      }
      break
    }
    case pathname.includes('/friends'): {
      presenceData.name = 'Facebook Friends'
      switch (true) {
        case pathname.includes('/friends/requests'): {
          if (
            document.querySelector(
              'div.cjfnh4rs.l9j0dhe7.du4w35lb.j83agx80.cbu4d94t',
            )
          ) {
            presenceData.details = privacyMode
              ? strings.browse
              : 'Sent requests'
          }
          else {
            presenceData.state = privacyMode ? strings.browse : 'Requests'
          }
          break
        }
        case pathname === '/friends/suggestions': {
          presenceData.details = presenceData.state = privacyMode
            ? strings.browse
            : 'Requests'
          break
        }
        case pathname.includes('/friends/suggestions/'): {
          presenceData.details = 'Suggestions'
          presenceData.state = `${strings.viewProfileOf} ${document
            .querySelector('h1')
            ?.textContent}`
          break
        }
        case pathname.includes('/friends/list'): {
          presenceData.details = presenceData.state = privacyMode
            ? strings.browse
            : 'All Friends'
          break
        }
        case pathname.includes('/friends/birthdays'): {
          presenceData.details = presenceData.state = privacyMode
            ? strings.browse
            : 'Birthdays'
          break
        }
        case pathname.includes('/friends/friendlist'): {
          presenceData.details = presenceData.state = privacyMode
            ? strings.browse
            : 'Custom lists'
          break
        }
      }

      break
    }
    case pathname.includes('/events'): {
      presenceData.name = 'Facebook Events'
      if (/events\/\d/.test(pathname)) {
        presenceData.details = privacyMode
          ? 'Viewing an event'
          : 'Viewing event:'
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
          ? 'Home'
          : strings.browse
      }
      break
    }
    case pathname.includes('/gaming/'): {
      presenceData.largeImageKey = ActivityAssets.GamingLogo
      presenceData.name = 'Facebook Gaming'
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
            presenceData.details = 'Playing'
          }

          break
        }
        case pathname.includes('gaming/play'): {
          presenceData.details = 'Playing'
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
        : '(Hidden)'
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
        .querySelector('h1')
        ?.textContent

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
      name: 'Facebook Events',
      details: privacyMode ? strings.browse : 'Calendar',
    },
    '/events/going/': {
      name: 'Facebook Events',
      details: privacyMode ? strings.browse : 'Confirmed',
    },
    '/events/invites/': {
      name: 'Facebook Events',
      details: privacyMode ? strings.browse : 'Invites',
    },
    '/events/interested/': {
      name: 'Facebook Events',
      details: privacyMode ? strings.browse : 'Interested',
    },
    '/events/birthdays/': {
      name: 'Facebook Events',
      details: privacyMode ? strings.browse : 'Birthdays',
    },
    '/events/notifications/': {
      name: 'Facebook Events',
      details: privacyMode ? strings.browse : 'Notifications',
    },
    '/events/create/': {
      name: 'Facebook Events',
      details: privacyMode ? strings.browse : 'Creating an event',
    },
    '/events/search/': {
      name: 'Facebook Events',
      details: privacyMode ? strings.browse : strings.search,
    },
    '/pages/': {
      name: 'Facebook Pages',
      details: strings.browse,
    },
    '/oculus/': {
      name: 'Facebook Oculus',
      details: strings.browse,
    },
    '/gaming/instantgames': {
      name: 'Facebook Games',
      details: privacyMode ? strings.browse : 'Instant Games',
    },
    '/salesgroups/': {
      name: 'Facebook Sales Groups',
      details: strings.browse,
    },
    '/jobs/': {
      name: 'Facebook ADs',
      details: strings.browse,
    },
    '/ads/': {
      name: 'Facebook ADs',
      details: strings.browse,
    },
    '/weather/': {
      name: 'Facebook Weather',
      details: privacyMode ? strings.browse : 'Viewing today',
    },
    '/saved/': {
      name: 'Facebook Saved',
      details: strings.browse,
    },
    '/offers/': {
      name: 'Facebook Offers',
      details: strings.browse,
    },
    '/recommendations/': {
      name: 'Facebook Recommendations',
      details: strings.browse,
    },
    '/bookmarks': {
      name: 'Facebook Bookmarks',
      details: strings.browse,
    },
    '/news': {
      name: 'Facebook News',
      details: strings.browse,
    },
    '/gaming/feed': {
      name: 'Facebook Gaming',
      details: privacyMode ? strings.browse : 'Browsing the feed',
    },
    '/gaming/following': {
      name: 'Facebook Gaming',
      details: privacyMode ? strings.browse : 'Viewing their following list',
    },
    '/gaming/browse': {
      name: 'Facebook Gaming',
      details: strings.browse,
    },
    '/gaming/browse/live': {
      name: 'Facebook Gaming',
      details: privacyMode ? strings.browse : `Livestreams ${strings.browse}`,
    },
    '/gaming/browse/streamers': {
      name: 'Facebook Gaming',
      details: privacyMode ? strings.browse : `Streamers ${strings.browse}`,
    },
    '/gaming/recent': {
      name: 'Facebook Gaming',
      details: privacyMode ? strings.browse : `Recent livestreams ${strings.browse}`,
    },
    '/gaming/recent/activity': {
      name: 'Facebook Gaming',
      details: privacyMode ? strings.browse : `Recent activity ${strings.browse}`,
    },
    '/gaming/recent/steamers': {
      name: 'Facebook Gaming',
      details: privacyMode ? strings.browse : `Recent streamers ${strings.browse}`,
    },
    '/gaming/recent/history': {
      name: 'Facebook Gaming',
      details: privacyMode ? strings.browse : `Recent history ${strings.browse}`,
    },
    '/games/recent': {
      name: 'Facebook Gaming',
      details: privacyMode ? strings.browse : `Recent games ${strings.browse}`,
    },
    '/gaming/tournaments/hosted': {
      name: 'Facebook Gaming',
      details: privacyMode ? strings.browse : `Hosted tournaments ${strings.browse}`,
    },
    '/gaming/tournaments/registered': {
      name: 'Facebook Gaming',
      details: privacyMode ? strings.browse : `Registered tournaments ${strings.browse}`,
    },
    '/gaming/tournaments/completed': {
      name: 'Facebook Gaming',
      details: privacyMode ? strings.browse : `Completed tournaments ${strings.browse}`,
    },
    '/gaming/play/registered': {
      name: 'Facebook Gaming',
      details: privacyMode ? strings.browse : `Registered play ${strings.browse}`,
    },
    '/gaming/tournaments': {
      name: 'Facebook Gaming',
      details: `Tournaments ${strings.browse}`,
    },
    '/gaming/play/completed': {
      name: 'Facebook Gaming',
      details: privacyMode ? strings.browse : `Completed play ${strings.browse}`,
    },
    '/marketplace/you': {
      name: 'Facebook Marketplace',
      details: privacyMode ? strings.browse : 'Viewing recent activity',
    },
    '/marketplace/groups': {
      name: 'Facebook Marketplace',
      details: privacyMode ? strings.browse : 'Viewing groups',
    },
    '/marketplace/stores': {
      name: 'Facebook Marketplace',
      details: privacyMode ? strings.browse : 'Viewing stores',
    },
    '/marketplace/you/buying': {
      name: 'Facebook Marketplace',
      details: privacyMode ? strings.browse : 'Viewing buying',
    },
    '/marketplace/you/selling': {
      name: 'Facebook Marketplace',
      details: privacyMode ? strings.browse : 'Viewing selling',
    },
    '/marketplace/you/saved': {
      name: 'Facebook Marketplace',
      details: privacyMode ? strings.browse : 'Viewing saved items',
    },
    '/marketplace/you/dashboard': {
      name: 'Facebook Marketplace',
      details: privacyMode ? strings.browse : 'Viewing the dashboard',
    },
    '/marketplace/notifications': {
      name: 'Facebook Marketplace',
      details: privacyMode ? strings.browse : 'Viewing notifications',
    },
    '/marketplace/you/seller_announcement_center': {
      name: 'Facebook Marketplace',
      details: privacyMode ? strings.browse : 'Viewing the seller announcement center',
    },
    '/marketplace/you/insights': {
      name: 'Facebook Marketplace',
      details: privacyMode ? strings.browse : 'Viewing seller insights',
    },
    '/settings': {
      name: 'Facebook Settings',
      details: strings.browse,
    },
    '/places': {
      name: 'Facebook Places',
      details: strings.browse,
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
  if (presenceData.endTimestamp && presenceData.type !== ActivityType.Watching) {
    (presenceData as PresenceData).type = ActivityType.Watching
  }
  if (presenceData.details || presenceData.name)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
