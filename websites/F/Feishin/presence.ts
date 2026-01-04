import { ActivityType, getTimestamps, timestampFromFormat } from 'premid'

const presence = new Presence({
  clientId: '1457416186940620820',
})

enum ActivityAssets {
  Logo = 'https://raw.githubusercontent.com/jeffvli/feishin/refs/heads/development/assets/icons/icon.png',
}

async function getStrings() {
  return presence.getStrings(
    {
      pause: 'general.paused',
      play: 'general.playing',
    },
  )
}
function getElement(query: string): string | undefined {
  let text: string | undefined = ''

  const element = document.querySelector(query)
  if (element) {
    if (element.childNodes.length > 1)
      text = element.childNodes[0]?.textContent ?? undefined
    else text = element.textContent ?? undefined
  }
  return text?.trimStart().trimEnd()
}

let strings: Awaited<ReturnType<typeof getStrings>>

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    type: ActivityType.Listening,
    largeImageKey: ActivityAssets.Logo,
  }

  const isPlaying = Boolean(document.querySelector('button.player-state-playing'))
  const hasPlayerBar = Boolean(document.getElementById('player-bar'))

  if (!strings) {
    strings = await getStrings()
  }

  if (!isPlaying && hasPlayerBar) {
    return presence.clearActivity()
  }

  if (hasPlayerBar) {
    const songTitle = getElement('a.song-title')
    const elapsedTime = getElement('div.elapsed-time')
    const durationTime = getElement('div.total-duration')
    const artistName = getElement('div.song-artist > a')
    const albumName = getElement('div.song-album > a')

    presenceData.details = songTitle
    presenceData.state = artistName || albumName
      ? [artistName, albumName].filter(Boolean).join(' - ')
      : undefined

    const [currentTime, duration] = [
      timestampFromFormat(elapsedTime ?? ''),
      timestampFromFormat(durationTime ?? ''),
    ]

    if (isPlaying) {
      [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(currentTime, duration)
    }
  }

  presence.setActivity(presenceData)
})
