const iframe = new iFrame()

iframe.on('UpdateData', async () => {
  const video = document.querySelector<HTMLVideoElement>('video')

  if (video && !Number.isNaN(video.duration)) {
    iframe.send({
      currentTime: video.currentTime,
      duration: video.duration,
      paused: video.paused,
      title: document.querySelector('a.ytp-title-link.yt-uix-sessionlink')
        ?.textContent || 'Unknown',
      channel: document.querySelector(
        'div.ytp-title-channel h2.ytp-title-expanded-title a',
      )?.textContent || 'Unknown',
      url: document.querySelector<HTMLAnchorElement>(
        'a.ytp-youtube-button.ytp-button.yt-uix-sessionlink',
      )?.href,
    })
  }
})
