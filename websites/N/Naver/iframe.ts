const iframe = new iFrame()

iframe.on('UpdateData', () => {
  if (document.querySelector('.se-documentTitle span')) {
    iframe.send({
      blog: document.querySelector('.se-documentTitle span')?.textContent?.trim(),
    })
  }
})
