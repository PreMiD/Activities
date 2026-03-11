export interface IFrameData {
  currentTime: number
  duration: number
  paused: boolean
  thumbnail: string | undefined
}

const iframe = new iFrame()

iframe.on('UpdateData', async () => {
  const video = document.querySelector<HTMLVideoElement>(
    '#vjs_video_3_html5_api',
  )
  if (video) {
    const data: IFrameData = {
      currentTime: video.currentTime,
      duration: video.duration,
      paused: video.paused,
      thumbnail: document.querySelector<HTMLImageElement>(
        '#vjs_video_3 > div.vjs-poster > picture > img',
      )?.src,
    }

    iframe.send(data)
  }
})
