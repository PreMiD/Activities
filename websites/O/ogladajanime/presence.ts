const presence = new Presence({ clientId: '1137362720254074972' })

const browsingTimestamp = Math.floor(Date.now() / 1000)
const anime = document.querySelector('#anime_name_id')
const animeicon = document.querySelector('.img-fluid.lozad')
const { pathname } = document.location

const observer = new MutationObserver(() => {
  presence.on('UpdateData', async () => {
    const presenceData: PresenceData = {
      startTimestamp: browsingTimestamp,
      largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/O/ogladajanime/assets/0.png',
    }

    if (pathname === '/main2' || pathname === '/') {
      presenceData.details = 'Przegląda stronę główną'
    }
    else if (pathname.includes('/search/name/')) {
      presenceData.details = 'Szuka Anime'
    }
    else if (pathname.includes('/chat')) {
      presenceData.details = 'Rozmawia na chacie'
    }
    else if (pathname.includes('/anime_list/')) {
      presenceData.details = 'Przegląda listę Anime'
      presenceData.buttons = [{ label: 'Zobacz Listę Anime', url: document.location.href }]
    }
    else if (pathname.includes('/anime')) {
      if (anime) {
        presenceData.details = anime.textContent
        presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/O/ogladajanime/assets/0.png'
        presenceData.buttons = [{ label: 'Obejrzyj Teraz', url: document.location.href }]
        presenceData.state = `Odcinek : ${
          Number.parseInt(document.location.href.split('/').pop() || '1', 10) || 1
        }`
      }

      if (animeicon) {
        presenceData.largeImageKey = animeicon.getAttribute('data-srcset')?.split(' ')[0]
      }
    }
    else if (pathname.includes('/profile')) {
      presenceData.details = 'Przegląda profil'
    }

    presence.setActivity(presenceData)
  })
})

observer.observe(document.body, {
  childList: true,
  subtree: true,
})
