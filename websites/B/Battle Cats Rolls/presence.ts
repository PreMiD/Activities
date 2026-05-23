import { Assets } from 'premid'

const presence = new Presence({
  clientId: '503557087041683458',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)
const slideshow = presence.createSlideshow()

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/B/Battle%20Cats%20Rolls/assets/logo.png',
}

let slideshowGenerated = false
async function generateSlideshow(cb: () => Awaitable<void>) {
  if (slideshowGenerated)
    return
  await cb()
  slideshowGenerated = true
}

function generateSeedTrackerSlides(presenceData: PresenceData) {
  const rows = document.querySelectorAll('tr')
  let currentRowNumber = ''
  for (const row of rows) {
    const rowId = [row.firstElementChild, row.lastElementChild].find(row => !!row?.id)
    if (rowId) {
      // not a roll-over cat
      const [pickA, pickB] = row.querySelectorAll<HTMLTableCellElement>('.cat')
      if (!pickA || !pickB) {
        currentRowNumber = rowId.textContent ?? ''
        continue
      }
      let mainPick: HTMLTableCellElement
      let extraPick: HTMLTableCellElement
      if (pickA?.getAttribute('onclick')?.includes('G')) {
        mainPick = pickB
        extraPick = pickA
      }
      else {
        mainPick = pickA
        extraPick = pickB
      }
      const data: PresenceData = {
        ...structuredClone(presenceData),
        smallImageKey: Assets.Question,
      }
      const baseText = `${currentRowNumber} - ${mainPick.querySelector('a')?.textContent}`
      data.smallImageText = extraPick.childElementCount === 0
        ? baseText
        : `${baseText} or ${extraPick.querySelector('a')?.textContent} guaranteed`
      data.buttons?.push({
        label: 'View Cat',
        url: mainPick.querySelector<HTMLAnchorElement>('a:last-child'),
      })
      slideshow.addSlide(currentRowNumber, data, MIN_SLIDE_TIME)
      if (extraPick.childElementCount) {
        const extraData: PresenceData = { ...data, buttons: structuredClone(presenceData.buttons) }
        extraData.buttons?.push({
          label: 'View Guaranteed Cat',
          url: extraPick.querySelector<HTMLAnchorElement>('a:last-child'),
        })
        slideshow.addSlide(`${currentRowNumber}G`, extraData, MIN_SLIDE_TIME)
      }
      currentRowNumber = rowId.textContent ?? ''
    }
  }
}

function generateCatDetailSlides(presenceData: PresenceData) {
  const catVariants = [
    ...document.querySelectorAll<HTMLTableCellElement>('th:first-child'),
  ].map(e => e.parentElement)
  const variantSet = new Set(catVariants)
  const rows = document.querySelectorAll('tr')
  let catName = catVariants[0]?.textContent ?? ''
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    if (row && variantSet.has(row)) {
      catName = row.textContent ?? ''
      continue
    }
    if (
      row?.childElementCount === 6
      && !row.classList.contains('attack')
    ) {
      for (let i = 0; i < 3; i++) {
        const statName = row.children[i * 2]?.textContent
        const statValue = row.children[i * 2 + 1]?.textContent
        const data: PresenceData = {
          ...presenceData,
          state: catName,
          smallImageKey: Assets.Search,
          smallImageText: `${statName} - ${statValue}`,
        }
        slideshow.addSlide(`${catName} - ${statName}`, data, MIN_SLIDE_TIME)
      }
    }
  }
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    name: 'Battle Cats Rolls',
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const { pathname, href, search } = document.location
  const mainPath = pathname.split('/')[1] || '/'
  const params = new URLSearchParams(search)
  let useSlideshow = false

  switch (mainPath) {
    case '/': {
      presenceData.details = 'Viewing Upcoming Rolls'
      presenceData.state = document.querySelector<HTMLSelectElement>(
        '#event_select',
      )?.selectedOptions[0]?.textContent
      if (Number(params.get('seed'))) {
        presenceData.buttons = [{ label: 'View Rolls', url: href }]
        generateSlideshow(() => generateSeedTrackerSlides(presenceData))
        useSlideshow = true
      }
      break
    }
    case 'cats': {
      if (pathname === '/cats') {
        presenceData.details = 'Searching for Cats'
      }
      else {
        presenceData.details = 'Viewing a Cat'
        presenceData.buttons = [{ label: 'View Cat', url: href }]
        generateSlideshow(() => generateCatDetailSlides(presenceData))
        useSlideshow = true
      }
      break
    }
    case 'help': {
      presenceData.details = 'Reading Tutorial'
      break
    }
    case 'logs': {
      presenceData.details = 'Reading Changelog'
      break
    }
    case 'seek': {
      presenceData.details = 'Looking up their seed'
      if (pathname.includes('result')) {
        const seed = document.querySelector<HTMLAnchorElement>('li:nth-of-type(2) a')
        if (seed) {
          presenceData.state = 'Viewing result'
          presenceData.buttons = [{ label: 'View Seed', url: seed }]
        }
        else {
          presenceData.state = 'Pending results'
        }
      }
      break
    }
  }

  presence.setActivity(useSlideshow ? slideshow : presenceData)
})
