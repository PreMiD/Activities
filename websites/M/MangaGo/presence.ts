import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1276562016332546049',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/M/MangaGo/assets/logo.png',
  LogoV2 = 'https://cdn.rcd.gg/PreMiD/websites/M/MangaGo/assets/0.png',
}

async function getStrings() {
  return presence.getStrings(
    {
      search: 'general.searchFor',
      searchSomething: 'general.searchSomething',
      viewHome: 'general.viewHome',
      viewAManga: 'general.viewAManga',
      viewManga: 'general.viewManga',
      reading: 'general.reading',
      viewGenre: 'general.viewGenre',
    },

  )
}

let strings: Awaited<ReturnType<typeof getStrings>>
let oldLang: string | null = null

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
  }
  const [newLang, time, privacy, cover] = await Promise.all([
    presence.getSetting<string>('lang').catch(() => 'en'),
    presence.getSetting<boolean>('time'),
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('cover'),
  ])
  const { pathname } = document.location

  if (time)
    presenceData.startTimestamp = browsingTimestamp

  if (oldLang !== newLang || !strings) {
    oldLang = newLang
    strings = await getStrings()
  }

  if (pathname === '/') {
    presenceData.details = strings.viewHome
  }
  else if (pathname.startsWith('/topmanga')) {
    presenceData.details = 'Viewing top-manga'
  }
  else if (pathname.startsWith('/r/l_search')) {
    presenceData.smallImageKey = Assets.Search
    presenceData.smallImageText = strings.search
    presenceData.details = privacy
      ? strings.searchSomething
      : `${strings.search} ${
        document.querySelector<HTMLInputElement>('#searchform_name')?.value
      }`
  }
  else if (pathname.startsWith('/genre')) {
    presenceData.details = `${strings.viewGenre} ${pathname
      .split('/')[2]
      ?.replaceAll('%20', ' ')}`
  }
  else if (pathname.startsWith('/read-manga')) {
    if (document.querySelector('#dropdown-chapter-page')) {
      presenceData.smallImageKey = Assets.Reading
      presenceData.smallImageText = strings.reading
      presenceData.largeImageKey = ActivityAssets.LogoV2
      presenceData.details = privacy
        ? strings.reading
        : `${strings.reading}: ${
          document.querySelector('#series')?.textContent
        }`
      if (!privacy) {
        presenceData.state = `${
          document.querySelector('#dropdown-chapter-page')?.textContent
        }/${
          document
            .querySelector('.dropdown-menu.chapter')
            ?.querySelectorAll('li')
            ?.length
        }`
      }
    }
    else {
      presenceData.smallImageKey = Assets.Viewing
      presenceData.smallImageText = strings.viewAManga
      presenceData.details = privacy
        ? strings.viewAManga
        : `${strings.viewManga} ${document
          .querySelector('.w-title')
          ?.textContent
          ?.replace(/\t|\n/g, '')}`
      presenceData.state = `⭐ ${
        document.querySelector('.rating_num')?.textContent
      }/10 `
      presenceData.largeImageKey = !privacy && cover
        ? document.querySelector<HTMLImageElement>('.left.cover > img')
          ?.src ?? ActivityAssets.LogoV2
        : ActivityAssets.LogoV2
    }
  }

  presence.setActivity(presenceData)
})
