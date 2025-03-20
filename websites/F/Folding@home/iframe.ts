const iframe = new iFrame()

iframe.on('UpdateData', async () => {
  const points = document.querySelector('#box-points-team > a')
  const progress = document.querySelector(
    '#slot-0 > div.pu > div.pu-bar.ui-progressbar.ui-widget.ui-widget-content.ui-corner-all > div',
  )
  if (progress && points) {
    iframe.send({
      info: {
        points: points.textContent,
        progress: progress.textContent,
      },
    })
  }
})
