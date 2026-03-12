import { Assets } from 'premid'

const presence = new Presence({
  clientId: '501842028569559061', // Official Wolfy Discord App Client ID, owned by Wolfy's Admin
})

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/W/Wolfy/assets/logo.png',
  Skin = 'https://cdn.rcd.gg/PreMiD/websites/W/Wolfy/assets/0.png',
  Shop = 'https://cdn.rcd.gg/PreMiD/websites/W/Wolfy/assets/1.png',
  Leaderboard = 'https://cdn.rcd.gg/PreMiD/websites/W/Wolfy/assets/2.png',
}

let path,
  prev: string,
  elapsed: number,
  prevState: string | null | undefined,
  cp: number,
  currTime: string | null | undefined

const waitingString = {
  en: 'WAITING',
  fr: 'EN ATTENTE',
}

function getTime(list: string[]): number {
  let ret = 0
  for (let index = list.length - 1; index >= 0; index--)
    ret += (Number.parseInt(list[index]!) * 60) ** index

  return ret
}

function getTimestamps(audioTime: number, audioDuration: string): number[] {
  return [
    Date.now(),
    audioTime + getTime(audioDuration.split(':').reverse()) * 1000,
  ]
}

function addButton(presenceData: PresenceData, label: string, url: string) {
  if (!presenceData.buttons) {
    presenceData.buttons = [
      {
        label,
        url,
      },
    ]
  }
  else {
    presenceData.buttons[1] = {
      label,
      url,
    }
  }
}

function addConsultArticleButton(presenceData: PresenceData, url: string) {
  addButton(presenceData, 'Consulter l\'article', url)
}

function addConsultCategoryButton(presenceData: PresenceData, url: string) {
  addButton(presenceData, 'Consulter la catégorie', url)
}

function addConsultEventButton(presenceData: PresenceData, href: string) {
  addButton(presenceData, 'Consulter l\'évènement', href)
}

async function addJoinGameButton(presenceData: PresenceData, gameId: string) {
  if (!(await presence.getSetting('joinGameButton')))
    return
  addButton(
    presenceData,
    `(${
      document.querySelector('div[class*=\'Header_timeState\']')?.textContent
    }) Rejoindre la partie`,
    `https://wolfy.net/game/${gameId}`,
  )
}

function addVisitHelpCenterButton(presenceData: PresenceData) {
  addButton(
    presenceData,
    'Consulter le centre d\'aide',
    'https://help.wolfy.net',
  )
}

async function addVisitProfilButton(
  presenceData: PresenceData,
  username: string | null | undefined,
) {
  if (!username)
    return
  if (!(await presence.getSetting('visitProfileButton')))
    return

  let label = `Visiter le profil de ${username}`
  if (label.length > 32)
    label = `${label.slice(0, 31)}…`

  addButton(presenceData, label, `https://wolfy.net/leaderboard/${username}`)
}

function addVisitWolfyButton(presenceData: PresenceData) {
  addButton(presenceData, 'Visiter le site de Wolfy', 'https://wolfy.net')
}

async function handleCheckingLeaderboard(
  presenceData: PresenceData,
  username?: string,
) {
  presenceData.smallImageKey = ActivityAssets.Leaderboard
  presenceData.smallImageText = 'Consulte le classement'

  if (!username) {
    presenceData.details = 'Regarde le classement'
    presenceData.state = `Niveau ${
      document.querySelector('div[class*=\'ProfilePicture_levelMarker\']')
        ?.textContent
    }`
  }
  else {
    presenceData.details = `Regarde le profil de ${username}`
    presenceData.state = `Niveau ${
      document.querySelector('div[class*=\'ProfilePicture_levelMarker\']')
        ?.textContent
    }`
    await addVisitProfilButton(presenceData, username)
  }
}

function isWaitingGame(state: string, lang: string) {
  return state === waitingString[resolveLanguage(lang)]
}

function resolveLanguage(lang: string): keyof typeof waitingString {
  if (Object.keys(waitingString).includes(lang))
    return lang as keyof typeof waitingString
  return 'en'
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
  }

  path = document.location.pathname.split('/')

  if (path[1] === document.querySelector('html')?.lang)
    path = path.slice(2)
  else path = path.slice(1)

  if (window.location.href !== prev && !path.includes('game')) {
    delete presenceData.startTimestamp
    delete presenceData.endTimestamp
    prev = window.location.href
    elapsed = Math.floor(Date.now() / 1000)
  }

  presenceData.startTimestamp = elapsed

  if (document.location.hostname.includes('help.wolfy')) {
    if (path.includes('article') && path[1]) {
      presenceData.details = 'Lit l\'article ⤵️'
      presenceData.state = document.querySelector('h1')?.textContent
      addConsultArticleButton(presenceData, document.location.href)
      addVisitHelpCenterButton(presenceData)
    }
    else if (path.includes('category') && path[1]) {
      presenceData.details = 'Consulte la catégorie ⤵️'
      presenceData.state = document.querySelector(
        'span.csh-category-badge',
      )?.textContent
      addConsultCategoryButton(presenceData, document.location.href)
    }
    else {
      presenceData.details = 'Consulte le centre d\'aide'
      presenceData.state = 'Page d\'accueil'
      addVisitHelpCenterButton(presenceData)
    }
  }
  else if (path.includes('articles') && path[1]) {
    presenceData.details = 'Lis l\'article ⤵️'
    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = 'Lis un article'
    presenceData.state = document.querySelector('body h1')?.textContent
  }
  else if (path.includes('game') && path[1]) {
    presenceData.state = document
      .querySelector('div[class*=\'Header_nameState\']')
      ?.textContent
      ?.toUpperCase()

    if (presenceData.state !== prevState) {
      delete presenceData.startTimestamp
      delete presenceData.endTimestamp
      prevState = presenceData.state
      cp = Date.now()
      currTime = document.querySelector(
        'div[class*=\'Header_timer\']',
      )?.textContent
    }

    await addVisitProfilButton(
      presenceData,
      document.querySelector('span[class*=\'ChatMain_username\']')?.textContent, // Will be the anonymous username if used
    )

    if (
      isWaitingGame(presenceData.state!, document.querySelector('html')?.lang ?? 'en')
    ) {
      presenceData.state += ` (${
        document.querySelector('div[class*=\'Header_timeState\']')?.textContent
      })`
      await addJoinGameButton(presenceData, path[1])
    }

    presenceData.details = 'En jeu'

    presenceData.smallImageKey = Assets.Live
    if (currTime?.includes(':')) {
      [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(
        cp,
        currTime,
      )
    }
    else {
      presenceData.startTimestamp = cp
    }
  }
  else if (path.includes('leaderboard')) {
    await addVisitProfilButton(
      presenceData,
      document.querySelector('p.Social_username__qpX4D')?.textContent,
    )

    await handleCheckingLeaderboard(presenceData, path[1])
  }
  else if (path.includes('event') && path[1]) {
    if (document.querySelector('div[class*=\'Event_eventIntroduction\']\'')) {
      presenceData.details = 'Participe à un évènement'
      presenceData.state = `Top ${Number.parseInt(
        document.querySelector(
          'div[class*=\'Event_lineLeaderboard\'][class*=\'Event_me\'] > div[class*=\'Event_rank\']',
        )?.textContent ?? '',
      ).toLocaleString()} - ${Number.parseInt(
        document.querySelector(
          'div[class*=\'Event_lineLeaderboard Event_me\'][class*=\'Event_me\'] > div[class*=\'Event_points\']',
        )?.textContent ?? '',
      ).toLocaleString()} points`
    }
    else {
      presenceData.details = 'Consulte un évènement à venir ⤵️'
      presenceData.state = document.querySelector(
        'div[class*=\'Event_title\']',
      )?.textContent
    }
    addConsultEventButton(presenceData, document.location.href)
  }
  else {
    await addVisitProfilButton(
      presenceData,
      document.querySelector('p[class*=\'Social_username\']')?.textContent,
    )

    presenceData.details = 'Dans un menu'

    switch (path[0]) {
      case 'skin':
        presenceData.smallImageKey = ActivityAssets.Skin
        presenceData.smallImageText = 'Choisis ton skin'
        presenceData.state = 'Consulte ses Skins'
        break
      case 'settings':
        presenceData.state = 'Change ses paramètres'
        break
      case 'shop':
        presenceData.smallImageKey = ActivityAssets.Shop
        presenceData.smallImageText = 'Achète des skins'
        presenceData.state = 'Consulte la Boutique'
        break
      case 'articles':
        presenceData.state = 'Consulte les dernières actualités'
        presenceData.smallImageKey = Assets.Reading
        presenceData.smallImageText = 'En train de lire'
        break
      default:
        presenceData.state = 'Page d\'accueil'
    }
  }

  if (!presenceData.buttons || !presenceData.buttons[1])
    addVisitWolfyButton(presenceData)

  presence.setActivity(presenceData)
})
