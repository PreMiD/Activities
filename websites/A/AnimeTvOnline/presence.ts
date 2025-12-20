const presence = new Presence({
  clientId: '1017558325753303102',
});

const browsingTimestamp = Math.floor(Date.now() / 1000);

presence.on('UpdateData', async () => {
  const dataDiv = document.getElementById('premid-data');
  const path = document.location.pathname;
  const href = document.location.href;

  if (dataDiv && (path.includes('player') || href.includes('episodio'))) {
    return {
      largeImageKey: 'logo_grande',
      startTimestamp: browsingTimestamp,
      details: dataDiv.dataset.anime || 'Guardando un Anime', // Fallback se manca il dato
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
    };
  }

  
  if (path.includes('dettagli') || href.includes('post.php')) {
    const titleElement = document.querySelector('h1');
    const title = titleElement ? titleElement.textContent : document.title;

    return {
      largeImageKey: 'logo_grande',
      startTimestamp: browsingTimestamp,
      details: 'Sta guardando la scheda di:',
      state: title.replace('AnimeTvOnline - ', '').trim(),
      buttons: [
        {
          label: 'Vedi Scheda',
          url: href,
        },
      ],
    };
  }

  if (path.includes('profilo')) {
    return {
      largeImageKey: 'logo_grande',
      startTimestamp: browsingTimestamp,
      details: 'Visualizzando un profilo',
      state: 'Utente AnimeTvOnline',
    };
  }

  if (path === '/' || path.includes('index') || path === '' || path.includes('login')) {
    return {
      largeImageKey: 'logo_grande',
      startTimestamp: browsingTimestamp,
      details: 'In Homepage',
      state: 'Cercando un anime da guardare...',
    };
  }

  return {
    largeImageKey: 'logo_grande',
    startTimestamp: browsingTimestamp,
    details: 'Navigando su AnimeTvOnline',
    state: 'Streaming Anime ITA',
  };
});
