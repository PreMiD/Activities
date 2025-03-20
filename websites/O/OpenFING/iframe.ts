const iframe = new iFrame()
iframe.on('UpdateData', async () => {
  if (document.querySelector('video'))
    iframe.send(Math.floor(document.querySelector('video')!.currentTime))
})
