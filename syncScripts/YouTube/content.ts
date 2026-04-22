SyncScript.register({
  setup(ctx) {
    ctx.features({ cursor: false, scroll: false })

    let lastPageInfoKey: string | null = null

    function updatePageInfo() {
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

    let lastAdState: boolean | null = null

    function detectAd() {
      const inAd = !!document.querySelector('.ad-showing, .ytp-ad-player-overlay')
      if (inAd === lastAdState)
        return
      lastAdState = inAd
      ctx.video.reportAd(inAd)
    }

    let debounceTimer: ReturnType<typeof setTimeout> | null = null

    const observer = new MutationObserver(() => {
      if (debounceTimer)
        return
      debounceTimer = setTimeout(() => {
        debounceTimer = null
        updatePageInfo()
        detectAd()
      }, 250)
    })

    function start(root: Node) {
      updatePageInfo()
      detectAd()
      observer.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] })
    }

    if (document.body) {
      start(document.body)
    }
    else {
      const bodyObserver = new MutationObserver(() => {
        if (document.body) {
          bodyObserver.disconnect()
          start(document.body)
        }
      })
      bodyObserver.observe(document.documentElement, { childList: true })
    }

    const adPoll = setInterval(detectAd, 500)

    return () => {
      observer.disconnect()
      clearInterval(adPoll)
    }
  },
})
