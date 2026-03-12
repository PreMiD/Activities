const presence = new Presence({
  clientId: '1406270668777197689',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

let privacyMode = false

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/%23/%E5%BE%AE%E4%BF%A1%E8%AF%BB%E4%B9%A6/assets/logo.jpeg',
}

function getPageType() {
  const pathname = document.location.pathname
  let pageType = 'unknown'

  if (pathname === '/' || pathname === '/web') {
    pageType = 'homepage'
  }
  else if (pathname.startsWith('/web/shelf')) {
    pageType = 'bookshelf'
  }
  else if (pathname.startsWith('/web/reader/') || pathname.startsWith('/web/bookDetail/')) {
    pageType = 'reading'
  }
  else if (pathname.startsWith('/web/search/books')) {
    pageType = 'search'
  }
  return { pageType }
}

// Get the book title from the page title, remove all '- 微信读书' or '-微信读书' at the end
function getTitle() {
  return document.title.replace(/ ?- ?微信读书$/, '')
}

// Get the book cover image URL if available
function getCoverImage(): string | undefined {
  const coverImg = document.querySelector<HTMLImageElement>('img.wr_bookCover_img')
  return coverImg?.src
}

presence.on('UpdateData', async () => {
  privacyMode = await presence.getSetting<boolean>('privacyMode')

  const { pageType } = getPageType()

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  if (pageType === 'homepage') {
    presenceData.details = 'Browsing Homepage'
  }
  else if (pageType === 'bookshelf') {
    presenceData.details = 'Browsing Bookshelf'
  }
  else if (pageType === 'reading') {
    presenceData.details = 'Reading a Book'
    if (!privacyMode) {
      const coverSrc = getCoverImage()
      if (coverSrc) {
        presenceData.largeImageKey = coverSrc
      }
      presenceData.state = getTitle()
    }
  }
  else if (pageType === 'search') {
    if (!privacyMode) {
      const urlParams = new URLSearchParams(document.location.search)
      const author = urlParams.get('author')
      if (author) {
        presenceData.details = `Viewing author: ${decodeURIComponent(author)}`
      }
    }
    else {
      presenceData.details = 'Searching Books'
    }
  }
  presence.setActivity(presenceData)
})
