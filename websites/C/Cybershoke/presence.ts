import { Assets } from 'premid'

const presence = new Presence({
  clientId: '503557087041683458',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)
const logoUrl = 'https://cybershoke.net/logo512.png'

let activeServerName: string | null = null
let activeMapName: string | null = null
let activeMapImage: string | null = null
let hasJoined = false

interface ServerDetails {
  name: string | null
  mapName: string | null
  mapImage: string | null
}

// Helper function to extract name, map name, and map image from any DOM element (card, modal, etc.)
function extractServerDetails(element: Element): ServerDetails {
  const details: ServerDetails = {
    name: null,
    mapName: null,
    mapImage: null,
  }

  // 1. Get name
  // Try DOM selectors first
  const selectors = ['.server-modal__title', '.modal-title', '.server-card__name', '.block-servers-name']
  for (const selector of selectors) {
    const el = element.querySelector(selector)
    if (el && el.textContent) {
      const text = el.textContent.trim()
      if (text && text.length > 3 && !text.includes('CYBERSHOKE')) {
        details.name = text
        break
      }
    }
  }

  // Fallback name search in leaf elements
  const allElements = element.querySelectorAll('*')
  if (!details.name) {
    for (const el of Array.from(allElements)) {
      if (el.children.length === 0 && el.textContent) {
        const text = el.textContent.trim()
        const match = text.match(/(?:[\w-]+\s+)?#\d+(?:\s+[\w-]+)?/)
        if (match) {
          let name = match[0].trim()
          name = name.replace(/^\d+\s+/, '').replace(/\s+\d+$/, '')
          if (name && name.length > 3 && !name.includes('CYBERSHOKE')) {
            details.name = name
            break
          }
        }
      }
    }
  }

  // 2. Get map name & map image URL from background styles or img tags
  // (This handles hover states where text map names are unmounted, but map images remain)
  for (const el of Array.from(allElements)) {
    let url: string | null = null
    if (el.tagName === 'IMG') {
      url = (el as HTMLImageElement).src
    }
    else {
      const bg = window.getComputedStyle(el).backgroundImage
      if (bg && bg.startsWith('url(')) {
        const match = bg.match(/url\((['"]?)(.*?)\1\)/)
        if (match) {
          url = match[2] || null
        }
      }
    }

    if (url) {
      let foundMap = false
      let mapNameExtract: string | null = null

      // Check for /maps/ or /img/maps/ patterns (e.g. //cloud.cybershoke.net/img/maps/2/de_mirage.jpg)
      const mapsPathMatch = url.match(/\/maps\/\d+\/([\w-]+)\.(?:jpg|jpeg|png|webp|gif)/i)
      if (mapsPathMatch && mapsPathMatch[1]) {
        mapNameExtract = mapsPathMatch[1].trim()
        foundMap = true
      }
      else if (url.includes('/maps/') || url.includes('/img/maps/')) {
        const parts = url.split('/')
        const lastPart = parts[parts.length - 1]
        if (lastPart) {
          const nameMatch = lastPart.match(/^([\w-]+)\./)
          if (nameMatch && nameMatch[1]) {
            mapNameExtract = nameMatch[1].trim()
            foundMap = true
          }
        }
      }

      // Fallback prefix matching
      if (!foundMap) {
        const mapMatch = url.match(/\b(?:de|cs|aim|awp|surf|kz|jail|fy|as|am|ar)_[\w-]+/i)
        if (mapMatch && mapMatch[0]) {
          mapNameExtract = mapMatch[0].trim()
          foundMap = true
        }
      }

      if (foundMap && mapNameExtract) {
        try {
          details.mapImage = new URL(url, document.location.href).href
          details.mapName = mapNameExtract
          break
        }
        catch {
          details.mapImage = url
          details.mapName = mapNameExtract
          break
        }
      }
    }
  }

  // 3. Fallback map name from text content (if not found in images/backgrounds)
  if (!details.mapName) {
    const mapInfoEl = element.querySelector('.block-servers-group-info, .server-modal__map')
    if (mapInfoEl && mapInfoEl.textContent) {
      const text = mapInfoEl.textContent
      const parts = text.split(/[–|-]/)
      const lastPart = parts[parts.length - 1]
      if (lastPart) {
        const possibleMap = lastPart.trim()
        if (possibleMap && possibleMap.length > 2 && !possibleMap.includes('/') && !possibleMap.includes('|')) {
          details.mapName = possibleMap
        }
      }
    }
  }

  if (!details.mapName) {
    const text = element.textContent || ''
    const mapMatch = text.match(/\b(?:de|cs|aim|awp|surf|kz|jail|fy|as|am|ar)_[\w-]+/i)
    if (mapMatch && mapMatch[0]) {
      details.mapName = mapMatch[0].trim()
    }
  }

  return details
}

// Catch clicks to capture server information before navigating or opening Steam
document.addEventListener('click', (event) => {
  const target = event.target as HTMLElement
  const buttonText = target.textContent ? target.textContent.trim().toLowerCase() : ''
  console.warn('[Cybershoke PreMiD] Click detected on:', target, 'text:', buttonText)

  // Determine if this is a join/connect click
  const isJoinClick = target.closest('.play-btn, [class*="play"], [class*="connect"], [class*="join"], button, a')
    || buttonText.includes('rejoindre')
    || buttonText.includes('join')
    || buttonText.includes('connect')
  console.warn('[Cybershoke PreMiD] isJoinClick:', !!isJoinClick)

  // Find the closest ancestor containing a server name pattern (# followed by numbers)
  let card: HTMLElement | null = null
  let parent = target
  // Walk up up to 6 levels to find the card/modal container
  for (let i = 0; i < 6; i++) {
    if (!parent || parent === document.body)
      break
    if (parent.textContent && /#\d+/.test(parent.textContent)) {
      card = parent
      break
    }
    parent = parent.parentElement as HTMLElement
  }
  console.warn('[Cybershoke PreMiD] Walked up to find card:', card)

  if (card) {
    console.warn('[Cybershoke PreMiD] Card element:', card)
    console.warn('[Cybershoke PreMiD] Card HTML:', card.outerHTML)
    const details = extractServerDetails(card)
    console.warn('[Cybershoke PreMiD] Extracted server details:', details)
    if (details.name) {
      activeServerName = details.name
      activeMapName = details.mapName
      activeMapImage = details.mapImage
      hasJoined = !!isJoinClick
      console.warn('[Cybershoke PreMiD] Updated state - activeServerName:', activeServerName, 'hasJoined:', hasJoined)
      return
    }
  }

  // If we clicked join inside a modal, persist the state
  if (isJoinClick) {
    if (activeServerName) {
      hasJoined = true
      console.warn('[Cybershoke PreMiD] Join click detected inside modal. Persisting state for:', activeServerName)

      const modal = document.getElementById('serverInfoModal') || document.querySelector('.arcticmodal, [class*="modal"]')
      if (modal) {
        const details = extractServerDetails(modal)
        console.warn('[Cybershoke PreMiD] Extracted details from open modal on join click:', details)
        if (details.mapName)
          activeMapName = details.mapName
        if (details.mapImage)
          activeMapImage = details.mapImage
      }
      return
    }
  }

  // Detect closing the modal (clicking close button or clicking outside modal overlay)
  const closeBtn = target.closest('.server-modal__close, .modal-close, [class*="close"]')
  const isOverlayClick = target.matches('.modal__overlay_SERVER_MODAL, .modal-overlay, .modal')
  console.warn('[Cybershoke PreMiD] closeBtn:', !!closeBtn, 'isOverlayClick:', !!isOverlayClick)
  if (closeBtn || isOverlayClick) {
    if (!hasJoined) {
      console.warn('[Cybershoke PreMiD] Modal closed without join. Resetting active server info.')
      activeServerName = null
      activeMapName = null
      activeMapImage = null
    }
  }
  else {
    // If clicked somewhere else (not join click, not inside card/modal), reset joined state
    if (!isJoinClick && !target.closest('#serverInfoModal, .arcticmodal, .home-body-servers')) {
      console.warn('[Cybershoke PreMiD] Clicked outside modal and cards. Resetting joined state.')
      hasJoined = false
    }
  }
}, true)

presence.on('UpdateData', async () => {
  const { pathname, href } = document.location

  // Strip language prefix (e.g. /fr/cs2 -> /cs2, /ru/premium -> /premium)
  const normalizedPath = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, '')

  const presenceData: PresenceData = {
    largeImageKey: logoUrl,
    startTimestamp: browsingTimestamp,
    smallImageKey: Assets.Play,
    smallImageText: 'Browsing site',
  }

  console.warn('[Cybershoke PreMiD] UpdateData loop running. path:', normalizedPath)
  console.warn('[Cybershoke PreMiD] State variables - activeServerName:', activeServerName, 'hasJoined:', hasJoined)

  // Determine state based on URL
  if (
    normalizedPath === '/'
    || normalizedPath.startsWith('/cs2')
    || normalizedPath.startsWith('/servers')
  ) {
    presenceData.details = 'Browsing CS2 Servers'
    let serverName: string | null = null

    // Look for active server names or connecting modal in DOM
    // Prioritize specific ArcticModal id/class first, then fall back to others
    let modalContainer = document.getElementById('serverInfoModal') || document.querySelector('.arcticmodal')
    if (!modalContainer) {
      modalContainer = document.querySelector(
        '.modal__overlay_SERVER_MODAL, [class*="modal"], .server-modal',
      )
    }
    console.warn('[Cybershoke PreMiD] modalContainer in DOM:', modalContainer)
    if (modalContainer) {
      // Check if the modal is actually showing (not hidden)
      let isShowing = true
      if (modalContainer.id !== 'serverInfoModal' && !modalContainer.classList.contains('arcticmodal')) {
        isShowing = !modalContainer.className.includes('Showing_false')
          && !modalContainer.className.includes('modal_hidden')
      }
      console.warn('[Cybershoke PreMiD] isShowing:', isShowing)
      if (isShowing) {
        const details = extractServerDetails(modalContainer)
        console.warn('[Cybershoke PreMiD] Extracted details from modalContainer:', details)
        if (details.name) {
          serverName = details.name
          activeServerName = details.name
        }
        else if (activeServerName) {
          serverName = activeServerName
        }
        if (details.mapName)
          activeMapName = details.mapName
        if (details.mapImage)
          activeMapImage = details.mapImage
      }
    }

    if (!serverName && hasJoined && activeServerName) {
      console.warn('[Cybershoke PreMiD] Using persisted joined server:', activeServerName)
      serverName = activeServerName
    }

    console.warn('[Cybershoke PreMiD] Resolved Server info - name:', serverName, 'mapName:', activeMapName, 'mapImage:', activeMapImage)

    if (serverName) {
      presenceData.state = `Server: ${serverName}`
      if (activeMapImage) {
        presenceData.largeImageKey = activeMapImage
      }
      if (activeMapName) {
        ;(presenceData as any).largeImageText = `Map: ${activeMapName}`
      }
    }
    else {
      presenceData.state = 'Finding a game server...'
    }

    presenceData.buttons = [
      {
        label: 'Browse Servers',
        url: href,
      },
    ]
  }
  else if (normalizedPath.startsWith('/profile')) {
    let username = 'Player Profile'

    const nameElement = document.querySelector(
      '.profile__name, .user-name, h1, h2',
    )
    if (nameElement && nameElement.textContent) {
      const parsedName = nameElement.textContent.trim()
      if (parsedName)
        username = parsedName
    }
    else {
      const pathParts = normalizedPath.split('/')
      const lastPart = pathParts[pathParts.length - 1]
      if (lastPart && lastPart !== 'profile') {
        username = `Profile #${lastPart}`
      }
    }

    presenceData.details = 'Viewing Profile'
    presenceData.state = username
    presenceData.buttons = [
      {
        label: 'View Profile',
        url: href,
      },
    ]
  }
  else if (normalizedPath.includes('/premium')) {
    presenceData.details = 'Checking Premium Benefits'
    presenceData.state = 'Looking at packages & missions'
    presenceData.buttons = [
      {
        label: 'Go Premium',
        url: 'https://cybershoke.net/premium',
      },
    ]
  }
  else if (
    normalizedPath.includes('/skin-changer')
    || normalizedPath.includes('/skinchanger')
  ) {
    presenceData.details = 'Customizing Weapons'
    presenceData.state = 'Configuring skin changer'
    presenceData.buttons = [
      {
        label: 'Customize Skins',
        url: href,
      },
    ]
  }
  else if (
    normalizedPath.includes('/stats')
    || normalizedPath.includes('/leaderboard')
    || normalizedPath.includes('/top')
  ) {
    presenceData.details = 'Checking Leaderboards'
    presenceData.state = 'Viewing player rankings'
    presenceData.buttons = [
      {
        label: 'View Stats',
        url: href,
      },
    ]
  }
  else if (
    normalizedPath.includes('/faq')
    || normalizedPath.includes('/support')
  ) {
    presenceData.details = 'Viewing Help & FAQ'
    presenceData.state = 'Reading support articles'
  }
  else {
    presenceData.details = 'Browsing CYBERSHOKE'
    presenceData.state = document.title
      ? document.title.replace('CYBERSHOKE – ', '')
      : 'CS2 Servers'
    presenceData.buttons = [
      {
        label: 'Visit Site',
        url: 'https://cybershoke.net/cs2',
      },
    ]
  }

  presence.setActivity(presenceData)
})
