import { ActivityType, Assets, getTimestampsFromMedia } from 'premid'

const presence = new Presence({
  clientId: '1507813260563452116',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

const strings = presence.getStrings({
  browse: 'general.browsing',
  viewHome: 'general.viewHome',
  view: 'general.view',
  viewPage: 'general.viewPage',
  viewChannel: 'general.viewChannel',
  viewCategory: 'general.viewCategory',
  viewProfile: 'general.viewProfile',
  viewAccount: 'general.viewAccount',
  searchFor: 'general.searchFor',
  readingAnArticle: 'general.readingAnArticle',
  watching: 'general.watching',
  paused: 'general.paused',
  buttonWatchVideo: 'general.buttonWatchVideo',
  buttonViewChannel: 'general.buttonViewChannel',
  buttonViewProfile: 'general.buttonViewProfile',
  buttonViewPage: 'general.buttonViewPage',
  buttonReadArticle: 'general.buttonReadArticle',
  buttonViewChangelog: 'general.buttonViewChangelog',
  buttonBrowse: 'general.buttonBrowse',
})

type Strings = Awaited<typeof strings>

// Pages statiques : libellé affiché (le h1 de certaines pages est générique)
const staticPages: Record<string, string> = {
  community: 'La Communauté',
  ranking: 'Classement',
  box: '+2Box',
  guidelines: 'Charte de la communauté',
  changelog: 'Notes de mise à jour',
  credits: 'Crédits',
  legal: 'Mentions légales',
  terms: 'Conditions Générales d\'Utilisation',
  settings: 'Paramètres',
}

// Sections de l'espace archiviste  /archivist/*
const archivistSections: Record<string, string> = {
  '': 'Tableau de bord',
  'upload': 'Mise en ligne d\'une archive',
  'edit': 'Modification d\'une archive',
  'channels': 'Chaînes',
  'agences': 'Agences',
  'collections': 'Collections',
  'events': 'Événements',
  'encodings': 'Encodages',
  'certification': 'Certification',
}

// Sections de l'administration  /staff/*
const staffSections: Record<string, string> = {
  '': 'Tableau de bord',
  'agences': 'Agences',
  'banner': 'Bannière',
  'carousel': 'Carrousel',
  'categories': 'Catégories',
  'certifications': 'Certifications',
  'channels': 'Chaînes',
  'collections': 'Collections',
  'events': 'Événements',
  'logs': 'Journaux',
  'settings': 'Paramètres',
  'theme': 'Thème',
  'users': 'Utilisateurs',
}

function getHeading(): string | undefined {
  return document.querySelector('main h1')?.textContent?.trim() || undefined
}

function setVideo(presenceData: PresenceData, t: Strings) {
  const video = document.querySelector('video')
  const isPaused = video?.paused ?? true

  if (video && !isPaused && Number.isFinite(video.duration)) {
    [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestampsFromMedia(video)
  }
  else if (isPaused) {
    delete presenceData.startTimestamp
  }

  presenceData.smallImageKey = isPaused ? Assets.Pause : Assets.Play
  presenceData.smallImageText = isPaused ? t.paused : t.watching
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://plus2tele.com/icons/pwa-512.png',
    type: ActivityType.Watching,
    startTimestamp: browsingTimestamp,
  }

  const { href, pathname, search } = document.location
  const params = new URLSearchParams(search)
  const showButtons = await presence.getSetting<boolean>('buttons')
  const t = await strings
  const heading = getHeading()
  const buttons: ButtonData[] = []

  // Lecteur intégré  /embed/*  (sans préfixe de langue)
  if (pathname.startsWith('/embed/')) {
    presenceData.details = document.title.split(' | ')[0]?.trim() || t.watching
    setVideo(presenceData, t)
    buttons.push({ label: t.buttonWatchVideo, url: href })
  }
  // Administration  /staff/*  (sans préfixe de langue)
  else if (pathname.startsWith('/staff')) {
    const section = pathname.split('/')[2] ?? ''
    presenceData.details = 'Administration'
    presenceData.state = staffSections[section] ?? staffSections['']
  }
  else {
    // Retire le préfixe de langue (/fr, /en…)
    const path = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, '') || '/'
    const [, root = '', sub = '', subSub = ''] = path.split('/')

    // Page : Accueil
    if (path === '/') {
      presenceData.details = t.viewHome
    }
    // Page : Lecteur  /player/*
    else if (root === 'player') {
      const channel = document
        .querySelector('main h1')
        ?.parentElement
        ?.querySelector('button span.text-sm')
        ?.textContent
        ?.trim()

      presenceData.details = heading ?? t.watching
      const uploader = document
        .querySelector('main h1')
        ?.parentElement
        ?.querySelector<HTMLAnchorElement>('a[href*="/profile/"]')

      presenceData.state = channel
      setVideo(presenceData, t)
      buttons.push({ label: t.buttonWatchVideo, url: href })
      if (uploader)
        buttons.push({ label: t.buttonViewProfile, url: uploader.href })
    }
    // Page : Zapping aléatoire  /zapping
    else if (root === 'zapping') {
      const channelLink = document.querySelector<HTMLAnchorElement>('main a[href*="archives?channel="]')
      const playerLink = document.querySelector<HTMLAnchorElement>('main a[href*="/player/"]')
      const channel = channelLink?.textContent?.trim()

      presenceData.details = heading ?? 'Zapping'
      presenceData.state = channel ? `Zapping • ${channel}` : 'Zapping'
      setVideo(presenceData, t)
      if (playerLink)
        buttons.push({ label: t.buttonWatchVideo, url: playerLink.href })
      if (channelLink)
        buttons.push({ label: t.buttonViewChannel, url: channelLink.href })
    }
    // Page : Archives  /archives  (recherche et filtres)
    else if (root === 'archives') {
      const query = params.get('query')
      // Filtres appliqués (chaîne, année, type…) affichés sous forme de pastilles
      const filters = Array.from(
        document.querySelectorAll('main span.rounded-full:has(> button) > span'),
        el => el.textContent?.trim(),
      ).filter(Boolean)

      if (query) {
        presenceData.details = t.searchFor
        presenceData.state = query
        presenceData.smallImageKey = Assets.Search
      }
      else {
        presenceData.details = t.browse
        presenceData.state = ['Archives', ...filters].join(' • ')
      }
      buttons.push({ label: t.buttonBrowse, url: href })
    }
    // Page : Chaîne et ses sous-pages  /channel/:slug[/annee|type|habillage/*]
    else if (root === 'channel') {
      presenceData.details = subSub ? t.view : t.viewChannel
      presenceData.state = heading
      buttons.push({ label: t.buttonViewChannel, url: href })
    }
    // Page : Archives d'une année  /annee/:year
    else if (root === 'annee') {
      presenceData.details = t.view
      presenceData.state = heading ?? `La télévision en ${sub}`
      buttons.push({ label: t.buttonViewPage, url: href })
    }
    // Page : Type d'archive  /type/:typeSlug
    else if (root === 'type') {
      presenceData.details = t.viewCategory
      presenceData.state = heading
      buttons.push({ label: t.buttonViewPage, url: href })
    }
    // Page : Collection  /collection/:id
    else if (root === 'collection') {
      presenceData.details = `${t.view} Collection`
      presenceData.state = heading
      buttons.push({ label: t.buttonViewPage, url: href })
    }
    // Page : Agence  /agence/:slug
    else if (root === 'agence') {
      presenceData.details = `${t.view} Agence`
      presenceData.state = heading
      buttons.push({ label: t.buttonViewPage, url: href })
    }
    // Page : Profil  /profile/:id  ou son propre profil  /profile
    else if (root === 'profile') {
      if (sub) {
        presenceData.details = t.viewProfile
        presenceData.state = heading
        buttons.push({ label: t.buttonViewProfile, url: href })
      }
      else {
        presenceData.details = t.viewAccount
      }
    }
    // Page : Blog  /blog  et article  /blog/:slug
    else if (root === 'blog') {
      if (sub) {
        presenceData.details = t.readingAnArticle
        presenceData.state = heading
        buttons.push({ label: t.buttonReadArticle, url: href })
      }
      else {
        presenceData.details = t.browse
        presenceData.state = 'Blog'
        buttons.push({ label: t.buttonBrowse, url: href })
      }
    }
    // Espace archiviste  /archivist/*
    else if (root === 'archivist') {
      presenceData.details = 'Espace archiviste'
      presenceData.state = archivistSections[sub] ?? archivistSections['']
    }
    // Pages de listes : chaînes, collections, agences
    else if (['channels', 'collections', 'agences'].includes(root)) {
      presenceData.details = t.browse
      presenceData.state = heading
      buttons.push({ label: t.buttonBrowse, url: href })
    }
    // Pages statiques : communauté, classement, +2Box, charte, changelog…
    else if (root in staticPages) {
      presenceData.details = t.viewPage
      presenceData.state = staticPages[root]
      if (root === 'changelog')
        buttons.push({ label: t.buttonViewChangelog, url: href })
      else if (root !== 'settings')
        buttons.push({ label: t.buttonViewPage, url: href })
    }
    // Toute autre page
    else {
      presenceData.details = t.viewPage
      presenceData.state = heading ?? document.title
    }
  }

  if (showButtons && buttons[0])
    presenceData.buttons = buttons[1] ? [buttons[0], buttons[1]] : [buttons[0]]

  presence.setActivity(presenceData)
})
