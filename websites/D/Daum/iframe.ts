const iframe = new iFrame()

iframe.on('UpdateData', () => {
  if (document.querySelector('video')) {
    const video = document.querySelector<HTMLVideoElement>('video')!

    iframe.send({
      video: {
        duration: video.duration,
        currentTime: video.currentTime,
        paused: video.paused,
        title: document.querySelector('span.link_title')?.textContent,
      },
    })
  }

  if (document.location.hostname === 'cafe.daum.net') {
    iframe.send({
      cafe: {
        name: document
          .querySelector('#cafe_info_outer > div.cafename')
          ?.textContent
          ?.trim(),
        title: (
          document.querySelector('strong.tit_item')
          ?? document.querySelector('h3.title')
        )?.textContent?.trim(),
        article: document
          .querySelector('strong.tit_info > b')
          ?.textContent
          ?.trim(),
      },
    })
  }
})
