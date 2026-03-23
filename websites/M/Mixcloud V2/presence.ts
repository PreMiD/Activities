import { Assets, ActivityType, StatusDisplayType } from 'premid'

const presence = new Presence({
  clientId: '1485354695961743402',
})
const strings = presence.getStrings({
  play: 'general.playing',
  pause: 'general.paused',
  live: 'general.live',
})

let author: string | null | undefined,
  title: string | null | undefined,
  url: string | null | undefined,
  openUrlText: string | null | undefined

const browsingTimestamp = Math.floor(Date.now() / 1000)

// ฟังก์ชันแปลงเวลา 01:06:25 ให้กลายเป็นวินาที
function getSeconds(timeStr: string | null | undefined): number {
  if (!timeStr) return 0
  const parts = timeStr.split(':').map(Number)
  if (parts.length === 3) return (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0)
  if (parts.length === 2) return (parts[0] || 0) * 60 + (parts[1] || 0)
  return 0
}

presence.on('UpdateData', async () => {
  const playerContainer = document.querySelector('[data-testid="player-container"]')
  const liveContainer = document.querySelector('[class^=LiveVideo__VideoContainer]') // เผื่อกรณี Live ยังใช้ UI เก่า

  let pfp: string | undefined

  if (playerContainer || liveContainer) {
    let isPlaying = false
    let isLive = false

    if (playerContainer) {
      isPlaying = !!document.querySelector('[data-testid="player-play-button-Pause"]')
      const titleEl = document.querySelector('[data-testid="player-show-title"]')

      title = titleEl?.textContent
      url = titleEl ? new URL(titleEl.getAttribute('href') ?? '', window.location.origin).href : undefined
      openUrlText = 'Listen to Show'

      // ดึงชื่อคนที่อัปโหลด (DJ)
      author = titleEl?.parentElement?.querySelector('p')?.textContent
        || document.querySelector('[data-testid="player-show-title"]')?.nextElementSibling?.textContent

      // ดึงปกเพลง และปรับขนาดเป็น 1080x1080
      const coverImg = document.querySelector('[data-testid="player-container"] img') as HTMLImageElement
      if (coverImg && coverImg.src) {
        pfp = coverImg.src.replace(/\/\d+x\d+\//, '/1080x1080/')
      }
    }
    else if (liveContainer) {
      isPlaying = document.querySelector('[class^=LiveVideo__VideoContainer] .shaka-play-button')?.getAttribute('icon') === 'pause'
      url = window.location.href
      openUrlText = 'View Livestream'
      title = document.querySelector('[class^=\'LiveStreamDetails__StreamTitleContainer\'] > h4')?.textContent
      author = document.querySelector('[class^=\'LiveStreamStreamerDetails__StreamerDetailsTextContainer\'] h4')?.textContent
      isLive = true
    }

    // ถ้าไม่มีการเล่นรายการใดเลย ให้โชว์สถานะกำลังเรียกดูเว็บ
    if (!title) {
      presence.setActivity({
        type: ActivityType.Watching,
        details: 'Browsing Mixcloud',
        largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/M/Mixcloud/assets/logo.png',
        startTimestamp: browsingTimestamp
      })
      return
    }

    const presenceData: PresenceData = {
      type: ActivityType.Listening,
      statusDisplayType: StatusDisplayType.Details,
      details: title,
      largeImageKey: pfp || 'https://cdn.rcd.gg/PreMiD/websites/M/Mixcloud/assets/logo.png',
      smallImageKey: isLive ? Assets.Live : (isPlaying ? Assets.Play : Assets.Pause),
      smallImageText: isLive ? (await strings).live : (isPlaying ? (await strings).play : (await strings).pause),
    }

    if (author) presenceData.state = author

    // สร้างปุ่ม (Buttons)
    if (url && openUrlText) {
      presenceData.buttons = [{ label: openUrlText, url: url }]
    }

    // จับเวลา (Timestamps)
    if (isPlaying && !isLive) {
      const currentSeconds = getSeconds(document.querySelector('[data-testid="startTime"]')?.textContent)
      const totalSeconds = getSeconds(document.querySelector('[data-testid="endTime"]')?.textContent)
      const nowSeconds = Math.floor(Date.now() / 1000)

      if (currentSeconds > 0) {
        presenceData.startTimestamp = nowSeconds - currentSeconds
        if (totalSeconds > 0) {
          presenceData.endTimestamp = presenceData.startTimestamp + totalSeconds
        }
      }
    }

    presence.setActivity(presenceData)
  } else {
    // ถ้าไม่มี player เลย แสดงว่าแค่เปิดดูเว็บเฉยๆ 
    presence.setActivity({
      type: ActivityType.Watching,
      details: 'Browsing Mixcloud',
      largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/M/Mixcloud/assets/logo.png',
      startTimestamp: browsingTimestamp
    })
  }
})