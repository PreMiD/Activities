import { Assets } from 'premid'

const presence = new Presence({
  clientId: '612746548631044116',
})
const strings = presence.getStrings({
  play: 'general.playing',
  pause: 'general.paused',
})
function truncateBefore(str: string, pattern: string): string {
  return str.slice(str.indexOf(pattern) + pattern.length)
}
function truncateAfter(str: string, pattern: string): string {
  return str.slice(0, str.indexOf(pattern))
}
function getSeconds(minutes: number, seconds: number): number {
  return Number(Math.floor(minutes * 60)) + Number(seconds)
}
const pattern = ':'

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    details: 'Unknown page',
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/A/Astiga/assets/logo.png',
  }

  const currentUser = document.querySelector(
    '#jp_container_1 > div.wrapper > aside.main-sidebar > section > div > div.pull-left.info > p',
  )

  const currentArtist = document.querySelector(
    '#jp_container_1 > div.wrapper > footer > div.jp-controls > div.btn-music-container > div:nth-child(1) > div:nth-child(2) > a.song-artist.menu-item',
  )

  const musicTitle = document.querySelector(
    '#jp_container_1 > div.wrapper > footer > div.jp-controls > div.btn-music-container > div:nth-child(1) > div.song-title.overflow',
  )

  const albumName = document.querySelector(
    'footer > div.jp-controls > div.btn-music-container > div:nth-child(1) > div:nth-child(2) > a.song-album.menu-item',
  )

  if (musicTitle?.textContent && musicTitle.textContent.length > 1) {
    const play = document.querySelector<HTMLAnchorElement>(
      'footer > div.jp-controls > div.btn-music-container > div:nth-child(2) > a.jp-play.btn.btn-music.btn-sm',
    )

    const currentMinutesString = document.querySelector(
      '#jp_container_1 > div.wrapper > footer > div.jp-controls > div.btn-music-container > div.hidden-xs > span.jp-current-time',
    )

    const currentMinutes = truncateAfter(currentMinutesString?.textContent ?? '', pattern)

    const currentSecondsString = document.querySelector(
      '#jp_container_1 > div.wrapper > footer > div.jp-controls > div.btn-music-container > div.hidden-xs > span.jp-current-time',
    )

    const currentSeconds = truncateBefore(currentSecondsString?.textContent ?? '', pattern)

    const minutesDurationString = document.querySelector(
      '#jp_container_1 > div.wrapper > footer > div.jp-controls > div.btn-music-container > div.hidden-xs > span.jp-duration',
    )

    const minutesDuration = truncateAfter(minutesDurationString?.textContent ?? '', pattern)

    const secondsDurationString = document.querySelector(
      '#jp_container_1 > div.wrapper > footer > div.jp-controls > div.btn-music-container > div.hidden-xs > span.jp-duration',
    )

    const secondsDuration = truncateBefore(
      secondsDurationString?.textContent ?? '',
      pattern,
    )

    const currentTime = getSeconds(
      Number.parseInt(currentMinutes),
      Number.parseInt(currentSeconds),
    )

    const duration = getSeconds(
      Number.parseInt(minutesDuration),
      Number.parseInt(secondsDuration),
    )

    let playback = false
    if (!play?.style.display || currentTime === 0)
      playback = false
    else playback = true

    presenceData.details = `Song: ${musicTitle.textContent}`

    if (
      albumName?.textContent
      && currentArtist?.textContent
      && albumName.textContent.length > 0
      && currentArtist.textContent.length > 0
    ) {
      presenceData.state = `${currentArtist.textContent} / ${albumName.textContent}`
    }
    else if (
      albumName?.textContent
      && albumName.textContent.length === 0
      && currentArtist?.textContent
      && currentArtist.textContent.length > 0
    ) {
      presenceData.state = `${currentArtist.textContent} / No album`
    }
    else if (
      albumName?.textContent
      && albumName.textContent.length > 0
      && currentArtist?.textContent
      && currentArtist.textContent.length === 0
    ) {
      presenceData.state = `No artist / ${albumName.textContent}`
    }
    else if (
      albumName?.textContent
      && albumName.textContent.length === 0
      && currentArtist?.textContent
      && currentArtist.textContent.length === 0
    ) {
      presenceData.state = 'No artist / No album'
    }

    presenceData.smallImageKey = playback ? Assets.Play : Assets.Pause

    presenceData.smallImageText = playback
      ? (await strings).play
      : (await strings).pause;

    [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(Math.floor(currentTime), Math.floor(duration))

    if (playback === false) {
      delete presenceData.startTimestamp

      delete presenceData.endTimestamp
    }
  }
  else {
    presenceData.details = 'No music playing.'

    presenceData.state = `Logged in user: ${currentUser?.textContent}`
  }

  presence.setActivity(presenceData)
})
