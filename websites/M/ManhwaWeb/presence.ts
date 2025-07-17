import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1395265529530548256',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://i.imgur.com/kulV4oU.png',
}

async function getStrings() {
  return presence.getStrings({
    reading: 'Leyendo',
    viewing: 'Viendo',
    home: 'Inicio',
    browsing: 'Navegando...',
    loading: 'Cargando...',
    library: 'Biblioteca',
    rankings: 'Cromas',
    spoilers: 'Spoilers',
    preparing: 'Preparando...',
    chapter: 'Capítulo',
    unknownChapter: '¿?'
  })
}

let strings: Awaited<ReturnType<typeof getStrings>>
let oldLang: string | null = null

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo
  }

  const [lang, showTime, privacy, showCover] = await Promise.all([
    presence.getSetting<string>('lang').catch(() => 'en'),
    presence.getSetting<boolean>('time'),
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('cover')
  ])

  if (!strings || lang !== oldLang) {
    oldLang = lang
    strings = await getStrings()
  }

  const { pathname } = location

  if (showTime) {
    presenceData.startTimestamp = browsingTimestamp
  }

  if (pathname === '/') {
    presenceData.details = strings.preparing
  } else if (pathname.startsWith('/manhwa/')) {
    const title = document.querySelector('h2')?.textContent?.trim() || strings.loading
    const cover = document.querySelector<HTMLMetaElement>('meta[property="og:image"]')?.content ||
                  document.querySelector<HTMLImageElement>('img.w-full.object-cover')?.src

    presenceData.details = privacy
      ? strings.viewing
      : `${strings.viewing}: ${title}`

    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = strings.viewing

    presenceData.largeImageKey = !privacy && showCover && cover
      ? cover
      : ActivityAssets.Logo

  } else if (pathname.startsWith('/leer/')) {
    const title = document.querySelector('div.text-center')?.textContent?.trim()
    const chapterMatch = document.title.match(/Cap[ií]tulo\s+(\d+)/i)
    const chapter = chapterMatch?.[1] ?? strings.unknownChapter

    presenceData.details = privacy
      ? strings.reading
      : `${strings.reading}: ${title}`

    presenceData.state = privacy ? undefined : `${strings.chapter} ${chapter}`

    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = strings.reading

    const firstImage = document.querySelector<HTMLImageElement>('img.w-full, img.w-7\\/12')?.src

    presenceData.largeImageKey = !privacy && showCover
      ? firstImage ?? ActivityAssets.Logo
      : ActivityAssets.Logo

  } else if (pathname.startsWith('/profile')) {
    const username = document.querySelector<HTMLDivElement>(
      "div.text-md, .xs\\:text-2xl, .sm\\:text-3xl, .md\\:text-4xl.font-semibold"
    )?.textContent?.trim()

    const avatarImg = document.querySelector<HTMLImageElement>(
      "img.object-cover.rounded-md.border-bronce"
    )
    const avatarUrl = avatarImg?.src

    presenceData.details = `${'Viendo perfil:'} ${username ?? 'Usuario desconocido'}`
    presenceData.largeImageKey = avatarUrl ?? ActivityAssets.Logo

  } else if (pathname.startsWith('/mis-manhwas')) {
    presenceData.details = strings.library
  } else if (pathname.startsWith('/rank')) {
    presenceData.details = strings.rankings
  } else if (pathname.startsWith('/spoilers')) {
    presenceData.details = strings.spoilers
  } else if (pathname.startsWith('/latest-chapters')) {
    presenceData.details = 'Viendo últimos capítulos'
  } else if (pathname.startsWith('/register')) {
    presenceData.details = 'En la página de Registro'
  } else if (pathname.startsWith('/login')) {
    presenceData.details = 'En la página de Inicio de Sesión'
  } else {
    presenceData.details = strings.browsing
  }

  presence.setActivity(presenceData)
})
