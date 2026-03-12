const iframe = new iFrame()
let videoMessage: {
  paused: boolean
  duration: number
  currentTime: number
}

iframe.on('UpdateData', async () => {
  const title = document.querySelector('div.vjs-title-control > div')
  const season = document.querySelector(
    'div.episode-selector.episode-selector-container > h3',
  )
  const video = document.querySelector<HTMLVideoElement>('video')

  if (video) {
    videoMessage = {
      paused: video.paused,
      duration: video.duration,
      currentTime: video.currentTime,
    }
  }

  if (!title || !title.textContent)
    return

  // Series

  if (title.textContent.includes('Bölüm')) {
    const titleArr = title.textContent.split('.')
    const epTitle = `${titleArr[0]?.charAt(titleArr[0].length - 1)}.${titleArr[1]}`

    iframe.send({
      video: {
        ...videoMessage,
      },
      series: {
        name: title.textContent.charAt(0) !== epTitle.split('.')[0]
          ? title.textContent.replace(new RegExp(epTitle, 'g'), '')
          : null,
        ep: epTitle,
        season: season && season.textContent && season.textContent.includes('Sezon')
          ? season.textContent
          : '1. Sezon',
      },
    })
  }
  else {
    // Movies
    iframe.send({
      video: {
        ...videoMessage,
      },
      movie: {
        name: title.textContent,
      },
    })
  }
})
