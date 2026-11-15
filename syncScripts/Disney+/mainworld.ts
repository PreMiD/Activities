SyncMainworldScript.register({
  setup(ctx) {
    function getPlayer() {
      const el = document.querySelector('disney-web-player') as any
      return el?.mediaPlayer ?? null
    }

    const interval = setInterval(() => {
      const mp = getPlayer()
      if (!mp) {
        ctx.content.send('state', null)
        return
      }

      const status = mp.playbackStatus
      const info = mp.timeline?.info
      const metadata = mp.mediaPlaybackCriteria?.metadata
      const ui = (document.querySelector('disney-web-player-ui') as any)?.latestUiState
      const durationMs = info?.programDurationMs ?? info?.seekableEndMs ?? 0

      ctx.content.send('state', {
        playing: !!status?.playing,
        paused: !!status?.paused,
        buffering: (status?.currentState === 'SEEKING' && !status?.paused) || !!status?.buffering,
        // Ads and promos alike keep the episode from playing.
        ad: !!ui?.interstitials?.isInterstitialPlaying,
        currentTime: info ? info.playheadPositionMs / 1000 : 0,
        duration: durationMs / 1000,
        title: metadata?.title?.text,
        subtitle: metadata?.subtitle?.text,
      })
    }, 100)

    ctx.content.onMessage('command', (data: any) => {
      const mp = getPlayer()
      if (!mp)
        return
      if (data.action === 'play')
        mp.play()
      else if (data.action === 'pause')
        mp.pause()
      else if (data.action === 'seek')
        mp.seek(data.timeMs)
    })

    return () => clearInterval(interval)
  },
})
