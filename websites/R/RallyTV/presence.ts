import { ActivityType } from 'premid'

const presence = new Presence({
  clientId: '1464394386170446077',
})
let lastTitle = ''

presence.on('UpdateData', () => {
  const h4Element = document.querySelector('main h4')
  const liveContainer = document.querySelector('.live')
  const docTitle = document.title

  let fullTitle = ''
  let isReplay = false

  if (h4Element && docTitle.includes(h4Element.textContent?.trim() || '')) {
    fullTitle = h4Element.textContent?.trim() || ''
    isReplay = true
  }
  else if (liveContainer) {
    const liveTitleElement = liveContainer.querySelector('p span')
    fullTitle = liveTitleElement?.textContent?.trim() || ''
  }

  if (!fullTitle || fullTitle === '') {
    fullTitle = 'Browsing Events'
  }

  fullTitle = fullTitle.replace(/^['"]+|['"]+$/g, '')

  if (fullTitle !== lastTitle) {
    const parts = fullTitle.split('|').map(p => p.trim())
    let detailsText = ''
    let stateText = ''

    if (isReplay) {
      detailsText = parts[0] || ''
      stateText = parts[1] || 'Replay'
    }
    else {
      detailsText = parts[1] || parts[0] || ''
      stateText = parts[0] || ''
    }

    const presenceData: PresenceData = {
      type: ActivityType.Watching,
      details: detailsText,
      state: stateText,
      largeImageKey: 'logo',
    }

    presence.setActivity(presenceData)
    lastTitle = fullTitle
  }
})
