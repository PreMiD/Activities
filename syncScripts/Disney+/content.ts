SyncScript.register({
  setup(ctx) {
    let handle: ManualVideoHandle | null = null
    let lastSeenAt = 0
    let lastBuffering = false
    let lastAd: boolean | null = null
    let lastPageInfoKey = ''
    let blocked = false

    // Claiming the page before the player exists keeps the generic path off the raw <video>.
    function claim() {
      // The extension forgets the page info of a page that is claimed again.
      lastPageInfoKey = ''
      ctx.features({ cursor: false, scroll: false, video: true, fallback: false })
    }
    let claimedPath = ''
    function claimPlayPage() {
      const path = location.pathname
      if (/^\/(?:[a-z]{2}(?:-[a-z]{2})?\/)?(?:play|video)\//i.test(path) && path !== claimedPath) {
        claimedPath = path
        claim()
      }
    }
    claimPlayPage()

    let controlOptions: SyncScriptTakeControlOptions | null = null
    function takeControl() {
      controlOptions = {
        onPlay: t => ctx.mainworld.send('command', { action: 'play', timeMs: t * 1000 }),
        onPause: t => ctx.mainworld.send('command', { action: 'pause', timeMs: t * 1000 }),
        onSeek: t => ctx.mainworld.send('command', { action: 'seek', timeMs: t * 1000 }),
        pauseAfterSeek: true,
      }
      // With onRate the runtime corrects small drift by nudging the rate instead of seeking. Older runtimes keep seeking.
      if (ctx.runtime)
        controlOptions.onRate = rate => ctx.mainworld.send('command', { action: 'rate', playbackRate: rate })
      return ctx.video.takeControl(controlOptions)
    }

    // The runtime reads onRate on every command, so dropping it falls back to seeking.
    const offRateRejected = ctx.mainworld.onMessage('rateRejected', () => {
      if (controlOptions)
        delete controlOptions.onRate
    })

    const offBroken = ctx.mainworld.onMessage('broken', (data: any) => {
      if (typeof ctx.log === 'function')
        ctx.log('Disney+ player API failed', data?.reason)
      if (typeof ctx.reportBlocked === 'function') {
        blocked = true
        ctx.reportBlocked('PreMiD cannot control the Disney+ player')
      }
    })
    function unblock() {
      if (blocked && typeof ctx.reportUnblocked === 'function')
        ctx.reportUnblocked()
      blocked = false
    }
    const offRecovered = ctx.mainworld.onMessage('recovered', unblock)

    const offState = ctx.mainworld.onMessage('state', (data: any) => {
      if (!data) {
        claimPlayPage()
        // The player is gone (home page, or between episodes) for about a second.
        if (handle && Date.now() - lastSeenAt > 1000) {
          handle.release()
          handle = null
          lastBuffering = false
          lastAd = null
        }
        return
      }
      lastSeenAt = Date.now()

      if (!handle) {
        // Older runtimes give up on a managed page that has reported nothing for 10 s, so the claim is renewed here.
        claim()
        handle = takeControl()
      }

      handle.reportPlayback({
        playing: data.playing,
        currentTime: data.currentTime,
        duration: data.duration,
        playbackRate: data.playbackRate,
      })
      // Older runtimes restart the ad-end debounce on every report, so repeats would keep an ad from ever ending.
      if (data.ad !== lastAd) {
        lastAd = data.ad
        handle.reportAd(data.ad)
      }

      if (data.buffering !== lastBuffering) {
        lastBuffering = data.buffering
        handle.reportBuffering(data.buffering)
      }

      const pageInfoKey = `${data.title}|${data.subtitle}`
      if (data.title && pageInfoKey !== lastPageInfoKey) {
        lastPageInfoKey = pageInfoKey
        ctx.setPageInfo({ title: data.title, subtitle: data.subtitle })
      }
    })

    return () => {
      offState()
      offRateRejected()
      offBroken()
      offRecovered()
      unblock()
      handle?.release()
    }
  },
})
