import { Assets } from 'premid'
import { findNearestAboveElement, squareImage } from '../util/util.js'

// Wiki-specific groups of pages
const strategies = new Set([
  'Sakigiri',
  'Suji',
  'Kabe',
  'Betaori',
  'Kawa',
  'Sashikomi',
  'Defense',
  'Tile_efficiency',
  'Atozuke',
  'Yaku_compatibility',
  'Damaten',
  'Kan',
  'Machi',
  'Riichi_strategy',
  'Shanten',
  'Tenpai',
  'Ukeire',
  'What_would_you_discard',
  'Dora',
])
const yaku = new Set([
  'Menzenchin_tsumohou',
  'Riichi',
  'Ippatsu',
  'Pinfu',
  'Iipeikou',
  'Haitei raoyue and houtei raoyui',
  'Rinshan_kaihou',
  'Chankan',
  'Tanyao',
  'Yakuhai',
  'Daburu_riichi',
  'Chanta',
  'Sanshouku_doujun',
  'Ikkitsuukan',
  'Toitoihou',
  'Sanankou',
  'Sanshoku_doukou',
  'Sankantsu',
  'Chiitoitsu',
  'Honroutou',
  'Shousangen',
  'Honiisou',
  'Junchantaiyaochuu',
  'Ryanpeikou',
  'Chiniisou',
  'Kazoe_yakuman',
  'Kokushi_musou',
  'Suuankou',
  'Daisangen',
  'Suushiihou',
  'Tsuuiisou',
  'Chinroutou',
  'Ryuuiisou',
  'Chuuren_poutou',
  'Suukantsu',
  'Tenhou_and_chiihou',
  'Nagashi_mangan',
])
const games = new Set(['Riichi_City', 'Majsoul', 'Sega_MJ', 'Tenhou.net'])
const SLIDESHOW_TIMEOUT = 6000

/**
 * Applies page details based on the current location.
 *
 * @param presenceData
 * @returns Whether the page uses slideshows.
 */
export async function specialPageHandler(
  presenceData: PresenceData,
  slideshow: Slideshow,
): Promise<boolean> {
  const { pathname, href, search } = document.location
  const searchParams = new URLSearchParams(search)
  const pageTitle = document.querySelector<HTMLSpanElement>('.mw-page-title-main')
  let firstPath = pathname.split('/').find(Boolean)
  let usesSlideshows = false
  if (firstPath === 'index.php')
    firstPath = searchParams.get('title') ?? ''

  if (searchParams.has('search')) {
    presenceData.details = 'Searching for a page'
    presenceData.state = document.querySelector<HTMLInputElement>(
      '#searchText > input',
    )?.value
  }
  else if (searchParams.has('action') || searchParams.has('veaction')) {
    const action = searchParams.get('action') ?? searchParams.get('veaction')
    switch (action) {
      case 'edit': {
        presenceData.details = 'Editing a page'
        presenceData.state = document.querySelector<HTMLSpanElement>('#firstHeadingTitle')
          ?? pageTitle
        break
      }
      case 'history': {
        presenceData.details = 'Viewing the revision history of a page'
        presenceData.state = pageTitle
        break
      }
    }
  }
  else {
    // Common WikiMedia pages
    switch (true) {
      case firstPath?.startsWith('Talk:'): {
        presenceData.details = `Viewing the talk page for '${pageTitle?.textContent}'`
        break
      }
      case firstPath?.startsWith('User:'): {
        presenceData.details = 'Viewing a user page'
        presenceData.state = pageTitle
        presenceData.buttons = [{ label: 'View User Page', url: href }]
        break
      }
      case firstPath?.startsWith('User_talk:'): {
        presenceData.details = 'Viewing a user\'s talk page'
        presenceData.state = pageTitle
        break
      }
      case firstPath?.startsWith('File:'): {
        presenceData.details = 'Viewing a file'
        presenceData.state = pageTitle
        presenceData.smallImageKey = await squareImage(
          document.querySelector<HTMLImageElement>('#file img')!,
        )
        break
      }
      case firstPath?.startsWith('Category:'): {
        presenceData.details = 'Viewing a category'
        presenceData.state = pageTitle
        presenceData.buttons = [{ label: 'View Category', url: href }]
        break
      }
      case firstPath === 'Special:Upload': {
        presenceData.details = 'Uploading a file'
        break
      }
      case firstPath === 'Special:Contributions': {
        presenceData.details = 'Viewing a user\'s contributions'
        presenceData.state = document.querySelector<HTMLAnchorElement>(
          '.mw-contributions-user-tools > a',
        )
        break
      }
    }
    // Wiki-specific pages
    switch (firstPath) {
      case 'Jikaze': {
        presenceData.details = 'Reading about seat winds'
        break
      }
      case 'List_of_Mahjong_Soul_characters': {
        const characters = document.querySelectorAll<HTMLLIElement>(
          'h2 + ul[style] > li',
        )
        presenceData.details = 'Viewing Mahjong Soul characters'
        usesSlideshows = true
        for (const character of characters) {
          const tmpPresenceData: PresenceData = { ...presenceData }
          const characterImage = character.querySelector('img')
          const characterName = character.querySelector('p > b')
          tmpPresenceData.smallImageKey = await squareImage(characterImage!)
          tmpPresenceData.smallImageText = characterName?.textContent
          tmpPresenceData.state = characterName?.textContent
          slideshow.addSlide(
            characterName?.textContent ?? '',
            tmpPresenceData,
            SLIDESHOW_TIMEOUT,
          )
        }
        break
      }
      case 'List_of_mahjong_video_games': {
        presenceData.details = 'Viewing the list of mahjong video games'
        break
      }
      case 'List_of_Riichi_City_characters': {
        const characters = document.querySelectorAll<HTMLLIElement>(
          '.riichi-city-characters > li',
        )
        presenceData.details = 'Viewing Riichi City characters'
        usesSlideshows = true
        for (const character of characters) {
          const tmpPresenceData: PresenceData = { ...presenceData }
          const characterImage = character.querySelector('img')
          const characterName = character.querySelector('p > b')
          tmpPresenceData.smallImageKey = await squareImage(characterImage!)
          tmpPresenceData.smallImageText = characterName?.textContent
          tmpPresenceData.state = characterName?.textContent
          slideshow.addSlide(
            characterName?.textContent ?? '',
            tmpPresenceData,
            SLIDESHOW_TIMEOUT,
          )
        }
        break
      }
      case 'List_of_yaku': {
        const tables = document.querySelectorAll<HTMLDivElement>(
          '.content-table-wrapper',
        )
        presenceData.details = 'Viewing list of yaku'
        usesSlideshows = true
        for (const table of tables) {
          const tmpPresenceData: PresenceData = { ...presenceData }
          const mainName = table.querySelector('a')
          const englishName = table.querySelector('dd dl')
          const closed = table.querySelector('dd + dd')
          const description = table.querySelector<HTMLTableCellElement>('td:last-child')
          const sectionHeader = findNearestAboveElement(table, 'h2')?.querySelector(
            '.mw-headline',
          )
          if (!table.querySelector('.wikitable'))
            continue
          tmpPresenceData.state = `${mainName?.textContent} (${englishName?.textContent}) - ${sectionHeader?.textContent}`
          tmpPresenceData.smallImageKey = Assets.Question
          tmpPresenceData.smallImageText = `${closed?.textContent} - ${description?.textContent}`
          tmpPresenceData.buttons = [{ label: 'View Yaku', url: mainName }]
          slideshow.addSlide(
            mainName?.textContent ?? '',
            tmpPresenceData,
            SLIDESHOW_TIMEOUT,
          )
        }
        break
      }
      case 'Local_yaku': {
        presenceData.details = 'Viewing local yaku'
        break
      }
      case 'Mahjong_equipment': {
        const tables = document.querySelectorAll<HTMLDivElement>(
          '.content-table-wrapper',
        )
        presenceData.details = 'Reading about the mahjong equipment'
        usesSlideshows = true
        for (const table of tables) {
          const sectionTitle = table.previousElementSibling?.querySelector<HTMLSpanElement>(
            '.mw-headline',
          )
          const images = table
            .querySelector<HTMLTableRowElement>('tbody > tr')
            ?.querySelectorAll<HTMLImageElement>('td img')
          const descriptions = table
            .querySelector<HTMLTableRowElement>('tbody > tr + tr')
            ?.querySelectorAll<HTMLTableCellElement>('td')
          for (const [i, image] of (images?.entries() ?? [])) {
            const tmpPresenceData: PresenceData = { ...presenceData }
            tmpPresenceData.smallImageKey = await squareImage(image!)
            tmpPresenceData.smallImageText = descriptions?.[i]?.textContent
            tmpPresenceData.state = sectionTitle?.textContent
            slideshow.addSlide(
              descriptions?.[i]?.textContent ?? '',
              tmpPresenceData,
              SLIDESHOW_TIMEOUT,
            )
          }
        }
        break
      }
      case 'Mentsu': {
        presenceData.details = 'Reading about tile groups'
        break
      }
      case 'Rules_overview': {
        presenceData.details = 'Reading the rules'
        break
      }
    }
    // Wiki-specific groups of pages
    for (const strategy of strategies) {
      if (firstPath === strategy) {
        presenceData.details = 'Reading about a strategy'
        presenceData.state = pageTitle
        presenceData.buttons = [{ label: 'View Strategy', url: href }]
        break
      }
    }
    for (const yakuPage of yaku) {
      if (firstPath === yakuPage) {
        presenceData.details = 'Reading about a yaku'
        presenceData.state = pageTitle
        presenceData.buttons = [{ label: 'View Yaku', url: href }]
        break
      }
    }
    for (const game of games) {
      if (firstPath === game) {
        presenceData.details = 'Reading about a mahjong game'
        presenceData.state = pageTitle
        presenceData.buttons = [{ label: 'View Game', url: href }]
        break
      }
    }

    if (!presenceData.details) {
      presenceData.details = 'Viewing a page'
      presenceData.state = pageTitle
    }
  }
  return usesSlideshows
}
