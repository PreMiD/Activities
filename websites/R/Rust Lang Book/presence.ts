const presence = new Presence({
  clientId: '1033608073106968576',
})

presence.on('UpdateData', async () => {
  const { href, pathname } = document.location
  const path = pathname
    .replace('/book/', '')
    .replace('.html', '')
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/R/Rust%20Lang%20Book/assets/logo.png', // rust logo 512x512
    smallImageKey: 'https://cdn.rcd.gg/PreMiD/websites/R/Rust%20Lang%20Book/assets/0.png', // ferris 512x512
    buttons: [
      {
        label: 'Read Book',
        url: href,
      },
    ],
  }

  if (path === '' || path === 'title-page') {
    presenceData.details = 'Viewing the book homepage'
  }
  else if (path === 'foreword') {
    presenceData.details = 'Reading the foreword'
  }
  else if (path.startsWith('ch')) {
    const [chapterNumber, subChapterNumber] = path.replace('ch', '').split('-')
    presenceData.details = `Reading chapter ${Number(chapterNumber)}`
    presenceData.state = document.querySelector('h1 .header')?.textContent
      || document.querySelector('h2 .header')?.textContent
    if (subChapterNumber !== '00') {
      presenceData.details += `.${Number(subChapterNumber)}`
    }
  }
  else if (path.startsWith('appendix')) {
    presenceData.details = 'Reading appendix'
    if (path.split('-')[1] !== '00') {
      presenceData.state = document.querySelector('h1 .header')?.textContent
        || document.querySelector('h2 .header')?.textContent
    }
  }

  presence.setActivity(presenceData)
})
