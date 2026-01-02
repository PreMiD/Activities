const presence = new Presence({
  clientId: '1017558325753303102',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const dataDiv = document.getElementById('premid-data')
  const path = document.location.pathname
  const href = document.location.href

  let activityData: any = {}

  // 1. PLAYER
  if (dataDiv && (path.includes('player') || href.includes('episodio'))) {
    activityData = {
      largeImageKey: 'logo_grande',
      startTimestamp: browsingTimestamp,
      details: dataDiv.dataset.anime || 'Guardando un Anime',
      state: `Episodio ${dataDiv.dataset.episode || '?'}`,
      largeImageText: dataDiv.dataset.anime,
      buttons: [
        {
          label: 'Guarda Episodio',
          url: href,
        },
        {
          label: 'Scheda Anime',
          url: `https://animetvonline.org/dettagli.php?slug=${dataDiv.dataset.slug}`,
        },
      ],
    }
  }

  // 2. SCHEDA DETTAGLI
  else if (path.includes('dettagli') || href.includes('post.php')) {
    const titleElement = document.querySelector('h1')
    const title = titleElement ? titleElement.textContent : document.title

    activityData = {
      largeImageKey: 'logo_grande',
      startTimestamp: browsingTimestamp,
      details: 'Sta guardando la scheda di:',
      state: title?.replace('AnimeTvOnline - ', '').trim(),
      buttons: [
        {
          label: 'Vedi Scheda',
          url: href,
        },
      ],
    }
  }

  // 3. PROFILO
  else if (path.includes('profilo')) {
    activityData = {
      largeImageKey: 'logo_grande',
      startTimestamp: browsingTimestamp,
      details: 'Visualizzando un profilo',
      state: 'Utente AnimeTvOnline',
    }
  }

  // 4. HOMEPAGE
  else if (path === '/' || path.includes('index') || path === '' || path.includes('login')) {
    activityData = {
      largeImageKey: 'logo_grande',
      startTimestamp: browsingTimestamp,
      details: 'In Homepage',
      state: 'Cercando un anime da guardare...',
    }
  }

  // 5. DEFAULT
  else {
    activityData = {
      largeImageKey: 'https://i.imgur.com/kAalrFw.png',
      startTimestamp: browsingTimestamp,
      details: 'Navigando su AnimeTvOnline',
      state: 'Streaming Anime ITA',
    }
  }

  presence.setActivity(activityData)
})
