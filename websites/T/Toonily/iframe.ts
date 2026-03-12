import { Assets } from 'premid'

const iframe = new iFrame()

iframe.on('UpdateData', async () => {
  const comment = document.querySelector<HTMLDivElement>('div.textarea')
  if (comment) {
    iframe.send({
      writing: comment.textContent && comment.textContent.length > 1,
      details: 'Writing Comment',
      smallImageKey: Assets.Writing,
    })
  }
})
