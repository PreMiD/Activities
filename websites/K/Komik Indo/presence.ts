import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1272521587912081428',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/K/Komik%20Indo/assets/logo.png',
}

function getTitleText(selector: string): string {
  const element = document.querySelector(selector)
  return element?.textContent?.replace(/\t|\n/g, '').trim() ?? 'Unknown'
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    details: 'Browsing...',
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const { pathname, href } = document.location
  const buttons = await presence.getSetting<boolean>('buttons')

  if (href.includes('?s=')) {
    presenceData.state = `Searching: ${getTitleText(
      'div.widget-title h1',
    ).replace('Komik Hasil Pencarian ', '')}`
    presenceData.smallImageKey = Assets.Search
    presenceData.details = 'Searching for Comics'
  }
  else if (pathname === '/') {
    presenceData.details = 'Viewing Homepage'
  }
  else if (pathname.endsWith('/daftar-komik/')) {
    presenceData.details = 'Viewing Popular Comics List'
  }
  else if (pathname.endsWith('/komik-terbaru/')) {
    presenceData.details = 'Viewing Latest Comics List'
  }
  else if (pathname.endsWith('/komik-berwarna/')) {
    presenceData.details = 'Viewing Colored Comics List'
  }
  else if (pathname.endsWith('/daftar-manga')) {
    presenceData.details = 'Viewing Manga List'
  }
  else if (pathname.endsWith('/manga/')) {
    presenceData.details = 'Viewing Manga'
  }
  else if (pathname.endsWith('/manhwa/')) {
    presenceData.details = 'Viewing Manhwa'
  }
  else if (pathname.endsWith('/manhua/')) {
    presenceData.details = 'Viewing Manhua'
  }
  else if (pathname.endsWith('/akun/')) {
    presenceData.details = 'Viewing Account'
  }
  else if (pathname.endsWith('/iklan/')) {
    presenceData.details = 'Contact Komikindo'
  }
  else if (pathname.endsWith('/konten/ecchi/')) {
    presenceData.details = 'Viewing Ecchi Content'
  }
  else if (pathname.startsWith('/komik/')) {
    const titleElement = getTitleText('h1.entry-title').replace('Komik', '')
    presenceData.details = `Viewing: ${titleElement}`

    let author = 'Unknown'
    let comicType = 'Unknown'

    for (const element of document.querySelectorAll(
      'div.infox > div.spe > span > b',
    )) {
      if (element.textContent?.includes('Pengarang:'))
        author = element.nextSibling!.textContent!.trim()
      if (element.textContent?.includes('Jenis Komik:'))
        comicType = element.nextElementSibling!.textContent!.trim()
    }

    presenceData.state = `Author: ${author} | Type: ${comicType}`
    presenceData.smallImageText = titleElement
    if (buttons) {
      presenceData.buttons = [
        {
          label: 'View Comic',
          url: href,
        },
      ]
    }
  }
  else if (href.includes('chapter-')) {
    const titleElement = getTitleText('div.dtlx > h1.entry-title').replace(
      'Komik',
      '',
    )
    presenceData.details = titleElement
    presenceData.state = 'Reading Chapter'
    presenceData.smallImageText = titleElement

    if (buttons) {
      presenceData.buttons = [
        {
          label: 'Read Chapter',
          url: href,
        },
        {
          label: 'View Comic',
          url: document
            .querySelectorAll('div.nextprev > a')[1]!
            .getAttribute('href'),
        },
      ]
    }
  }
  else {
    presenceData.details = 'Browsing...'
  }

  presence.setActivity(presenceData)
})
