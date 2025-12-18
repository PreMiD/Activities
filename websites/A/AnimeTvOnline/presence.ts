import * as PreMiD from 'premid'

// Usiamo (PreMiD as any) per zittire l'errore tecnico mantenendo la logica funzionante
const presence = new (PreMiD as any).Presence({
  clientId: '1017558325753303102'
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const dataDiv = document.getElementById('premid-data')
  const path = document.location.pathname
  const href = document.location.href

  const presencePayload: any = {
    largeImageKey: 'logo_grande',
    startTimestamp: browsingTimestamp
  }

  // 1. PLAYER
  if (dataDiv && (path.includes('player') || href.includes('episodio'))) {
    presencePayload.details = dataDiv.dataset.anime
    presencePayload.state = `Episodio ${dataDiv.dataset.episode}`
    presencePayload.largeImageText = dataDiv.dataset.anime

    presencePayload.buttons = [
      {
        label: 'Guarda Episodio',
        url: href
      },
      {
        label: 'Scheda Anime',
        url: `https://animetvonline.org/dettagli.php?slug=${dataDiv.dataset.slug}`
      }
    ]

    return presencePayload
  }

  // 2. SCHEDA DETTAGLI
  if (path.includes('dettagli')) {
    const titleElement = document.querySelector('h1')
    const title = titleElement ? titleElement.textContent : document.title

    presencePayload.details = 'Sta guardando la scheda di:'
    presencePayload.state = title.replace('AnimeTvOnline - ', '').trim()
    presencePayload.buttons = [
      {
        label: 'Vedi Scheda',
        url: href
      }
    ]

    return presencePayload
  }

  // 3. PROFILO
  if (path.includes('profilo')) {
    presencePayload.details = 'Visualizzando un profilo'
    presencePayload.state = 'Utente AnimeTvOnline'
    return presencePayload
  }

  // 4. HOMEPAGE
  if (path === '/' || path.includes('index') || path === '' || path.includes('login')) {
    presencePayload.details = 'In Homepage'
    presencePayload.state = 'Cercando un anime da guardare...'
    presencePayload.buttons = [
      {
        label: 'Visita il sito',
        url: 'https://animetvonline.org'
      }
    ]
    return presencePayload
  }

  // 5. DEFAULT
  presencePayload.details = 'Navigando su AnimeTvOnline'
  presencePayload.state = 'Streaming Anime ITA'

  return presencePayload
})
