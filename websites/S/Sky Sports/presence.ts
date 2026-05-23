import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '1013092464212586586',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/S/Sky%20Sports/assets/logo.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    type: ActivityType.Playing,
  }
  const setting = {
    showButtons: await presence.getSetting<boolean>('showButtons'),
    privacy: await presence.getSetting<boolean>('privacy'),
  }
  const urlpath = document.location.pathname.split('/')

  if (!setting.privacy) {
    presenceData.startTimestamp = browsingTimestamp
  }

  if (!urlpath[1]) {
    presenceData.details = 'Home'
  }
  else {
    if (
      // News articles
      urlpath[2] === 'news'
      || urlpath[2] === 'live-blog'
    ) {
      presenceData.details = setting.privacy
        ? 'Reading article'
        : 'Reading article:'
      if (!setting.privacy) {
        const articleTitle = document.querySelector<HTMLMetaElement>(
          '[class="sdc-article-header__long-title"]',
        )
        presenceData.state = articleTitle?.textContent ?? 'Latest'
      }

      if (setting.showButtons && !setting.privacy) {
        presenceData.buttons = [
          {
            label: 'Read More',
            url: document.location.href,
          },
        ]
      }
    }
    if (
      // Live channels
      urlpath[1] === 'watch'
      || urlpath[2] === 'watch'
    ) {
      presenceData.details = setting.privacy
        ? 'Viewing live channel'
        : 'Viewing live:'
      if (!setting.privacy) {
        const liveTitle = document.querySelector<HTMLMetaElement>(
          '[class="watch-channel__title-text"]',
        )
        presenceData.state = liveTitle?.textContent ?? 'TV Guide'
        presenceData.smallImageKey = Assets.Live
        presenceData.smallImageText = 'Watching live'
      }

      if (setting.showButtons && !setting.privacy) {
        presenceData.buttons = [
          {
            label: 'Watch Live',
            url: document.location.href,
          },
        ]
      }
    }
    if (urlpath[1] === 'f1') {
      // F1 presences
      presenceData.details = 'Reading F1 news'
      if (urlpath[2] === 'standings') {
        presenceData.details = 'Viewing F1 standings'
      }
      if (urlpath[2] === 'schedule-results') {
        presenceData.details = 'Viewing F1 schedule & results'
      }
      if (urlpath[2] === 'drivers-teams') {
        presenceData.details = 'Viewing F1 drivers & teams'
      }
      if (urlpath[2] === 'opinion') {
        presenceData.details = 'Reading F1 opinions'
      }
      if (urlpath[2] === 'drivers') {
        presenceData.details = setting.privacy
          ? 'Viewing F1 drivers'
          : 'Viewing F1 driver:'
        if (!setting.privacy) {
          presenceData.state = document.querySelector<HTMLMetaElement>(
            '[class="swap-text__target"]',
          )
        }
      }
      if (urlpath[2] === 'teams') {
        presenceData.details = setting.privacy
          ? 'Viewing F1 teams'
          : 'Viewing F1 team:'
        if (!setting.privacy) {
          presenceData.state = document.querySelector<HTMLMetaElement>(
            '[class="swap-text__target"]',
          )
        }
      }
    }
    if (
      // Scores pages
      urlpath[1] === 'football-scores-fixtures'
      || urlpath[1] === 'live-scores'
      || urlpath[2] === 'scores-fixtures'
      || urlpath[2] === 'fixtures'
      || urlpath[2] === 'results'
    ) {
      presenceData.details = 'Viewing results & fixtures'
    }
    if (urlpath[1] === 'football') {
      // Football
      if (urlpath[2] === 'tables') {
        presenceData.details = 'Viewing football tables'
      }
      if (urlpath[2] === 'transfer-centre') {
        presenceData.details = 'Viewing football transfers'
      }
      if (urlpath[2] === 'teams') {
        presenceData.details = 'Viewing football teams'
      }
      if (urlpath[2] === 'competitions') {
        presenceData.details = 'Viewing football leagues & cups'
      }
    }
    else if (
      // categories
      urlpath[1] === 'football'
      || urlpath[1] === 'cricket'
      || urlpath[1] === 'golf'
      || urlpath[1] === 'tennis'
      || urlpath[1] === 'boxing'
      || urlpath[1] === 'rugby-union'
      || urlpath[1] === 'rugby-league'
      || urlpath[1] === 'darts'
      || urlpath[1] === 'racing'
      || urlpath[1] === 'nfl'
      || urlpath[1] === 'netball'
      || urlpath[1] === 'mma'
    ) {
      presenceData.details = setting.privacy ? 'Reading news' : 'Reading news:'
      if (!setting.privacy) {
        const categoryTitle = document.querySelector<HTMLMetaElement>(
          '[class="sdc-site-localnav__header-title"]',
        )
        presenceData.state = categoryTitle?.textContent ?? 'Latest'
      }

      if (setting.showButtons && !setting.privacy) {
        presenceData.buttons = [
          {
            label: 'View More',
            url: document.location.href,
          },
        ]
      }
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.clearActivity()
})
