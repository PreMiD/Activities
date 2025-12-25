const iframe = new iFrame()
let lastUrl = ''

iframe.on('UpdateData', async () => {
    const { pathname, hash } = document.location
    const currentUrl = pathname + hash

    if (currentUrl !== lastUrl) {
        console.log(`[ShinyColors Iframe] Path: ${pathname}, Hash: ${hash}`)
        lastUrl = currentUrl
        await iframe.send({
            pathname,
            hash
        })
    }
})
