import { ActivityType, Assets, getTimestamps, timestampFromFormat } from 'premid'

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

const uploadedFiles: Record<string, string> = {}
async function uploadFile(
  url: string,
  defaultImage: string,
  presence: Presence,
): Promise<string> {
  if (uploadedFiles[url])
    return uploadedFiles[url]
  uploadedFiles[url] = defaultImage

  try {
    const imageData = await fetch(url).then(res => res.blob())
    const formData = new FormData()
    formData.append('file', imageData, 'file')
    const resultURL = await fetch('https://pd.premid.app/create/image', {
      method: 'POST',
      body: formData,
    }).then(res => res.text())

    presence.info(resultURL)
    uploadedFiles[url] = resultURL
    return resultURL
  }
  catch (err) {
    presence.error(err as string)
    return url
  }
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    type: ActivityType.Listening,
    largeImageKey: ActivityAssets.Logo,
  }

  const isPlaying = Boolean(document.querySelector('button.player-state-playing'))
  const isPaused = Boolean(document.querySelector('button.player-state-paused'))
  const hasPlayerBar = Boolean(document.getElementById('player-bar'))

  if (!strings) {
    strings = await getStrings()
  }

  if (hasPlayerBar) {
    const songTitle = getElement('a.song-title')
    const elapsedTime = getElement('div.elapsed-time')
    const durationTime = getElement('div.total-duration')
    const artistName = getElement('div.song-artist > a')
    const albumName = getElement('div.song-album > a')
    const leftSidebar = document.getElementById('left-sidebar')
    const albumContainer = leftSidebar?.children[leftSidebar.children.length - 1]
    const albumImgElement = albumContainer?.querySelector('img')

    if (albumImgElement && albumImgElement.src) {
      presenceData.largeImageKey = await uploadFile(
        albumImgElement.src,
        ActivityAssets.Logo,
        presence,
      )
    }
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
      presenceData.smallImageKey = Assets.Play
      presenceData.smallImageText = strings.play
    }
    else if (isPaused) {
      presenceData.smallImageKey = Assets.Pause
      presenceData.smallImageText = strings.pause
    }
  }

  presence.setActivity(presenceData)
})
