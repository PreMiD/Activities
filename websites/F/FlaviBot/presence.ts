import { Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '503557087041683458',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/F/FlaviBot/assets/logo.png',
    startTimestamp: browsingTimestamp,
    name: 'FlaviBot',
  }
  const { href } = document.location
  // Strip the optional locale prefix (/fr/..., /pt-BR/..., /ckb-IR/...)
  const pathname = document.location.pathname.replace(/^\/(?:[a-z]{2}(?:-[A-Z]{2})?|ckb-IR)(?=\/|$)/, '') || '/'
  // Every page title is "<page> — FlaviBot" or "<page> — FlaviBot Dashboard"
  const pageTitle = document.title.split(' — ')[0]?.trim()

  switch (true) {
    case pathname.startsWith('/music-player'): {
      const player = document.querySelector('img[alt="Track thumbnail"]')?.closest('.grid')
      const [title, artist] = player?.querySelectorAll('a[href*="/music-player/search"]') ?? []
      if (!title?.textContent) {
        presenceData.details = 'Viewing the music player'
        presenceData.state = pageTitle
        break
      }
      const isPlaying = !!player?.querySelector('button[aria-label="Pause"]')
      const progress = player?.querySelector('[role="slider"]')
      presenceData.details = title.textContent.trim()
      presenceData.state = artist?.textContent?.trim()
      presenceData.largeImageKey = player?.querySelector<HTMLImageElement>('img[alt="Track thumbnail"]')?.src ?? presenceData.largeImageKey
      presenceData.smallImageKey = isPlaying ? Assets.Play : Assets.Pause
      presenceData.smallImageText = isPlaying ? 'Playing' : 'Paused'
      delete presenceData.startTimestamp
      if (isPlaying && progress) {
        // Slider values are in milliseconds
        [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(
          Number(progress.getAttribute('aria-valuenow')) / 1000,
          Number(progress.getAttribute('aria-valuemax')) / 1000,
        )
      }
      break
    }
    case /^\/dashboard\/\d+/.test(pathname): {
      const server = document.querySelector('.sidebar-fold-fade button[aria-haspopup="listbox"] span.truncate')?.textContent?.trim()
      presenceData.details = `Managing ${server ?? 'a server'}`
      if (pageTitle !== server)
        presenceData.state = pageTitle
      break
    }
    case pathname.startsWith('/dashboard'): {
      presenceData.details = 'Choosing a server'
      break
    }
    case pathname.startsWith('/@'): {
      presenceData.details = 'Viewing a profile'
      presenceData.state = pathname.slice(1)
      break
    }
    case pathname.startsWith('/legal/'): {
      presenceData.details = 'Reading'
      presenceData.state = pageTitle
      presenceData.smallImageKey = Assets.Reading
      break
    }
    case pathname === '/commands':
    case pathname === '/status':
    case pathname.startsWith('/leaderboard/'): {
      presenceData.details = 'Viewing'
      presenceData.state = pageTitle
      presenceData.buttons = [{ label: 'View Page', url: href }]
      break
    }
    default: {
      presenceData.details = 'Browsing'
      presenceData.state = pageTitle
    }
  }

  presence.setActivity(presenceData)
})
