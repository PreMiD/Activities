SyncScript.register({
  setup(ctx) {
    let handle: ManualVideoHandle | null = null
    let lastSeenAt = 0
    let lastBuffering = false
    let lastPageInfoKey = ''

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
        onPlay: () => ctx.mainworld.send('command', { action: 'play' }),
        onPause: () => ctx.mainworld.send('command', { action: 'pause' }),
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

    const offState = ctx.mainworld.onMessage('state', (data: any) => {
      if (!data) {
        // The player is gone (browse page, or between episodes) for about two seconds.
        if (handle && Date.now() - lastSeenAt > 2000) {
          handle.release()
          handle = null
          lastBuffering = false
        }
        return
      }
      lastSeenAt = Date.now()

      if (!handle) {
        // A managed page that reports nothing is given up on, so it only becomes one once there is a player.
        ctx.features({ cursor: false, scroll: false, video: true })
        handle = takeControl()
      }

      handle.reportPlayback({
        playing: data.playing,
        currentTime: data.currentTime,
        duration: data.duration,
        playbackRate: data.playbackRate,
      })
      handle.reportAd(data.ad)

      if (data.buffering !== lastBuffering) {
        lastBuffering = data.buffering
        handle.reportBuffering(data.buffering)
      }

      updatePageInfo()
    })

    return () => {
      offState()
      offRateRejected()
      handle?.release()
    }
  },
})
