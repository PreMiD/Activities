const iframe = new iFrame()
const coverCache: Record<string, string | undefined> = {}

async function getCover(songId: string): Promise<string> {
  const coverImage = coverCache[songId]

  if (typeof coverImage !== 'undefined')
    return coverImage

  coverCache[songId] = undefined

  const response = await fetch(
    `https://api.beatleader.xyz/leaderboard/${songId}?count=0`,
  )
  if (!response.ok)
    throw new Error(`Response status: ${response.status}`)

  const json = await response.json()

  coverCache[songId] = json.song.coverImage

  return json.song.coverImage
}

if (document.location.href.includes('https://replay.beatleader.')) {
  iframe.on('UpdateData', async () => {
    let coverURL = document.querySelector<HTMLImageElement>('#songImage')?.src

    if (coverURL?.startsWith('blob:')) {
      coverURL = await getCover(
        document
          .querySelector<HTMLAnchorElement>('#songLink')!.href.split('/')[5]!,
      )

      if (coverURL === null)
        return
    }

    iframe.send({
      name: document.querySelector('#songName')?.textContent,
      subName: document.querySelector('#songSubName')?.textContent,
      currentTime: document.querySelector('#songProgress')?.textContent,
      playing: Boolean(document.querySelector('.btn.pause')),
      duration: document.querySelector('#songDuration')?.textContent,
      playerName: document.querySelector('#playerName')?.textContent,
      cover: coverURL,
    })
  })
}
