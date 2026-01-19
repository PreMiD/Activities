import { StatusDisplayType } from 'premid'

const presence = new Presence({
  clientId: '1459578800223420416',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/T/Typersguild/assets/logo.png',
}

enum ContentType {
  Book = 'book',
  Wiki = 'wiki',
  Browsing = 'browsing',
}

enum ActivityStates {
  Typing = 'Typing on Typersguild',
  Browsing = 'Browsing',
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
    statusDisplayType: StatusDisplayType.Name,
    largeImageKey: ActivityAssets.Logo,
    largeImageUrl: 'https://typersguild.com/books',
    stateUrl: 'https://typersguild.com/books',
    startTimestamp: browsingTimestamp,
  }

  switch (contentType) {
    case ContentType.Book:
    { const bookCover = getBookCover()
      if (bookCover)
        presenceData.largeImageKey = bookCover

      presenceData.name = getBookName()
      presenceData.details = `by ${getBookAuthor()}`
      presenceData.state = ActivityStates.Typing
      break
    }
    case ContentType.Wiki:
      presenceData.name = getBookName()
      presenceData.details = 'Wikipedia'
      presenceData.state = ActivityStates.Typing
      break
    case ContentType.Browsing:
      presenceData.details = 'Books, Wikis, and more'
      presenceData.state = ActivityStates.Browsing
      break
  }

  if (presenceData.state) {
    presence.setActivity(presenceData)
  }
  else {
    presence.clearActivity()
  }
})
