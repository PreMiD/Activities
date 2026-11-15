SyncScript.register({
  setup(ctx) {
    ctx.features({ cursor: false, scroll: false })

    let lastPageInfoKey: string | null = null

    function musicPageInfo() {
      const metadata = navigator.mediaSession?.metadata
      return {
        title: metadata?.title || document.querySelector<HTMLElement>('ytmusic-player-bar .title')?.textContent?.trim(),
        uploader: metadata?.artist || document.querySelector<HTMLElement>('ytmusic-player-bar .byline a')?.textContent?.trim(),
        thumbnail: metadata?.artwork?.at(-1)?.src || document.querySelector<HTMLImageElement>('ytmusic-player-bar img.image')?.src,
      }
    }

    function updatePageInfo() {
      if (location.hostname === 'music.youtube.com') {
        const { title, uploader, thumbnail } = musicPageInfo()
        const key = `${title}|${uploader}|${thumbnail}`
        if (key === lastPageInfoKey)
          return
        lastPageInfoKey = key
        ctx.setPageInfo({ title: title || undefined, subtitle: uploader || undefined, thumbnail: thumbnail || undefined })
        return
      }

      const title
        = document.querySelector<HTMLElement>('#title h1 yt-formatted-string')?.textContent
          ?? document.querySelector<HTMLElement>('ytm-slim-video-metadata-section-renderer h2 span')?.textContent
          ?? document.title

      const uploader
        = document.querySelector<HTMLElement>('#owner #channel-name yt-formatted-string a')?.textContent
          ?? document.querySelector<HTMLElement>('ytm-slim-owner-renderer .slim-owner-channel-name')?.textContent

      const thumbnail = document.querySelector<HTMLMetaElement>('meta[property="og:image"]')?.content

      const key = `${title}|${uploader}|${thumbnail}`
      if (key === lastPageInfoKey)
        return
      lastPageInfoKey = key

      ctx.setPageInfo({
        title: title || undefined,
        subtitle: uploader || undefined,
        thumbnail: thumbnail || undefined,
      })
    }

    function reportAd() {
      // Hover previews are separate players that can show ads of their own.
      const inAd = !!document.querySelector('#movie_player.ad-showing, #movie_player.ad-interrupting, #movie_player .ytp-ad-player-overlay')
      // The runtime drops repeats, so the state is sent every tick and reaches the party from the start.
      ctx.video.reportAd(inAd)
    }

    function tick() {
      updatePageInfo()
      reportAd()
    }

    tick()
    const poll = setInterval(tick, 500)

    return () => clearInterval(poll)
  },
})
