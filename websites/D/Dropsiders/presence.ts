import { ActivityType } from 'premid';

const presence = new Presence({
  clientId: '503557087041683458', // PreMiD universal Discord Application ID
});

const browsingTimestamp = Math.floor(Date.now() / 1000);

enum ActivityAssets {
  Logo = 'https://raw.githubusercontent.com/Itsalexfr1/sitedropsiders/main/public/premid_logo.png',
  Radio = 'https://raw.githubusercontent.com/Itsalexfr1/sitedropsiders/main/public/premid_radio.png',
}

interface LiveRadioState {
  isPlaying: boolean;
  trackTitle: string;
  artist: string;
  blockTitle: string;
}

interface LiveTVState {
  isPlaying: boolean;
  title: string;
  blockTitle: string;
  category: string;
  isPromo: boolean;
}

const liveRadio: LiveRadioState = {
  isPlaying: false,
  trackTitle: '',
  artist: '',
  blockTitle: '',
};

const liveTv: LiveTVState = {
  isPlaying: true, // Par défaut sur la page TV, la vidéo démarre automatiquement
  title: '',
  blockTitle: '',
  category: '',
  isPromo: false,
};

// ─── ÉCOUTEURS D'ÉVÉNEMENTS EN DIRECT DU SITE ────────────────────────────────

// 1. État Radio
window.addEventListener('dropsiders_radio_state', (e: any) => {
  if (e?.detail) {
    liveRadio.isPlaying = !!e.detail.isPlaying;
    const currentSet = e.detail.currentSet;
    if (currentSet) {
      liveRadio.trackTitle = (currentSet.title || currentSet.event || '').trim();
      liveRadio.artist = (currentSet.artist || '').trim();
      liveRadio.blockTitle = (currentSet.blockTitle || '').trim();
    }
  }
});

// 2. État TV
window.addEventListener('dropsiders_tv_state', (e: any) => {
  if (e?.detail) {
    liveTv.isPlaying = e.detail.isPlaying !== false;
    if (e.detail.title) liveTv.title = String(e.detail.title).trim();
    if (e.detail.blockTitle) liveTv.blockTitle = String(e.detail.blockTitle).trim();
    if (e.detail.category) liveTv.category = String(e.detail.category).trim();
    liveTv.isPromo = !!e.detail.isPromo;
  }
});

// Demande d'état initial au site
window.dispatchEvent(new CustomEvent('dropsiders_radio_query_state'));
window.dispatchEvent(new CustomEvent('dropsiders_tv_query_state'));

presence.on('UpdateData', async () => {
  const { pathname, href } = document.location;

  const showTV = (await presence.getSetting<boolean>('showTV')) ?? true;
  const showRadio = (await presence.getSetting<boolean>('showRadio')) ?? true;
  const showArticle = (await presence.getSetting<boolean>('showArticle')) ?? true;
  const showButtons = (await presence.getSetting<boolean>('showButtons')) ?? true;

  const defaultButtons: [ButtonData, ButtonData?] = [
    { label: 'Visiter le site', url: 'https://dropsiders.fr' },
    { label: 'Écouter la Radio', url: 'https://dropsiders.fr/radio' },
  ];

  // 1. ─── DROPSIDERS TV (/tv) ────────────────────────────────────────────────
  if ((pathname.startsWith('/tv') || pathname === '/tv') && showTV) {
    const tvContainer = document.getElementById('dropsiders-tv-container');
    const domTitle =
      tvContainer?.getAttribute('data-tv-title') ||
      document.querySelector('h2.font-display')?.textContent?.trim() ||
      document.querySelector('h2')?.textContent?.trim() ||
      '';
    const domBlock =
      tvContainer?.getAttribute('data-tv-block') ||
      liveTv.blockTitle ||
      'Programme TV';

    const currentTitle = (liveTv.title || domTitle || '').trim();

    const tvButtons: [ButtonData, ButtonData?] = [
      { label: 'Regarder Dropsiders TV', url: 'https://dropsiders.fr/tv' },
      { label: 'Visiter le site', url: 'https://dropsiders.fr' },
    ];

    const tvData: PresenceData = {
      type: ActivityType.Watching,
      largeImageKey: ActivityAssets.Logo,
      largeImageText: 'Dropsiders TV - Direct 24/7',
      smallImageKey: ActivityAssets.Radio,
      smallImageText: 'En direct',
      details: currentTitle ? `📺 ${currentTitle}`.slice(0, 120) : 'Dropsiders TV - Direct 24/7',
      state: domBlock ? `🎪 ${domBlock}`.slice(0, 120) : 'Livesets & Clips en continu',
      startTimestamp: browsingTimestamp,
      buttons: showButtons ? tvButtons : undefined,
    };

    presence.setActivity(tvData);
    return;
  }

  // 2. ─── RADIO EN DIRECT (/radio ou en arrière-plan) ────────────────────────
  if (showRadio) {
    const isAudioPlaying = Array.from(document.querySelectorAll('audio')).some(
      (a) => !a.paused && !a.ended && a.currentTime > 0
    );
    const radioBar = document.querySelector('aside, [role="complementary"], .fixed.bottom-0');
    const domTitle = radioBar?.querySelector('h4')?.textContent?.trim();
    const domArtist = radioBar?.querySelector('p.text-gray-300')?.textContent?.trim();

    const trackTitle = liveRadio.trackTitle || domTitle;
    const artistName = liveRadio.artist || domArtist;

    // Détection active si l'audio tourne ou si l'utilisateur est sur /radio
    const isRadioActive =
      (liveRadio.isPlaying || isAudioPlaying) && !!trackTitle;
    const isOnRadioPage = pathname.startsWith('/radio') || pathname === '/radio';

    if (isRadioActive || isOnRadioPage) {
      const radioButtons: [ButtonData, ButtonData?] = [
        { label: 'Écouter la Radio', url: 'https://dropsiders.fr/radio' },
        { label: 'Visiter le site', url: 'https://dropsiders.fr' },
      ];

      const radioData: PresenceData = {
        type: ActivityType.Listening,
        largeImageKey: ActivityAssets.Radio,
        largeImageText: 'Dropsiders Radio Live 24/7',
        smallImageKey: ActivityAssets.Logo,
        smallImageText: 'Dropsiders.fr',
        details: trackTitle ? `🎵 ${trackTitle}`.slice(0, 120) : 'Dropsiders Radio Live 24/7',
        state: artistName ? `par ${artistName}`.slice(0, 120) : 'Web Radio Electro 24/7',
        startTimestamp: browsingTimestamp,
        buttons: showButtons ? radioButtons : undefined,
      };

      presence.setActivity(radioData);
      return;
    }
  }

  // 3. ─── NAVIGATION DANS LES DIFFÉRENTES CATÉGORIES DU SITE ──────────────────
  const basePresence: PresenceData = {
    type: ActivityType.Watching,
    largeImageKey: ActivityAssets.Logo,
    largeImageText: 'Dropsiders - Musique Électronique & Festivals',
    startTimestamp: browsingTimestamp,
  };

  // ARTICLES / ACTUALITÉS
  if (pathname.startsWith('/news/') && pathname !== '/news' && showArticle) {
    const articleTitle = document.querySelector('h1')?.textContent?.trim() || 'Actualité Électro';
    basePresence.details = `📰 ${articleTitle}`.slice(0, 120);
    basePresence.state = "Lecture d'une actualité";
    basePresence.buttons = showButtons
      ? [
          { label: "Lire l'article", url: href },
          { label: 'Toutes les actus', url: 'https://dropsiders.fr/news' },
        ]
      : undefined;
  } else if (pathname.startsWith('/news') || pathname === '/news') {
    basePresence.details = 'Consulte les actualités électro';
    basePresence.state = 'News, sorties & annonces festivals';
    basePresence.buttons = showButtons
      ? [
          { label: 'Découvrir les actus', url: 'https://dropsiders.fr/news' },
          { label: 'Visiter le site', url: 'https://dropsiders.fr' },
        ]
      : undefined;

  // RÉCAPS DE FESTIVALS
  } else if (pathname.startsWith('/recaps/') && pathname !== '/recaps' && showArticle) {
    const recapTitle = document.querySelector('h1')?.textContent?.trim() || 'Récap Festival';
    basePresence.details = `🎉 ${recapTitle}`.slice(0, 120);
    basePresence.state = 'Découvre un récap de festival';
    basePresence.buttons = showButtons
      ? [
          { label: 'Voir le récap', url: href },
          { label: 'Tous les récaps', url: 'https://dropsiders.fr/recaps' },
        ]
      : undefined;
  } else if (pathname.startsWith('/recaps') || pathname === '/recaps') {
    basePresence.details = 'Explore les récaps de festivals';
    basePresence.state = "Retours d'expérience & aftermovies";
    basePresence.buttons = showButtons
      ? [
          { label: 'Voir les récaps', url: 'https://dropsiders.fr/recaps' },
          { label: 'Visiter le site', url: 'https://dropsiders.fr' },
        ]
      : undefined;

  // INTERVIEWS D'ARTISTES
  } else if (pathname.startsWith('/interviews/') && pathname !== '/interviews' && showArticle) {
    const interviewTitle = document.querySelector('h1')?.textContent?.trim() || 'Interview Exclusive';
    basePresence.details = `🎙️ ${interviewTitle}`.slice(0, 120);
    basePresence.state = "Découvre une interview d'artiste";
    basePresence.buttons = showButtons
      ? [
          { label: "Lire l'interview", url: href },
          { label: 'Toutes les interviews', url: 'https://dropsiders.fr/interviews' },
        ]
      : undefined;
  } else if (pathname.startsWith('/interviews') || pathname === '/interviews') {
    basePresence.details = 'Interviews exclusives de DJs';
    basePresence.state = "Coulisses & rencontres d'artistes";
    basePresence.buttons = showButtons
      ? [
          { label: 'Voir les interviews', url: 'https://dropsiders.fr/interviews' },
          { label: 'Visiter le site', url: 'https://dropsiders.fr' },
        ]
      : undefined;

  // AGENDA DES FESTIVALS
  } else if (pathname.startsWith('/agenda') || pathname === '/agenda') {
    basePresence.details = "Consulte l'Agenda des Festivals";
    basePresence.state = 'Dates, line-ups & billetteries';
    basePresence.buttons = showButtons
      ? [
          { label: "Voir l'Agenda", url: 'https://dropsiders.fr/agenda' },
          { label: 'Visiter le site', url: 'https://dropsiders.fr' },
        ]
      : undefined;

  // FESTIVAL EN DIRECT (LIVE MULTI-SCÈNES)
  } else if (pathname.startsWith('/live') || pathname === '/live') {
    basePresence.details = 'Festival en direct live';
    basePresence.state = 'Diffusion exclusive multi-scènes';
    basePresence.buttons = showButtons
      ? [
          { label: 'Regarder le Live', url: 'https://dropsiders.fr/live' },
          { label: 'Visiter le site', url: 'https://dropsiders.fr' },
        ]
      : undefined;

  // GALERIE PHOTOS / COMMU ALBUMS
  } else if (pathname.startsWith('/galerie') || pathname.startsWith('/communaute/')) {
    const albumTitle = document.querySelector('h1')?.textContent?.trim();
    basePresence.details = albumTitle ? `📸 ${albumTitle}`.slice(0, 120) : 'Galerie Photos Festivals';
    basePresence.state = 'Les plus beaux clichés en festival';
    basePresence.buttons = showButtons
      ? [
          { label: 'Voir les photos', url: 'https://dropsiders.fr/galerie' },
          { label: 'Visiter le site', url: 'https://dropsiders.fr' },
        ]
      : undefined;

  // VOYAGES & PACKAGES FESTIVALS
  } else if (pathname.startsWith('/voyage')) {
    basePresence.details = 'Voyages & Séjours Festivals';
    basePresence.state = 'Hébergements, navettes & pass';
    basePresence.buttons = showButtons
      ? [
          { label: 'Découvrir les voyages', url: 'https://dropsiders.fr/voyage' },
          { label: 'Visiter le site', url: 'https://dropsiders.fr' },
        ]
      : undefined;

  // BLIND TEST ÉLECTRO
  } else if (pathname.includes('/blind-test') || pathname.includes('/blindtest')) {
    basePresence.details = '🎮 Blind Test Électro';
    basePresence.state = 'Défie ses connaissances musicales';
    basePresence.buttons = showButtons
      ? [
          { label: 'Jouer au Quiz', url: 'https://dropsiders.fr/blind-test' },
          { label: 'Visiter le site', url: 'https://dropsiders.fr' },
        ]
      : undefined;

  // BOUTIQUE / SHOP
  } else if (pathname.startsWith('/shop') || pathname.includes('/boutique')) {
    basePresence.details = '🛍️ Boutique Dropsiders';
    basePresence.state = 'Merch officiel, textile & goodies';
    basePresence.buttons = showButtons
      ? [
          { label: 'Voir la boutique', url: 'https://dropsiders.fr/shop' },
          { label: 'Visiter le site', url: 'https://dropsiders.fr' },
        ]
      : undefined;

  // TOP DROPSIDERS & COMMUNAUTÉ
  } else if (pathname.startsWith('/top-dropsiders') || pathname === '/communaute') {
    basePresence.details = '🏆 Communauté Dropsiders';
    basePresence.state = 'Classement & cartes collectors';
    basePresence.buttons = showButtons
      ? [
          { label: 'Voir le classement', url: 'https://dropsiders.fr/top-dropsiders' },
          { label: 'Visiter le site', url: 'https://dropsiders.fr' },
        ]
      : undefined;

  // CLIPS VIDÉOS
  } else if (pathname.startsWith('/clips')) {
    basePresence.details = '🎬 Clips & Nouveautés Électro';
    basePresence.state = 'Sélection des meilleurs clips';
    basePresence.buttons = showButtons
      ? [
          { label: 'Regarder les clips', url: 'https://dropsiders.fr/clips' },
          { label: 'Visiter le site', url: 'https://dropsiders.fr' },
        ]
      : undefined;

  // GRAND CONCOURS GTA 6
  } else if (pathname.includes('gta6') || pathname.includes('concours')) {
    basePresence.details = '🔥 Grand Concours GTA VI';
    basePresence.state = 'Tente de remporter le jeu GTA 6';
    basePresence.buttons = showButtons
      ? [
          { label: 'Participer au jeu', url: 'https://dropsiders.fr/concours-gta6' },
          { label: 'Visiter le site', url: 'https://dropsiders.fr' },
        ]
      : undefined;

  // MIXES & SETS PARTAGÉS
  } else if (pathname.startsWith('/mix/') || pathname.startsWith('/mixes/')) {
    basePresence.type = ActivityType.Listening;
    basePresence.details = '🎧 Écoute un DJ Set exclusif';
    basePresence.state = 'Sélection sets & mixes partagés';
    basePresence.buttons = showButtons
      ? [
          { label: 'Écouter le mix', url: href },
          { label: 'Visiter le site', url: 'https://dropsiders.fr' },
        ]
      : undefined;

  // STUDIO CRÉATIF / VISUELS
  } else if (pathname.includes('/social-studio') || pathname.includes('/aftermovie')) {
    basePresence.details = 'Studio Créatif Dropsiders';
    basePresence.state = 'Création de visuels & aftermovies';
    basePresence.buttons = showButtons ? defaultButtons : undefined;

  // ACCUEIL / PAR DÉFAUT
  } else {
    basePresence.details = 'Explore Dropsiders';
    basePresence.state = 'Portail N°1 Festivals & Musique Électro';
    basePresence.buttons = showButtons ? defaultButtons : undefined;
  }

  presence.setActivity(basePresence);
});
