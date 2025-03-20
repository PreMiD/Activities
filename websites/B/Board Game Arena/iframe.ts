const iframe = new iFrame()

iframe.on('UpdateData', async () => {
  const forumTitle = document.querySelector<HTMLAnchorElement>('h2 a')
  if (forumTitle) {
    iframe.send({
      title: forumTitle.textContent,
      url: forumTitle.href,
    })
  }
})
