import { ActivityType } from 'premid';

const presence = new Presence({
  clientId: '503557087041683458', // PreMiD universal Discord Application ID
});

const browsingTimestamp = Math.floor(Date.now() / 1000);

enum ActivityAssets {
  Logo = 'https://raw.githubusercontent.com/Itsalexfr1/sitedropsiders/main/public/premid_logo.png',
  Radio = 'https://raw.githubusercontent.com/Itsalexfr1/sitedropsiders/main/public/premid_radio.png',
  Play = 'https://raw.githubusercontent.com/Itsalexfr1/sitedropsiders/main/public/premid_radio.png',
}

interface LiveRadioState {
  isPlaying: boolean;
  trackTitle: string;
  artist: string;
  blockTitle: string;
}

const liveRadio: LiveRadioState = {
  isPlaying: false,
  trackTitle: '',
  artist: '',
  blockTitle: '',
};

// Écoute de l'état réel de la radio diffusé par l'application Dropsiders
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

// Demande immédiate du statut actuel à l'application Dropsiders
window.dispatchEvent(new CustomEvent('dropsiders_radio_query_state'));

presence.on('UpdateData', async () => {
  const { pathname, href } = document.location;

  const showRadio = (await presence.getSetting<boolean>('showRadio')) ?? true;
  const showArticle = (await presence.getSetting<boolean>('showArticle')) ?? true;

  const defaultButtons: [ButtonData, ButtonData?] = [
    { label: 'Visiter le site', url: 'https://dropsiders.fr' },
    { label: 'Écouter la Radio', url: 'https://dropsiders.fr/radio' },
  ];

  // 1. ─── DÉTECTION RADIO EN DIRECT ──────────────────────────────────────────
  if (showRadio) {
    const isAudioPlaying = Array.from(document.querySelectorAll('audio')).some(
      (a) => !a.paused && !a.ended && a.currentTime > 0
    );
    const hasPauseButton = Array.from(document.querySelectorAll('button')).some(
      (b) => b.textContent?.trim().toUpperCase().includes('PAUSE')
    );
    const isPlaying = liveRadio.isPlaying || isAudioPlaying || hasPauseButton;

    // Récupérer le titre STRICTEMENT depuis la barre radio (jamais depuis les cartes d'articles)
    const radioBar = document.querySelector('aside, [role="complementary"], .fixed.bottom-0');
    const domTitle = radioBar?.querySelector('h4')?.textContent?.trim();
    const domArtist = radioBar?.querySelector('p.text-gray-300')?.textContent?.trim();

    const trackTitle = liveRadio.trackTitle || domTitle;
    const artistName = liveRadio.artist || domArtist;

    if (isPlaying) {
      const radioData: PresenceData = {
        type: ActivityType.Listening,
        largeImageKey: ActivityAssets.Radio,
        largeImageText: 'Dropsiders Radio Live 24/7',
        largeImageUrl: 'https://dropsiders.fr/radio',
        details: trackTitle ? `🎵 ${trackTitle}` : 'Dropsiders Radio Live 24/7',
        detailsUrl: 'https://dropsiders.fr/radio',
        state: artistName ? `par ${artistName}` : 'Web Radio Electro 24/7',
        stateUrl: 'https://dropsiders.fr/radio',
        smallImageKey: ActivityAssets.Logo,
        smallImageText: 'Dropsiders.fr',
        smallImageUrl: 'https://dropsiders.fr',
        startTimestamp: browsingTimestamp,
        buttons: defaultButtons,
      };

      presence.setActivity(radioData);
      return;
    }
  }

  // 2. ─── NAVIGATION SUR LES PAGES DU SITE ─────────────────────────────────────
  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    largeImageKey: ActivityAssets.Logo,
    largeImageText: 'Dropsiders - Musique Électronique & Festivals',
    largeImageUrl: 'https://dropsiders.fr',
    detailsUrl: 'https://dropsiders.fr',
    startTimestamp: browsingTimestamp,
    buttons: defaultButtons,
  };

  if (pathname.startsWith('/news/') && showArticle) {
    const articleTitle = document.querySelector('h1')?.textContent?.trim() || 'Article Actualité';
    presenceData.details = articleTitle.slice(0, 120);
    presenceData.state = "Lecture d'un article";
    presenceData.detailsUrl = href;
    presenceData.buttons = [
      { label: "Lire l'article", url: href },
      { label: 'Visiter le site', url: 'https://dropsiders.fr' },
    ];
  } else if (pathname.startsWith('/recaps/') && showArticle) {
    const recapTitle = document.querySelector('h1')?.textContent?.trim() || 'Récapitulatif Festival';
    presenceData.details = recapTitle.slice(0, 120);
    presenceData.state = 'Découvre un récap de festival';
    presenceData.detailsUrl = href;
    presenceData.buttons = [
      { label: 'Voir le récap', url: href },
      { label: 'Visiter le site', url: 'https://dropsiders.fr' },
    ];
  } else if (pathname.includes('/agenda')) {
    presenceData.details = "Consulte l'Agenda des Festivals";
    presenceData.state = 'À la recherche des prochains events';
    presenceData.detailsUrl = 'https://dropsiders.fr/agenda';
    presenceData.buttons = [
      { label: "Voir l'Agenda", url: 'https://dropsiders.fr/agenda' },
      { label: 'Visiter le site', url: 'https://dropsiders.fr' },
    ];
  } else if (pathname.includes('/live') || pathname.includes('/tv')) {
    presenceData.details = 'Regarde Dropsiders TV';
    presenceData.state = 'Livesets & Clips en continu';
    presenceData.detailsUrl = 'https://dropsiders.fr/tv';
    presenceData.buttons = [
      { label: 'Regarder le Live', url: 'https://dropsiders.fr/tv' },
      { label: 'Visiter le site', url: 'https://dropsiders.fr' },
    ];
  } else if (pathname.includes('/blind-test') || pathname.includes('/blindtest')) {
    presenceData.details = 'Joue au Blind Test Electro';
    presenceData.state = 'En pleine session quiz musical';
    presenceData.detailsUrl = 'https://dropsiders.fr/blind-test';
    presenceData.buttons = [
      { label: 'Jouer au Quiz', url: 'https://dropsiders.fr/blind-test' },
      { label: 'Visiter le site', url: 'https://dropsiders.fr' },
    ];
  } else if (pathname.includes('/social-studio')) {
    presenceData.details = 'Social Studio Dropsiders';
    presenceData.state = 'Création de visuels & vidéos';
    presenceData.detailsUrl = 'https://dropsiders.fr/social-studio';
    presenceData.buttons = defaultButtons;
  } else if (pathname.includes('/shop')) {
    presenceData.details = 'Visite la boutique Dropsiders';
    presenceData.state = 'Merch & Goodies';
    presenceData.detailsUrl = 'https://dropsiders.fr/shop';
    presenceData.buttons = [
      { label: 'Voir la boutique', url: 'https://dropsiders.fr/shop' },
      { label: 'Visiter le site', url: 'https://dropsiders.fr' },
    ];
  } else {
    presenceData.details = 'Explore Dropsiders';
    presenceData.state = 'Portail N°1 Festivals & Musique Electro';
    presenceData.detailsUrl = 'https://dropsiders.fr';
    presenceData.buttons = defaultButtons;
  }

  presence.setActivity(presenceData);
});
