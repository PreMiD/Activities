import { Assets } from 'premid'

const presence = new Presence({
  clientId: '609774216430092298',
})

async function getStrings() {
  return presence.getStrings(
    {
      accountSettings: 'osuppy.accountSettings',
      beatMapListing: 'osuppy.beatMapListing',
      beatMapLooking: 'osuppy.beatMapLooking',
      beatMapPacks: 'osuppy.beatMapPacks',
      browsing: 'general.browsing',
      buttonReadArticle: 'general.buttonReadArticle',
      buttonViewBeatmap: 'osuppy.buttonViewBeatmap',
      buttonViewProfile: 'general.buttonViewProfile',
      changelog: 'osuppy.changelog',
      chatting: 'osuppy.chatting',
      contests: 'osuppy.contests',
      countryRankings: 'osuppy.countryRankings',
      downloads: 'osuppy.pageDownloads',
      featuredArtists: 'osuppy.featuredArtists',
      for: 'osuppy.for',
      forums: 'osuppy.forums',
      friendList: 'osuppy.friendList',
      kudosuRankings: 'osuppy.kudosuRankings',
      livestreams: 'osuppy.livestreams',
      osuStore: 'osuppy.osuStore',
      otherProfile: 'osuppy.otherProfile',
      performanceRankings: 'osuppy.performanceRankings',
      rank: 'osuppy.rank',
      reading: 'general.reading',
      readingAnArticle: 'general.readingAnArticle',
      readingArticle: 'general.readingArticle',
      readingForum: 'osuppy.readingForum',
      readingNews: 'general.readingNews',
      scoreRankings: 'osuppy.scoreRankings',
      search: 'general.search',
      searchFor: 'general.searchFor',
      spotlights: 'osuppy.spotlights',
      support: 'osuppy.support',
      theirProfile: 'osuppy.theirProfile',
      tournaments: 'osuppy.tournaments',
      unsupportedPage: 'osuppy.unsupportedPage',
      view: 'general.view',
      viewingForum: 'osuppy.viewingForum',
      viewingHome: 'general.viewHome',
      watchLists: 'osuppy.watchLists',
      wikiMainPage: 'general.wikiMainPage',
    },
  )
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/O/osu%20ppy/assets/logo.png',
  }
  const buttons = presence.getSetting<boolean>('buttons')
  const { pathname, href } = document.location
  const strings = await getStrings()

  if (pathname === '/' || pathname === '/home') {
    const inputSelected = document.querySelector<HTMLInputElement>('[type="search"]')
    if (inputSelected?.value) {
      presenceData.details = strings.searchFor
      presenceData.state = inputSelected.value
      presenceData.smallImageKey = Assets.Search
    }
    else {
      presenceData.details = strings.viewingHome
      presenceData.smallImageKey = Assets.Search
    }
  }
  else if (pathname.startsWith('/home/download')) {
    presenceData.details = strings.view
    presenceData.state = strings.downloads
    presenceData.smallImageKey = Assets.Search
  }
  else if (pathname.startsWith('/home/news')) {
    if (pathname.split('/')[3]) {
      presenceData.details = strings.readingArticle
      presenceData.state = document.querySelector(
        'div.news-show__info > h1',
      )?.textContent
      presenceData.smallImageKey = Assets.Reading

      presenceData.buttons = [
        {
          label: strings.buttonReadArticle,
          url: href,
        },
      ]
    }
    else {
      presenceData.details = strings.readingAnArticle
      presenceData.smallImageKey = Assets.Search
    }
  }
  else if (pathname.startsWith('/home/support')) {
    presenceData.details = strings.view
    presenceData.state = strings.support
    presenceData.smallImageKey = Assets.Search
  }
  else if (pathname.includes('/beatmapsets')) {
    if (pathname === '/beatmapsets') {
      presenceData.details = strings.browsing
      presenceData.state = strings.beatMapListing
      presenceData.smallImageKey = Assets.Search
    }
    else {
      const title = document.querySelector(
        '.beatmapset-header__details-text--title',
      )?.textContent
      const diffName = `${document.querySelector('.beatmapset-header__diff-name')?.firstChild?.textContent} ${document.querySelector('.beatmapset-header__diff-name > span')?.textContent}`
      if (title && diffName) {
        const beatmapTitle = `${title} [${diffName}]`
        presenceData.details = strings.beatMapLooking
        presenceData.state = beatmapTitle
        presenceData.smallImageKey = Assets.Search
      }

      presenceData.buttons = [
        {
          label: strings.buttonViewBeatmap,
          url: href,
        },
      ]
    }
  }
  else if (pathname.startsWith('/beatmaps/packs')) {
    presenceData.details = strings.browsing
    presenceData.state = strings.beatMapPacks
    presenceData.smallImageKey = Assets.Search
  }
  else if (pathname.startsWith('/beatmaps/artists')) {
    presenceData.details = strings.browsing
    presenceData.state = strings.featuredArtists
    presenceData.smallImageKey = Assets.Search
  }
  else if (pathname.startsWith('/store')) {
    presenceData.details = strings.browsing
    presenceData.state = strings.osuStore
    presenceData.smallImageKey = Assets.Search
  }
  else if (pathname.startsWith('/rankings')) {
    const gamemode = pathname.split('/')[2]
    if (pathname.includes('/performance')) {
      if (
        document.querySelector('div.u-ellipsis-overflow')?.textContent !== 'All'
      ) {
        const selected = document.querySelector('div.u-ellipsis-overflow')
        presenceData.details = strings.browsing
        presenceData.state = `${strings.performanceRankings} ${strings.for
          .replace('{0}', `${selected?.textContent}`)
          .replace('{1}', `${gamemode}`)}`
        presenceData.smallImageKey = Assets.Search
      }
      else {
        presenceData.details = strings.browsing
        presenceData.state = `${strings.performanceRankings} ${gamemode}`
        presenceData.smallImageKey = Assets.Search
      }
    }
    else if (pathname.includes('/charts')) {
      const selected = document.querySelector('div.u-ellipsis-overflow')
      presenceData.details = strings.browsing
      presenceData.state = `${strings.spotlights} (${selected?.textContent})`
        .replace('{0}', gamemode ?? '')
        .replace('{1}', selected?.textContent ?? '')
      presenceData.smallImageKey = Assets.Search
    }
    else if (pathname.includes('/score')) {
      presenceData.details = strings.browsing
      presenceData.state = `${strings.scoreRankings.replace(
        '{0}',
        `${gamemode}`,
      )}`
      presenceData.smallImageKey = Assets.Search
    }
    else if (pathname.includes('/country')) {
      presenceData.details = strings.browsing
      presenceData.state = `${strings.countryRankings.replace(
        '{0}',
        `${gamemode}`,
      )}`
      presenceData.smallImageKey = Assets.Search
    }
  }
  else if (pathname.includes('kudosu')) {
    presenceData.details = strings.browsing
    presenceData.state = strings.kudosuRankings
    presenceData.smallImageKey = Assets.Search
  }
  else if (pathname.startsWith('/multiplayer/rooms')) {
    const selected = document.querySelector('div.u-ellipsis-overflow')
    presenceData.details = strings.browsing
    presenceData.state = `${selected?.textContent}`
    presenceData.smallImageKey = Assets.Search
  }
  else if (pathname.startsWith('/community/forums')) {
    if (pathname.split('/')[3] === 'topics') {
      presenceData.details = strings.readingForum
      presenceData.smallImageKey = Assets.Reading
    }
    else if (Number.isNaN(Number.parseInt(pathname.split('/')[3]!)) === false) {
      const forumName = document
        .querySelector('h1.forum-title__name a.link--white.link--no-underline')
        ?.textContent
        ?.replace(/[\n|\r][\s\S][\s\S]/g, '')
        .trimStart()
        .trimEnd()
      presenceData.details = strings.browsing
      presenceData.state = strings.forums.replace('{0}', forumName ?? '')
      presenceData.smallImageKey = Assets.Search
    }
    else {
      presenceData.details = strings.browsing
      presenceData.state = strings.forums.replace('{0}', '')
      presenceData.smallImageKey = Assets.Search
    }
  }
  else if (pathname.startsWith('/community/chat')) {
    presenceData.details = strings.chatting
  }
  else if (pathname.startsWith('/community/contests')) {
    presenceData.details = strings.browsing
    presenceData.state = strings.contests
    presenceData.smallImageKey = Assets.Search
  }
  else if (pathname.startsWith('/community/livestreams')) {
    presenceData.details = strings.browsing
    presenceData.state = strings.livestreams
    presenceData.smallImageKey = Assets.Search
  }
  else if (pathname.startsWith('/community/tournaments')) {
    presenceData.details = strings.browsing
    presenceData.state = strings.tournaments
    presenceData.smallImageKey = Assets.Search
  }
  else if (pathname.startsWith('/home/search')) {
    const inputSelected = document.querySelector<HTMLInputElement>('#search-input')
    if (inputSelected?.ariaValueMax) {
      presenceData.details = strings.searchFor
      presenceData.state = inputSelected?.value
      presenceData.smallImageKey = Assets.Search
    }
    else {
      presenceData.details = strings.search
      presenceData.smallImageKey = Assets.Search
    }
  }
  else if (pathname.startsWith('/home/account/edit')) {
    presenceData.details = strings.accountSettings
  }
  else if (pathname.startsWith('/wiki')) {
    const selected = document.querySelector('[class="osu-md osu-md--wiki"] > h1')
    if (selected) {
      presenceData.details = strings.reading
      presenceData.state = selected.textContent
      presenceData.smallImageKey = Assets.Reading
    }
    else if (pathname.includes('/Main_page')) {
      presenceData.details = strings.reading
      presenceData.state = strings.wikiMainPage
      presenceData.smallImageKey = Assets.Reading
    }
    else {
      const selected = document.querySelector(
        'body > div.osu-layout__section.osu-layout__section--full.js-content.help_sitemap > div.osu-page.osu-page--generic',
      )
      presenceData.details = strings.reading
      presenceData.state = selected?.textContent
      presenceData.smallImageKey = Assets.Reading
    }
  }
  else if (pathname.startsWith('/home/changelog')) {
    presenceData.details = strings.view
    presenceData.state = strings.changelog
    presenceData.smallImageKey = Assets.Reading
  }
  else if (pathname.startsWith('/home/friends')) {
    presenceData.details = strings.view
    presenceData.state = strings.friendList
    presenceData.smallImageKey = Assets.Reading
  }
  else if (pathname.startsWith('/home/follows')) {
    presenceData.details = strings.view
    presenceData.state = strings.watchLists
    presenceData.smallImageKey = Assets.Reading
  }
  else if (pathname.startsWith('/users')) {
    const profileName = document.querySelector(
      '.profile-info__name > span',
    )?.textContent
    const rank = document.querySelector(
      'div:nth-child(1) > div.value-display__value > div',
    )?.textContent
    const pp = document.querySelector(
      'div.profile-detail__values.profile-detail__values--grid > div:nth-child(2) > div.value-display__value > div',
    )?.textContent
    const profileRanking = `${strings.rank.replace('{0}', rank ?? '')} / ${pp}pp`
    presenceData.details = document.querySelector('.user-card__username')
      ?.textContent === profileName
      ? strings.theirProfile.replace('{0}', profileName ?? '')
      : strings.otherProfile.replace('{0}', profileName ?? '')
    presenceData.state = profileRanking
    presenceData.smallImageKey = Assets.Reading
    presenceData.buttons = [
      {
        label: strings.buttonViewProfile,
        url: href,
      },
    ]
  }
  else {
    presenceData.details = strings.view
    presenceData.state = strings.unsupportedPage
  }

  if (!buttons && presenceData.buttons)
    delete presenceData.buttons
  presence.setActivity(presenceData)
})
