const presence = new Presence({
  clientId: '1483241564619669546',
})

const IMAGE = 'https://i.imgur.com/e3lBwoS.png'

function findChapter(): string | null {
  const nodes = document.querySelectorAll('div, span')

  for (const n of nodes) {
    const text = n.textContent?.trim()

    if (text && /^chapter\s*\d+/i.test(text)) {
      return text
    }
  }

  return null
}

function findPageCounter(): string | null {
  const nodes = document.querySelectorAll('div, span')

  for (const n of nodes) {
    const text = n.textContent?.trim()

    if (text && /^\d+\s*\/\s*\d+$/.test(text)) {
      return text
    }
  }

  return null
}

presence.on('UpdateData', async () => {
  const url = window.location.href
  const path = window.location.pathname
  const title = document.title.replace(' | Seanime', '')

  if (!url.includes(':43211')) {
    return
  }

  if (path === '/' || path === '') {
    presence.setActivity({
      name: 'Seanime',
      details: 'Browsing',
      state: 'Looking for anime or manga',
      largeImageKey: IMAGE,
    })

    return
  }

  if (path.includes('/manga/entry')) {
    const chapter = findChapter()
    const page = findPageCounter()

    if (!chapter && !page) {
      presence.setActivity({
        name: 'Reading Manga',
        details: `Viewing ${title}`,
        state: 'Manga Info',
        largeImageKey: IMAGE,
      })

      return
    }

    presence.setActivity({
      name: 'Reading Manga',
      details: title,
      state: page
        ? `${chapter ?? 'Reading'} • Page ${page}`
        : chapter ?? 'Reading',
      largeImageKey: IMAGE,
    })

    return
  }

  const video = document.querySelector('video') as HTMLVideoElement | null

  if (video) {
    const current = Math.floor(video.currentTime)
    const total = Math.floor(video.duration || 0)

    const format = (s: number) => {
      const m = Math.floor(s / 60)
      const sec = s % 60

      return `${m}:${sec.toString().padStart(2, '0')}`
    }

    presence.setActivity({
      name: 'Watching Anime',
      details: title,
      state: `${format(current)} / ${format(total)}`,
      largeImageKey: IMAGE,
    })
  }
})
