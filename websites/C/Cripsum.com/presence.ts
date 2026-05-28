import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1375776178568429631',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://i.imgur.com/QfiBrJL.jpeg',
}

let currentEditCard: Element | null = null

document.addEventListener('click', (e) => {
  const card = (e.target as Element).closest('.edit-card')
  if (card)
    currentEditCard = card
}, true)

async function getStrings() {
  return presence.getStrings({
    openingLootbox: 'cripsum.openingLootbox',
    justPulled: 'cripsum.justPulled',
    testingLuck: 'cripsum.testingLuck',
    readingArticle: 'general.reading',
    readArticle: 'general.buttonReadArticle',
    userProfile: 'general.viewAProfile',
    lookingAtProfile: 'cripsum.lookingAtProfile',
    profile: 'cripsum.profile',
    stalkingProfiles: 'cripsum.stalkingProfiles',
    visitProfile: 'general.buttonViewProfile',
    watchingEdit: 'general.watching',
    watchingEdits: 'cripsum.watchingEdits',
    listeningToTrack: 'cripsum.listeningToTrack',
    editsGallery: 'cripsum.editsGallery',
    choosingEdit: 'cripsum.choosingEdit',
    duelLobby: 'cripsum.duelLobby',
    searchingOpponent: 'cripsum.searchingOpponent',
    inLobby: 'cripsum.inLobby',
    playNow: 'cripsum.playNow',
    matchEnded: 'cripsum.matchEnded',
    spectating: 'cripsum.spectating',
    vsOpponent: 'cripsum.vsOpponent',
    room: 'cripsum.room',
    opponent: 'cripsum.opponent',
    pickingTeam: 'cripsum.pickingTeam',
    waitingOpponent: 'cripsum.waitingOpponent',
    inArena: 'cripsum.inArena',
    achievements: 'cripsum.achievements',
    unlockedAchievements: 'cripsum.unlockedAchievements',
    huntingAchievements: 'cripsum.huntingAchievements',
    downloads: 'cripsum.downloads',
    downloadingFortnite: 'cripsum.downloadingFortnite',
    downloadingOsu: 'cripsum.downloadingOsu',
    downloadingYoshukai: 'cripsum.downloadingYoshukai',
    downloadingStuff: 'cripsum.downloadingStuff',
    store: 'general.store',
    buyingStuff: 'cripsum.buyingStuff',
    applyingForTeam: 'cripsum.applyingForTeam',
    sellingSoul: 'cripsum.sellingSoul',
    applyForTeam: 'cripsum.applyForTeam',
    profileEditor: 'cripsum.profileEditor',
    editingProfile: 'cripsum.editingProfile',
    aboutUs: 'cripsum.aboutUs',
    lookingAtTeam: 'cripsum.lookingAtTeam',
    authentication: 'cripsum.authentication',
    signingUp: 'cripsum.signingUp',
    loggingIn: 'cripsum.loggingIn',
    donations: 'cripsum.donations',
    supportingCripsum: 'cripsum.supportingCripsum',
    gambling: 'cripsum.gambling',
    gamblingAway: 'cripsum.gamblingAway',
    merch: 'cripsum.merch',
    buyingMerch: 'cripsum.buyingMerch',
    legalStuff: 'cripsum.legalStuff',
    readingRules: 'cripsum.readingRules',
    support: 'cripsum.support',
    lookingForHelp: 'cripsum.lookingForHelp',
    notFound: 'cripsum.notFound',
    lookingForNothing: 'cripsum.lookingForNothing',
    quandel57: 'cripsum.quandel57',
    lookingAtQuandel: 'cripsum.lookingAtQuandel',
    topRimasti: 'cripsum.topRimasti',
    lookingAtRimasti: 'cripsum.lookingAtRimasti',
    shitposts: 'cripsum.shitposts',
    lookingAtShitposts: 'cripsum.lookingAtShitposts',
    globalChat: 'cripsum.globalChat',
    chatting: 'cripsum.chatting',
    inventory: 'cripsum.inventory',
    lookingAtInventory: 'cripsum.lookingAtInventory',
    missions: 'cripsum.missions',
    grindingMissions: 'cripsum.grindingMissions',
    banned: 'cripsum.banned',
    skillIssue: 'cripsum.skillIssue',
    settings: 'cripsum.settings',
    messingSetting: 'cripsum.messingSetting',
    adminPanel: 'cripsum.adminPanel',
    inAdminPanel: 'cripsum.inAdminPanel',
    exploringHomepage: 'cripsum.exploringHomepage',
    welcomeToSite: 'cripsum.welcomeToSite',
    exploringCripsum: 'cripsum.exploringCripsum',
    lookingForSecrets: 'cripsum.lookingForSecrets',
  })
}

presence.on('UpdateData', async () => {
  const strings = await getStrings()

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  const { pathname, href } = document.location
  const path = pathname.toLowerCase()

  if (path.includes('lootbox')) {
    presenceData.details = strings.openingLootbox
    presenceData.smallImageKey = Assets.Play

    const dropResult = document.querySelector('.gacha-card-name')?.textContent
    const avatarImg = document.querySelector<HTMLImageElement>('.card-img-godo')?.src

    if (dropResult) {
      presenceData.state = `${strings.justPulled} ${dropResult}`
      presenceData.largeImageKey = avatarImg
    }
    else {
      presenceData.state = strings.testingLuck
    }
  }

  else if (path.includes('cripsumpedia') || path.includes('tiktokpedia')) {
    presenceData.smallImageKey = Assets.Reading
    presenceData.details = path.includes('tiktokpedia') ? 'TikTokpedia' : 'Cripsumpedia'

    const articleTitle = document.querySelector('h1')?.textContent || document.title
    presenceData.state = `${strings.readingArticle} ${articleTitle}`

    const articleImage = document.querySelector<HTMLImageElement>('.img-cripsumpedias')?.src
    if (articleImage) {
      presenceData.largeImageKey = articleImage
    }

    presenceData.buttons = [
      { label: strings.readArticle, url: href },
    ]
  }

  else if (path.includes('/u/') || path.includes('user') || path.includes('bio')) {
    presenceData.smallImageKey = Assets.Search
    presenceData.details = strings.userProfile

    const username = document.querySelector('.bio-username')?.textContent
    presenceData.state = username
      ? `${strings.lookingAtProfile} ${username} ${strings.profile}`
      : strings.stalkingProfiles

    const avatarImg = document.querySelector<HTMLImageElement>('.bio-avatar')?.src
    if (avatarImg) {
      presenceData.largeImageKey = avatarImg
    }

    presenceData.buttons = [
      { label: strings.visitProfile, url: href },
    ]
  }

  else if (path.includes('edits')) {
    presenceData.smallImageKey = Assets.Play

    if (currentEditCard) {
      const title = currentEditCard.querySelector('.character-name span')?.textContent?.trim()
      const music = currentEditCard.querySelector('.music-info span')?.textContent?.trim()
      const editId = currentEditCard.getAttribute('data-edit-id')
      const rpcimg = currentEditCard.querySelector<HTMLImageElement>('.rpcimg')?.src

      presenceData.details = title ? `${strings.watchingEdit} ${title}` : strings.watchingEdits
      presenceData.state = music ? `🎵 ${music}` : strings.listeningToTrack

      if (editId) {
        presenceData.largeImageKey = rpcimg
      }
    }
    else {
      presenceData.details = strings.editsGallery
      presenceData.state = strings.choosingEdit
    }
  }

  else if (path.includes('/game/lobby')) {
    presenceData.details = strings.duelLobby

    const isMatchmaking = document.querySelector<HTMLElement>('#matchmakingWait')?.hidden === false

    if (isMatchmaking) {
      presenceData.state = strings.searchingOpponent
      presenceData.startTimestamp = Date.now()
    }
    else {
      presenceData.state = strings.inLobby
    }
    presenceData.buttons = [
      { label: strings.playNow, url: href },
    ]
  }

  else if (path.includes('/game/arena')) {
    presenceData.details = 'Cripsum Duel'

    const waitingPanel = document.querySelector<HTMLElement>('#waitingPanel')
    const teamPanel = document.querySelector<HTMLElement>('#teamPanel')
    const arenaPanel = document.querySelector<HTMLElement>('#arenaPanel')
    const resultModal = document.querySelector<HTMLElement>('#resultModal')
    const spectatorMode = document.querySelector<HTMLElement>('#spectatorMode')

    if (resultModal && !resultModal.hidden) {
      const title = document.querySelector('#resultTitle')?.textContent?.trim()
      const kicker = document.querySelector('#resultKicker')?.textContent?.trim()
      presenceData.state = (kicker && title) ? `${kicker}: ${title}` : strings.matchEnded
    }

    else if (arenaPanel && !arenaPanel.hidden && spectatorMode && !spectatorMode.hidden) {
      const p1 = document.querySelector('#playerName')?.textContent?.trim()
      const p2 = document.querySelector('#opponentName')?.textContent?.trim()
      const turn = document.querySelector('#turnLabel')?.textContent?.trim()
      presenceData.state = `${strings.spectating} ${p1} VS ${p2}`
      if (turn)
        presenceData.details = `Cripsum Duel · ${turn}`
    }

    else if (arenaPanel && !arenaPanel.hidden) {
      const opponent = document.querySelector('#opponentName')?.textContent?.trim()
      const turn = document.querySelector('#turnLabel')?.textContent?.trim()
      const room = document.querySelector('#arenaRoomCode')?.textContent?.trim()
      presenceData.state = `${strings.vsOpponent} ${opponent || strings.opponent}`
      if (turn)
        presenceData.details = `Cripsum Duel · ${turn}`
      if (room && room !== '---')
        presenceData.smallImageText = `${strings.room} ${room}`
    }

    else if (teamPanel && !teamPanel.hidden) {
      const counter = document.querySelector('#teamCounter')?.textContent?.trim()
      presenceData.state = `${strings.pickingTeam} ${counter ?? '0/3'}`
    }

    else if (waitingPanel && !waitingPanel.hidden) {
      presenceData.state = strings.waitingOpponent
      presenceData.startTimestamp = Date.now()
    }

    else {
      presenceData.state = strings.inArena
    }
    presenceData.buttons = [
      { label: strings.playNow, url: href },
    ]
  }

  else if (path.includes('achievement') || path.includes('obiettivi')) {
    presenceData.details = strings.achievements
    const unlocked = document.querySelector('.statUnlocked')?.textContent
    const totalAchievements = document.querySelector('.statTotal')?.textContent
    presenceData.state = unlocked ? `${strings.unlockedAchievements} ${unlocked}/${totalAchievements}` : strings.huntingAchievements
  }

  else if (path.includes('download/fortnite')) {
    presenceData.details = strings.downloads
    presenceData.state = strings.downloadingFortnite
  }

  else if (path.includes('download/osu')) {
    presenceData.details = strings.downloads
    presenceData.state = strings.downloadingOsu
  }

  else if (path.includes('download/yoshukai')) {
    presenceData.details = strings.downloads
    presenceData.state = strings.downloadingYoshukai
  }

  else if (path.includes('download')) {
    presenceData.details = strings.downloads
    presenceData.state = strings.downloadingStuff
  }

  else if (path.includes('negozio')) {
    presenceData.details = strings.store
    presenceData.state = strings.buyingStuff
  }

  else if (path.includes('candidatura-chisiamo')) {
    presenceData.details = strings.applyingForTeam
    presenceData.state = strings.sellingSoul
    presenceData.buttons = [
      { label: strings.applyForTeam, url: href },
    ]
  }

  else if (path.includes('edit-profile')) {
    presenceData.details = strings.profileEditor
    presenceData.state = strings.editingProfile
    const avatarImg = document.querySelector<HTMLImageElement>('.bio-avatar')?.src
    if (avatarImg) {
      presenceData.largeImageKey = avatarImg
    }
  }

  else if (path.includes('chisiamo')) {
    presenceData.details = strings.aboutUs
    presenceData.state = strings.lookingAtTeam
  }

  else if (path.includes('accedi') || path.includes('registrati') || path.includes('login')) {
    presenceData.details = strings.authentication
    presenceData.state = path.includes('registrati') ? strings.signingUp : strings.loggingIn
  }

  else if (path.includes('donazioni')) {
    presenceData.details = strings.donations
    presenceData.state = strings.supportingCripsum
  }

  else if (path.includes('gambling')) {
    presenceData.details = strings.gambling
    presenceData.state = strings.gamblingAway
  }

  else if (path.includes('merch')) {
    presenceData.details = strings.merch
    presenceData.state = strings.buyingMerch
  }

  else if (path.includes('privacy') || path.includes('tos')) {
    presenceData.details = strings.legalStuff
    presenceData.state = strings.readingRules
  }

  else if (path.includes('supporto')) {
    presenceData.details = strings.support
    presenceData.state = strings.lookingForHelp
  }

  else if (path.includes('404')) {
    presenceData.details = strings.notFound
    presenceData.state = strings.lookingForNothing
  }

  else if (path.includes('quandel57')) {
    presenceData.details = strings.quandel57
    presenceData.state = strings.lookingAtQuandel
  }

  else if (path.includes('rimasti')) {
    presenceData.details = strings.topRimasti
    presenceData.state = strings.lookingAtRimasti

    const modal = document.querySelector('#cwPostModal.is-open')
    if (modal) {
      const articleImage = modal.querySelector<HTMLImageElement>('.godomedia')?.src
      const articleTitle = modal.querySelector('h2')?.textContent
      if (articleTitle) {
        presenceData.state = `${strings.readingArticle} ${articleTitle}`
        if (articleImage)
          presenceData.largeImageKey = articleImage
      }
    }
  }

  else if (path.includes('shitpost')) {
    presenceData.details = strings.shitposts
    presenceData.state = strings.lookingAtShitposts

    const modal = document.querySelector('#cwPostModal.is-open')
    if (modal) {
      const articleImage = modal.querySelector<HTMLImageElement>('.godomedia')?.src
      const articleTitle = modal.querySelector('h2')?.textContent
      if (articleTitle) {
        presenceData.state = `${strings.readingArticle} ${articleTitle}`
        if (articleImage)
          presenceData.largeImageKey = articleImage
      }
    }
  }

  else if (path.includes('global-chat')) {
    presenceData.details = strings.globalChat
    presenceData.state = strings.chatting
  }

  else if (path.includes('inventario')) {
    presenceData.details = strings.inventory
    presenceData.state = strings.lookingAtInventory
  }

  else if (path.includes('mission')) {
    presenceData.details = strings.missions
    presenceData.state = strings.grindingMissions
  }

  else if (path.includes('banned')) {
    presenceData.details = strings.banned
    presenceData.state = strings.skillIssue
    presenceData.largeImageKey = 'https://i.imgur.com/zhWqqwv.jpeg'
  }

  else if (path.includes('impostazioni')) {
    presenceData.details = strings.settings
    presenceData.state = strings.messingSetting
  }

  else if (path.includes('admin')) {
    presenceData.details = strings.adminPanel
    presenceData.state = strings.inAdminPanel
  }

  else if (path === '/' || path.includes('home')) {
    presenceData.details = strings.exploringHomepage
    presenceData.state = strings.welcomeToSite
  }

  else {
    presenceData.details = strings.exploringCripsum
    presenceData.state = strings.lookingForSecrets
  }

  presence.setActivity(presenceData)
})
