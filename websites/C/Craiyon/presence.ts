const presence = new Presence({
  clientId: '1015402986534608948',
})
const slideshow = presence.createSlideshow()
const logo = 'https://cdn.rcd.gg/PreMiD/websites/C/Craiyon/assets/logo.png'

type State = 'start' | 'generation' | 'results'

let browsingTimestamp: number = Date.now() / 1000
let oldPrompt: string | undefined
let oldPath: string | undefined
let activityState: State = 'start'
let searchResultCacheTimestamp = 0

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: logo,
    startTimestamp: browsingTimestamp,
  }
  const { pathname, href } = document.location
  const pathList = pathname.split('/').filter(Boolean)

  let useSlideshow = false
  if (oldPath !== pathname) {
    oldPath = pathname
    slideshow.deleteAllSlides()
  }

  switch (pathList[0] ?? '/') {
    case '/': {
      const input = document.querySelector<HTMLTextAreaElement>('#prompt')
      const imageContainers = document.querySelectorAll<HTMLImageElement>(
        '.image-container img',
      )
      presenceData.state = input?.value
        ? `"${input.value}"`
        : 'Waiting for input...'
      if (
        document.querySelector<HTMLButtonElement>('#generateButton')?.disabled
      ) {
        if (activityState !== 'generation') {
          presenceData.startTimestamp = browsingTimestamp = Date.now() / 1000
          oldPrompt = input?.value
          activityState = 'generation'
          slideshow.deleteAllSlides()
        }
        presenceData.details = 'Generating images'
        presenceData.state = `"${oldPrompt}"`
      }
      else {
        if (activityState !== 'results') {
          presenceData.startTimestamp = browsingTimestamp = Date.now() / 1000
          activityState = 'results'
          slideshow.deleteAllSlides()
        }
        if (
          (document.activeElement === input && input?.value !== oldPrompt)
          || !imageContainers.length
        ) {
          presenceData.details = 'Thinking of a prompt'
        }
        else {
          presenceData.details = 'Viewing results'
          presenceData.state = `"${oldPrompt}"`

          for (const [i, image] of imageContainers.entries()) {
            const presenceDataCopy = Object.assign({}, presenceData)
            presenceDataCopy.largeImageKey = image
            slideshow.addSlide(`image${i}`, presenceDataCopy, 5000)
          }
          useSlideshow = true
        }
      }
      break
    }
    case 'image': {
      presenceData.details = 'Viewing an image'
      presenceData.state = (
        document
          .evaluate('//p[text()=\'Prompt\']', document.body)
          .iterateNext() as HTMLParagraphElement
      ).nextElementSibling
      presenceData.largeImageKey = document.querySelector<HTMLImageElement>('main img')
      presenceData.buttons = [
        {
          label: 'View Image Details',
          url: href,
        },
      ]
      break
    }
    case 'search': {
      if (pathList.length > 1) {
        presenceData.details = 'Viewing search results'
        presenceData.state = document.querySelector('input')?.value
        const now = Date.now()
        if (now - searchResultCacheTimestamp > 5000) {
          searchResultCacheTimestamp = now

          for (const [i, image] of document
            .querySelectorAll<HTMLImageElement>('main a img')
            .entries()) {
            const presenceDataCopy = Object.assign({}, presenceData)
            presenceDataCopy.largeImageKey = image
            slideshow.addSlide(`image${i}`, presenceDataCopy, 5000)
          }
        }
        useSlideshow = true
      }
      else {
        presenceData.details = 'Searching for images'
      }
      break
    }
    case 'blog': {
      if (pathList.length > 1) {
        presenceData.details = 'Reading a blog post'
        presenceData.state = document.querySelector('h1')
        presenceData.largeImageKey = document.querySelector<HTMLImageElement>('main p + img')
        presenceData.buttons = [
          {
            label: 'View Blog Post',
            url: href,
          },
        ]
      }
      else {
        presenceData.details = 'Browsing blog posts'
      }
      break
    }
    case 'privacy': {
      presenceData.details = 'Reading privacy policy'
      break
    }
    case 'terms': {
      presenceData.details = 'Reading terms and conditions'
      break
    }
  }
  if (presenceData.details) {
    if (useSlideshow)
      presence.setActivity(slideshow)
    else presence.setActivity(presenceData)
  }
  else {
    presence.setActivity()
  }
})
