import { Assets } from 'premid'

const presence = new Presence({
  clientId: '503557087041683458',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)
const slideshow = presence.createSlideshow()

enum ActivityAssets {
  Logo = 'https://i.imgur.com/Sj13xSA.png',
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
    const rowId = row.firstElementChild ?? row.lastElementChild
    if (rowId) { // not a roll-over cat
      const [pickA, pickB] = row.querySelectorAll<HTMLTableCellElement>('.cat')
      if (!pickA || !pickB)
        continue
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
        ...presenceData,
        smallImageKey: Assets.Question,
      }
      const baseText = `${currentRowNumber} - ${mainPick.querySelector('a')?.textContent}`
      data.smallImageText = extraPick.childElementCount > 0
        ? baseText
        : `${baseText} or ${extraPick.querySelector('a')?.textContent} guaranteed`
      data.buttons?.push({
        label: 'View Cat',
        url: mainPick.querySelector('a'),
      })
      slideshow.addSlide(currentRowNumber, data, MIN_SLIDE_TIME)
      if (extraPick.childElementCount) {
        const extraData = { ...data, buttons: presenceData.buttons }
        extraData.buttons?.push({
          label: 'View Guaranteed Cat',
          url: extraPick.querySelector('a'),
        })
        slideshow.addSlide(`${currentRowNumber}G`, extraData, MIN_SLIDE_TIME)
      }
      currentRowNumber = rowId.id ?? ''
    }
  }
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    smallImageKey: Assets.Play,
  }
  const { pathname, href, search } = document.location
  const params = new URLSearchParams(search)
  let useSlideshow = false

  switch (pathname) {
    case '/': {
      presenceData.details = 'Viewing Upcoming Rolls'
      presenceData.state = document.querySelector<HTMLSelectElement>(
        '#event_select',
      )?.selectedOptions[0]?.textContent
      if (Number(params.get('seed'))) {
        generateSlideshow(() => generateSeedTrackerSlides(presenceData))
        presenceData.buttons = [{ label: 'View Rolls', url: href }]
        useSlideshow = true
      }
      break
    }
  }

  presence.setActivity(useSlideshow ? slideshow : presenceData)
})
