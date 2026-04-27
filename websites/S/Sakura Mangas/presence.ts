const presence = new Presence({
  clientId: '1497792741130768546',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://i.imgur.com/8EhCZKg.png',
}

// Fetches an image and converts it to a base64 data URL, with caching.
// Needed because the server requires JavaScript to serve images,
// so Discord can't fetch them directly via URL.
const dataUrlCache = new Map<string, string | null>()
async function toDataUrl(url: string): Promise<string | null> {
  if (dataUrlCache.has(url))
    return dataUrlCache.get(url)!
  try {
    const blob = await fetch(url).then(r => r.blob())
    const result = await new Promise<string | null>((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.readAsDataURL(blob)
    })
    dataUrlCache.set(url, result)
    return result
  }
  catch {
    dataUrlCache.set(url, null)
    return null
  }
}

presence.on('UpdateData', async () => {
  const [
    privacy,
    showButtons,
    showCover,
  ] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('showButtons'),
    presence.getSetting<boolean>('showCover'),
  ])

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  const { href, pathname } = document.location
  const [, section, slug, subSlug] = pathname.split('/')

  if (privacy) {
    presenceData.details = 'Navegando no site'
    presence.setActivity(presenceData)
    return
  }

  switch (section) {
    case 'login':
      presenceData.details = 'Fazendo login'
      break

    case 'obras': {
      if (subSlug) {
        const mangaUrl = `${document.location.origin}/obras/${slug}/`
        if (showCover) {
          const coverUrl = await toDataUrl(`${mangaUrl}thumb_256.jpg`)
          if (coverUrl)
            presenceData.largeImageKey = coverUrl
        }
        presenceData.details = document.querySelector('.reader-manga-title')?.textContent
        presenceData.state = `Capítulo ${subSlug.replaceAll('-', '.')}`
        if (showButtons) {
          presenceData.buttons = [
            { label: 'Ler capítulo', url: href },
            { label: 'Ver mangá', url: mangaUrl },
          ]
        }
      }
      else if (slug) {
        if (showCover) {
          const cover = document.querySelector<HTMLImageElement>('.img-fluid.capa')
          if (cover?.src) {
            const coverUrl = await toDataUrl(cover.src)
            if (coverUrl)
              presenceData.largeImageKey = coverUrl
          }
        }
        presenceData.details = document.querySelector('.h1-titulo')?.textContent
        if (showButtons) {
          presenceData.buttons = [{ label: 'Ler mangá', url: href }]
        }
      }
      else {
        presenceData.details = 'Explorando o catálogo'
      }
      break
    }

    case 'feed': {
      const userName = document.querySelector('#header-username')?.textContent
      presenceData.details = `Perfil: ${userName}`
      presenceData.state = document.querySelector('button.nav-link.active')?.textContent
      break
    }

    case 'scans': {
      if (slug) {
        presenceData.details = document.querySelector('#scan-nome')?.textContent
        if (showButtons) {
          presenceData.buttons = [{ label: 'Ver scan', url: href }]
        }
      }
      else {
        presenceData.details = 'Explorando as scans'
      }
      break
    }

    default: {
      presenceData.details = 'Na página inicial'
      break
    }
  }
  presence.setActivity(presenceData)
})
