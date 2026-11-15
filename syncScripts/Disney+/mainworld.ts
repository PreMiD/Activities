SyncMainworldScript.register({
  setup(ctx) {
    function getPlayer() {
      const el = document.querySelector('disney-web-player') as any
      return el?.mediaPlayer ?? null
    }

    function readState() {
      const mp = getPlayer()
      const info = mp?.timeline?.info
      // Without a timeline the position is unknown, and reporting 0 would pull the party to the start.
      if (!info)
        return null

      const status = mp.playbackStatus
      const metadata = mp.mediaPlaybackCriteria?.metadata
      const ui = (document.querySelector('disney-web-player-ui') as any)?.latestUiState
      const durationMs = info.programDurationMs ?? info.seekableEndMs ?? 0

      return {
        playing: !!status?.playing,
        paused: !!status?.paused,
        buffering: (status?.currentState === 'SEEKING' && !status?.paused) || !!status?.buffering,
        // Ads and promos alike keep the episode from playing.
        ad: !!ui?.interstitials?.isInterstitialPlaying,
        currentTime: info.playheadPositionMs / 1000,
        duration: durationMs / 1000,
        // mediaPlayer.playbackRate only takes presets, the <video> takes any rate (unverified on a live account).
        playbackRate: mp.mediaElement?.playbackRate ?? 1,
        title: metadata?.title?.text,
        subtitle: metadata?.subtitle?.text,
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
    function alignTo(mp: any, timeMs: unknown) {
      if (typeof timeMs !== 'number' || !Number.isFinite(timeMs))
        return
      const state = readState()
      if (!state || state.ad || state.buffering || mp.playbackStatus?.currentState === 'SEEKING')
        return
      if (Math.abs(state.currentTime * 1000 - timeMs) <= 1000)
        return
      // Old runtimes repeat play with every heartbeat until the player plays, so one seek has to land first.
      if (Date.now() - lastAlignAt < 3000)
        return
      lastAlignAt = Date.now()
      mp.seek(timeMs)
    }

    let rateCheck: ReturnType<typeof setTimeout> | undefined
    function setRate(mp: any, rate: number) {
      const element = mp.mediaElement
      if (!element)
        return ctx.content.send('rateRejected', rate)
      element.playbackRate = rate
      clearTimeout(rateCheck)
      // Drift is corrected by small rate changes; a player that resets them must be seeked instead.
      rateCheck = setTimeout(() => {
        try {
          if (Math.abs((getPlayer()?.mediaElement?.playbackRate ?? rate) - rate) > 0.001)
            ctx.content.send('rateRejected', rate)
        }
        catch (error) {
          failed(error)
        }
      }, 500)
    }

    ctx.content.onMessage('command', (data: any) => {
      try {
        const mp = getPlayer()
        if (!mp)
          return
        if (data.action === 'play') {
          alignTo(mp, data.timeMs)
          mp.play()
        }
        else if (data.action === 'pause') {
          alignTo(mp, data.timeMs)
          mp.pause()
        }
        else if (data.action === 'seek') {
          mp.seek(data.timeMs)
        }
        else if (data.action === 'rate') {
          setRate(mp, data.playbackRate)
        }
      }
      catch (error) {
        failed(error)
      }
    })

    return () => {
      clearInterval(interval)
      clearTimeout(rateCheck)
    }
  },
})
