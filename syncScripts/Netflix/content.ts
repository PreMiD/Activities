SyncScript.register({
  setup(ctx) {
    let handle: ManualVideoHandle | null = null
    let lastSeenAt = 0
    let lastBuffering = false
    let lastAd: boolean | null = null
    let lastPageInfoKey = ''
    let blocked = false

    // Claiming the page before the player exists keeps the generic path from writing the raw <video>, which breaks Netflix.
    function claim() {
      // The extension forgets the page info of a page that is claimed again.
      lastPageInfoKey = ''
      ctx.features({ cursor: false, scroll: false, video: true, fallback: false })
    }
    let claimedPath = ''
    function claimWatchPage() {
      if (location.pathname.startsWith('/watch/') && location.pathname !== claimedPath) {
        claimedPath = location.pathname
        claim()
      }
    }
    claimWatchPage()

    function updatePageInfo() {
      const titleElement = document.querySelector('[data-uia="video-title"]')
      const title = titleElement?.querySelector('h4')?.textContent ?? titleElement?.textContent
      const subtitle = titleElement?.querySelector('span')?.textContent ?? undefined
      const key = `${title}|${subtitle}`
      if (!title || key === lastPageInfoKey)
        return
      lastPageInfoKey = key
      ctx.setPageInfo({ title, subtitle })
    }

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
        ctx.log('Netflix player API failed', data?.reason)
      if (typeof ctx.reportBlocked === 'function') {
        blocked = true
        ctx.reportBlocked('PreMiD cannot control the Netflix player')
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
        claimWatchPage()
        // The player is gone (browse page, or between episodes) for about two seconds.
        if (handle && Date.now() - lastSeenAt > 2000) {
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

      updatePageInfo()
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
