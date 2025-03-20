const iframe = new iFrame()

iframe.on('UpdateData', async () => {
  if (document.querySelector<HTMLSpanElement>('span.liveText')) {
    iframe.send({
      live: document.querySelector<HTMLSpanElement>('span.liveText'),
    })
  }
  else if (document.querySelector<HTMLSpanElement>('span.timelabel')) {
    iframe.send({
      currentTime: document.querySelector<HTMLSpanElement>('span.timelabel')?.textContent,
      duration: document.querySelector<HTMLSpanElement>('span.vduration')?.textContent,
      paused: document
        .querySelector<HTMLButtonElement>(
          '#videocontrols > div.controlsleft > button',
        )
        ?.textContent
        ?.includes('play'),
    })
  }
})
