import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '1470135877656252619',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

const ActivityAssets = {
  Logo: 'https://i.imgur.com/nzdDKtJ.png',
}
const strings = presence.getStrings({
  play: 'general.playing',
  pause: 'general.paused',
})

function timeToSeconds(timeStr: string): number {
  if (!timeStr) {
    return 0
  }

  const cleanStr = timeStr.replace(/[^\d:]/g, '')
  const parts = cleanStr.split(':')

  if (parts.length < 2) {
    return 0
  }

  const minutes = Number.parseInt(parts[0] || '0', 10)
  const seconds = Number.parseInt(parts[1] || '0', 10)

  return minutes * 60 + seconds
}

presence.on('UpdateData', async () => {
  const songInfo = document.querySelector('.song_info')
  const playerCtrl = document.querySelector('.player_controller')
  const playBtn = document.querySelector('.btn_now')

  const songLink = songInfo?.querySelector('.song_area .song .link')
  const title = songLink?.textContent?.trim()
  const artist = songInfo?.querySelector('.artist .link_artist')?.textContent?.trim()

  const albumElement = songInfo?.querySelector('.option_area .dropdown_wrap .ly_option .ly_song_info a.ly_info_album')
  const album = albumElement?.getAttribute('title')?.trim() || ''
  const url = songLink?.getAttribute('href')?.trim() || null

  if (!title) {
    presence.setActivity({
      details: 'Selecting',
      startTimestamp: browsingTimestamp,
      largeImageKey: ActivityAssets.Logo,
    })
    return
  }

  const isPlaying = playBtn?.classList.contains('play')

  const thumbDiv = songInfo?.querySelector('.thumb .img') as HTMLElement | null
  let imageUrl: string = ActivityAssets.Logo
  if (thumbDiv?.style.backgroundImage) {
    const match = thumbDiv.style.backgroundImage.match(/url\(["']?([^"']+)["']?\)/)
    if (match && match[1]) {
      imageUrl = match[1]
    }
  }

  const presenceData: PresenceData = {
    details: title,
    state: artist || 'Unknown Artist',
    largeImageKey: imageUrl,
    largeImageText: album,
    smallImageKey: isPlaying ? Assets.Play : Assets.Pause,
    smallImageText: isPlaying
      ? (await strings).play
      : (await strings).pause,
    type: ActivityType.Listening,
  }

  if (url) {
    presenceData.buttons = [
      {
        label: 'Listen on LINE MUSIC',
        url: `https://music.line.me${url}`,
      },
    ]
  }

  if (isPlaying) {
    const nowStr = playerCtrl?.querySelector('.playtime .now')?.textContent ?? ''
    const totalStr = playerCtrl?.querySelector('.playtime .remain')?.textContent ?? ''
    const nowSeconds = timeToSeconds(nowStr)
    const totalSeconds = timeToSeconds(totalStr)

    presenceData.startTimestamp = Math.floor(Date.now() / 1000) - nowSeconds
    presenceData.endTimestamp = Math.floor(Date.now() / 1000) + (totalSeconds - nowSeconds)
  }
  else {
    delete presenceData.startTimestamp
    delete presenceData.endTimestamp
  }

  presence.setActivity(presenceData)
})
