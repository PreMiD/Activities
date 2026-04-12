import { ActivityType, Assets, getTimestamps, getTimestampsFromMedia, timestampFromFormat } from 'premid'

let elapsed = Math.floor(Date.now() / 1000)
let prevUrl = document.location.href
let oldLang = 'en'

enum ActivityAssets {
  BlackOps = 'https://cdn.rcd.gg/PreMiD/websites/T/Twitch/assets/0.png',
  DevMain = 'https://cdn.rcd.gg/PreMiD/websites/T/Twitch/assets/1.png',
  Purple = 'https://cdn.rcd.gg/PreMiD/websites/T/Twitch/assets/2.png',
  White = 'https://cdn.rcd.gg/PreMiD/websites/T/Twitch/assets/3.png',
  Pride = 'https://cdn.rcd.gg/PreMiD/websites/T/Twitch/assets/4.png',
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/T/Twitch/assets/5.png',
  DevWhite = 'https://cdn.rcd.gg/PreMiD/websites/T/Twitch/assets/6.png',
  DevPurple = 'https://cdn.rcd.gg/PreMiD/websites/T/Twitch/assets/7.png',
}

const presence = new Presence({
  clientId: '802958789555781663',
})
function getElement(query: string): string | undefined {
  return document.querySelector(query)?.textContent ?? undefined
}
async function getStrings() {
  return presence.getStrings(
    {
      play: 'general.playing',
      pause: 'general.paused',
      live: 'general.live',
      browse: 'general.browsing',
      viewPage: 'general.viewPage',
      home: 'twitch.home',
      download: 'twitch.downloads',
      jobs: 'twitch.jobs',
      turbo: 'twitch.turbo',
      partners: 'twitch.partners',
      press: 'twitch.press',
      security: 'twitch.security',
      access: 'twitch.access',
      ads: 'twitch.ads',
      guidelines: 'twitch.guidelines',
      terms: 'general.terms',
      privacy: 'general.privacy',
      cookie: 'general.cookie',
      watchingLive: 'general.watchingLive',
      watchingVid: 'general.watchingVid',
      viewProfile: 'general.viewProfile',
      viewCategory: 'general.viewCategory',
      viewWallet: 'twitch.wallet',
      viewEsports: 'twitch.esports',
      viewFollow: 'twitch.viewFollow',
      viewTeam: 'twitch.viewTeam',
      viewDropsInv: 'twitch.viewDropsInv',
      viewDropsComp: 'twitch.viewDropsComp',
      view: 'general.view',
      searchingFor: 'general.searchFor',
      searchingSomething: 'general.searchSomething',
      viewSettings: 'twitch.viewSettings',
      viewFriends: 'twitch.viewFriends',
      subs: 'twitch.subs',
      squad: 'twitch.squad',
      modStreamer: 'twitch.modStreamer',
      readingAbout: 'general.readingAbout',
      redeem: 'twitch.redeem',
      camp: 'twitch.camp',
      campBasic: 'twitch.campBasic',
      campSetup: 'twitch.campSetup',
      campLevel: 'twitch.campLevel',
      campConnect: 'twitch.campConnect',
      campReward: 'twitch.campReward',
      campMusic: 'twitch.campMusic',
      campLive: 'twitch.campLive',
      dashboard: 'twitch.dashboard',
      dashboardManage: 'twitch.dashboardManage',
      manageRoles: 'twitch.manageRoles',
      produce: 'twitch.produce',
      viewTheir: 'twitch.viewTheir',
      channelAnaly: 'twitch.channelAnaly',
      streamSum: 'twitch.streamSum',
      achievements: 'twitch.achievements',
      activity: 'twitch.activity',
      followList: 'twitch.followList',
      colls: 'twitch.colls',
      clips: 'twitch.clips',
      channelSettings: 'twitch.channelSettings',
      moderationSettings: 'twitch.moderationSettings',
      dropsSettings: 'twitch.dropsSettings',
      tools: 'twitch.tools',
      extensions: 'twitch.extensions',
      brand: 'twitch.brand',
      brandReal: 'twitch.brandReal',
      brandMadness: 'twitch.brandMadness',
      brandExpression: 'twitch.brandExpression',
      brandTogether: 'twitch.brandTogether',
      brandWatch: 'twitch.brandWatch',
      blogArchive: 'twitch.blogArchive',
      readingArticle: 'general.readingArticle',
      blogBrowse: 'twitch.blogBrowse',
      blogs: 'twitch.blogs',
      help: 'twitch.help',
      helpTopic: 'twitch.helpTopic',
      helpTopicCatalog: 'twitch.helpTopicCatalog',
      affiliate: 'twitch.affiliate',
      dev: 'twitch.dev',
      devProduct: 'twitch.devProduct',
      devShowcase: 'twitch.devShowcase',
      devSupport: 'twitch.devSupport',
      devDocs: 'twitch.devDocs',
      incident: 'general.incidentHistory',
      uptime: 'general.uptimeHistory',
      forums: 'general.forums',
      thread: 'general.readingThread',
      user: 'general.viewUser',
      watchStream: 'general.buttonWatchStream',
      watchVideo: 'general.buttonWatchVideo',
    },
  )
}
const devLogoArr = [ActivityAssets.DevMain, ActivityAssets.DevWhite, ActivityAssets.DevPurple]
const logoArr = [
  ActivityAssets.Logo,
  ActivityAssets.BlackOps,
  ActivityAssets.White,
  ActivityAssets.Purple,
  ActivityAssets.Pride,
]

let strings: Awaited<ReturnType<typeof getStrings>>

presence.on('UpdateData', async () => {
  const path = location.pathname.replace(/\/?$/, '/')
  const [
    showBrowsing,
    showLive,
    showVideo,
    showTimestamps,
    newLang,
    privacy,
    vidDetail,
    vidState,
    streamDetail,
    streamState,
    pfp,
    logo,
    devLogo,
    buttons,
    streamerTitle,
  ] = await Promise.all([
    presence.getSetting<boolean>('browse'),
    presence.getSetting<boolean>('live'),
    presence.getSetting<boolean>('video'),
    presence.getSetting<boolean>('timestamp'),
    presence.getSetting<string>('lang').catch(() => 'en'),
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<string>('vidDetail'),
    presence.getSetting<string>('vidState'),
    presence.getSetting<string>('streamDetail'),
    presence.getSetting<string>('streamState'),
    presence.getSetting<boolean>('profilePic'),
    presence.getSetting<number>('logo'),
    presence.getSetting<number>('devLogo'),
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('streamerTitle'),
  ])

  if (oldLang !== newLang || !strings) {
    oldLang = newLang
    strings = await getStrings()
  }

  let presenceData: PresenceData = {
    type: ActivityType.Watching,
    largeImageKey: logoArr[logo] || ActivityAssets.Logo,
    startTimestamp: elapsed,
  }

  if (document.location.href !== prevUrl) {
    prevUrl = document.location.href
    elapsed = Math.floor(Date.now() / 1000)
  }

  switch (document.location.hostname) {
    case 'www.twitch.tv': {
      //* Main website
      const statics = {
        '/downloads/': {
          details: strings.viewPage,
          state: strings.download,
        },
        '/jobs/': {
          details: strings.viewPage,
          state: strings.jobs,
        },
        '/turbo/': {
          details: strings.viewPage,
          state: strings.turbo,
        },
        '/broadcast/studio/': {
          details: strings.readingAbout,
          state: 'Twitch Studio',
        },
        '/redeem/': {
          details: strings.redeem,
        },
        '/p/partners/': {
          details: strings.viewPage,
          state: strings.partners,
        },
        '/p/press-center/': {
          details: strings.viewPage,
          state: strings.press,
        },
        '/p/security/': {
          details: strings.viewPage,
          state: strings.security,
        },
        '/p/legal/accessibility/': {
          details: strings.viewPage,
          state: strings.access,
        },
        '/p/legal/ad-choices/': {
          details: strings.viewPage,
          state: strings.ads,
        },
        '/p/legal/community-guidelines/': {
          details: strings.viewPage,
          state: strings.guidelines,
        },
        '/p/legal/cookie-policy/': {
          details: strings.viewPage,
          state: strings.cookie,
        },
        '/p/legal/privacy-notice/': {
          details: strings.viewPage,
          state: strings.privacy,
        },
        '/p/legal/terms-of-serice/': {
          details: strings.viewPage,
          state: strings.terms,
        },
        '/p/(\\w*|\\w*-\\w*)/about/': {
          details: strings.readingAbout,
          state: 'Twitch',
        },
        '/p/(\\w*|\\w*-\\w*)/stream/': {
          details: strings.readingAbout,
          state: 'How to stream',
        },
        '/p/(\\w*|\\w*-\\w*)/watch/': {
          details: strings.readingAbout,
          state: 'How to watch',
        },
        '/p/(\\w*|\\w*-\\w*)/company/': {
          details: strings.readingAbout,
          state: 'The Company',
        },
        '/p/(\\w*|\\w*-\\w*)/giftcard/': {
          details: strings.readingAbout,
          state: 'Giftcards',
        },
        '/p/(\\w*|\\w*-\\w*)/artists/': {
          details: strings.readingAbout,
          state: 'Artists',
        },
        '/creatorcamp/(\\w*|\\w*-\\w*)/learn-the-basics/': {
          details: `${strings.camp} | ${strings.viewPage}`,
          state: strings.campBasic,
        },
        '/creatorcamp/(\\w*|\\w*-\\w*)/setting-up-your-stream/': {
          details: `${strings.camp} | ${strings.viewPage}`,
          state: strings.campSetup,
        },
        '/creatorcamp/(\\w*|\\w*-\\w*)/level-up/': {
          details: `${strings.camp} | ${strings.viewPage}`,
          state: strings.campLevel,
        },
        '/creatorcamp/(\\w*|\\w*-\\w*)/connect-and-engage/': {
          details: `${strings.camp} | ${strings.viewPage}`,
          state: strings.campConnect,
        },
        '/creatorcamp/(\\w*|\\w*-\\w*)/get-rewarded/': {
          details: `${strings.camp} | ${strings.viewPage}`,
          state: strings.campReward,
        },
        '/creatorcamp/(\\w*|\\w*-\\w*)/twitch-music-getting-started/': {
          details: `${strings.camp} | ${strings.viewPage}`,
          state: strings.campMusic,
        },
        '/creatorcamp/(\\w*|\\w*-\\w*)/live/': {
          details: `${strings.camp} | ${strings.viewPage}`,
          state: strings.campLive,
        },
        '/creatorcamp/(\\w*|\\w*-\\w*)/': {
          details: `${strings.camp} | ${strings.viewPage}`,
          state: strings.home,
        },
      }

      if (showBrowsing) {
        for (const [k, v] of Object.entries(statics)) {
          if (path.match(k)) {
            presenceData.smallImageKey = Assets.Reading
            presenceData.smallImageText = strings.browse
            presenceData = { ...presenceData, ...v }
          }
        }

        if (path === '/') {
          presenceData.details = strings.browse
          presenceData.state = strings.home
        }

        // Chat popout. Breaks the activity so we early return to prevent update.
        if (path.includes('popout'))
          return

        let user = getElement('.home-header-sticky .tw-title')
        if (user) {
          const tab = getElement('a[aria-selected="true"] > div > div > p')
          const profilePic = (
            document.querySelector<HTMLImageElement>(
              '.tw-halo > .tw-aspect > .tw-avatar > .tw-image-avatar',
            )
            ?? document
              .querySelector('.channel-root__info')
              ?.querySelector<HTMLImageElement>('img[class*="image-avatar"]')
          )?.src?.replace(/-\d{1,2}x\d{1,2}/, '-600x600')
          ?? (logoArr[logo] || ActivityAssets.Logo)
          user += tab ? ` (${tab})` : ''

          presenceData.details = strings.viewProfile
          presenceData.state = user
          if (pfp)
            presenceData.largeImageKey = profilePic
        }

        if (path.includes('/team/')) {
          presenceData.details = strings.viewTeam
          presenceData.state = document.location.pathname
            .split('/')
            .pop()
            ?.split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
        }

        if (path.includes('/settings/')) {
          presenceData.details = strings.viewSettings
          presenceData.state = getElement('a[aria-selected="true"]')
        }

        let searching = false
        if (path.includes('/search/')) {
          searching = true

          presenceData.details = strings.searchingFor
          presenceData.state = document.querySelector<HTMLInputElement>('input')?.value
          presenceData.smallImageKey = Assets.Search
        }

        if (path.includes('/drops/inventory/'))
          presenceData.details = strings.viewDropsInv

        if (path.includes('/drops/campaigns/')) {
          presenceData.details = strings.viewDropsComp

          let activeDrop = null

          for (const drop of document.querySelector(
            '.drops-root__content > div:nth-child(4)',
          )?.children ?? []) {
            if (drop.children[0]?.children[0]?.ariaExpanded === 'true')
              activeDrop = `${drop.firstElementChild?.firstElementChild?.firstElementChild?.children[1]?.firstElementChild?.children[0]?.textContent} (${drop.firstElementChild?.firstElementChild?.firstElementChild?.children[1]?.firstElementChild?.children[1]?.textContent})`
          }

          if (activeDrop)
            presenceData.state = activeDrop
        }

        if (path.includes('/subscriptions/')) {
          const tab = getElement(
            'li:not([data-a-target="paid"]) > button[aria-selected="true"]',
          )

          presenceData.details = strings.subs
          if (tab)
            presenceData.state = tab.replace(/Subscriptions|Abonnements/, '')
        }

        if (path.includes('/wallet/')) {
          const tab = getElement(
            'li:not([data-index="0"]) > button[aria-selected="true"] > div > div > p',
          )

          presenceData.details = strings.viewWallet
          if (tab)
            presenceData.state = tab
        }

        const pathSplit = path.split('/')
        if (path.includes('/directory/following/')) {
          const tab = getElement(
            'li:not([data-index="0"]) > a[aria-selected="true"] > div > div > p',
          )

          presenceData.details = strings.viewFollow
          if (tab)
            presenceData.state = tab
        }
        else if (path.includes('/directory/esports/')) {
          presenceData.details = strings.viewEsports
          if (pathSplit.length > 4) {
            presenceData.state = getElement(
              `label[for="game_selector_${pathSplit[5]}"] > div > div > div.jnFWYC > p`,
            )
          }
        }
        else if (
          ['gaming', 'irl', 'music', 'creative'].includes(pathSplit[2]!)
        ) {
          presenceData.details = strings.viewCategory
          presenceData.state = getElement('h1.tw-title')
        }
        else if (path.includes('/directory/')) {
          presenceData.details = strings.browse
          presenceData.state = getElement(
            'a[aria-selected="true"] > div > div > p',
          )
        }

        if (privacy && searching) {
          presenceData.details = strings.searchingSomething
          delete presenceData.state
        }
        else if (privacy) {
          presenceData.details = strings.browse
          delete presenceData.state
          delete presenceData.smallImageKey
        }
      }

      if (path.includes('/squad/')) {
        const squad = document.querySelectorAll('.squad-stream-channel-card a')
        const squadNames: string[] = []

        for (const squadUser of squad) squadNames.push(squadUser.textContent!)

        presenceData.details = strings.squad
        presenceData.state = squadNames.join(', ')
        presenceData.smallImageKey = Assets.Live
        presenceData.smallImageText = strings.live
      }

      if (path.includes('/moderator/')) {
        presenceData.details = strings.modStreamer

        // the title on top of the display box
        let streamerinfo = document.querySelector('[data-a-target="player-info-title"]')?.textContent

        // "Streamername's Mod View - Twitch"
        if (!streamerinfo) {
          streamerinfo = document.title.split('\'s')[0]
        }

        // fallback, broken? Maybe just on my browser
        if (!streamerinfo) {
          streamerinfo = getElement('.stream-info-card p > a')
        }

        presenceData.state = streamerinfo

        if (getElement('.modview-dock-widget p') !== 'Offline') {
          presenceData.smallImageKey = Assets.Live
          presenceData.smallImageText = strings.live
        }
      }

      const video = document.querySelector<HTMLVideoElement>('video')
      if (
        !document.querySelector<HTMLDivElement>('.home-carousel-info')
        && document.querySelector<HTMLDivElement>('.channel-root')
        && video
      ) {
        const live = video.duration >= 1073741824

        if (showLive && live) {
          //* Live
          const title = getElement('p[data-a-target=\'stream-title\']')
          const streamer = document.querySelector('.channel-info-content h1')?.textContent
            ?? document
              .querySelector('[class*="metadata-layout__support"]')
              ?.querySelector('a')
              ?.textContent
          const game = getElement('a[data-a-target=\'stream-game-link\']')
            || 'Just Chatting'
          const profilePic = document
            .querySelector<HTMLImageElement>(
              '[class*=channel-info-content] [class*=tw-image]',
            )
            ?.src
            ?.replace(/-\d{1,2}x\d{1,2}/, '-600x600')
            ?? (logoArr[logo] || ActivityAssets.Logo)
          if (streamer && streamerTitle && !privacy) {
            presenceData.name = streamer
          }
          presenceData.details = streamDetail
            .replace('%title%', title ?? '')
            .replace('%streamer%', streamer ?? '')
            .replace('%game%', game)

          presenceData.state = streamState
            .replace('%title%', title ?? '')
            .replace('%streamer%', streamer ?? '')
            .replace('%game%', game)

          if (!presenceData.details)
            presenceData.details = strings.watchingLive

          presenceData.smallImageKey = Assets.Live
          presenceData.smallImageText = strings.live
          if (pfp)
            presenceData.largeImageKey = profilePic

          presenceData.buttons = [
            {
              label: strings.watchStream,
              url: document.URL.split('?')[0]!,
            },
          ]
        }

        if (showVideo && !live) {
          //* Video or Clips
          const title = getElement('[data-a-target="stream-title"]')
            ?.split('•')
            .shift()
          const uploader = document.querySelector('.channel-info-content h1')?.textContent
            ?? document
              .querySelector('[class*="metadata-layout__support"]')
              ?.querySelector('a')
              ?.textContent
          const game = getElement('a[data-a-target=\'stream-game-link\']')
            || 'Just Chatting'
          const profilePic = document
            .querySelector<HTMLImageElement>(
              '.channel-info-content .tw-avatar > .tw-image',
            )
            ?.src
            ?.replace(/-\d{1,2}x\d{1,2}/, '-600x600')
            ?? (logoArr[logo] || ActivityAssets.Logo)
          presenceData.details = vidDetail
            .replace('%title%', title ?? '')
            .replace('%uploader%', uploader ?? '')
            .replace('%game%', game)
          presenceData.state = vidState
            .replace('%title%', title ?? '')
            .replace('%uploader%', uploader ?? '')
            .replace('%game%', game)
          presenceData.smallImageKey = Assets.Play
          presenceData.smallImageText = strings.play
          if (pfp)
            presenceData.largeImageKey = profilePic;

          [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestampsFromMedia(video)

          presenceData.buttons = [
            {
              label: strings.watchVideo,
              url: document.URL.split('?')[0]!,
            },
          ]
        }

        if (((showLive && live) || (showVideo && !live)) && video.paused) {
          delete presenceData.startTimestamp
          delete presenceData.endTimestamp
          presenceData.smallImageKey = Assets.Pause
          presenceData.smallImageText = strings.pause
        }

        //* Privacy mode enabled.
        if (privacy && showLive && live) {
          presenceData.details = strings.watchingLive
          delete presenceData.state
        }
        else if (privacy && showVideo && !live) {
          presenceData.details = strings.watchingVid
          delete presenceData.state
        }
        else if (showBrowsing && (!showVideo || !showLive)) {
          presenceData.details = strings.browse
          delete presenceData.state
        }
      }

      break
    }
    case 'dashboard.twitch.tv': {
      //* Creator Dashboard
      if (showBrowsing) {
        const statics = {
          '/home/': {
            details: `${strings.dashboard} | ${strings.viewPage}`,
            state: strings.home,
          },
          '/stream-manager/': {
            details: strings.dashboard,
            state: strings.dashboardManage,
          },
          '/channel-analytics/': {
            details: `${strings.dashboard} | ${strings.viewTheir}`,
            state: strings.channelAnaly,
          },
          '/stream-summary/': {
            details: `${strings.dashboard} | ${strings.viewTheir}`,
            state: strings.streamSum,
          },
          '/achievements/': {
            details: `${strings.dashboard} | ${strings.viewTheir}`,
            state: strings.achievements,
          },
          '/community/roles/': {
            details: strings.dashboard,
            state: strings.manageRoles,
          },
          '/community/activity/': {
            details: `${strings.dashboard} | ${strings.viewTheir}`,
            state: strings.activity,
          },
          '/community/followers-list/': {
            details: `${strings.dashboard} | ${strings.viewTheir}`,
            state: strings.followList,
          },
          '/content/video-producer/': {
            details: strings.dashboard,
            state: strings.produce,
          },
          '/content/collections/': {
            details: `${strings.dashboard} | ${strings.viewTheir}`,
            state: strings.colls,
          },
          '/content/clips/': {
            details: `${strings.dashboard} | ${strings.viewTheir}`,
            state: strings.clips,
          },
          '/settings/channel/': {
            details: `${strings.dashboard} | ${strings.viewTheir}`,
            state: strings.channelSettings,
          },
          '/settings/moderation/': {
            details: `${strings.dashboard} | ${strings.viewTheir}`,
            state: strings.moderationSettings,
          },
          '/drops/': {
            details: `${strings.dashboard} | ${strings.viewTheir}`,
            state: strings.dropsSettings,
          },
          '/broadcast/': {
            details: strings.dashboard,
            state: strings.tools,
          },
          '/extensions/': {
            details: strings.dashboard,
            state: strings.extensions,
          },
        }

        for (const [k, v] of Object.entries(statics)) {
          if (path.match(k)) {
            presenceData.smallImageKey = Assets.Reading
            presenceData.smallImageText = strings.browse
            presenceData = { ...presenceData, ...v }
          }
        }

        if (privacy) {
          presenceData.details = strings.browse
          delete presenceData.state
          delete presenceData.smallImageKey
        }
      }

      break
    }
    case 'brand.twitch.tv': {
      //* Brand website
      if (showBrowsing) {
        const statics = {
          '/brand/': {
            details: strings.brand,
            state: strings.brandReal,
          },
          '/madness/': {
            details: strings.brand,
            state: strings.brandMadness,
          },
          '/expression/': {
            details: strings.brand,
            state: strings.brandExpression,
          },
          '/together/': {
            details: strings.brand,
            state: strings.brandTogether,
          },
        }

        for (const [k, v] of Object.entries(statics)) {
          if (path.match(k)) {
            presenceData.smallImageKey = Assets.Reading
            presenceData.smallImageText = strings.browse
            presenceData = { ...presenceData, ...v }
          }
        }

        if (
          path === '/'
          && document.querySelector('.plyr')?.className.includes('plyr--playing')
        ) {
          presenceData.details = strings.brandWatch
          presenceData.smallImageKey = Assets.Play
          presenceData.smallImageText = strings.play;
          [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(
            timestampFromFormat(
              document.querySelector('.c-controls__time.plyr__time--current')
                ?.textContent ?? '',
            ),
            timestampFromFormat('01:30'),
          )
        }
        else if (path === '/') {
          presenceData.details = strings.brand
        }

        if (privacy) {
          presenceData.details = strings.browse
          delete presenceData.state
          delete presenceData.smallImageKey
        }
      }

      break
    }
    case 'blog.twitch.tv': {
      //* Blog website
      if (showBrowsing) {
        const statics = {
          '/': {
            details: strings.blogBrowse,
          },
          '/(\\w*|\\w*-\\w*)/archive/': {
            details: strings.blogArchive.replace(
              '{0}',
              location.pathname.replace(/\/?$/, '/').split('/')[3] ?? '',
            ),
          },
          '/(\\w*|\\w*-\\w*)/(\\d*)/(\\d*)/(\\d*)/((\\w*|\\w*-\\w*)*)/': {
            details: `${strings.blogs} | ${strings.readingArticle}`,
            state: document.querySelector('.c-page-heading__text')?.textContent,
          },
        }

        for (const [k, v] of Object.entries(statics)) {
          if (path.match(k)) {
            presenceData.smallImageKey = Assets.Reading
            presenceData.smallImageText = strings.browse
            presenceData = { ...presenceData, ...v }
          }
        }

        if (privacy) {
          presenceData.details = strings.browse
          delete presenceData.state
          delete presenceData.smallImageKey
        }
      }

      break
    }
    case 'help.twitch.tv': {
      //* Help website
      if (showBrowsing) {
        const statics = {
          '/s/': {
            details: `${strings.help} | ${strings.browse}`,
          },
          '/s/topiccatalog/': {
            details: strings.helpTopicCatalog,
          },
          '/s/topic/': {
            details: strings.helpTopic,
            state: document.querySelector('.headlineTitle')?.textContent,
          },
          '/s/article/': {
            details: `${strings.help} | ${strings.readingArticle}`,
            state: document.querySelector('.articleTitle')?.textContent,
          },
        }

        for (const [k, v] of Object.entries(statics)) {
          if (path.match(k)) {
            presenceData.smallImageKey = Assets.Reading
            presenceData.smallImageText = strings.browse
            presenceData = { ...presenceData, ...v }
          }
        }

        if (privacy) {
          presenceData.details = strings.browse
          delete presenceData.state
          delete presenceData.smallImageKey
        }
      }

      break
    }
    case 'affiliate.twitch.tv': {
      //* Help website
      if (showBrowsing) {
        presenceData.details = strings.readingAbout
        presenceData.state = strings.affiliate
        presenceData.smallImageKey = Assets.Reading
        presenceData.smallImageText = strings.browse

        if (privacy) {
          presenceData.details = strings.browse
          delete presenceData.state
          delete presenceData.smallImageKey
        }
      }

      break
    }
    case 'dev.twitch.tv': {
      //* Dev docs
      presenceData.largeImageKey = devLogoArr[devLogo] || ActivityAssets.DevMain
      if (showBrowsing) {
        const statics = {
          '/': {
            details: `${strings.dev} | ${strings.browse}`,
          },
          '/products/': {
            details: `${strings.dev} | ${strings.view}`,
            state: strings.devProduct,
          },
          '/showcase/': {
            details: `${strings.dev} | ${strings.view}`,
            state: strings.devShowcase,
          },
          '/support/': {
            details: `${strings.dev} | ${strings.view}`,
            state: strings.devSupport,
          },
          '/docs/': {
            details: strings.devDocs,
            state: strings.browse,
          },
          '/docs/(\\w*|\\w*-\\w*)/': {
            details: `${strings.devDocs} | ${strings.readingAbout}`,
            state: document.querySelector('.text-content > h1')?.textContent,
          },
        }

        for (const [k, v] of Object.entries(statics)) {
          if (path.match(k)) {
            presenceData.smallImageKey = Assets.Reading
            presenceData.smallImageText = strings.browse
            presenceData = { ...presenceData, ...v }
          }
        }

        if (privacy) {
          presenceData.details = strings.browse
          delete presenceData.state
          delete presenceData.smallImageKey
        }
      }

      break
    }
    case 'discuss.dev.twitch.tv': {
      // ! Development forums
      presenceData.largeImageKey = devLogoArr[devLogo] || ActivityAssets.DevMain
      if (showBrowsing) {
        const statics = {
          '/': {
            details: `${strings.dev} (${strings.forums}) | ${strings.browse}`,
          },
          '/c/': {
            details: `${strings.dev} (${strings.forums}) | ${strings.viewCategory}`,
            state: document.querySelector('.category-name')?.textContent,
          },
          '/t/': {
            details: `${strings.dev} (${strings.forums}) | ${strings.thread}`,
            state: document.querySelector('.fancy-title')?.textContent,
          },
          '/u/': {
            details: `${strings.dev} (${strings.forums}) | ${strings.user}`,
            state: document.querySelector('.username')?.textContent,
          },
        }

        for (const [k, v] of Object.entries(statics)) {
          if (path.match(k)) {
            presenceData.smallImageKey = Assets.Reading
            presenceData.smallImageText = strings.browse
            presenceData = { ...presenceData, ...v }
          }
        }

        if (privacy) {
          presenceData.details = strings.browse
          delete presenceData.state
          delete presenceData.smallImageKey
        }
      }

      break
    }
    case 'devstatus.twitch.tv':
    case 'status.twitch.tv': {
      //* Status pages
      if (document.location.hostname === 'devstatus.twitch.tv')
        presenceData.largeImageKey = devLogoArr[devLogo] || ActivityAssets.DevMain
      if (showBrowsing) {
        const statics = {
          '/': {
            details: `Status page | ${strings.browse}`,
          },
          '/incidents/': {
            details: `Status page | ${strings.view}`,
            state: document.querySelector('.page-title > div')?.textContent,
          },
          '/history/': {
            details: `Status page | ${strings.view}`,
            state: strings.incident,
          },
          '/uptime/': {
            details: `Status page | ${strings.view}`,
            state: strings.uptime,
          },
        }

        for (const [k, v] of Object.entries(statics)) {
          if (path.match(k)) {
            presenceData.smallImageKey = Assets.Reading
            presenceData.smallImageText = strings.browse
            presenceData = { ...presenceData, ...v }
          }
        }

        if (privacy) {
          presenceData.details = strings.browse
          delete presenceData.state
          delete presenceData.smallImageKey
        }
      }

      break
    }
  }

  if (!showTimestamps) {
    delete presenceData.startTimestamp
    delete presenceData.endTimestamp
  }
  if (privacy || !buttons)
    delete presenceData.buttons

  if (privacy)
    delete presenceData.name

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.clearActivity()
})
