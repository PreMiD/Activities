SyncMainworldScript.register({
  setup(ctx) {
    function getPlayer() {
      const el = document.querySelector('disney-web-player') as any
      return el?.mediaPlayer ?? null
    }

    const interval = setInterval(() => {
      const mp = getPlayer()
      if (!mp)
        return

      const status = mp.playbackStatus
      const info = mp.timeline?.info
      const metadata = mp.mediaPlaybackCriteria?.metadata

      ctx.content.send('state', {
        playing: !!status?.playing,
        paused: !!status?.paused,
        buffering: (status?.currentState === 'SEEKING' && !status?.paused) || !!status?.buffering,
        currentTime: info ? info.playheadPositionMs / 1000 : 0,
        duration: info ? info.seekableDurationMs / 1000 : 0,
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
