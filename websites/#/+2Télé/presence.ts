import type ActivityStrings from './+2Télé.json'
import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '1507813260563452116',
})

const startTimestamp = Math.floor(Date.now() / 1000)

declare global {
  interface StringKeys {
    plus2tele: keyof typeof ActivityStrings
  }
}

enum ActivityAssets {
  Logo = 'https://i.ibb.co/ZRjtGH0X/P6-T-PP-CGI-1-1.png',
}

function getArchivesCount(): string {
  const archivesHeading = Array.from(document.querySelectorAll('h2')).find(
    el => el.classList.contains('text-xl') && el.classList.contains('font-bold'),
  )
  const archivesSpan = archivesHeading?.nextElementSibling
    || archivesHeading?.parentElement?.querySelector('span.text-brand-blue, span.bg-brand-blue\\/20')
    || archivesHeading?.parentElement?.querySelector('span')
    || document.querySelector('h2 + span.bg-brand-blue\\/20')
    || document.querySelector('div.flex.items-center.gap-3 > span.text-brand-blue')
  return archivesSpan?.textContent?.trim() || ''
}

function getArchivesListStats(): string {
  const p = document.querySelector('p.text-white\\/40.text-xs')
    || Array.from(document.querySelectorAll('p')).find(
      el => el.textContent?.includes('•') && /\d+/.test(el.textContent || ''),
    )
  const statsText = p?.textContent?.trim() || ''
  if (statsText.includes('•')) {
    const parts = statsText.split('•')
    const part1 = parts[0]?.trim()
    const part2 = parts[1]?.trim()
    if (part1 && part2) {
      const words = part2.split(/\s+/).filter(Boolean)
      const total = words[words.length - 2]
      const label = words[words.length - 1]
      if (total && label && /^\d+$/.test(total)) {
        return `${part1} • ${total} ${label}`
      }
    }
  }
  return statsText
}

presence.on('UpdateData', async () => {
  const strings = await presence.getStrings({
    accueil: 'plus2tele.accueil',
    archivesList: 'plus2tele.archivesList',
    channelsList: 'plus2tele.channelsList',
    viewingChannel: 'plus2tele.viewingChannel',
    agencesList: 'plus2tele.agencesList',
    viewingAgence: 'plus2tele.viewingAgence',
    collectionsList: 'plus2tele.collectionsList',
    viewingCollection: 'plus2tele.viewingCollection',
    community: 'plus2tele.community',
    zapping: 'plus2tele.zapping',
    watchingArchive: 'plus2tele.watchingArchive',
    viewingProfile: 'plus2tele.viewingProfile',
    browsing: 'plus2tele.browsing',
    byAuthor: 'plus2tele.byAuthor',
  })

  const { pathname, href } = document.location
  const paths = pathname.split('/').filter(Boolean)

  // Shift/discard the dynamic [pays] prefix (e.g. 'fr', 'gb', 'es', 'de', 'pt', 'it', 'pl', 'ro') if present
  if (paths[0] && /^[a-z]{2}(?:-[a-z]{2,4})?$/i.test(paths[0])) {
    paths.shift()
  }

  const firstSegment = paths[0]

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp,
  }

  // Determine current page and set details/state
  if (paths.length === 0 || !firstSegment) {
    // Home Page
    presenceData.details = strings.accueil
    presenceData.state = strings.browsing
  }
  else if (paths.length === 1 && firstSegment === 'archives') {
    // Archives List
    presenceData.details = strings.archivesList
    presenceData.state = getArchivesListStats() || strings.browsing
  }
  else if (paths.length === 1 && firstSegment === 'channels') {
    // Channels List
    presenceData.details = strings.channelsList
    presenceData.state = strings.browsing
  }
  else if (firstSegment === 'channel' && paths.length >= 2) {
    // Channel Detail
    const h1 = document.querySelector('h1')
    const channelName = h1?.textContent?.trim()
    const archivesText = getArchivesCount()

    presenceData.details = strings.viewingChannel.replace('{0}', channelName || 'Inconnu')
    presenceData.state = archivesText || strings.browsing
    presenceData.buttons = [
      {
        label: 'Voir la chaîne',
        url: href,
      },
    ]
  }
  else if (paths.length === 1 && firstSegment === 'agences') {
    // Agencies List
    presenceData.details = strings.agencesList
    presenceData.state = strings.browsing
  }
  else if (firstSegment === 'agence' && paths.length >= 2) {
    // Agency Detail
    const h1 = document.querySelector('h1')
    const agencyName = h1?.textContent?.trim()
    const archivesText = getArchivesCount()
    let archivesDisplay = archivesText
    if (archivesText && /^\d+$/.test(archivesText)) {
      archivesDisplay = `${archivesText} archives`
    }

    presenceData.details = strings.viewingAgence.replace('{0}', agencyName || 'Inconnu')
    presenceData.state = archivesDisplay || strings.browsing
    presenceData.buttons = [
      {
        label: 'Voir l\'agence',
        url: href,
      },
    ]
  }
  else if (paths.length === 1 && firstSegment === 'collections') {
    // Collections List
    presenceData.details = strings.collectionsList
    presenceData.state = strings.browsing
  }
  else if (firstSegment === 'collection' && paths.length >= 2) {
    // Collection Detail
    const collectionName = document.querySelector('h1')?.textContent?.trim()
    const archivesText = getArchivesCount()
    let archivesDisplay = archivesText
    if (archivesText && /^\d+$/.test(archivesText)) {
      archivesDisplay = `${archivesText} archives`
    }

    presenceData.details = strings.viewingCollection.replace('{0}', collectionName || 'Inconnu')
    presenceData.state = archivesDisplay || strings.browsing
    presenceData.buttons = [
      {
        label: 'Voir la collection',
        url: href,
      },
    ]
  }
  else if (paths.length === 1 && firstSegment === 'community') {
    // Community Page
    presenceData.details = strings.community
    presenceData.state = strings.browsing
  }
  else if (paths.length === 1 && firstSegment === 'zapping') {
    // Zapping (Random archives)
    const zappingTitle = document.querySelector('h1.text-2xl.font-bold.text-white.mb-2, h1')?.textContent?.trim()
    presenceData.details = strings.zapping
    presenceData.state = zappingTitle || strings.browsing
  }
  else if (firstSegment === 'player') {
    // Player Page (Watching archive)
    const playerTitle = document.querySelector('h1.text-xl.md\\:text-2xl.font-bold.text-white.leading-tight, h1')?.textContent?.trim()
    const authorLink = document.querySelector('a[href*="/profile/"]')
    const authorText = authorLink?.textContent?.trim() || ''

    presenceData.details = playerTitle || strings.watchingArchive
    presenceData.state = authorText || strings.browsing
    ;(presenceData as PresenceData).type = ActivityType.Watching

    const video = document.querySelector('video')
    if (video) {
      const isPlaying = !video.paused && !video.ended
      presenceData.smallImageKey = isPlaying ? Assets.Play : Assets.Pause
      presenceData.smallImageText = isPlaying ? 'Lecture' : 'Pause'
    }

    presenceData.buttons = [
      {
        label: 'Regarder l\'archive',
        url: href,
      },
    ]
  }
  else if (firstSegment === 'profile' && paths.length >= 2) {
    // Profile Detail
    const profileName = document.querySelector('h1.text-3xl.font-bold.text-white, h1')?.textContent?.trim()
    const archivesSpan = Array.from(document.querySelectorAll('span')).find(el => el.textContent?.includes('au total'))
    const profileArchivesText = archivesSpan?.textContent?.trim() || ''

    presenceData.details = strings.viewingProfile.replace('{0}', profileName || 'Inconnu')
    presenceData.state = profileArchivesText || strings.browsing
    presenceData.buttons = [
      {
        label: 'Voir le profil',
        url: href,
      },
    ]
  }
  else {
    // Fallback
    presenceData.details = strings.accueil
    presenceData.state = strings.browsing
  }

  if (presenceData.details) {
    presence.setActivity(presenceData)
  }
  else {
    presence.setActivity()
  }
})
