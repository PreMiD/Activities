import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1396506033890922496',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/H/Hdfilmcehennemi/assets/logo.png',
}

let iframePlayback = false
let currTime = 0
let durTime = 0
let isPaused = true
let mainTitle: string | null = null
let germanTitle: string | null = null
let year: string | null = null

presence.on('iFrameData', (data: any) => {
  if (data.iFrameVideoData) {
    iframePlayback = true
    currTime = data.iFrameVideoData.currTime
    durTime = data.iFrameVideoData.dur
    isPaused = data.iFrameVideoData.paused
  }
})

presence.on('UpdateData', async () => {
  const { pathname, href } = document.location

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    type: ActivityType.Watching,
    startTimestamp: browsingTimestamp,
    endTimestamp: undefined,
    details: 'Viewing hdfilmcehennemi.nl',
  }

  // Player Reproduction
  const player = document.querySelector('#router > div.player-container')
  if (player) {
    // Movie Title As Name
    presenceData.name = document.querySelector('.section-title')?.childNodes[0]?.textContent?.trim()
    const categoryLinks = document.querySelectorAll('.post-info-cats a')
    const categories = Array.from(categoryLinks).map(a => a.textContent?.trim())
    presenceData.state = categories.join(' · ')
    presenceData.largeImageText = `Watching: ${mainTitle || 'Unknow Movie'}`

    if (iframePlayback) {
      presenceData.smallImageKey = isPaused ? Assets.Pause : Assets.Play
      presenceData.smallImageText = isPaused ? 'Paused' : 'Playing'
    }

    if (!isPaused) {
      const [startTs, endTs] = getTimestamps(
        Math.floor(currTime),
        Math.floor(durTime),
      )
      presenceData.startTimestamp = startTs
      presenceData.endTimestamp = endTs
    }
    else {
      delete presenceData.startTimestamp
      delete presenceData.endTimestamp
    }
  }

  if (pathname === '/') {
    presenceData.details = 'Viewing home page'
  }
  else {
    const h1 = document.querySelector('h1.section-title')
    if (h1 instanceof HTMLElement) {
      const first = h1.firstChild
      const small = h1.querySelector('small')

      mainTitle = first?.textContent?.trim().replace(/ izle$/, '') ?? null

      const smallText = small?.textContent?.trim() ?? null
      if (smallText) {
        const match = smallText.match(/^(.*)\s\((\d{4})\)$/)
        if (match) {
          germanTitle = match[1] ?? null
          year = match[2] ?? null
        }
      }
    }

    const detailsText = `${mainTitle} · ${germanTitle} · ${year}`
    presenceData.details = detailsText
    presenceData.buttons = [
      {
        label: 'Watch Together',
        url: href,
      },
    ]
  }
  presence.setActivity(presenceData)
})
