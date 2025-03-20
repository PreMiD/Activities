const presence = new Presence({ clientId: '1137362720254074972' })
const browsingTimestamp = Math.floor(Date.now() / 1000)
const anime = document.querySelector('#anime_name_id')
const animeicon = document.querySelector('.img-fluid.lozad')
const { pathname, href } = document.location

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    startTimestamp: browsingTimestamp,
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/O/ogladajanime/assets/0.png',
  }

  if (pathname === '/main2') {
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
    presenceData.buttons = [{ label: 'Zobacz Listę Anime', url: href }]
  }
  else if (pathname.includes('/anime')) {
    if (anime) {
      presenceData.details = anime.textContent
      presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/O/ogladajanime/assets/0.png'
      presenceData.buttons = [{ label: 'Obejrzyj Teraz', url: href }]

      presenceData.state = `Odcinek : ${
        Number.parseInt(href.split('/').pop() || '1', 10) || 1
      }`
    }

    if (animeicon) {
      presenceData.largeImageKey = animeicon
        .getAttribute('data-srcset')
        ?.split(' ')[0]
    }
  }
  presence.setActivity(presenceData)
})
