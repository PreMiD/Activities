const presence = new Presence({
  clientId: '1371050079439425576',
})

let startTimestamp = sessionStorage.getItem('startTimestamp')
if (!startTimestamp) {
  startTimestamp = Math.floor(Date.now() / 1000).toString()
  sessionStorage.setItem('startTimestamp', startTimestamp)
}

presence.on('UpdateData', async () => {
  const { pathname, search, hash } = document.location

  const presenceData: PresenceData = {
    largeImageKey: 'https://i.ibb.co/1fZY8jWs/icon-512x512.png',
    startTimestamp: Number.parseInt(startTimestamp, 10),
  }

  let detailsText = 'Browsing Kuroiru'
  let mediaName = ''

  const isAnime = pathname.startsWith('/anime/')
  const isManga = pathname.startsWith('/manga/')

  if (isAnime || isManga) {
    const segments = pathname.split('/')
    if (segments.length >= 4 && segments[3]) {
      mediaName = decodeURIComponent(segments[3].replace(/_/g, ' '))
    }

    if (hash.includes('tab=streams')) {
      detailsText = 'Checking Streams'
    }
    else if (hash.includes('tab=related')) {
      detailsText = 'Viewing Related Titles'
    }
    else if (hash.includes('tab=music')) {
      detailsText = 'Browsing Music Info'
    }
    else if (hash.includes('tab=news')) {
      detailsText = 'Reading News'
    }
    else if (hash.includes('tab=read')) {
      detailsText = 'Reading Manga'
    }
    else {
      detailsText = isAnime ? 'Reading Anime Info' : 'Reading Manga Info'
    }

    presenceData.state = mediaName
  }
  else if (pathname === '/anime/explore') {
    detailsText = 'Exploring Anime on Kuroiru'
  }
  else if (pathname === '/manga/explore') {
    detailsText = 'Exploring Manga on Kuroiru'
  }
  else if (pathname === '/airing.html') {
    if (search.includes('filter=upcoming')) {
      detailsText = 'Browsing Upcoming Anime'
    }
    else {
      detailsText = 'Browsing Airing Anime'
    }
  }
  else if (pathname === '/app') {
    detailsText = 'Browsing Kuroiru'
  }

  presenceData.details = detailsText

  presence.setActivity(presenceData)
})
