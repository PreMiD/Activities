SyncScript.register({
  setup(ctx) {
    let handle: ManualVideoHandle | null = null
    let lastSeenAt = 0
    let lastBuffering = false
    let lastPageInfoKey = ''

    const offState = ctx.mainworld.onMessage('state', (data: any) => {
      if (!data) {
        // The player is gone (home page, or between episodes) for about a second.
        if (handle && Date.now() - lastSeenAt > 1000) {
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
        handle = ctx.video.takeControl({
          onPlay: () => ctx.mainworld.send('command', { action: 'play' }),
          onPause: () => ctx.mainworld.send('command', { action: 'pause' }),
          onSeek: t => ctx.mainworld.send('command', { action: 'seek', timeMs: t * 1000 }),
          pauseAfterSeek: true,
        })
      }

      handle.reportPlayback({
        playing: data.playing,
        currentTime: data.currentTime,
        duration: data.duration,
        playbackRate: 1,
      })
      handle.reportAd(data.ad)

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
      handle?.release()
    }
  },
})
