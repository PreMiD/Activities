const iframe = new iFrame()

interface QuizletWindow {
  dataLayer?: {
    event: string
  }[]
}

iframe.on('UpdateData', async () => {
  const quizlet = window as QuizletWindow
  if (!quizlet.dataLayer)
    return

  iframe.send({
    layer: quizlet.dataLayer.find(
      layer => layer.event === 'dataLayer-initialized',
    ),
    searchLayer: quizlet.dataLayer.find(layer => layer.event === 'Search'),
  })
})
