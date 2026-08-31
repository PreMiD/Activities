import { ActivityType, Assets, getTimestampsFromMedia } from 'premid'

const presence = new Presence({
  clientId: '969064871310282813',
})

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/Q/Quran.com/assets/logo.png',
}

let browsingTimestamp = Math.floor(Date.now() / 1000)
let lastCategory: 'browsing' | 'reading' | 'reciters' | 'search' | null = null

async function getStrings() {
  return presence.getStrings({
    buttonViewPage: 'general.buttonViewPage',
    paused: 'general.paused',
    privacy: 'general.privacy',
    reading: 'general.reading',
    searchFor: 'general.searchFor',
    searchSomething: 'general.searchSomething',
    viewHome: 'general.viewHome',
    viewPage: 'general.viewPage',
  })
}

let strings: Awaited<ReturnType<typeof getStrings>>
let oldLang: string | undefined

function setCategory(category: typeof lastCategory) {
  if (lastCategory !== category) {
    browsingTimestamp = Math.floor(Date.now() / 1000)
    lastCategory = category
  }
}

function query<T extends Element = Element>(selectors: string[]): T | null {
  for (const selector of selectors) {
    const el = document.querySelector<T>(selector)
    if (el)
      return el
  }
  return null
}

interface ChapterEntry {
  translatedName: string
}

function getEnglishName(chapterNumber: string): string | undefined {
  try {
    const nextData = JSON.parse(document.getElementById('__NEXT_DATA__')?.textContent ?? '')
    const chaptersData = nextData?.props?.pageProps?.chaptersData as Record<string, ChapterEntry> | undefined
    return chaptersData?.[chapterNumber]?.translatedName
  }
  catch {
    return undefined
  }
}

const reciterNames: Record<string, string> = {
  'qdc/abdul_baset/mujawwad': 'AbdulBaset AbdulSamad (Mujawwad)',
  'qdc/abdul_baset/murattal': 'AbdulBaset AbdulSamad (Murattal)',
  'qdc/abdurrahmaan_as_sudais/murattal': 'Abdur-Rahman as-Sudais (Murattal)',
  'qdc/abu_bakr_shatri/murattal': 'Abu Bakr al-Shatri (Murattal)',
  'qdc/hani_ar_rifai/murattal': 'Hani ar-Rifai (Murattal)',
  'qdc/khalifah_taniji/murattal': 'Khalifah Al Tunaiji (Murattal)',
  'qdc/khalil_al_husary/muallim': 'Mahmoud Khalil Al-Husary (Muallim)',
  'qdc/khalil_al_husary/murattal': 'Mahmoud Khalil Al-Husary (Murattal)',
  'qdc/mishari_al_afasy/murattal': 'Mishari Rashid al-`Afasy (Murattal)',
  'qdc/mishari_al_afasy/streaming/mp3': 'Mishari Rashid al-`Afasy (Murattal)',
  'qdc/saud_ash-shuraym/murattal': 'Sa`ud ash-Shuraym (Murattal)',
  'qdc/siddiq_al-minshawi/mujawwad': 'Mohamed Siddiq al-Minshawi (Mujawwad)',
  'qdc/siddiq_minshawi/kids_repeat': 'Mohamed Siddiq al-Minshawi (Kids repeat)',
  'qdc/siddiq_minshawi/murattal': 'Mohamed Siddiq al-Minshawi (Murattal)',
  'qdc/yasser_ad-dussary/mp3': 'Yasser Ad Dussary - beta (Murattal)',
  'quran/ahmed_ibn_3ali_al-3ajamy': 'Ahmed ibn Ali al-Ajmy - beta (Murattal)',
  'quran/ali_jaber': 'Abdullah Ali Jabir - beta (Murattal)',
  'quran/bandar_baleela/complete': 'Bandar Baleela - beta (Murattal)',
  'quran/maher_almu3aiqly/year1440': 'Maher al-Muaiqly - beta (Murattal)',
  'quran/sa3d_al-ghaamidi/complete': 'Saad al-Ghamdi (Murattal)',
}

function getReciterName(audioSrc: string): string | undefined {
  const pathname = new URL(audioSrc).pathname.replace(/\/+/g, '/')
  return Object.entries(reciterNames)
    .find(([path]) => pathname.startsWith(`/${path}/`))?.[1]
}

function getVerseKey(pathname: string, audio: HTMLAudioElement | null): string | undefined {
  const audioSrc = audio?.currentSrc || audio?.src
  if (audioSrc) {
    return query(['[data-verse-key][class*="highlightedContainer"]'])
      ?.getAttribute('data-verse-key') ?? undefined
  }

  if (/^\/[^/]+\/\d+\/?$/.test(pathname)) {
    const verseKey = query(['[data-verse-key]'])?.getAttribute('data-verse-key')
    if (verseKey)
      return verseKey
  }

  const verseNumber = pathname.match(/^\/[^/]+\/(\d+)\/?$/)?.[1]
  const chapterNumber = query(['[data-testid="chapter-navigation"]'])?.textContent?.match(/^(\d+)\./)?.[1]
  return verseNumber && chapterNumber ? `${chapterNumber}:${verseNumber}` : undefined
}

const translations = {
  en: {
    radio: 'Looking through radio stations',
    aboutUs: 'Viewing the about us page',
    apps: 'Looking at Quran apps',
    developers: 'Looking at the developers page',
    support: 'Looking at the support page',
    reciters: 'Browsing through reciters',
    viewingReciter: 'Viewing a reciter',
    dailyVerse: 'Viewing the Quran verse of the day',
    duas: 'Browsing Quranic duas',
    viewingDua: 'Viewing a Quranic dua',
    readingTafsir: 'Reading a tafsir',
    learningPlans: 'Browsing Quran learning plans',
    viewingLearningPlan: 'Viewing a Quran learning plan',
    readingFallback: 'Reading the Holy Quran',
    ayah: 'Ayah',
  },
  ar: {
    radio: 'تصفح محطات الراديو',
    aboutUs: 'عرض صفحة من نحن',
    apps: 'تصفح تطبيقات القرآن',
    developers: 'عرض صفحة المطورين',
    support: 'عرض صفحة الدعم',
    reciters: 'تصفح القراء',
    viewingReciter: 'عرض قارئ',
    dailyVerse: 'عرض آية اليوم من القرآن',
    duas: 'تصفح الأدعية القرآنية',
    viewingDua: 'عرض دعاء قرآني',
    readingTafsir: 'قراءة تفسير',
    learningPlans: 'تصفح خطط تعلم القرآن',
    viewingLearningPlan: 'عرض خطة لتعلم القرآن',
    readingFallback: 'قراءة القرآن الكريم',
    ayah: 'آية',
  },
} as const

type LangCode = keyof typeof translations

presence.on('UpdateData', async () => {
  try {
    const newLang = await presence.getSetting<string>('lang').catch(() => 'en') || 'en'
    if (oldLang !== newLang || !strings) {
      oldLang = newLang
      strings = await getStrings()
    }

    const lang: LangCode = newLang.toLowerCase().startsWith('ar') ? 'ar' : 'en'
    const t = translations[lang]

    let presenceData: PresenceData = {
      largeImageKey: ActivityAssets.Logo,
      type: ActivityType.Playing,
    }

    const { pathname } = window.location

    switch (pathname) {
      case '/': {
        setCategory('browsing')
        presenceData.details = strings.viewHome
        presenceData.startTimestamp = browsingTimestamp
        break
      }
      case '/radio': {
        setCategory('browsing')
        presenceData.details = t.radio
        presenceData.startTimestamp = browsingTimestamp
        break
      }
      case '/about-us': {
        setCategory('browsing')
        presenceData.details = t.aboutUs
        presenceData.startTimestamp = browsingTimestamp
        break
      }
      case '/apps': {
        setCategory('browsing')
        presenceData.details = t.apps
        presenceData.startTimestamp = browsingTimestamp
        break
      }
      case '/developers': {
        setCategory('browsing')
        presenceData.details = t.developers
        presenceData.startTimestamp = browsingTimestamp
        break
      }
      case '/privacy': {
        setCategory('browsing')
        presenceData.details = strings.privacy
        presenceData.startTimestamp = browsingTimestamp
        break
      }
      case '/support': {
        setCategory('browsing')
        presenceData.details = t.support
        presenceData.startTimestamp = browsingTimestamp
        break
      }
      case '/search': {
        setCategory('search')
        const searchQuery = query<HTMLInputElement>(['#searchQuery', 'input[type="search"]'])?.value?.trim()
        presenceData.details = searchQuery ? strings.searchFor : strings.searchSomething
        if (searchQuery)
          presenceData.state = searchQuery.slice(0, 60)
        presenceData.startTimestamp = browsingTimestamp
        break
      }
      default: {
        const pageTitle = document.title.replace(/\s*[-–—]\s*Quran\.com\s*$/i, '').trim()

        if (pathname.includes('/reciters')) {
          if (pathname.includes('/reciters/')) {
            setCategory('reciters')
            presenceData.details = t.viewingReciter
            const reciter = query(['[class*="ReciterInfo_reciterName"]', '[data-testid="reciter-name"]'])?.textContent
            if (reciter)
              presenceData.state = reciter
            presenceData.startTimestamp = browsingTimestamp
          }
          else {
            setCategory('browsing')
            presenceData.details = t.reciters
            presenceData.startTimestamp = browsingTimestamp
          }
          break
        }

        if (pathname === '/daily') {
          setCategory('reading')
          presenceData.details = t.dailyVerse
          const verseKey = query(['[data-verse-key]'])?.getAttribute('data-verse-key')
          if (verseKey)
            presenceData.state = `${t.ayah} ${verseKey}`
          presenceData.startTimestamp = browsingTimestamp
          break
        }

        if (pathname === '/duas' || pathname.startsWith('/duas/')) {
          setCategory('reading')
          presenceData.details = pathname === '/duas' ? t.duas : t.viewingDua
          if (pathname !== '/duas' && pageTitle)
            presenceData.state = pageTitle
          presenceData.startTimestamp = browsingTimestamp
          break
        }

        if (/^\/[^/]+\/\d+\/tafsirs(?:\/|$)/.test(pathname)) {
          setCategory('reading')
          presenceData.details = t.readingTafsir
          const tafsirSeparator = [' — Tafsir ', ' – Tafsir ', ' - Tafsir ']
            .find(separator => pageTitle.includes(separator))
          const tafsirTitle = tafsirSeparator ? pageTitle.split(tafsirSeparator)[0] : undefined
          const tafsirContext = pageTitle.split('Tafsir Surah ')[1]
          const verseKey = query(['[data-verse-key]'])?.getAttribute('data-verse-key')
          const state = [verseKey ? `${t.ayah} ${verseKey}` : tafsirContext, tafsirTitle]
            .filter(Boolean)
            .join(' • ')
          if (state)
            presenceData.state = state
          presenceData.startTimestamp = browsingTimestamp
          break
        }

        if (pathname === '/learning-plans' || pathname.startsWith('/learning-plans/')) {
          setCategory('reading')
          presenceData.details = pathname === '/learning-plans'
            ? t.learningPlans
            : t.viewingLearningPlan
          if (pathname !== '/learning-plans' && pageTitle)
            presenceData.state = pageTitle
          presenceData.startTimestamp = browsingTimestamp
          break
        }

        const audio = document.getElementById('audio-player') as HTMLAudioElement | null
        const directVerseSurah = /^\/[^/]+\/\d+\/?$/.test(pathname)
          ? document.title.match(/^Surah (.+?) Ayah \d+/)?.[1]
          : undefined
        const surahName = query(['[data-testid="chapter-navigation"]'])?.textContent
          ?? (directVerseSurah ? `Surah ${directVerseSurah}` : undefined)
        const pageInfo = query(['[data-testid="page-info"]'])?.textContent

        if (!surahName) {
          setCategory('browsing')
          presenceData.details = strings.viewPage
          if (pageTitle)
            presenceData.state = pageTitle
          presenceData.startTimestamp = browsingTimestamp
          break
        }

        const verseKey = getVerseKey(pathname, audio)

        const chapterNumber = surahName?.match(/^(\d+)\./)?.[1]
        const englishName = chapterNumber ? getEnglishName(chapterNumber) : undefined
        const audioSrc = audio?.currentSrc || audio?.src
        const reciterName = audioSrc ? getReciterName(audioSrc) : undefined

        presenceData.details = surahName
          ? `${strings.reading} ${surahName}${englishName ? ` (${englishName})` : ''}`
          : t.readingFallback

        const ayahPart = verseKey ? `${t.ayah} ${verseKey}` : pageInfo
        const state = [ayahPart, reciterName].filter(Boolean).join(' • ')
        if (state)
          presenceData.state = state

        if (audio && !audio.paused && !Number.isNaN(audio.duration) && audio.duration > 0) {
          setCategory('reading')
          presenceData = { ...presenceData, type: ActivityType.Listening }
          ;[presenceData.startTimestamp, presenceData.endTimestamp] = getTimestampsFromMedia(audio)
        }
        else {
          setCategory('reading')
          presenceData.startTimestamp = browsingTimestamp
          if (audioSrc) {
            presenceData.smallImageKey = Assets.Pause
            presenceData.smallImageText = strings.paused
          }
        }
      }
    }

    if (pathname !== '/') {
      presenceData.buttons = [
        {
          label: strings.buttonViewPage,
          url: window.location.href,
        },
      ]
    }

    presence.setActivity(presenceData)
  }
  catch (error) {
    presence.error(`Failed to update presence: ${error}`)
  }
})
