import { Assets } from 'premid'

const presence = new Presence({ clientId: '867525909204566056' })
const timeElapsed: number = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/G/Goodreads/assets/logo.png',
    details: 'Browsing Goodreads',
    startTimestamp: timeElapsed,
  }
  const { pathname, href } = document.location

  if (pathname === '/home' || pathname === '/') {
    presenceData.details = 'Browsing homepage'
  }
  else if (pathname === '/book') {
    presenceData.details = 'Browsing books'
  }
  else if (pathname.includes('/book/show/')) {
    presenceData.details = 'Viewing a book:'
    presenceData.largeImageKey = document
      .querySelector('.BookCover img.ResponsiveImage')
      ?.getAttribute('src')
    presenceData.state = document.querySelector('h1')?.textContent
    presenceData.buttons = [
      {
        label: 'View Book',
        url: href,
      },
    ]

    presenceData.smallImageKey = Assets.Reading
    // author
    presenceData.smallImageText = `By: ${
      document.querySelector('span.ContributorLink__name')?.textContent
    }`
  }
  else if (pathname.includes('/series')) {
    const bookseries = document.querySelector('h1')?.textContent
    if (bookseries === 'Series') {
      presenceData.details = 'Viewing all book series on Goodreads'
    }
    else {
      presenceData.details = 'Viewing a book series:'
      presenceData.state = bookseries

      presenceData.largeImageKey = document
        .querySelector('.gr-box--withShadow.responsiveBook__img')
        ?.getAttribute('src') // get first book in series img
      presenceData.buttons = [
        {
          label: 'View Series',
          url: href,
        },
      ]
    }
  }
  else if (pathname.includes('/user/show/')) {
    presenceData.details = 'Viewing a profile:'
    // Without reading ID for private profiles
    const user = document.querySelector('h1')?.textContent
    if (document.querySelector('h1 a') === null) {
      // others profiles
      presenceData.state = user
    }
    else {
      presenceData.state = user?.replace(
        document.querySelector('h1 a')?.textContent ?? '',
        '',
      )
    }
    try {
      presenceData.largeImageKey = document
        .querySelector('.profilePictureIcon')
        ?.getAttribute('src')
      presenceData.buttons = [
        {
          label: 'View Profile',
          url: href,
        },
      ]
    }
    catch {
      presenceData.details = 'Trying to view a private profile:'
    }
  }
  else if (pathname.includes('/user/year_in_books/')) {
    presenceData.details = `Viewing ${
      document.querySelector('.bannerYearText')?.textContent
    } year in books of:`
    presenceData.state = document.querySelector(
      '.headerNameContainer .headerName',
    )?.textContent
    presenceData.largeImageKey = document
      .querySelector('.headerImageContainer img')
      ?.getAttribute('src')
  }
  else if (pathname.includes('/photo/author/')) {
    presenceData.details = 'Viewing an author photo:'
    presenceData.state = document.querySelector('h1 a')?.textContent
    presenceData.largeImageKey = document
      .querySelector('.profile a img')
      ?.getAttribute('src')
  }
  else if (pathname.includes('/author/show/')) {
    presenceData.details = 'Viewing an author:'
    presenceData.state = document.querySelector('.authorName span')?.textContent

    presenceData.largeImageKey = document
      .querySelector('.leftContainer.authorLeftContainer img')
      ?.getAttribute('src')
    presenceData.buttons = [
      {
        label: 'View Author',
        url: href,
      },
    ]
  }
  else if (pathname.includes('/group/show/')) {
    presenceData.details = 'Viewing a group:'
    presenceData.state = document.querySelector('h1')?.textContent
  }
  else if (pathname.includes('/topic')) {
    presenceData.details = 'Browsing discussions'
  }
  else if (pathname.includes('/review/edit/')) {
    presenceData.details = 'Writing a book review...'
    try {
      presenceData.state = document.querySelector('a.bookTitle')?.textContent
      presenceData.smallImageKey = document
        .querySelector('.leftAlignedImage')
        ?.getAttribute('src')
      presenceData.smallImageText = `Rating for ${document
        .querySelector('.stars')
        ?.getAttribute('data-rating')}☆ stars`
    }
    catch {
      presenceData.state = 'Trying to edit an unknown book...'
    }

    presenceData.largeImageKey = Assets.Writing
  }
  else if (pathname.includes('/review/list/')) {
    presenceData.details = 'Browsing bookshelves'
  }
  else if (pathname.includes('/review/show')) {
    presenceData.details = 'Reading a review...'
    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = 'On Goodreads'
  }
  else if (pathname.includes('/recommendations')) {
    presenceData.details = 'Browsing recommendations'
  }
  else if (
    pathname.includes('/challenges')
    || pathname.includes('/user_challenges')
  ) {
    presenceData.details = 'Viewing reading challenge'
  }
  else if (pathname.includes('/quotes')) {
    presenceData.details = 'Browsing quotes'
  }
  else if (pathname.includes('/search')) {
    presenceData.details = 'Searching for a book...'
    presenceData.smallImageKey = Assets.Search
    presenceData.smallImageText = 'On Goodreads'
  }
  presence.setActivity(presenceData)
})
