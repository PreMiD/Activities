import type { Playback, PlaybackInfo } from './types.js'
import { ActivityType, Assets, getTimestamps, getTimestampsFromMedia, StatusDisplayType } from 'premid'
import { ActivityAssets, ListItemStatus, StaticBrowsing } from './constants.js'
import { append, determineSeason, getAnimeIcon, getProfilePicture, getUserID } from './utils.js'

const presence = new Presence({ clientId: '1137362720254074972' })

const browsingTimestamp = Math.floor(Date.now() / 1000)

let userID = 0

let playbackInfo: PlaybackInfo | null

let lastWatched: Playback

function getPlayerInfo(): [isPaused: boolean, timestamp: [start: number, end: number]] {
  const player = getOAPlayer()
  if (player?.paused === false)
    return [false, getTimestampsFromMedia(player)]
  else if (playbackInfo?.paused === false)
    return [false, getTimestamps(playbackInfo.currTime, playbackInfo.duration)]
  else
    return [true, [-1, -1]]
}

function getOAPlayer(): HTMLVideoElement | undefined {
  const { pathname } = document.location
  if (pathname.includes('/anime') || pathname.includes('/watch2gether/')) {
    const _player = document.querySelector('video')
    if (_player?.classList.contains('d-none') !== true && _player != null) {
      playbackInfo = null
      return _player
    }
  }
  return undefined
}

async function getStrings() {
  return presence.getStrings(
    {
      // Other

      // -> General

      playing: 'general.playing', // Playing
      paused: 'general.paused', // Paused
      viewHome: 'general.viewHome', // Viewing home page
      viewUser: 'general.viewUser', // Viewing user:
      searchSomething: 'general.searchSomething', // Searching up something...
      browsing: 'general.browsing', // Browsing...
      searchFor: 'general.searchFor', // Searching for:
      viewPage: 'general.viewPage', // Viewing page:
      listeningTo: 'general.listeningTo', // Listening to{0}{1}
      buttonWatchAnime: 'general.buttonWatchAnime', // Watch Anime
      episode: 'general.episode', // Episode
      watching: 'general.watching', // Watching:
      viewAnUser: 'general.viewAnUser', // Viewing an user

      // -> OgladajAnime

      radioAnime: 'ogladajanime.radioAnime', // Radio Anime
      random: 'ogladajanime.random', // Browsing{0}Random Anime
      new: 'ogladajanime.new', // Browsing{0}New Anime
      topRated: 'ogladajanime.topRated', // Browsing{0}Top Rated Anime
      browsingRooms: 'ogladajanime.browsingRooms', // Browsing{0}Watch2Gether Rooms
      chatting: 'ogladajanime.chatting', // Chatting
      importList: 'ogladajanime.importList', // Importing anime list from another service
      room: 'ogladajanime.room', // Room
      votes: 'ogladajanime.votes', // votes
      category: 'ogladajanime.category', // Category
      viewAnimeList: 'ogladajanime.viewAnimeList', // Viewing anime list
      viewAnimeListOf: 'ogladajanime.viewAnimeListOf', // Viewing anime list of: {0}
      viewCharacter: 'ogladajanime.viewCharacter', // Viewing character:{0}{1}
      allAvailableAnimes: 'ogladajanime.allAvailableAnimes', // All Available Animes
      watchTime: 'ogladajanime.watchTime', // Watch time: [{0} days] [{1} hours] [{2} minutes]
      viewCommentsOf: 'ogladajanime.viewCommentsOf', // Viewing comments of: {0}
      viewComments: 'ogladajanime.viewComments', // Viewing comments of a user
      commentCount: 'ogladajanime.commentCount', // {0} comments sent ({1} likes, {2} dislikes)
      searchResults: 'ogladajanime.searchResults', // {0} search results

      // Anime List

      categoryWatched: 'ogladajanime.categoryWatched', // Watched
      categoryWatching: 'ogladajanime.categoryWatching', // Watching
      categoryPlanning: 'ogladajanime.categoryPlanning', // Planning
      categorySuspended: 'ogladajanime.categorySuspended', // Suspended
      categoryAbandoned: 'ogladajanime.categoryAbandoned', // Abandoned
      categoryAll: 'ogladajanime.categoryAll', // {0} • Watching {1}
      animeListWatched: 'ogladajanime.animeListWatched', // {0} watched

      // Page Names

      lastActivity: 'ogladajanime.lastActivity', // Last Activity
      donate: 'ogladajanime.donate', // Donate
      newestComments: 'ogladajanime.newestComments', // Newest Comments
      upcomingAnimes: 'ogladajanime.upcomingAnimes', // Upcoming Animes
      upcomingEpisodes: 'ogladajanime.upcomingEpisodes', // Upcoming Episodes Timetable
      activeLoginSessions: 'ogladajanime.activeLoginSessions', // Active Login Sessions
      newestEdits: 'ogladajanime.newestEdits', // Newest Edits
      contact: 'ogladajanime.contact', // Contact
      terms: 'general.terms', // Terms Of Service

      // Buttons

      buttonWatchWithMe: 'ogladajanime.buttonWatchWithMe', // Watch with me
      buttonViewAnimeList: 'ogladajanime.buttonViewAnimeList', // View Anime List
      buttonViewComments: 'ogladajanime.buttonViewComments', // View Comments
      buttonViewProfile: 'general.buttonViewProfile', // View Profile
      buttonViewCharacter: 'ogladajanime.buttonViewCharacter', // View Character
      buttonMyProfile: 'ogladajanime.buttonMyProfile', // My Profile
    },

  )
}

let strings: Awaited<ReturnType<typeof getStrings>>
let oldLang: string | null = null

async function setButton(label: string, url: string): Promise<[ButtonData, (ButtonData | undefined)]> {
  const privacyMode = await presence.getSetting<boolean>('privacyMode')
  if (privacyMode || userID === 0)
    return [{ label, url }, undefined]
  else
    return [{ label: strings.buttonMyProfile, url: `https://ogladajanime.pl/profile/${userID}` }, { label, url }]
}

async function profileButton(): Promise<[ButtonData, undefined] | undefined> {
  const privacyMode = await presence.getSetting<boolean>('privacyMode')
  if (privacyMode || userID === 0)
    return undefined
  else
    return [{ label: strings.buttonMyProfile, url: `https://ogladajanime.pl/profile/${userID}` }, undefined]
}

presence.on('iFrameData', (data) => {
  const info = data as PlaybackInfo
  playbackInfo = info
})

presence.on('UpdateData', async () => {
  userID = getUserID()

  const { pathname } = document.location

  const [newLang, browsingStatusEnabled, useAltName, hideWhenPaused, titleAsPresence, showSearchContent, showCover, determineSeasonSetting] = await Promise.all([
    presence.getSetting<string>('lang').catch(() => 'en'),
    presence.getSetting<boolean>('browsingStatus'),
    presence.getSetting<boolean>('useAltName'),
    presence.getSetting<boolean>('hideWhenPaused'),
    presence.getSetting<boolean>('titleAsPresence'),
    presence.getSetting<boolean>('showSearchContent'),
    presence.getSetting<boolean>('showCover'),
    presence.getSetting<boolean>('determineSeason'),
  ])

  if (oldLang !== newLang || !strings) {
    oldLang = newLang
    strings = await getStrings()
  }

  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    startTimestamp: browsingTimestamp,
    largeImageKey: ActivityAssets.Logo,
  }

  if (pathname.startsWith('/anime/')) {
    const anime = document.querySelector('#anime_name_id')
    const animeID = anime?.getAttribute('anime_id')
    let name = anime?.textContent
    const alternativeName = anime?.parentElement?.querySelector(
      'i[class="text-muted text-trim"]',
    )
    if (alternativeName != null) {
      const altName = alternativeName?.getAttribute('title')
      if (altName != null && altName.length !== 0 && useAltName)
        name = altName
    }
    const activeEpisode = document.querySelector('#ep_list > .active')

    const ratingElement = document.getElementById('my_anime_rate')
    const rating = ratingElement?.parentElement?.querySelector('h4')
    const voteCount = ratingElement?.parentElement?.querySelector('.text-left')?.textContent?.split(' ')[0] ?? '0'

    const epNum = activeEpisode?.getAttribute('value') ?? 0
    const epName = activeEpisode?.querySelector('p')?.textContent

    let season: number = -1
    if (determineSeasonSetting) {
      const d = determineSeason(useAltName)
      if (d && d.found) {
        name = d.name
        season = d.season
      }
    }

    if (name) {
      presenceData.details = name
      if (titleAsPresence)
        presenceData.statusDisplayType = StatusDisplayType.Details
      else
        presenceData.statusDisplayType = StatusDisplayType.Name

      if (season !== -1)
        presenceData.state = epName
      else
        presenceData.state = append(`${strings.episode} ${epNum}`, epName, ' • ')
    }
    else {
      return presence.clearActivity()
    }

    const [isPaused, timestamp] = getPlayerInfo()
    if (!isPaused) {
      lastWatched = {
        animeID: animeID ?? '',
        episode: epNum,
      } as Playback
      presenceData.smallImageKey = Assets.Play
      presenceData.smallImageText = strings.playing;
      [presenceData.startTimestamp, presenceData.endTimestamp] = [timestamp[0], timestamp[1]]
    }
    else if (isPaused && !browsingStatusEnabled && hideWhenPaused) {
      return presence.clearActivity()
    }
    else if (isPaused && lastWatched && lastWatched.animeID === animeID && lastWatched.episode === epNum) {
      presenceData.smallImageKey = Assets.Pause
      presenceData.smallImageText = strings.paused
    }
    else {
      presenceData.smallImageKey = Assets.Viewing
      presenceData.smallImageText = strings.browsing
    }

    if (season !== -1)
      presenceData.largeImageText = `Season ${season}, Episode ${epNum}`
    else if (rating && voteCount)
      presenceData.largeImageText = `${rating.textContent} • ${strings.votes.replace('{0}', voteCount)}`

    if (animeID && showCover)
      presenceData.largeImageKey = getAnimeIcon(animeID)

    presenceData.buttons = await setButton(strings.buttonWatchAnime, document.location.href)
  }
  else if (pathname.match(/\/watch2gether\/\d+/)) {
    const name = document.querySelector('h5[class="card-title text-dark"]')
    const animeIcon = document.querySelector('img[class="img-fluid lozad rounded tooltip tooltip-anime mb-2 tooltipstered"]')
    const spans = document.querySelectorAll('.card-subtitle > .text-gray')

    if (spans == null || spans.length === 0) {
      return presence.clearActivity()
    }

    const episode = spans[0]?.textContent
    const roomName = spans[spans.length - 1]?.textContent

    if (name && name.textContent) {
      presenceData.details = name.textContent
      if (titleAsPresence)
        presenceData.statusDisplayType = StatusDisplayType.Details
      else
        presenceData.statusDisplayType = StatusDisplayType.Name
      presenceData.state = append(`${strings.episode} ${episode}`, `${strings.room} '${roomName}'`, ' • ')
    }
    else {
      return presence.clearActivity()
    }

    const [isPaused, timestamp] = getPlayerInfo()
    if (!isPaused) {
      presenceData.smallImageKey = Assets.Play
      presenceData.smallImageText = strings.playing;
      [presenceData.startTimestamp, presenceData.endTimestamp] = [timestamp[0], timestamp[1]]
    }
    else if (isPaused && !browsingStatusEnabled && hideWhenPaused) {
      return presence.clearActivity()
    }
    else if (isPaused) {
      presenceData.smallImageKey = Assets.Pause
      presenceData.smallImageText = strings.paused
    }

    if (animeIcon && showCover)
      presenceData.largeImageKey = animeIcon.getAttribute('src')?.replace('0.webp', '2.webp').replace('1.webp', '2.webp')

    presenceData.buttons = await setButton(strings.buttonWatchWithMe, document.location.href)
  }
  else if (pathname.startsWith('/anime_list/') && browsingStatusEnabled) {
    let id = pathname.replace('/anime_list/', '')
    const match = id.match(/\/\d/)
    let category = 0
    if (match) {
      const split = id.split('/')
      category = Number.parseInt(split.at(1) as string)
      id = split.at(0) as string
    }

    presenceData.details = strings.viewAnimeList
    presenceData.buttons = await setButton(strings.buttonViewAnimeList, document.location.href)
    if (id) {
      if (category === 0) {
        const statuses = document.querySelectorAll('td[class="px-1 px-sm-2"]')
        let watched = 0
        let watching = 0
        statuses.forEach((elem, _, __) => {
          const select = elem.querySelector('select')
          if (select != null) {
            const value = Number.parseInt(select.value)
            if (value === ListItemStatus.categoryWatched)
              watched++
            else if (value === ListItemStatus.categoryWatching)
              watching++
          }
          else if (elem.textContent != null) {
            if (elem.textContent?.trim()?.replace(' ', '') === 'Obejrzane')
              watched++
            else if (elem.textContent?.trim()?.replace(' ', '') === 'Oglądam')
              watching++
          }
        })

        if (watching === 0)
          presenceData.state = strings.animeListWatched.replace('{0}', watched.toString())
        else
          presenceData.state = strings.categoryAll.replace('{0}', strings.animeListWatched.replace('{0}', watched.toString())).replace('{1}', watching.toString())
      }
      else {
        let categoryName: string

        if (category >= 0 && category <= 5) {
          categoryName = getStringByName(ListItemStatus[category as ListItemStatus]) ?? 'N/A'
        }
        else {
          categoryName = document.querySelector('h5[class="card-title col-12 text-center mb-3"]')?.textContent ?? 'N/A'
        }

        const count = document.querySelectorAll('td[class="px-0 px-sm-2"]').length / 2
        presenceData.state = `${strings.category} '${categoryName}' • ${count} anime`
      }

      const name = document.querySelector('.card-title.col-12.text-center')?.textContent?.replace(' - Lista anime', '')?.replace(/\s/g, '')

      presenceData.details = strings.viewAnimeListOf.replace('{0}', name ?? 'N/A')

      if (showCover)
        presenceData.largeImageKey = await getProfilePicture(id)
    }
  }
  else if (pathname.startsWith('/user_comments/') && browsingStatusEnabled) {
    const id = pathname.replace('/user_comments/', '')
    presenceData.buttons = await setButton(strings.buttonViewComments, document.location.href)
    presenceData.details = strings.viewComments
    if (id != null) {
      const name = document.querySelector('h4[class="card-title col-12 text-center mb-1"]')?.textContent?.replace('Komentarze użytkownika: ', '')?.replace(/\s/g, '')
      const comments = document.querySelectorAll('section > .row > div[class="col-12 mb-3"]')

      let likes = 0
      let dislikes = 0

      comments.forEach((elem, _, __) => {
        dislikes += Number.parseInt(elem.getElementsByClassName('fa-thumbs-down').item(0)?.textContent ?? '0')
        likes += Number.parseInt(elem.getElementsByClassName('fa-thumbs-up').item(0)?.textContent ?? '0')
      })

      const commentsCount = (comments?.length ?? 1) - 1

      if (name)
        presenceData.details = strings.viewCommentsOf.replace('{0}', name ?? 'N/A')

      presenceData.state = strings.commentCount.replace('{0}', commentsCount.toString()).replace('{1}', likes.toString()).replace('{2}', dislikes.toString())

      if (showCover)
        presenceData.largeImageKey = await getProfilePicture(id)
    }
  }
  else if (pathname.startsWith('/profile') && browsingStatusEnabled) {
    const id = pathname.replace('/profile/', '')
    const name = document.querySelector('.card-title.col-12.text-center.m-0')?.textContent?.replace(/\s/g, '')?.replace('-Profil', '')

    let watchTime

    const headers = document.querySelectorAll('h4[class="card-title col-12 text-center mb-1 mt-2"]')
    for (const elem of headers) {
      if (elem.textContent === 'Statystyki') {
        const entry = elem.parentElement?.querySelector('table > tbody > tr')
        if (entry != null && entry.childNodes.length >= 4) {
          watchTime = entry.childNodes[3]?.textContent?.trim()
        }
        break
      }
    }

    presenceData.details = `${strings.viewUser} ${name}`

    if (watchTime) {
      let state = strings.watchTime as string

      let days = -1
      let hours = -1
      let minutes = -1

      // This part was unfortunately fixed by AI, because I could not get the regex to work.
      for (const m of watchTime.matchAll(/(?<value>\d+) *(?<unit>[dgm])/g)) {
        const val = Number.parseInt(m.groups?.value ?? '0')
        const unit = m.groups?.unit
        if (unit === 'd')
          days = val
        else if (unit === 'g')
          hours = val
        else if (unit === 'm')
          minutes = val
      }

      state = replaceTime(state, 0, days)
      state = replaceTime(state, 1, hours)
      state = replaceTime(state, 2, minutes)

      if (!state.match(/\d+/))
        state += watchTime

      presenceData.state = state
    }

    if (showCover)
      presenceData.largeImageKey = await getProfilePicture(id)

    if (id === userID.toString())
      presenceData.buttons = await profileButton()
    else
      presenceData.buttons = await setButton(strings.buttonViewProfile, document.location.href)
  }
  else if (pathname.startsWith('/character/') && browsingStatusEnabled) {
    const name = document.querySelector('#animemenu_info > div[class="row card-body justify-content-center"] > h4[class="card-title col-12 text-center mb-1"]')
    const image = document.querySelector('img[class="img-fluid lozad rounded text-center"]')?.getAttribute('data-src')?.trim()

    presenceData.buttons = await setButton(strings.buttonViewProfile, document.location.href)
    const text = strings.viewCharacter.replace('{1}', name?.textContent ?? 'N/A')
    const split = text.split('{0}')
    if (split.length > 1) {
      presenceData.details = split[0]
      presenceData.state = split[1]
    }
    else {
      presenceData.details = text
    }

    if (image && showCover)
      presenceData.largeImageKey = image
  }
  else if (pathname.startsWith('/search/name/') && browsingStatusEnabled && showSearchContent) {
    const search = document.getElementsByClassName('search-info')?.[0]?.querySelector('div[class="card bg-white"] > div[class="row card-body justify-content-center"] > p[class="col-12 p-0 m-0"]')?.textContent?.replace('Wyszukiwanie: ', '')
    const resultCountElements = document.querySelectorAll('div[class="card bg-white"] > div[class="row card-body justify-content-center"]')
    const resultCount = resultCountElements[resultCountElements.length - 1]?.textContent?.match(/\d+/)?.[0]

    presenceData.details = `${strings.searchFor} ${search}`

    if (resultCount)
      presenceData.state = strings.searchResults.replace('{0}', resultCount)
  }
  else if (pathname.startsWith('/radio') && browsingStatusEnabled) {
    const text = strings.listeningTo.replace('{1}', strings.radioAnime)
    const split = text.split('{0}')
    if (split.length > 1) {
      presenceData.details = split[0]
      presenceData.state = split[1]
    }
    else {
      presenceData.details = text
    }
  }
  else {
    if (browsingStatusEnabled) {
      let recognized = false
      for (const [key, value] of Object.entries(StaticBrowsing)) {
        if (pathname.includes(key)) {
          const parsed = parseString(value)
          presenceData.details = parsed[0]
          presenceData.state = parsed[1]
          const buttons = await profileButton()
          if (buttons)
            presenceData.buttons = buttons
          recognized = true
          break
        }
      }

      if (!recognized)
        return presence.clearActivity()
    }
    else {
      return presence.clearActivity()
    }
  }

  presence.setActivity(presenceData)
})

function parseString(text: string): [string, string] {
  const keys = Object.keys(strings)
  const values = Object.values(strings)

  let details = ''
  let state = ''

  const slashB = '(^(?=[\\w!])|(?<=[\\w!])$|(?<=[^\\w!])(?=[\\w!])|(?<=[\\w!])(?=[^\\w!]))'
  // ^^ Equivalent of \b, but also detects an exclamation mark !

  if (text.startsWith('!?')) {
    let _text = text.replace('!?', '')
    _text = getStringByName(_text) ?? 'N/A'
    details = strings.viewPage
    state = _text
    return [details, state]
  }

  for (let i = 0; i < keys.length; i++)
    text = text.replace(new RegExp(`${slashB}!${keys[i]}${slashB}`), `${values[i]}`)

  if (text.includes('{0}')) {
    const split = text.split('{0}')
    details = split[0] ?? 'N/A'
    state = split[1] ?? 'N/A'
  }
  else {
    details = text
  }

  return [details, state]
}

function getStringByName(name: string): string | undefined {
  const keys = Object.keys(strings)
  const values = Object.values(strings)
  return values[keys.findIndex(x => x === name)]
}

// This part was unfortunately fixed by AI, because I could not get the regex to work.
function replaceTime(text: string, num: number, value: number): string {
  const pattern = new RegExp(`\\[(.*?\\{${num}\\}.*?)\\]`)

  if (value === -1)
    return text.replace(pattern, '')

  return text.replace(pattern, (_match, inner: string) => {
    return inner.replace(`{${num}}`, value.toString())
  })
}
