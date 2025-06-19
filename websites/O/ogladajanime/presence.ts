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

    if ((pathname === '/main2' || pathname === '/') && browsingStatusEnabled) {
      presenceData.details = 'Przegląda stronę główną'
    }
    else if (pathname.includes('/search/name/') && browsingStatusEnabled) {
      presenceData.details = 'Szuka Anime'
    }
    else if (pathname.includes('/chat') && browsingStatusEnabled) {
      presenceData.details = 'Rozmawia na chacie'
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
    else if (pathname.includes('/anime_list/') && browsingStatusEnabled) {
      const id = pathname.replace('/anime_list/', '').replace(/\/\d/, '')
      if (id == null) {
        presenceData.details = 'Przegląda listę Anime'
        presenceData.state = pathname
        presenceData.buttons = [{ label: 'Zobacz Listę Anime', url: document.location.href }]
      }
      else {
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
        })
        const name = document.querySelector('h4[class="card-title col-12 text-center mb-1"]')?.textContent?.replace('- Lista anime', '')?.replace(/\s/g, '')

        if (name) {
          presenceData.details = `Przegląda listę '${name}'`
        }
        else {
          presenceData.details = 'Przegląda listę Anime'
        }
        if (watching === 0)
          presenceData.state = `${watchedString(watched)}`
        else
          presenceData.state = `${watchingString(watching)} • ${watchedString(watched)}`
        presenceData.buttons = [{ label: 'Zobacz Listę Anime', url: document.location.href }]

        presenceData.largeImageKey = `https://cdn.ogladajanime.pl/images/user/${id}.webp`
        presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/O/ogladajanime/assets/0.png'
      }
    }
    else if (pathname.includes('/profile') && browsingStatusEnabled) {
      const pfp = document.querySelector('img[alt="Profile Avatar"]')
      const name = document.querySelector('h4[class="card-title col-12 text-center m-0 text-dark"]')?.textContent?.replace(/\s/g, '')?.replace('-Profil', '')
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
      const altName = alternativeName?.getAttribute('title')
      if (altName != null && useAltName)
        name = altName
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
    else {
      return presence.clearActivity()
    }

    presence.setActivity(presenceData)
  })
}

function watchingString(num: number): string {
  if (num === 0)
    return `${num} oglądanych`
  else if (num < 5)
    return `${num} oglądane`
  else
    return `${num} oglądanych`
}

function watchedString(num: number): string {
  if (num === 0)
    return `${num} obejrzanych`
  else if (num < 5)
    return `${num} obejrzane`
  else
    return `${num} obejrzanych`
}

function checkForPlayer() {
  const { pathname } = document.location
  if (pathname.includes('/anime')) {
    presence.info('looking for video')
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
