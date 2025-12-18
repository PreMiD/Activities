import { Presence } from 'premid'

const presence = new Presence({
  clientId: '1017558325753303102'
})

presence.on('UpdateData', async () => {
  const dataDiv = document.getElementById('premid-data')

  // 1. Se siamo nel Player
  if (dataDiv) {
    return {
      largeImageKey: 'logo_grande',
      largeImageText: dataDiv.dataset.anime,
      details: dataDiv.dataset.anime,
      state: `Guardando l'episodio ${dataDiv.dataset.episode}`,
      buttons: [
        {
          label: 'Guarda anche tu',
          url: document.location.href
        },
        {
          label: 'Scheda Anime',
          url: `https://animetvonline.org/dettagli.php?slug=${dataDiv.dataset.slug}`
        }
      ]
    }
  }

  // 2. Se siamo nella Home
  if (document.location.pathname === '/' || document.location.pathname === '/index.php') {
    return {
      largeImageKey: 'logo_grande',
      details: 'Navigando nella Home',
      state: 'Cercando un anime...',
      buttons: [
        {
          label: 'Visita il sito',
          url: 'https://animetvonline.org'
        }
      ]
    }
  }
})
