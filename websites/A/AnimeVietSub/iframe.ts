import type { PrivacyCommandMessage } from './privacy.js'
import {
  isPrivacyStateMessage,
  PRIVACY_MESSAGE_SOURCE,
} from './privacy.js'
import {
  ensurePrivacyButton,
  removePrivacyButton,
} from './privacyUi.js'

const iframe = new iFrame()
let privateMode = false
let privacyButtonShown = false
let hasPrivacyState = false
let lastStateRequest = 0

function sendPrivacyCommand(type: PrivacyCommandMessage['type']): void {
  window.top?.postMessage({ source: PRIVACY_MESSAGE_SOURCE, type }, '*')
}

function togglePrivacy(): void {
  if (!privacyButtonShown)
    return

  privateMode = !privateMode
  ensurePrivacyButton(document, privateMode, togglePrivacy)
  sendPrivacyCommand('toggle')
}

function syncPrivacyButton(): void {
  if (privacyButtonShown)
    ensurePrivacyButton(document, privateMode, togglePrivacy)
  else
    removePrivacyButton(document)
}

window.addEventListener('message', (event) => {
  if (event.source !== window.top || !isPrivacyStateMessage(event.data))
    return

  privateMode = event.data.privateMode
  privacyButtonShown = event.data.privacyButtonShown
  hasPrivacyState = true
  syncPrivacyButton()
})

iframe.on('UpdateData', async () => {
  const video = document.querySelector<HTMLVideoElement>('video')
  if (video && !Number.isNaN(video.duration)) {
    if (hasPrivacyState) {
      syncPrivacyButton()
    }
    else if (Date.now() - lastStateRequest > 2000) {
      lastStateRequest = Date.now()
      sendPrivacyCommand('request-state')
    }

    iframe.send({
      duration: video.duration,
      currTime: video.currentTime,
      paused: video.paused,
    })
  }
})
