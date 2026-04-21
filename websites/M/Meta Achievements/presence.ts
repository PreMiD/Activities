import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1495660017607507999',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://i.imgur.com/WpN6Sm6.png',
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

  if (pathname.endsWith('index.html') || pathname === '/') {
    details = 'Home'
    smallImageKey = getEmojiUrl('🏠')
  }
  else if (pathname.endsWith('achievements.html')) {
    const username = document.querySelector('.summary-title')?.textContent?.trim()
    const games = getMetric('Games Tracked')
    const achievements = getMetric('Achievements Unlocked')
    const completions = getMetric('100% Completions')

    if (games || achievements || completions) {
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

    const avatarImg = document.querySelector('#profileAvatar img') as HTMLImageElement
    if (avatarImg?.src) {
      smallImageKey = avatarImg.src
    }
  }
  else if (pathname.endsWith('achievementdefinitions.html')) {
    details = 'All Achievements'
    smallImageKey = getEmojiUrl('📚')

    const games = getMetric('Games indexed')
    const achievements = getMetric('Total Achievements')
    if (games || achievements) {
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
  else if (pathname.endsWith('achievementdefinitionsapp.html')) {
    details = 'Definitions App'
    smallImageKey = getEmojiUrl('🛠️')
  }
  else if (pathname.endsWith('gamercard.html')) {
    details = 'Gamercard'
    smallImageKey = getEmojiUrl('🪪')
  }
  else if (pathname.endsWith('ios-webapp-guide.html')) {
    details = 'IOS Web App Guide'
    smallImageKey = getEmojiUrl('🍏')
  }
  else if (pathname.endsWith('settings.html')) {
    details = 'User Settings'
    smallImageKey = getEmojiUrl('⚙️')
  }

  const presenceData: PresenceData = {
    details,
    state,
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    smallImageKey,
    buttons: [
      {
        label: 'View Page',
        url: window.location.href,
      },
    ],
  }

  presence.setActivity(presenceData)
})
