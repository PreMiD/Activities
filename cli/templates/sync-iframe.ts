SyncIframeScript.register({
  setup(ctx) {
    const video = document.querySelector('video')
    if (video)
      ctx.video.setElement(video)
  },
})
