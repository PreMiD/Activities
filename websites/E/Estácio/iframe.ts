const iframe = new iFrame()

export interface IframeData {
  topic: string | null
}

iframe.on('UpdateData', async () => {
  const currentTopic = document.querySelector(
    'aside[data-testid=\'menu\'] li[data-selected=\'true\'] p',
  )?.textContent || null

  const data: IframeData = {
    topic: currentTopic,
  }

  iframe.send(data)
})
