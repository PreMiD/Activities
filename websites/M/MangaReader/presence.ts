const presence = new Presence({
  clientId: '901608545743683674',
})
const strings = presence.getStrings({
  homepage: 'general.viewHome',
  reading: 'general.reading',
  searchSomething: 'general.searchSomething',
  searchFor: 'general.searchFor',
  genre: 'general.viewGenre',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/M/MangaReader/assets/logo.png',
    details: (await strings).searchFor,
  }

  if (document.location.pathname === '/' || !document.location.pathname) {
    presenceData.details = (await strings).searchSomething
  }
  else if (document.location.pathname.includes('/search')) {
    presenceData.state = `"${
      document.querySelector('.block_area-header i')?.textContent
    }"`
  }
  else if (document.location.pathname.includes('/home')) {
    presenceData.details = (await strings).homepage
  }
  else if (document.location.pathname.includes('/genre')) {
    presenceData.details = (await strings).genre
    presenceData.state = `📔 ${
      document.querySelector('.block_area-header')?.textContent
    }`
  }
  else if (document.location.pathname.includes('/new-release')) {
    presenceData.state = '✌️ New releases'
  }
  else if (document.location.pathname.includes('/completed')) {
    presenceData.state = '✅ Completed Manga'
  }
  else if (document.location.pathname.includes('/most-viewed')) {
    presenceData.state = '🔥 Most Viewed'
  }
  else if (document.location.pathname.includes('/latest-updated')) {
    presenceData.state = '⚡ Latest Updated'
  }
  else if (document.location.pathname.includes('/az-list')) {
    presenceData.state = '🔠 A-Z List'
  }
  else if (document.location.pathname.includes('/type')) {
    presenceData.state = `📖 ${
      document.querySelector('.block_area-header')?.textContent
    }s`
  }
  else if (document.location.pathname.includes('/character')) {
    presenceData.details = 'Viewing Character:'
    presenceData.state = document.querySelector('.name')?.textContent
  }
  else if (document.location.pathname.includes('/author')) {
    presenceData.details = 'Viewing Author:'
    presenceData.state = document.querySelector('.name')?.textContent
  }
  else {
    presenceData.details = document.querySelector('.manga-name')?.textContent
    presenceData.buttons = [
      {
        label: 'Read Manga',
        url: document.location.href,
      },
    ]

    if (document.location.pathname.includes('/read')) {
      presenceData.details = `${(await strings).reading} ${
        presenceData.details
      }`
      presenceData.state = `${document
        .querySelector('#current-chapter')
        ?.textContent
        ?.replace(' ', ' #️')} | ${document
        .querySelector('#c-selected-lang, #v-selected-lang')
        ?.textContent
        ?.replace('Language: ', '')}`
      presenceData.startTimestamp = browsingTimestamp
    }
  }

  if (!presenceData.details)
    presence.setActivity()
  else presence.setActivity(presenceData)
})
