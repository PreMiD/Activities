import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1166473264990797924',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/M/MineKeo%20Network/assets/logo.png',
}

// Counters on the site show "--" until their data loads and "!" on error.
function readCount(selector: string): number | null {
  const text = document.querySelector(selector)?.textContent?.trim()
  return text && /^\d+$/.test(text) ? Number(text) : null
}

presence.on('UpdateData', async () => {
  // The same page is reachable as /vote, /vote/ and /vote.php.
  const path = document.location.pathname
    .replace(/\.php$/, '')
    .replace(/\/+$/, '') || '/'

  if (path.startsWith('/admin')) {
    presence.clearActivity()
    return
  }

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  if (await presence.getSetting<boolean>('privacy')) {
    presenceData.details = 'Đang xem website'
  }
  else if (path === '/' || path === '/index') {
    presenceData.details = 'Đang xem trang chủ'
    const online = readCount('#stat-online')
    if (online !== null) {
      presenceData.state = `${online} người đang online`
    }
  }
  else if (path === '/vote') {
    presenceData.details = 'Đang vote cho server'
  }
  else if (path.includes('diemdanh')) {
    presenceData.details = 'Đang điểm danh hằng ngày'
    const streak = readCount('#stat-streak')
    if (streak !== null) {
      presenceData.state = `Chuỗi ${streak} ngày liên tiếp`
    }
  }
  else if (path === '/rules') {
    presenceData.details = 'Đang đọc luật server'
    presenceData.smallImageKey = Assets.Reading
  }
  else if (path === '/quy-dinh-ung-ho' || path === '/donate-policy') {
    presenceData.details = 'Đang đọc quy định ủng hộ'
    presenceData.smallImageKey = Assets.Reading
  }
  else if (path.startsWith('/ungho') || path.startsWith('/naptien')) {
    presenceData.details = 'Đang ủng hộ server'
  }
  else {
    presenceData.details = 'Đang xem website'
  }

  presence.setActivity(presenceData)
})
