const iframe = new iFrame()
const bufferingHold = 3500
let lastBufferingAt = 0

function isIgnoredHost(): boolean {
  return /(?:youtube(?:-nocookie)?\.com|youtu\.be)$/i.test(document.location.hostname)
}

function isVisible(element: Element): boolean {
  const htmlElement = element as HTMLElement
  const rect = htmlElement.getBoundingClientRect()

  if (rect.width <= 0 || rect.height <= 0)
    return false

  const style = window.getComputedStyle(htmlElement)

  return style.display !== 'none'
    && style.visibility !== 'hidden'
    && style.visibility !== 'collapse'
    && Number.parseFloat(style.opacity || '1') > 0.01
}

function getVideo(): HTMLVideoElement | undefined {
  return (Array.from(document.querySelectorAll('video')) as HTMLVideoElement[])
    .filter(video => isVisible(video) && Boolean(video.currentSrc || video.src || video.duration))
    .sort((first, second) => {
      const firstRect = first.getBoundingClientRect()
      const secondRect = second.getBoundingClientRect()

      return secondRect.width * secondRect.height - firstRect.width * firstRect.height
    })[0]
}

function hasLoadingSignal(): boolean {
  const loadingElements = Array.from(
    document.querySelectorAll(
      '[aria-busy="true"], [role="status"], [class*="buffer"], [class*="loader"], [class*="loading"], [class*="progress"], [class*="spinner"], [class*="animate-spin"]',
    ),
  ) as HTMLElement[]

  if (
    loadingElements.some(element =>
      isVisible(element)
      && /buffer|connect|fetch|load|prepar|progress|spin|wait|animate-spin/i.test(`${element.textContent ?? ''} ${element.className}`),
    )
  ) {
    return true
  }

  return /buffering|loading|please wait|preparing stream|connecting|fetching stream/i.test(document.body?.textContent ?? '')
}

function isBuffering(video?: HTMLVideoElement): boolean {
  const waitingForVideo = !video && hasLoadingSignal()

  if (waitingForVideo) {
    lastBufferingAt = Date.now()
    return true
  }

  if (!video || video.paused || video.ended)
    return false

  const waitingForData = video.seeking
    || video.readyState < video.HAVE_FUTURE_DATA
    || (video.networkState === video.NETWORK_LOADING && video.readyState < video.HAVE_ENOUGH_DATA)

  if (waitingForData || hasLoadingSignal())
    lastBufferingAt = Date.now()

  return Date.now() - lastBufferingAt < bufferingHold
}

iframe.on('UpdateData', () => {
  if (isIgnoredHost())
    return

  const video = getVideo()

  if (!video) {
    iframe.send({
      buffering: isBuffering(),
      title: document.title,
      src: document.location.href,
    })
    return
  }

  iframe.send({
    buffering: isBuffering(video),
    paused: video.paused,
    currentTime: Number.isFinite(video.currentTime) ? video.currentTime : 0,
    duration: Number.isFinite(video.duration) ? video.duration : 0,
    title: document.title,
    src: video.currentSrc || video.src,
  })
})
