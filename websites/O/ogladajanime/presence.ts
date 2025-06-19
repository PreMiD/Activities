import { ActivityType, getTimestamps } from 'premid'

const presence = new Presence({ clientId: '1137362720254074972' })

const browsingTimestamp = Math.floor(Date.now() / 1000)

const content = document.getElementById('site-content')
let player: HTMLMediaElement
let isPlaying = false

let lastContentOpacity = 0

if (content != null) {
  new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'style') {
        if (content != null) {
          const opacity = Number.parseInt(content.style.opacity)
          if (opacity <= 0 && lastContentOpacity > 0) {
            isPlaying = false
            updatePresence()
          }

          lastContentOpacity = opacity
        }
      }
    })
  }).observe(content, {
    attributes: true,
  })
}

function updatePresence() {
  presence.on('UpdateData', async () => {
    const { pathname } = document.location
    const browsingStatusEnabled = await presence.getSetting<boolean>('browsingStatus')
    const useAltName = await presence.getSetting<boolean>('useAltName')
    const hideWhenPaused = await presence.getSetting<boolean>('hideWhenPaused')
    const presenceData: PresenceData = {
      type: ActivityType.Watching,
      startTimestamp: browsingTimestamp,
      largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/O/ogladajanime/assets/0.png',
    }

    // Complex

    if (pathname.includes('/user_comments/') && browsingStatusEnabled) {
      const id = pathname.replace('/user_comments/', '')
      presenceData.buttons = [{ label: 'Zobacz listę komentarzy', url: document.location.href }]
      presenceData.details = 'Przegląda komentarze wysłane przez użytkownika'
      if (id != null) {
        const name = document.querySelector('h4[class="card-title col-12 text-center mb-1"]')?.textContent?.replace('Komentarze użytkownika: ', '')?.replace(/\s/g, '')
        const comments = (document.querySelector('#site-content section .row')?.querySelectorAll('div[class="col-12 mb-3"]').length ?? 1) - 1

        if (name) {
          presenceData.details = `Przegląda komentarze wysłane przez '${name}'`
        }

        presenceData.state = `${commentsString(comments)} przez użytkownika`

        presenceData.largeImageKey = `https://cdn.ogladajanime.pl/images/user/${id}.webp`
        presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/O/ogladajanime/assets/0.png'
      }
    }
    else if (pathname.includes('/anime_list/') && browsingStatusEnabled) {
      let id = pathname.replace('/anime_list/', '')
      const match = id.match(/\/\d/)
      let category = 0
      if (match != null) {
        const split = id.split('/')
        category = Number.parseInt(split.at(1) as string)
      }
      id = id.replace(/\/\d/, '')

      presenceData.details = 'Przegląda listę Anime'
      presenceData.buttons = [{ label: 'Zobacz listę Anime', url: document.location.href }]
      if (id != null) {
        if (category === 0) {
          const statuses = document.querySelectorAll('td[class="px-1 px-sm-2"]')
          let watched = 0
          let watching = 0
          statuses.forEach((elem, _, __) => {
            const select = elem.querySelector('select')
            if (select != null) {
              if (select.value === '2')
                watched++
              else if (select.value === '1')
                watching++
            }
            else if (elem.innerHTML != null) {
              if (elem.innerHTML?.trim()?.replace(' ', '') === 'Obejrzane')
                watched++
              else if (elem.textContent?.trim()?.replace(' ', '') === 'Oglądam')
                watching++
            }
          })

          if (watching === 0)
            presenceData.state = `${watchedString(watched)}`
          else
            presenceData.state = `Ogląda ${watching} • ${watchedString(watched)}`
        }
        else {
          let categoryName: string = 'N/A'
          switch (category) {
            case 1:
              categoryName = 'Oglądam'
              break
            case 2:
              categoryName = 'Obejrzane'
              break
            case 3:
              categoryName = 'Planuje'
              break
            case 4:
              categoryName = 'Wstrzymane'
              break
            case 5:
              categoryName = 'Porzucone'
              break
          }

          const count = document.querySelectorAll('td[class="px-0 px-sm-2"]').length / 2
          presenceData.state = `Kategoria '${categoryName}' • ${count} anime`
        }

        const name = document.querySelector('h4[class="card-title col-12 text-center mb-1"]')?.textContent?.replace('- Lista anime', '')?.replace(/\s/g, '')

        if (name) {
          presenceData.details = `Przegląda listę '${name}'`
        }

        presenceData.largeImageKey = `https://cdn.ogladajanime.pl/images/user/${id}.webp`
        presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/O/ogladajanime/assets/0.png'
      }
    }
    else if (pathname.includes('/profile') && browsingStatusEnabled) {
      const pfp = document.querySelector('img[alt="Profile Avatar"]')
      const name = document.querySelector('h4[class="card-title col-12 text-center m-0 text-dark"]')?.textContent?.replace(/\s/g, '')?.replace('-Profil', '')
      // TODO: add a state for presence
      if (name) {
        presenceData.details = `Przegląda profil '${name}'`
      }
      else {
        presenceData.details = 'Przegląda profil'
      }
      if (pfp) {
        presenceData.largeImageKey = pfp.getAttribute('src')
        presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/O/ogladajanime/assets/0.png'
      }
      presenceData.buttons = [{ label: 'Zobacz Profil', url: document.location.href }]
    }
    else if (pathname.includes('/anime')) {
      checkForPlayer()
      const anime = document.querySelector('#anime_name_id')
      let name = anime?.textContent
      const alternativeName = anime?.parentElement?.querySelector(
        'i[class="text-muted text-trim"]',
      )
      if (alternativeName != null) {
        const altName = alternativeName?.getAttribute('title')
        if (altName != null && altName.length !== 0 && useAltName)
          name = altName
      }
      const animeicon = document.querySelector('.img-fluid.lozad')
      const episodeList = document.querySelector('#ep_list')
      const activeEpisode = episodeList?.querySelector('.active')

      const ratingElement = document.getElementById('my_anime_rate')
      const rating = ratingElement?.parentElement?.querySelector('h4')
      const voteCount = ratingElement?.parentElement?.querySelector('.text-left')

      if (name) {
        presenceData.details = name
        presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/O/ogladajanime/assets/0.png'
        presenceData.buttons = [{ label: 'Obejrzyj Teraz', url: document.location.href }]
        presenceData.state = `Odcinek ${activeEpisode?.getAttribute('value') ?? 0
        } • ${activeEpisode?.querySelector('p')?.innerHTML ?? 'N/A'}`
      }
      else {
        return presence.clearActivity()
      }

      if (player != null && isPlaying) {
        const timestamps = getTimestamps(player.currentTime, player.duration)
        presenceData.startTimestamp = timestamps[0]
        presenceData.endTimestamp = timestamps[1]
      }
      else if (!isPlaying && !browsingStatusEnabled && hideWhenPaused) {
        return presence.clearActivity()
      }

      if (rating && voteCount) {
        presenceData.largeImageText = `${rating.textContent} • ${voteCount.textContent}`
      }

      if (animeicon) {
        presenceData.largeImageKey = animeicon.getAttribute('data-srcset')?.split(' ')[0]
      }
    }
    else if (pathname.match(/\/watch2gether\/\d+/)) {
      checkForPlayer()
      const animeicon = document.querySelector('img[class="img-fluid lozad rounded tooltip tooltip-anime mb-2 tooltipstered"]')
      const name = document.querySelector('h5[class="card-title text-dark"]')
      const infoElem = document.querySelector('h6[class="card-subtitle mb-2 text-muted"]')
      const spans = infoElem?.querySelectorAll('span[class="text-gray"]')

      if (spans == null || spans.length === 0)
        return presence.clearActivity()

      const episode = spans[0]?.textContent
      const roomName = spans[spans.length - 1]?.textContent

      if (name) {
        presenceData.details = name.textContent
        presenceData.state = `Odcinek ${episode} • Pokój '${roomName}'`
        presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/O/ogladajanime/assets/0.png'
        presenceData.buttons = [{ label: 'Obejrzyj ze mną', url: document.location.href }]
      }
      else {
        return presence.clearActivity()
      }

      if (player != null && isPlaying) {
        const timestamps = getTimestamps(player.currentTime, player.duration)
        presenceData.startTimestamp = timestamps[0]
        presenceData.endTimestamp = timestamps[1]
      }
      else if (!isPlaying && !browsingStatusEnabled && hideWhenPaused) {
        return presence.clearActivity()
      }

      if (animeicon) {
        presenceData.largeImageKey = animeicon.getAttribute('data-src')?.split(' ')[0]
      }
    }
    else if (pathname.includes('/character/') && browsingStatusEnabled) {
      const characterInfo = document.getElementById('animemenu_info')
      const name = characterInfo?.querySelector('div[class="row card-body justify-content-center"] h4[class="card-title col-12 text-center mb-1"]')
      const image = document.querySelector('img[class="img-fluid lozad rounded text-center"]')?.getAttribute('data-src')?.trim()
      if (name)
        presenceData.details = `Sprawdza postać '${name?.textContent}'`
      else
        presenceData.details = 'Sprawdza postać'
      if (image) {
        presenceData.largeImageKey = image
        presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/O/ogladajanime/assets/0.png'
      }
    }
    // Simple

    else if (pathname.includes('/watch2gether') && browsingStatusEnabled) {
      presenceData.details = 'Przegląda pokoje do oglądania z innymi'
    }

    else if ((pathname === '/main2' || pathname === '/') && browsingStatusEnabled) {
      presenceData.details = 'Przegląda stronę główną'
    }
    else if ((pathname.includes('/search/name/') || pathname.includes('/search/custom')) && browsingStatusEnabled) {
      presenceData.details = 'Szuka Anime'
    }
    else if (pathname.includes('/search/rand') && browsingStatusEnabled) {
      presenceData.details = 'Przegląda losowe anime'
    }
    else if (pathname.includes('/search/new') && browsingStatusEnabled) {
      presenceData.details = 'Przegląda najnowsze anime'
    }
    else if (pathname.includes('/search/main') && browsingStatusEnabled) {
      presenceData.details = 'Przegląda najlepiej oceniane anime'
    }
    else if (pathname.includes('/chat') && browsingStatusEnabled) {
      presenceData.details = 'Rozmawia na chacie'
    }
    else if (pathname.includes('/user_activity') && browsingStatusEnabled) {
      presenceData.details = 'Przegląda swoją ostatnią aktywność'
    }
    else if (pathname.includes('/last_comments') && browsingStatusEnabled) {
      presenceData.details = 'Przegląda ostatnie komentarze'
    }
    else if (pathname.includes('/active_sessions') && browsingStatusEnabled) {
      presenceData.details = 'Przegląda aktywne sesje logowania'
    }
    else if (pathname.includes('/manage_edits') && browsingStatusEnabled) {
      presenceData.details = 'Przegląda ostatnie edycje'
    }
    else if (pathname.includes('/anime_list_to_load') && browsingStatusEnabled) {
      presenceData.details = 'Ładuję listę anime z innej strony'
    }
    else if (pathname.includes('/discord') && browsingStatusEnabled) {
      presenceData.details = 'Sprawdza jak można się skontaktować'
    }
    else if (pathname.includes('/support') && browsingStatusEnabled) {
      presenceData.details = 'Sprawdza jak można wspierać OA'
    }
    else if (pathname.includes('/radio') && browsingStatusEnabled) {
      presenceData.details = 'Słucha Radio Anime'
    }
    else if (pathname.includes('/rules') && browsingStatusEnabled) {
      presenceData.details = 'Czyta regulamin'
    }
    else if (pathname.includes('/harmonogram') && browsingStatusEnabled) {
      presenceData.details = 'Przegląda harmonogram emisji odcinków Anime'
    }
    // TODO: add support for https://ogladajanime.pl/anime_seasons. Would have done that if I only knew what it was about
    else {
      return presence.clearActivity()
    }

    presence.setActivity(presenceData)
  })
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

function checkForPlayer() {
  const { pathname } = document.location
  if (pathname.includes('/anime') || pathname.includes('/watch2gether/')) {
    const _player = document.querySelector('video')
    if (_player != null) {
      if (player != null) {
        player.removeEventListener('playing', playerPlaying)
        player.removeEventListener('pause', playerPaused)
        player.removeEventListener('durationchange', playerDurationChange)
        player.removeEventListener('timeupdate', playerTimeChange)
      }
      player = _player
      player.addEventListener('playing', playerPlaying)
      player.addEventListener('pause', playerPaused)
      player.addEventListener('durationchange', playerDurationChange)
      player.addEventListener('timeupdate', playerTimeChange)
    }
  }
}

function playerPlaying() {
  isPlaying = true
  updatePresence()
}

function playerPaused() {
  isPlaying = false
  updatePresence()
}

function playerDurationChange() {
  updatePresence()
}

let previousTime = 0

function playerTimeChange() {
  if (Math.abs(player.currentTime - previousTime) > 2) {
    updatePresence()
  }
  previousTime = player.currentTime
}

updatePresence()
