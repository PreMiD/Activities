const presence = new Presence({
  clientId: '1490410891236216974',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

function parseTitle(): { anime: string, episode: string | null } {
  const raw = document.title.replace(' - Tengoku Fansub', '').trim()
  const sep = raw.indexOf(' — ')
  if (sep !== -1) {
    return {
      anime: raw.slice(0, sep).trim(),
      episode: raw.slice(sep + 3).trim() || null,
    }
  }
  return { anime: raw, episode: null }
}

presence.on('UpdateData', async () => {
  const showEpisode = await presence.getSetting<boolean>('showEpisode')
  const showTimestamp = await presence.getSetting<boolean>('showTimestamp')
  const showButtons = await presence.getSetting<boolean>('showButtons')

  const { pathname, href } = document.location

  const presenceData: PresenceData = {
    type: 3, // ActivityType.Watching
    largeImageKey: 'logo',
    largeImageText: 'Tengoku Fansub',
  }

  if (showTimestamp)
    presenceData.startTimestamp = browsingTimestamp

  // İzləmə səhifəsi: /anime/slug/episode
  const isEpisodePage = /^\/anime\/[^/]+\/[\d.]+/.test(pathname)
  if (isEpisodePage) {
    const { anime, episode } = parseTitle()

    presenceData.details = anime
    presenceData.state = showEpisode && episode ? `İzləyir: ${episode}` : 'İzləyir'
    presenceData.smallImageKey = 'play'
    presenceData.smallImageText = 'İzləyir'

    if (showButtons) {
      presenceData.buttons = [
        { label: 'İzlə →', url: href },
      ]
    }

    presence.setActivity(presenceData)
    return
  }

  // Anime detail səhifəsi: /anime/slug
  const isAnimePage = /^\/anime\/[^/]+\/?$/.test(pathname)
  if (isAnimePage) {
    const { anime } = parseTitle()

    presenceData.details = anime || 'Anime'
    presenceData.state = 'Anime səhifəsini araşdırır'
    presenceData.smallImageKey = 'browse'
    presenceData.smallImageText = 'Baxır'

    if (showButtons)
      presenceData.buttons = [{ label: 'Bax →', url: href }]

    presence.setActivity(presenceData)
    return
  }

  // Arxiv/Axtarış
  if (pathname.startsWith('/archive')) {
    const params = new URLSearchParams(document.location.search)
    const query = params.get('q')

    presenceData.details = query ? `"${query}" axtarır` : 'Arxivi axtarır'
    presenceData.state = 'Tengoku Fansub'
    presenceData.smallImageKey = 'search'
    presenceData.smallImageText = 'Axtarır'

    presence.setActivity(presenceData)
    return
  }

  // Profil
  if (pathname.startsWith('/profile')) {
    presenceData.details = 'Profilinə baxır'
    presenceData.state = 'Tengoku Fansub'
    presenceData.smallImageKey = 'browse'

    presence.setActivity(presenceData)
    return
  }

  // Marketplace
  if (pathname.startsWith('/marketplace')) {
    presenceData.details = 'Mağazaya baxır'
    presenceData.state = 'Tengoku Fansub'
    presenceData.smallImageKey = 'browse'

    presence.setActivity(presenceData)
    return
  }

  // Ana səhifə / digər
  presenceData.details = 'Tengoku Fansub'
  presenceData.state = pathname === '/' || pathname === '' ? 'Ana səhifədə' : 'Sayta baxır'
  presenceData.smallImageKey = 'logo'

  presence.setActivity(presenceData)
})
