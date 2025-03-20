const iframe = new iFrame()

iframe.on('UpdateData', async () => {
  if (document.querySelector<HTMLUListElement>('ul.mailbox-list')) {
    iframe.send({
      currentMailbox: document.querySelector<HTMLParagraphElement>(
        'ul.mailbox-list li.mailbox-list-item[aria-selected=true] p',
      )?.textContent ?? 'Unknown',
      currentMailSubject: document.querySelector<HTMLHeadingElement>(
        'div.ic-neqjca h2.ic-1ngj2ga',
      )?.textContent,
      currentMailSender: document.querySelector<HTMLSpanElement>(
        'div.ic-gg4vpm span.ic-x1z554',
      )?.textContent,
    })
  }
})
