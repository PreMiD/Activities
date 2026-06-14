import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1515699905765834912',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'data:image/png;base64,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',
}

//#regions FUNCTIONS
/**
 * Function to retrieve the page
 * @returns Return it
 */
async function getData() {
  let data = {
    success: false,
    details: "",
    image: "",
    state: "",
    buttons: {} as {
      label: string,
      url: string
    }
  }
  const url = document.location
  if (url.pathname === '/') {
    data.success = true
    data.details = 'Dans le menu d\'accueil'
  }
  else if (url.pathname.startsWith('/search')) {
    data.success = true
    data.details = 'Recherche un manga'
    if (url.search) {
      data.details += ` : "${await searchPageValueProperly(url.search)}"`
    }
  }
  else if (url.pathname.startsWith('/manga')) {
    let mangaInfo = await mangaPageInfos(url.pathname)
    if (mangaInfo) {
      data.success = true
      data.details = `Regarde la page du manga : ${mangaInfo.name}`
      data.image = mangaInfo.image
      data.buttons = mangaInfo.buttons
    }
  }
  else if (url.pathname.startsWith('/scan')) {
    let scanInfos = await scanPagaInfos()
    if (scanInfos) {
      data.success = true
      data.details = `Regarde : ${scanInfos.nameManga}`
      data.state = `Chapitre ${scanInfos?.chapter
        } • Page ${scanInfos.page}`
      data.buttons = scanInfos.buttons
    }
  }
  return data
}

/**
 * Function to retrieve the search value cleanly
 * @param value Default search value
 * @returns Return the search properly
 */
async function searchPageValueProperly(value: string) {
  let deleteQuery = value.replace('?q=', '')
  let removePlus = deleteQuery.replaceAll('+', ' ')
  let decode = decodeURIComponent(removePlus)
  return decode
}

/**
 * Function to retrieve the manga values ​​in the manga page
 * @param value Value in manga url
 */
async function mangaPageInfos(value: string) {
  let data = {
    name: "",
    image: "",
    buttons: {} as {
      label: string,
      url: string
    }
  }
  async function getNameManga(value: string) {
    let removeManga = value.replace('/manga/', '')
    let removeSlash = removeManga.replace('/', '')
    let removeUnderscore = removeSlash.replaceAll('_', ' ')
    const arrayManga = removeUnderscore.split(" ");
    let nameManga = await capitalizeMangaName(arrayManga)
    let decode = decodeURIComponent(nameManga)
    data.name = decode
  }
  async function getImageManga() {
    let dom = document.getElementById("manga-cover")
    if (dom) {
      data.image = dom.getAttribute("src") || ""
    }
  }
  async function forButtons() {
    data.buttons = {
      label: 'Voir la page du manga',
      url: document.location.href
    }
  }
  await getNameManga(value)
  await getImageManga()
  await forButtons()
  return data
}

/**
 * Function to capitalize the name of the current manga
 * @param value Manga Name Array
 * @returns Return the name of the manga in capitalize
 */
async function capitalizeMangaName(value: Array<string>) {
  let response: string = ""
  value.forEach(res => {
    response += capitalize(res) + " "
  })
  return response
}

/**
 * Function to capitalize the first letter of a string
 * @param str Value to capitalize
 * @returns  Return the value with the first letter in capitalize
 */
function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Function to retrieve the scan page information
 * @returns  Return the information of the scan page
 */
async function scanPagaInfos() {
  let data = {
    nameManga: "",
    chapter: "",
    page: "",
    buttons: {} as {
      label: string,
      url: string
    }
  }
  async function getNameManga() {
    let dom = document.getElementById("readerMangaTitle")
    if (dom) {
      data.nameManga = dom.innerText
    }
  }
  async function getChapter() {
    let dom = document.getElementById("readerChapterBtn")
    if (dom) {
      data.chapter = dom.children[0]?.innerHTML || ""
    }
  }
  async function getPage() {
    let current = document.getElementById("readerCurrentPage")
    let max = document.getElementById("readerTotalPages")
    if (current && max) {
      data.page = `${current.innerHTML} / ${max.innerHTML}`
    }
  }
  async function forButtons() {
    data.buttons = {
      label: 'Voir le manga',
      url: document.location.href
    }
  }
  await getNameManga()
  await getChapter()
  await getPage()
  await forButtons()
  return data
}
//#endregions FUNCTIONS

presence.on('UpdateData', async () => {
  let state: string | undefined
  let presenceData: PresenceData
  let details = await getData()
  if (details.success) {
    presenceData = {
      details: details.details,
      state: details.state || state,
      largeImageKey: details.image || ActivityAssets.Logo,
      startTimestamp: browsingTimestamp,
    }
    if (Object.keys(details.buttons).length > 0) {
      presenceData.buttons = [
        {
          label: details.buttons.label,
          url: details.buttons.url,
        },
      ]
    }
    presence.setActivity(presenceData)
  }
})