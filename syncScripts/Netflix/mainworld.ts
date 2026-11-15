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

    const interval = setInterval(() => {
      const player = getPlayer()
      if (!player || player.isReady?.() === false) {
        watchVideo(null)
        ctx.content.send('state', null)
        return
      }
      watchVideo(player.getElement?.() ?? null)
      // On the ad plan getCurrentTime() also counts the ads already played; the segment time is the episode's own clock.
      const timeMs = player.getSegmentTime?.() ?? player.getCurrentTime()
      ctx.content.send('state', {
        playing: !player.isPaused(),
        currentTime: timeMs / 1000,
        duration: player.getDuration() / 1000,
        buffering,
        ad: isInAd(player),
      })
    }, 250)

    ctx.content.onMessage('command', (data: any) => {
      const player = getPlayer()
      if (!player)
        return
      if (data.action === 'play')
        player.play()
      else if (data.action === 'pause')
        player.pause()
      else if (data.action === 'seek')
        player.seek(Math.round(data.timeMs))
    })

    return () => {
      clearInterval(interval)
      watchVideo(null)
    }
  },
})
