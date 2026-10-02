import { sampleVideo } from './media.js'

const iframe = new iFrame()
let token = ''

function sendSample() {
  if (!token)
    return
  const videos = [...document.querySelectorAll<HTMLVideoElement>('video')]
    .filter(video => video.getClientRects().length > 0
      && !video.closest('.jw-flag-ads, .video-ads, [data-ad="true"]'))
  // Ambiguous player layouts are reported as unavailable, never guessed.
  iframe.send({
    source: 'french-stream',
    token,
    sample: videos.length === 1 ? sampleVideo(videos[0]!) : null,
  })
}

// Only the parent-selected main player receives a challenge. Ad and trailer
// frames never get a token, even though their domains can match iFrameRegExp.
window.addEventListener('message', (event: MessageEvent) => {
  if (window.parent === window || event.source !== window.parent
    || event.data?.source !== 'french-stream-request'
    || typeof event.data.token !== 'string' || event.data.token.length > 100) {
    return
  }
  token = event.data.token
  sendSample()
})

iframe.on('UpdateData', sendSample)
for (const event of ['play', 'playing', 'pause', 'seeked', 'ended', 'emptied', 'ratechange'])
  document.addEventListener(event, sendSample, true)
