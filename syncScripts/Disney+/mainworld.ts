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

    const interval = setInterval(() => post(readState()), 250)

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
