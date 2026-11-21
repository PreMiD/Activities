SyncScript.register({
  setup(ctx) {
    ctx.features({ video: true })

    const video = document.querySelector('video')
    const handle = video ? ctx.video.attach(video) : undefined

    ctx.setPageInfo({ title: document.title })

    return () => handle?.detach()
  },
})
