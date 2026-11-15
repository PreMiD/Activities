SyncScript.register({
  setup(ctx) {
    let handle: ManualVideoHandle | null = null
    let missed = 0
    let lastBuffering = false
    let lastTitle = ''

    function updatePageInfo() {
      const titleElement = document.querySelector('[data-uia="video-title"]')
      const title = titleElement?.querySelector('h4')?.textContent ?? titleElement?.textContent
      if (!title || title === lastTitle)
        return
      lastTitle = title
      ctx.setPageInfo({ title, subtitle: titleElement?.querySelector('span')?.textContent ?? undefined })
    }

    const offState = ctx.mainworld.onMessage('state', (data: any) => {
      if (!data) {
        // The player is gone (browse page, or between episodes) for about two seconds.
        if (handle && ++missed > 8) {
          handle.release()
          handle = null
          lastBuffering = false
        }
        return
      }
      missed = 0

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

      updatePageInfo()
    })

    return () => {
      offState()
      handle?.release()
    }
  },
})
