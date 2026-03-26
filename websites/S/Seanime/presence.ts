presence.on('UpdateData', async () => {
  console.warn('Presence running')

  const path = window.location.pathname
  const rawTitle = document.title.replace(' | Seanime', '')

  if (!path || path === '/' || path.length <= 1) {
    presence.setActivity({
      type: 0,
      details: 'Browsing Library',
      state: 'Looking for something to watch',
      largeImageKey: LOGO,
    })
    return
  }

  if (path.includes('/manga/entry')) {
    const chapter = findChapter()
    const page = findPageCounter()

    presence.setActivity({
      type: 0,
      name: 'Reading Manga',
      details: rawTitle,
      state: [chapter, page].filter(Boolean).join(' • '),
      largeImageKey: LOGO,
    })
    return
  }

  const video = document.querySelector('video')

  if (video) {
    const episode = findEpisode()
    const episodeTitle = findEpisodeTitle()

    const cleanTitle
        = document
            .querySelector('[data-vc-element="top-playback-info-title"]')
            ?.textContent
            ?.trim()
        || rawTitle

    const epNumber
        = episode
            ? episode.match(/\d+/)
            : null

    const epShort
        = epNumber
            ? `Ep ${epNumber[0]}`
            : null

    const current = Math.floor(video.currentTime || 0)
    const total = Math.floor(video.duration || 0)

    const startTimestamp = Math.floor(Date.now() / 1000) - current
    const endTimestamp = startTimestamp + total

    const paused = video.paused

    const stateText
        = paused
            ? `Paused • ${epShort || ''}\n${episodeTitle || ''}`.trim()
            : `${epShort || ''}\n${episodeTitle || ''}`.trim()

    presence.setActivity({
      type: 3,
      name: 'Anime',
      details: cleanTitle,
      state: stateText,
      largeImageKey: LOGO,
      startTimestamp: paused
        ? undefined
        : startTimestamp,
      endTimestamp: paused
        ? undefined
        : endTimestamp,
      smallImageKey: paused
        ? PAUSE_ICON
        : PLAY_ICON,
      smallImageText: paused
        ? 'Paused'
        : 'Playing',
    })

    return
  }

  presence.setActivity({
    type: 0,
    details: rawTitle,
    state: 'Browsing',
    largeImageKey: LOGO,
  })
})
