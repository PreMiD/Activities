SyncScript.register({
  setup(ctx) {
    ctx.features({ video: true })

    const video = document.querySelector('video')
    if (video)
      ctx.video.attach(video)

    ctx.setPageInfo({ title: document.title })
  },
})
