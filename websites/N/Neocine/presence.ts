import { ActivityType, Assets, getTimestampsFromMedia } from 'premid'

const LOGO = 'https://neocine.xyz/icons/icon-512.png'

const HOME = 'Sur la page d\'accueil'

const BROWSING: Array<[RegExp, string]> = [
  [/^\/catalogue\/?$/, 'Explore le catalogue'],
  [/^\/calendrier\/?$/, 'Parcourt le calendrier'],
  [/^\/maliste\/?$/, 'Parcourt sa liste'],
  [/^\/abonnement\/?$/, 'Consulte l\'abonnement'],
  [/^\/suggestions\/?$/, 'Demande un titre'],
  [/^\/surprends-moi\/?$/, 'Se laisse surprendre'],
  [/^\/parametres(\/[a-z]+)?\/?$/, 'Bidouille ses paramètres'],
  [/^\/connexion\/?$/, 'Se connecte'],
  [/^\/inscription\/?$/, 'Crée un compte'],
  [/^\/profils\/?$/, 'Choisit son profil'],
  [/^\/lien\/?$/, 'Connecte un appareil'],
  [/^\/avent\/?$/, 'Ouvre l\'avent'],
  [/^\/tv(\/[a-z0-9-]+)?\/?$/i, 'Regarde une chaîne en direct'],
]

const FICHE_SUFFIX = /(?: \(\d{4}\))? en streaming VF et VOSTFR · neocine$/

const presence = new Presence({
  clientId: '1575145429664923839',
})

let browsingTs: number | null = null

let lastSig = ''

presence.on('UpdateData', async () => {
  const data = {
    name: 'Neocine',
    type: ActivityType.Watching,
    details: '',
    state: null as string | null,
    startTimestamp: null as number | Date | null,
    endTimestamp: null as number | Date | null,
    largeImageKey: LOGO,
    largeImageText: 'neocine',
    smallImageKey: null as string | null,
    smallImageText: null as string | null,
    buttons: null as Array<{ label: string, url: string }> | null,
  }

  const path = document.location.pathname
  const q = new URLSearchParams(document.location.search).get('q') ?? ''
  const httpsOk = document.location.protocol === 'https:'

  const playerRoot = document.querySelector<HTMLElement>('[data-nc-title]')
  const watchTitle = playerRoot?.getAttribute('data-nc-title') ?? ''

  if (path.startsWith('/player/') && playerRoot) {
    const kind = playerRoot.getAttribute('data-nc-kind') === 'tv'
      ? 'tv'
      : 'movie'

    if (watchTitle) {
      data.type = ActivityType.Watching
      data.details = watchTitle
      data.largeImageKey = playerRoot.getAttribute('data-nc-backdrop') || LOGO

      if (kind === 'tv') {
        const s = Number(playerRoot.getAttribute('data-nc-season')) || 1
        const e = Number(playerRoot.getAttribute('data-nc-episode')) || 1
        const epName = playerRoot.getAttribute('data-nc-ep-name') ?? ''
        data.largeImageText = `Season ${s}, Episode ${e}`
        data.state = epName
          ? `S${s} E${e} · ${epName}`
          : `S${s} E${e}`
      }
      else {
        data.largeImageText = watchTitle
      }

      const video = document.querySelector<HTMLVideoElement>('video')
      if (video && !video.paused) {
        data.smallImageKey = Assets.Play
        data.smallImageText = 'Lecture en cours'
        if (Number.isFinite(video.duration) && video.duration > 0) {
          const [start, end] = getTimestampsFromMedia(video)
          data.startTimestamp = start
          data.endTimestamp = end
        }
      }
      else if (video) {
        data.state = data.state
          ? `${data.state} · En pause`
          : 'En pause'
        data.smallImageKey = Assets.Pause
        data.smallImageText = 'En pause'
      }
    }
    else {
      data.details = 'Neocine'
      data.state = 'Prépare la lecture'
    }

    data.buttons = httpsOk
      ? [
          { label: 'Regarder', url: document.location.href },
        ]
      : null

    browsingTs = null
  }
  else {
    if (browsingTs === null)
      browsingTs = Date.now()
    data.startTimestamp = browsingTs

    data.details = 'Neocine'
    data.buttons = httpsOk && path !== '/' && path !== ''
      ? [
          { label: 'Visiter', url: document.location.href },
        ]
      : null
    if (q) {
      data.state = `Cherche « ${q.slice(0, 60)} »`
    }
    else {
      data.state
        = BROWSING.find(([re]) => re.test(path))?.[1]
          ?? (path === '/' || path === ''
            ? HOME
            : 'Sur neocine')
    }

    const fiche = path.match(/^\/(?:film|serie)\/\d+$/)
    if (fiche) {
      const ogTitle = document.head
        .querySelector<HTMLMetaElement>('meta[property="og:title"]')
        ?.getAttribute('content') ?? ''
      const clean = ogTitle.replace(FICHE_SUFFIX, '')
      const ogImage = document.head
        .querySelector<HTMLMetaElement>('meta[property="og:image"]')
        ?.getAttribute('content') ?? ''
      if (clean !== '' && clean !== ogTitle) {
        data.type = ActivityType.Watching
        data.details = clean
        data.state = 'Consulte la fiche'
        data.largeImageKey = ogImage || LOGO
        data.largeImageText = clean
        data.buttons = httpsOk
          ? [
              { label: 'Regarder', url: document.location.href },
            ]
          : null
      }
    }
  }

  const sig = JSON.stringify([
    data.type,
    data.details,
    data.state,
    data.largeImageKey,
    data.largeImageText,
    data.smallImageKey,
    data.smallImageText,
    data.startTimestamp,
    data.endTimestamp,
    data.buttons,
  ])
  if (sig === lastSig)
    return
  lastSig = sig

  presence.setActivity(data as PresenceData)
})
