import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1495660017607507999',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/M/Meta%20Achievements/assets/logo.png',
}

presence.on('UpdateData', async () => {
  const { pathname } = window.location
  let details = 'Browsing'
  let state = ''
  let smallImageKey: string = Assets.Play

  const getMetric = (label: string) => {
    const metric = Array.from(document.querySelectorAll('.summary-metric'))
      .find((m) => {
        const l = m.querySelector('.summary-metric-label')?.textContent?.trim().toLowerCase()
        return l && l.includes(label.toLowerCase())
      })
    const value = metric?.querySelector('.summary-metric-value')?.textContent?.trim()
    return value && value.length > 0 ? value : null
  }

  // Twemoji helper for smallImageKey
  const getEmojiUrl = (char: string) => `https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/72x72/${char.codePointAt(0)?.toString(16)}.png`

  let buttonLabel: string | undefined
  if (pathname.endsWith('index.html') || pathname.endsWith('/index') || pathname === '/') {
    details = 'Home'
    smallImageKey = getEmojiUrl('🏠')
  }
  else if (pathname.endsWith('achievements.html') || pathname.endsWith('/achievements')) {
    const username = document.querySelector('.summary-title')?.textContent?.trim()
    const games = getMetric('Games Tracked')
    const achievements = getMetric('Achievements Unlocked')
    const completions = getMetric('100% Completions')

    if (games || achievements || completions) {
      buttonLabel = 'View Profile'
      details = username ? `${username}'s Profile` : 'Loading Profile...'
      const parts = []
      if (games) {
        parts.push(`${games} Games`)
      }
      if (achievements) {
        parts.push(`${achievements} Achievements`)
      }
      if (completions) {
        parts.push(`${completions} 100%`)
      }

      state = parts.join(' · ')
    }
    else {
      details = 'Loading Profile...'
    }

    const avatarImg = document.querySelector<HTMLImageElement>('#profileAvatar img')
    if (avatarImg?.src) {
      smallImageKey = avatarImg.src
    }
  }
  else if (pathname.endsWith('achievementsbeta.html') || pathname.endsWith('/achievementsbeta')) {
    const username = document.querySelector('.summary-title')?.textContent?.trim()
    const games = getMetric('Games Tracked')
    const achievements = getMetric('Achievements Unlocked')
    const completions = getMetric('100% Completions')

    if (games || achievements || completions) {
      buttonLabel = 'View Profile'
      details = username ? `${username}'s Profile` : 'Loading Profile...'
      const parts = []
      if (games) {
        parts.push(`${games} Games`)
      }
      if (achievements) {
        parts.push(`${achievements} Achievements`)
      }
      if (completions) {
        parts.push(`${completions} 100%`)
      }

      state = parts.join(' · ')
    }
    else {
      details = 'Loading Profile...'
    }

    const avatarImg = document.querySelector<HTMLImageElement>('#profileAvatar img')
    if (avatarImg?.src) {
      smallImageKey = avatarImg.src
    }
  }
  else if (pathname.endsWith('achievementdefinitions.html') || pathname.endsWith('/achievementdefinitions')) {
    details = 'All Achievements'
    smallImageKey = getEmojiUrl('📚')

    const games = getMetric('Games indexed')
    const achievements = getMetric('Total Achievements')
    if (games || achievements) {
      buttonLabel = 'View Game List'
      const parts = []
      if (games) {
        parts.push(`${games} Total Games`)
      }
      if (achievements) {
        parts.push(`${achievements} Achievements`)
      }
      state = parts.join(' · ')
    }
  }
  else if (pathname.endsWith('achievementdefinitionsbeta.html') || pathname.endsWith('/achievementdefinitionsbeta')) {
    details = 'All Achievements'
    smallImageKey = getEmojiUrl('📚')

    const games = getMetric('Games indexed')
    const achievements = getMetric('Total Achievements')
    if (games || achievements) {
      buttonLabel = 'View Game List'
      const parts = []
      if (games) {
        parts.push(`${games} Total Games`)
      }
      if (achievements) {
        parts.push(`${achievements} Achievements`)
      }
      state = parts.join(' · ')
    }
  }
  else if (pathname.endsWith('achievementdefinitionsapp.html') || pathname.endsWith('/achievementdefinitionsapp')) {
    details = 'Definitions App'
    smallImageKey = getEmojiUrl('🛠️')
  }
  else if (pathname.endsWith('gamercard.html') || pathname.endsWith('/gamercard')) {
    details = 'Gamercard'
    smallImageKey = getEmojiUrl('🪪')
  }
  else if (pathname.endsWith('ios-webapp-guide.html') || pathname.endsWith('/ios-webapp-guide')) {
    details = 'IOS Web App Guide'
    smallImageKey = getEmojiUrl('🍏')
  }
  else if (pathname.endsWith('qs-redirect.html') || pathname.endsWith('/qs-redirect')) {
    details = 'Chosing their fate'
    smallImageKey = getEmojiUrl('🎲')
  }
  else if (
    pathname.endsWith('settings.html')
    || pathname.endsWith('/settings')
    || pathname.endsWith('admin.html')
    || pathname.endsWith('/admin')
    || pathname.endsWith('link.html')
    || pathname.endsWith('/link')
    || pathname.endsWith('altstore.html')
    || pathname.endsWith('/altstore')
  ) {
    details = 'Settings'
    smallImageKey = getEmojiUrl('⚙️')
  }

  const presenceData: PresenceData = {
    details,
    state,
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    smallImageKey,
    buttons: buttonLabel
      ? [
          {
            label: buttonLabel,
            url: window.location.href,
          },
        ]
      : undefined,
  }

  presence.setActivity(presenceData)
})
