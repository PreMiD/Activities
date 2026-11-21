SyncMainworldScript.register({
  setup(ctx) {
    // Writing <video>.currentTime makes Netflix stop with an error, so everything goes through its player API.
    function getPlayer() {
      const videoPlayer = (window as any).netflix?.appContext?.state?.playerApp?.getAPI?.()?.videoPlayer
      // Previews and billboards run in other sessions; an episode change starts a new watch- session.
      const sessionId = videoPlayer?.getAllPlayerSessionIds?.()?.find((id: string) => id.startsWith('watch-'))
      return sessionId ? videoPlayer.getVideoPlayerBySessionId(sessionId) : null
    }

    function isInAd(player: any) {
      try {
        if (player.getAdManager?.()?.adPresenting?._value)
          return true
      }
      catch {}
      return !!document.querySelector('[data-uia="ads-info-container"]')
    }

    let video: HTMLVideoElement | null = null
    let buffering = false
    const onWaiting = () => {
      buffering = true
    }
    const onPlaying = () => {
      buffering = false
    }

    function watchVideo(element: HTMLVideoElement | null) {
      if (element === video)
        return
      video?.removeEventListener('waiting', onWaiting)
      video?.removeEventListener('playing', onPlaying)
      video?.removeEventListener('canplay', onPlaying)
      video = element
      buffering = false
      video?.addEventListener('waiting', onWaiting)
      video?.addEventListener('playing', onPlaying)
      video?.addEventListener('canplay', onPlaying)
    }

    function readState() {
      const player = getPlayer()
      if (!player || player.isReady?.() === false) {
        watchVideo(null)
        return null
      }
      watchVideo(player.getElement?.() ?? null)
      // On the ad plan getCurrentTime() also counts the ads already played; the segment time is the episode's own clock.
      const timeMs = player.getSegmentTime?.() ?? player.getCurrentTime()
      return {
        playing: !player.isPaused(),
        currentTime: timeMs / 1000,
        duration: player.getDuration() / 1000,
        playbackRate: player.getPlaybackRate?.() ?? 1,
        buffering,
        ad: isInAd(player),
      }
    }

    // The position changes every tick while playing, so a playing player is still reported every tick.
    let lastPosted: string | undefined
    let lastPostedAt = 0
    function post(state: ReturnType<typeof readState>) {
      const key = JSON.stringify(state)
      const now = Date.now()
      if (key === lastPosted && now - lastPostedAt < 1000)
        return
      lastPosted = key
      lastPostedAt = now
      ctx.content.send('state', state)
    }

    let failures = 0
    let broken = false
    function succeeded() {
      failures = 0
      if (broken) {
        broken = false
        ctx.content.send('recovered', null)
      }
    }
    function failed(error: unknown) {
      if (++failures === 3) {
        broken = true
        ctx.content.send('broken', { reason: String(error) })
      }
    }

    const interval = setInterval(() => {
      try {
        post(readState())
        succeeded()
      }
      catch (error) {
        post(null)
        failed(error)
      }
    }, 250)

    let lastAlignAt = 0
    // A paused or loading follower gets play and pause with the party's position, which it has to be at first.
    function alignTo(player: any, timeMs: unknown) {
      if (typeof timeMs !== 'number' || !Number.isFinite(timeMs))
        return
      const state = readState()
      if (!state || state.ad || state.buffering || Math.abs(state.currentTime * 1000 - timeMs) <= 1000)
        return
      // Old runtimes repeat play with every heartbeat until the player plays, so one seek has to land first.
      if (Date.now() - lastAlignAt < 3000)
        return
      lastAlignAt = Date.now()
      player.seek(Math.round(timeMs))
    }

    let rateCheck: ReturnType<typeof setTimeout> | undefined
    function setRate(player: any, rate: number) {
      if (typeof player.setPlaybackRate !== 'function')
        return ctx.content.send('rateRejected', rate)
      player.setPlaybackRate(rate)
      clearTimeout(rateCheck)
      // Drift is corrected by small rate changes; a player that only takes preset rates must be seeked instead.
      rateCheck = setTimeout(() => {
        try {
          const current = getPlayer()?.getPlaybackRate?.()
          if (typeof current === 'number' && Math.abs(current - rate) > 0.001)
            ctx.content.send('rateRejected', rate)
        }
        catch (error) {
          failed(error)
        }
      }, 500)
    }

    ctx.content.onMessage('command', (data: any) => {
      try {
        const player = getPlayer()
        if (!player)
          return
        if (data.action === 'play') {
          alignTo(player, data.timeMs)
          player.play()
        }
        else if (data.action === 'pause') {
          alignTo(player, data.timeMs)
          player.pause()
        }
        else if (data.action === 'seek') {
          player.seek(Math.round(data.timeMs))
        }
        else if (data.action === 'rate') {
          setRate(player, data.playbackRate)
        }
      }
      catch (error) {
        failed(error)
      }
    })

    return () => {
      clearInterval(interval)
      clearTimeout(rateCheck)
      watchVideo(null)
    }
  },
})
