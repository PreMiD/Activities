const iframe = new iFrame()
let lastUrl = ''

iframe.on('UpdateData', async () => {
  const { pathname, hash } = document.location
  const currentUrl = pathname + hash

  if (currentUrl !== lastUrl) {
    lastUrl = currentUrl
    await iframe.send({
      pathname,
      hash,
    })
  }
})
