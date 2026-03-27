SyncScript.register({
  setup(ctx) {
    ctx.features({ cursor: false, scroll: false, video: true })

    let lastBuffering = false

    const handle = ctx.video.takeControl({
      onPlay: () => ctx.mainworld.send('command', { action: 'play' }),
      onPause: () => ctx.mainworld.send('command', { action: 'pause' }),
      onSeek: t => ctx.mainworld.send('command', { action: 'seek', timeMs: t * 1000 }),
      pauseAfterSeek: true,
    })

    const offState = ctx.mainworld.onMessage('state', (data: any) => {
      handle.reportPlayback({
        playing: data.playing,
        currentTime: data.currentTime,
        duration: data.duration,
        playbackRate: 1,
      })

      if (data.buffering !== lastBuffering) {
        lastBuffering = data.buffering
        handle.reportBuffering(data.buffering)
      }

      if (data.title)
        ctx.setPageInfo({ title: data.title, subtitle: data.subtitle })
    })

    return () => {
      offState()
      handle.release()
    }
  },
})
