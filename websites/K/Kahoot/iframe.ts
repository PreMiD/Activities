const iframe = new iFrame()
iframe.on('UpdateData', async () => {
  const name = document.querySelector(
    'main[data-functional-selector="launch-page"] div[dir="auto"] > div',
  )?.textContent
  if (name)
    iframe.send(name)
})
