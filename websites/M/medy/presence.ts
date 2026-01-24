const presence = new Presence({
  clientId: '1460608892668084411',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const { pathname, href, search } = document.location
  const presenceData: any = {
    largeImageKey: 'https://cdn.medy.website/thumbnail.png',
    startTimestamp: browsingTimestamp,
  }

  const searchParams = new URLSearchParams(search)

  const episodeParam = searchParams.get('episode')
  const chapterParam = searchParams.get('chapter')
  const isPlaying = episodeParam || chapterParam

  if (pathname.includes('/anime/')) {
    const titleElement = document.querySelector('h1')
    let title = 'Anime'
    if (titleElement && titleElement.textContent) {
      const titleText = titleElement.textContent.trim()
      if (titleText) {
        title = titleText
      }
    }

    if (isPlaying && episodeParam) {
      presenceData.details = 'Дивиться аніме'
      presenceData.state = `Епізод ${episodeParam} - ${title}`
    }
    else {
      presenceData.details = 'Переглядає сторінку аніме'
      presenceData.state = title
    }

    const images = Array.from(document.querySelectorAll('img'))
    for (const img of images) {
      if (img.src && img.src.includes('cdn.hikka.io')) {
        presenceData.largeImageKey = img.src
        break
      }
    }

    presenceData.buttons = [
      {
        label: 'Переглянути',
        url: href,
      },
    ]
  }
  else if (pathname.includes('/manga/')) {
    const titleElement = document.querySelector('h1')
    let title = 'Manga'
    if (titleElement && titleElement.textContent) {
      const titleText = titleElement.textContent.trim()
      if (titleText) {
        title = titleText
      }
    }

    if (isPlaying && chapterParam) {
      presenceData.details = 'Читає манґу'
      presenceData.state = `Розділ ${chapterParam} - ${title}`
    }
    else {
      presenceData.details = 'Переглядає сторінку манґи'
      presenceData.state = title
    }

    const images = Array.from(document.querySelectorAll('img'))
    for (const img of images) {
      if (img.src && img.src.includes('cdn.hikka.io')) {
        presenceData.largeImageKey = img.src
        break
      }
    }

    presenceData.buttons = [
      {
        label: 'Переглянути',
        url: href,
      },
    ]
  }
  else if (pathname === '/' || pathname === '' || pathname === '/catalog') {
    presenceData.details = 'Блукає по сайту'
  }
  else {
    presenceData.details = 'Блукає по сайту'
  }

  if (!presenceData.largeImageKey) {
    presenceData.largeImageKey = 'https://cdn.medy.website/thumbnail.png'
  }

  presence.setActivity(presenceData)
})
