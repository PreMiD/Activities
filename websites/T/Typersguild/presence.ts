import { ActivityType, StatusDisplayType } from 'premid'

const presence = new Presence({
  clientId: '1459578800223420416',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://typersguild.com/android-chrome-512x512.png',
}

enum ContentType {
  Book = 'book',
  Wiki = 'wiki',
  Browsing = 'browsing',
}

function getBookName(): string {
  const presenceName = document
    .querySelector('[data-presence-book-name]')
    ?.getAttribute('data-presence-book-name')
    ?.trim()

  return presenceName || 'a book'
}

function getBookAuthor(): string {
  const authorName = document
    .querySelector('[data-presence-book-author]')
    ?.getAttribute('data-presence-book-author')
    ?.trim()

  return authorName || 'Unknown Author'
}

function getBookCover(): string | null {
  const coverUrl = document
    .querySelector('[data-presence-book-cover]')
    ?.getAttribute('data-presence-book-cover')
    ?.trim()

  return coverUrl || null
}

function getContentType(path: string): ContentType {
  if (/^\/books\/[^/]+\/chapter\/\d+/.test(path)) {
    return ContentType.Book
  }

  if (/^\/my-books\/[^/]+\/chapter\/\d+/.test(path)) {
    return ContentType.Book
  }

  if (/^\/wiki\/[^/]+\/[^/]+/.test(path)) {
    return ContentType.Wiki
  }

  return ContentType.Browsing
}

presence.on('UpdateData', async () => {
  const { pathname } = document.location
  const contentType = getContentType(pathname)

  const presenceData: PresenceData = {
    type: ActivityType.Playing,
    name: 'Typing on Typersguild',
    statusDisplayType: StatusDisplayType.Details,
    largeImageKey: ActivityAssets.Logo,
    largeImageUrl: 'https://typersguild.com/books',
    detailsUrl: 'https://typersguild.com/books',
    startTimestamp: browsingTimestamp,
  }

  switch (contentType) {
    case ContentType.Book:
    { const bookCover = getBookCover()
      const bookName = getBookName()
      if (bookCover) {
        presenceData.largeImageKey = bookCover
      }

      presenceData.details = bookName
      presenceData.state = `by ${getBookAuthor()}`

      break
    }

    case ContentType.Wiki:
      presenceData.details = getBookName()
      presenceData.state = 'Typing Wikipedia'

      break

    case ContentType.Browsing:
      presenceData.name = 'Browsing Typersguild'
      presenceData.details = 'Typersguild'
      presenceData.state = 'Books, Wikis, and more'

      break
  }

  if (presenceData.state) {
    presence.setActivity(presenceData)
  }
  else {
    presence.clearActivity()
  }
})
