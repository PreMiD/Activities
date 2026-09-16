// This file runs INSIDE the iframe that holds the live player (confirmed —
// the video is embedded there, not on the main page). It reads the <video>
// tag from its own document and sends the state out to presence.ts, which
// can't reach into the iframe directly.
//
// Still needed in metadata.json:
//   "iframe": true,
//   "iFrameRegExp": "<pattern matching the iframe's src>"

const iframe = new iFrame()

iframe.on('UpdateData', async () => {
  const video = document.querySelector<HTMLVideoElement>('video')

  if (video) {
    iframe.send({
      video: {
        paused: video.paused,
        ended: video.ended,
        readyState: video.readyState,
        currentTime: video.currentTime,
        duration: video.duration,
      },
    })
  }
})
