const presence = new Presence({
  clientId: '721986767322087464',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  United = 'https://cdn.rcd.gg/PreMiD/websites/T/TrackMania%20Exchange/assets/0.png',
  Nforever = 'https://cdn.rcd.gg/PreMiD/websites/T/TrackMania%20Exchange/assets/1.png',
  Sunrise = 'https://cdn.rcd.gg/PreMiD/websites/T/TrackMania%20Exchange/assets/2.png',
  Original = 'https://cdn.rcd.gg/PreMiD/websites/T/TrackMania%20Exchange/assets/3.png',
  Nations = 'https://cdn.rcd.gg/PreMiD/websites/T/TrackMania%20Exchange/assets/4.png',
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/T/TrackMania%20Exchange/assets/logo.png',
}

let currentURL = new URL(document.location.href)
let currentPath = currentURL.pathname.replace(/^\/|\/$/g, '').split('/')
let presenceData: PresenceData = {
  details: 'Viewing an unsupported page',
  largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/T/TrackMania%20Exchange/assets/logo.png',
  startTimestamp: browsingTimestamp,
}

const updateCallback = {
  _function: null as unknown as () => void,
  get function(): () => void {
    return this._function
  },
  set function(parameter) {
    this._function = parameter
  },
  get present(): boolean {
    return this._function !== null
  },
}
/**
 * Initialize/reset presenceData.
 */
function resetData(defaultData: PresenceData = {
  details: 'Viewing an unsupported page',
  largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/T/TrackMania%20Exchange/assets/logo.png',
  startTimestamp: browsingTimestamp,
}): void {
  currentURL = new URL(document.location.href)
  currentPath = currentURL.pathname.replace(/^\/|\/$/g, '').split('/')
  presenceData = { ...defaultData }
}
/**
 * Search for URL parameters.
 * @param urlParam The parameter that you want to know about the value.
 */
function getURLParam(urlParam: string): string {
  return currentURL.searchParams.get(urlParam)!
}

((): void => {
  if (
    currentURL.hostname === 'tm-exchange.com'
    || currentURL.hostname === 'www.tm-exchange.com'
  ) {
    presenceData.details = 'On the home page'
  }
  else if (currentURL.hostname === 'blog.tm-exchange.com') {
    if (currentPath[0] === 'post') {
      presenceData.details = 'Reading a blog post'
      presenceData.state = document.querySelector('.WindowHeader1')?.textContent
    }
    else if (currentPath[0] === 'archive.aspx') {
      presenceData.details = 'Viewing the blog archive'
    }
    else {
      presenceData.details = 'Viewing the blog'
    }
  }
  else {
    let pageType: string | undefined | null = null
    let idPrefix = 'ctl03'

    /*

    This part figures out the page type.
    There are three ways for getting it's type.

    The old structure are done as below.

    1. From the "action" parameter on the current URL.
    2. From the "action" parameter on the URL located on the "External Link" part on the top left corner.
    3. From the "Location" part on the top left corner, specifically the bolded part.

    The new structure (only TMNF and TMUF) are done as below.

    1. From the "action" path on the URL located on the "External Link" part on the top left corner.
    2. From the "Location" part on the top left corner, specifically the bolded part.
    3. From the "action" path on the current URL. (This is done last because the unrealibilty of the URL in some cases.)

    */

    const locationType: { [index: string]: string } = {
      'Home': 'home',
      'Login': 'login', // action guessed
      'Registration': 'register', // action guessed
      'Lost Login': 'forget', // action guessed
      'Track Info': 'trackshow',
      'Search Tracks': 'tracksearch',
      'Nadeo Tracks': 'tracksearch',
      'Your AOI': 'tracksearch',
      'User\'s Tracks': 'tracksearch',
      'Track Signs': 'tracksigns',
      'Track Upload': 'trackuploadtrack',
      'Submit Replays': 'recordmassupload',
      'Leaderboards': 'userrecords',
      'Your Tracks': 'tracksearch',
      'Your Replays': 'tracksearch',
      'Your Downloads': 'tracksearch',
      'PlayPal': 'playpal',
      'PlayPal On-Line': 'playpalonline',
      'TrackBeta': 'trackbeta',
      'Find Users': 'usersearch',
      'User Info': 'usershow',
      'User Packs': 'trackpacksearch',
      'Pack Info': 'trackpackshow',
      'Your Account': 'usershow',
      'Send Private Message': 'postupdate',
      'Edit Post': 'postedit',
      'Report Problem': 'reportproblem',
      'News Archive': 'newssearch',
      'Track Replay Info': 'trackreplayshow',
    }

    if (
      currentURL.host === 'united.tm-exchange.com'
      || currentURL.host === 'tmnforever.tm-exchange.com'
    ) {
      if (document.querySelector('.BookmarkCell a')) {
        currentURL = new URL(
          document.querySelector('.BookmarkCell a')!.textContent!,
        )
        currentPath = currentURL.pathname.replace(/^\/|\/$/g, '').split('/');
        [pageType] = currentPath
      }
      else {
        try {
          pageType = locationType[
            document.querySelector('.NavigatorCell b')!.textContent!
          ]
        }
        catch {
          pageType = currentPath[0] || null
        }
      }
    }
    else if (
      getURLParam('action') !== null
      && getURLParam('action') !== 'auto#auto'
    ) {
      pageType = getURLParam('action')
    }
    else if (document.querySelector('.BookmarkCell a')) {
      currentURL = new URL(
        document.querySelector('.BookmarkCell a')!.textContent!,
      )
      pageType = getURLParam('action')
    }
    else {
      try {
        pageType = locationType[document.querySelector('.NavigatorCell b')!.textContent!]
      }
      catch {
        pageType = null
      }
    }

    if (document.querySelector('.NavigatorCell b')?.textContent === 'Login')
      pageType = 'login'

    /* This parts gives suffix to the top text of the activity (aka details), to differentiate the different sites on the network. */

    switch (currentURL.host) {
      case 'united.tm-exchange.com':
        presenceData.smallImageKey = ActivityAssets.United
        presenceData.smallImageText = 'United (TMUF-X)'
        idPrefix = '_ctl1'
        break
      case 'tmnforever.tm-exchange.com':
        presenceData.smallImageKey = ActivityAssets.Nforever
        presenceData.smallImageText = 'Nations Forever (TMNF-X)'
        idPrefix = 'ctl01'
        break
      case 'nations.tm-exchange.com':
        presenceData.smallImageKey = ActivityAssets.Nations
        presenceData.smallImageText = 'Nations'
        break
      case 'sunrise.tm-exchange.com':
        presenceData.smallImageKey = ActivityAssets.Sunrise
        presenceData.smallImageText = 'Sunrise'
        break
      case 'original.tm-exchange.com':
        presenceData.smallImageKey = ActivityAssets.Original
        presenceData.smallImageText = 'Original'
        break
    }

    /* This part sets the details to be given to PreMID. */

    if (
      currentPath[0] === 'error'
      || currentPath[0] === 'errorhandler'
      || (document.querySelector('.WindowTitle')
        && document.querySelector('.WindowTitle')?.textContent === 'Error')
      || (document.querySelector('h1')
        && document.querySelector('h1')?.textContent === 'Server Error')
    ) {
      presenceData.details = 'On a non-existent page'
    }
    else {
      switch (pageType) {
        case 'home': {
          presenceData.details = 'On the home page'
          break
        }
        case 'login': {
          presenceData.details = 'Logging in'
          break
        }
        case 'register': {
          presenceData.details = 'Registering an account'
          break
        }
        case 'forget': {
          presenceData.details = 'Figuring out the password'
          break
        }
        case 'trackshow': {
          presenceData.details = document.querySelector(
            `#${idPrefix}_ShowTrackName`,
          )?.textContent
          presenceData.state = document.querySelector(
            'tr.WindowTableCell1:nth-child(3) > td:nth-child(2) > a:nth-child(3)',
          )?.textContent

          break
        }
        case 'tracksearch': {
          let searchSummary: string | undefined
          if (
            document.querySelector(`#${idPrefix}_ShowSummary > b:nth-child(1)`)
              ?.textContent === 'tracks'
          ) {
            const summary = document
              .querySelector(`#${idPrefix}_ShowSummary`)
              ?.textContent
            searchSummary = summary
              ?.slice(15, summary.length - 4)
          }
          else {
            const summary = document
              .querySelector(`#${idPrefix}_ShowSummary`)
              ?.textContent
            searchSummary = summary
              ?.slice(8, summary.length - 4)
          }
          presenceData.details = 'Searching for a track'
          const textFilter = document.querySelector('.TextFilter')
          if (textFilter) {
            presenceData.state = `${textFilter
              .textContent
              ?.slice(9, textFilter.textContent.length - 1)}, ${searchSummary}`
          }
          else {
            presenceData.state = `${searchSummary?.[0]?.toUpperCase()}${searchSummary?.slice(1)}`
          }

          break
        }
        case 'tracksigns': {
          presenceData.details = 'Viewing track signs'
          break
        }
        case 'trackuploadtrack': {
          presenceData.details = 'Uploading a track'
          break
        }
        case 'recordmassupload': {
          presenceData.details = 'Submitting replays'
          break
        }
        case 'userrecords': {
          const summary = document
            .querySelector(`#${idPrefix}_ShowSummary`)
            ?.textContent
          const searchSummary = summary
            ?.slice(16, summary.length - 4)
          presenceData.details = 'Viewing the leaderboards'
          if (
            (document.querySelector(`#${idPrefix}_GetUser`) as HTMLInputElement)
              .value
          ) {
            presenceData.state = `${
              (
                document.querySelector(
                  `#${idPrefix}_GetUser`,
                ) as HTMLInputElement
              ).value
            }, ${searchSummary}`
          }
          else {
            presenceData.state = `${searchSummary?.[0]?.toUpperCase()}${searchSummary?.slice(1)}`
          }

          break
        }
        case 'forumshow':
        case 'forumsshow': {
          presenceData.details = 'Viewing the forums'
          if (pageType === 'forumshow') {
            presenceData.state = document
              .querySelector('.WindowTitle')
              ?.textContent
              ?.trim()
          }

          break
        }
        case 'threadshow': {
          presenceData.details = 'Viewing a thread'
          presenceData.state = document.querySelector(
            `#${idPrefix}_ShowSubject`,
          )?.textContent

          break
        }
        case 'playpal': {
          presenceData.details = 'Viewing PlayPal'
          break
        }
        case 'playpalonline': {
          presenceData.details = 'Viewing PlayPal Online'
          break
        }
        case 'trackbeta': {
          presenceData.details = 'Viewing TrackBeta'
          break
        }
        case 'usersearch': {
          const summary = document
            .querySelector(`#${idPrefix}_ShowSummary`)
            ?.textContent
          const searchSummary = summary
            ?.slice(15, summary.length - 4)
          presenceData.details = 'Searching for a user'
          if (document.querySelector(`#${idPrefix}_ShowName`)) {
            presenceData.state = `${
              document.querySelector<HTMLInputElement>(`#${idPrefix}_ShowName`)?.textContent
            }, ${searchSummary}`
          }
          else {
            presenceData.state = `${searchSummary?.[0]?.toUpperCase()}${searchSummary?.slice(1)}`
          }

          break
        }
        case 'usershow': {
          presenceData.details = 'Viewing a user\'s info'
          presenceData.state = document.querySelector(
            `#${idPrefix}_ShowLoginId`,
          )?.textContent

          break
        }
        case 'trackpacksearch': {
          const summary = document
            .querySelector(`#${idPrefix}_ShowSummary`)
            ?.textContent
          const searchSummary = summary
            ?.slice(20, summary.length - 4)
          presenceData.details = 'Searching for a user pack'
          if (document.querySelector(`#${idPrefix}_ShowName`)) {
            presenceData.state = `${
              document.querySelector(`#${idPrefix}_ShowName`)?.textContent
            }, ${searchSummary}`
          }
          else {
            presenceData.state = `${searchSummary?.[0]?.toUpperCase()}${searchSummary?.slice(1)}`
          }

          break
        }
        case 'postupdate': {
          presenceData.details = 'Writing a private message'
          break
        }
        case 'trackpackshow': {
          presenceData.details = 'Viewing a track pack'
          presenceData.state = `${
            document.querySelector(`#${idPrefix}_ShowPackName`)?.textContent
          } by ${
            document.querySelector(
              '#Table7 > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(2) > a:nth-child(3)',
            )?.textContent
          }`

          break
        }
        case 'postedit': {
          presenceData.details = 'Editing a post'
          break
        }
        case 'reportproblem': {
          presenceData.details = 'Reporting something'
          break
        }
        case 'newssearch': {
          presenceData.details = 'Viewing the news archive'
          break
        }
        case 'trackreplayshow': {
          presenceData.details = 'Viewing the replay history'
          presenceData.state = document.querySelector(
            `#${idPrefix}_Windowrow10 a`,
          )?.textContent

          break
        }
      }
    }
  }
})()

if (updateCallback.present) {
  const defaultData = { ...presenceData }
  presence.on('UpdateData', async () => {
    resetData(defaultData)
    updateCallback.function()
    presence.setActivity(presenceData)
  })
}
else {
  presence.on('UpdateData', async () => {
    presence.setActivity(presenceData)
  })
}
