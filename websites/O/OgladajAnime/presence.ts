import { ActivityType, Assets, getTimestamps, getTimestampsFromMedia } from 'premid'

const presence = new Presence({ clientId: '1137362720254074972' })

const browsingTimestamp = Math.floor(Date.now() / 1000)

let userID = 0

let playbackInfo: PlaybackInfo | null

let lastWatched: Playback

interface PlaybackInfo {
  currTime: number
  duration: number
  paused: boolean
}

interface Playback {
  animeID: string
  episode: string
}

enum ListItemStatus {
  Oglądam = 1,
  Obejrzane = 2,
  Planuje = 3,
  Wstrzymane = 4,
  Porzucone = 5,
}

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/O/ogladajanime/assets/0.png',
}

function getUserID() {
  const dropdowns = document.querySelectorAll('a[class="dropdown-item"]')
  let found = false
  dropdowns.forEach((elem, _, __) => {
    const href = elem.getAttribute('href')
    if (href != null && href.startsWith('/profile/')) {
      userID = Number.parseInt(href.replace('/profile/', ''))
      found = true
    }
  })
  if (!found)
    userID = 0
}

function getPlayerInfo(): [isPaused: boolean, timestamp: [start: number, end: number]] {
  const player = getOAPlayer()
  if (player?.paused === false)
    return [false, getTimestampsFromMedia(player)]
  else if (playbackInfo?.paused === false)
    return [false, getTimestamps(playbackInfo.currTime, playbackInfo.duration)]
  else
    return [true, [-1, -1]]
}

async function setButton(label: string, url: string): Promise<[ButtonData, (ButtonData | undefined)]> {
  const privacyMode = await presence.getSetting<boolean>('privacyMode')
  if (privacyMode || userID === 0)
    return [{ label, url }, undefined]
  else
    return [{ label: 'Mój profil', url: `https://ogladajanime.pl/profile/${userID}` }, { label, url }]
}

async function profileButton(): Promise<[ButtonData, undefined] | undefined> {
  const privacyMode = await presence.getSetting<boolean>('privacyMode')
  if (privacyMode || userID === 0)
    return undefined
  else
    return [{ label: 'Mój profil', url: `https://ogladajanime.pl/profile/${userID}` }, undefined]
}

function watchedString(num: number): string {
  if (num === 0)
    return `${num} obejrzanych`
  else if (num < 5)
    return `${num} obejrzane`
  else
    return `${num} obejrzanych`
}

function commentsString(num: number): string {
  if (num === 1)
    return `${num} wysłany komentarz`
  else
    return `${num} wysłanych komentarzy`
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

function append(text: string, append: string | undefined | null, separator: string = ': '): string {
  if (append?.trim()?.replace(' ', ''))
    return `${text}${separator}${append}`
  else
    return text
}

function getProfilePicture(id: number | string): string {
  return `https://cdn.ogladajanime.pl/images/user/${id}.webp`
}

function getAnimeIcon(id: number | string): string {
  return `https://cdn.ogladajanime.pl/images/anime_new/${id}/2.webp`
}

// TODO: add support for https://ogladajanime.pl/anime_seasons. Would have done that if I only knew what it was about
const staticBrowsing = {
  '/watch2gether': 'Przegląda pokoje do oglądania z innymi',
  '/main2': 'Przegląda stronę główną',
  '/search/name/': 'Szuka Anime',
  '/search/custom': 'Szuka Anime',
  '/search/rand': 'Przegląda losowe anime',
  '/search/new': 'Przegląda najnowsze anime',
  '/search/main': 'Przegląda najlepiej oceniane anime',
  '/chat': 'Rozmawia na chacie',
  '/user_activity': 'Przegląda swoją ostatnią aktywność',
  '/last_comments': 'Przegląda ostatnie komentarze',
  '/active_sessions': 'Przegląda aktywne sesje logowania',
  '/manage_edits': 'Przegląda ostatnie edycje',
  '/anime_list_to_load': 'Ładuję listę anime z innej strony',
  '/discord': 'Sprawdza jak można się skontaktować',
  '/support': 'Sprawdza jak można wspierać OA',
  '/radio': 'Słucha Radia Anime',
  '/rules': 'Czyta regulamin',
  '/harmonogram': 'Przegląda harmonogram emisji odcinków Anime',
  '/': 'Przegląda stronę główną', // This MUST stay at the end, otherwise this will always display no matter the page
}

presence.on('iFrameData', (data) => {
  const info = data as PlaybackInfo
  playbackInfo = info
})

presence.on('UpdateData', async () => {
  getUserID()

  const { pathname } = document.location

  const [browsingStatusEnabled, useAltName, hideWhenPaused, titleAsPresence, showSearchContent, showCover] = await Promise.all([
    presence.getSetting<boolean>('browsingStatus'),
    presence.getSetting<boolean>('useAltName'),
    presence.getSetting<boolean>('hideWhenPaused'),
    presence.getSetting<boolean>('titleAsPresence'),
    presence.getSetting<boolean>('showSearchContent'),
    presence.getSetting<boolean>('showCover'),
  ])

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
    const voteCount = ratingElement?.parentElement?.querySelector('.text-left')

    const epNum = activeEpisode?.getAttribute('value') ?? 0
    const epName = activeEpisode?.querySelector('p')?.textContent

    if (name) {
      if (titleAsPresence)
        presenceData.name = name
      else
        presenceData.details = name

      presenceData.state = append(`Odcinek ${epNum}`, epName, ' • ')
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
      presenceData.smallImageText = 'Obecnie ogląda';
      [presenceData.startTimestamp, presenceData.endTimestamp] = [timestamp[0], timestamp[1]]
    }
    else if (isPaused && !browsingStatusEnabled && hideWhenPaused) {
      return presence.clearActivity()
    }
    else if (isPaused && lastWatched && lastWatched.animeID === animeID && lastWatched.episode === epNum) {
      presenceData.smallImageKey = Assets.Pause
      presenceData.smallImageText = 'Odtwarzanie anime jest wstrzymane'
    }
    else {
      presenceData.smallImageKey = Assets.Viewing
      presenceData.smallImageText = 'Przegląda stronę anime'
    }

    if (rating && voteCount)
      presenceData.largeImageText = `${rating.textContent} • ${voteCount.textContent}`

    if (animeID && showCover)
      presenceData.largeImageKey = getAnimeIcon(animeID)

    presenceData.buttons = await setButton('Obejrzyj Teraz', document.location.href)
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
      if (titleAsPresence)
        presenceData.name = name.textContent
      else
        presenceData.details = name.textContent

      presenceData.state = append(`Odcinek ${episode}`, `Pokój '${roomName}'`, ' • ')
    }
    else {
      return presence.clearActivity()
    }

    const [isPaused, timestamp] = getPlayerInfo()
    if (!isPaused) {
      presenceData.smallImageKey = Assets.Play
      presenceData.smallImageText = 'Obecnie ogląda';
      [presenceData.startTimestamp, presenceData.endTimestamp] = [timestamp[0], timestamp[1]]
    }
    else if (isPaused && !browsingStatusEnabled && hideWhenPaused) {
      return presence.clearActivity()
    }
    else if (isPaused) {
      presenceData.smallImageKey = Assets.Pause
      presenceData.smallImageText = 'Odtwarzanie anime jest wstrzymane'
    }

    if (animeIcon && showCover)
      presenceData.largeImageKey = animeIcon.getAttribute('src')?.replace('0.webp', '2.webp').replace('1.webp', '2.webp')

    presenceData.buttons = await setButton('Obejrzyj ze mną', document.location.href)
  }
  else if (pathname.startsWith('/anime_list/') && browsingStatusEnabled) {
    let id = pathname.replace('/anime_list/', '')
    const match = id.match(/\/\d/)
    let category = 0
    if (match) {
      const split = id.split('/')
      category = Number.parseInt(split.at(1) as string)
    }
    id = id.replace(/\/\d/, '')

    presenceData.details = 'Przegląda listę Anime'
    presenceData.buttons = await setButton('Zobacz listę Anime', document.location.href)
    if (id) {
      if (category === 0) {
        const statuses = document.querySelectorAll('td[class="px-1 px-sm-2"]')
        let watched = 0
        let watching = 0
        statuses.forEach((elem, _, __) => {
          const select = elem.querySelector('select')
          if (select != null) {
            const value = Number.parseInt(select.value)
            if (value === ListItemStatus.Obejrzane)
              watched++
            else if (value === ListItemStatus.Oglądam)
              watching++
          }
          else if (elem.innerHTML != null) {
            if (elem.innerHTML?.trim()?.replace(' ', '') === ListItemStatus[ListItemStatus.Obejrzane])
              watched++
            else if (elem.textContent?.trim()?.replace(' ', '') === ListItemStatus[ListItemStatus.Oglądam])
              watching++
          }
        })

        if (watching === 0)
          presenceData.state = watchedString(watched)
        else
          presenceData.state = `Ogląda ${watching} • ${watchedString(watched)}`
      }
      else {
        const categoryName: string = ListItemStatus[category as ListItemStatus]

        const count = document.querySelectorAll('td[class="px-0 px-sm-2"]').length / 2
        presenceData.state = `Kategoria '${categoryName}' • ${count} anime`
      }

      const name = document.querySelector('h4[class="card-title col-12 text-center mb-1"]')?.textContent?.replace('- Lista anime', '')?.replace(/\s/g, '')

      presenceData.details = append('Przegląda listę Anime', name)

      if (showCover)
        presenceData.largeImageKey = getProfilePicture(id)
    }
  }
  else if (pathname.startsWith('/user_comments/') && browsingStatusEnabled) {
    const id = pathname.replace('/user_comments/', '')
    presenceData.buttons = await setButton('Zobacz listę komentarzy', document.location.href)
    presenceData.details = 'Przegląda komentarze wysłane przez użytkownika'
    if (id != null) {
      const name = document.querySelector('h4[class="card-title col-12 text-center mb-1"]')?.textContent?.replace('Komentarze użytkownika: ', '')?.replace(/\s/g, '')
      const comments = (document.querySelectorAll('section > .row > div[class="col-12 mb-3"]')?.length ?? 1) - 1

      if (name) {
        presenceData.details = `Przegląda komentarze wysłane przez: ${name}`
      }

      presenceData.state = `${commentsString(comments)} przez użytkownika`

      if (showCover)
        presenceData.largeImageKey = getProfilePicture(id)
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

    presenceData.details = append('Przegląda profil', name)

    if (watchTime)
      presenceData.state = `Czas oglądania: ${watchTime}`

    if (showCover)
      presenceData.largeImageKey = getProfilePicture(id)

    if (id === userID.toString())
      presenceData.buttons = await profileButton()
    else
      presenceData.buttons = await setButton('Zobacz Profil', document.location.href)
  }
  else if (pathname.startsWith('/character/') && browsingStatusEnabled) {
    const name = document.querySelector('#animemenu_info > div[class="row card-body justify-content-center"] > h4[class="card-title col-12 text-center mb-1"]')
    const image = document.querySelector('img[class="img-fluid lozad rounded text-center"]')?.getAttribute('data-src')?.trim()

    presenceData.buttons = await setButton('Zobacz Postać', document.location.href)
    presenceData.details = append('Sprawdza postać', name?.textContent)

    if (image && showCover)
      presenceData.largeImageKey = image
  }
  else if (pathname.startsWith('/all_anime_list') && browsingStatusEnabled) {
    const letter = pathname.replace('/all_anime_list', '')?.replace('/', '')?.toUpperCase()

    presenceData.details = 'Przegląda wszystkie dostępne anime'

    if (letter)
      presenceData.details = `Przegląda anime na literę: ${letter}`
    else
      presenceData.details = 'Przegląda anime nie zaczynające się na literę'
  }
  else if (pathname.startsWith('/search/name/') && browsingStatusEnabled && showSearchContent) {
    const search = document.getElementsByClassName('search-info')?.[0]?.querySelector('div[class="card bg-white"] > div[class="row card-body justify-content-center"] > p[class="col-12 p-0 m-0"]')?.textContent?.replace('Wyszukiwanie: ', '')
    const resultCountElements = document.querySelectorAll('div[class="card bg-white"] > div[class="row card-body justify-content-center"]')
    const resultCount = resultCountElements[resultCountElements.length - 1]?.textContent?.match('Znaleziono: (.*?)\.S')?.[1]

    presenceData.details = append('Szuka Anime', search)

    if (resultCount)
      presenceData.state = resultCount
  }
  else {
    if (browsingStatusEnabled) {
      let recognized = false
      for (const [key, value] of Object.entries(staticBrowsing)) {
        if (pathname.includes(key)) {
          presenceData.details = value
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
