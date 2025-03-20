const presence = new Presence({
  clientId: '1037407267336753152',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)
const slideshow = presence.createSlideshow()

async function getListImages() {
  return await Promise.all(
    [
      ...document.querySelectorAll<HTMLDivElement>(
        '.image-prompt-overlay-container',
      ),
    ].map(async container => [
      await getShortURL(
        container.querySelector<HTMLImageElement>('.generated-image > img')!.src,
      ),
      container.querySelector<HTMLDivElement>('.image-prompt-overlay')!
        .textContent,
    ]),
  )
}

const shortenedURLs: Record<string, string> = {}
async function getShortURL(url: string) {
  if (url.length < 256)
    return url
  if (shortenedURLs[url])
    return shortenedURLs[url]
  try {
    const pdURL = await (
      await fetch(`https://pd.premid.app/create/${url}`)
    ).text()
    shortenedURLs[url] = pdURL
    return pdURL
  }
  catch (err) {
    presence.error(err as string)
    return url
  }
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/D/DALL-E/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const { pathname, href } = window.location
  const showImages = await presence.getSetting<boolean>('showImages')

  if (pathname === '/') {
    const input = document.querySelector<HTMLInputElement>(
      '.image-prompt-input',
    )
    if (input?.value) {
      presenceData.details = 'Crafting a prompt'
      presenceData.state = input.value
    }
    else {
      presenceData.details = 'Thinking of a prompt'
    }
  }
  else if (pathname.startsWith('/history')) {
    if (showImages) {
      const images = await getListImages()
      if (images.length > 0) {
        for (const [i, [image, text]] of images.entries()) {
          slideshow.addSlide(
            i.toString(),
            {
              ...presenceData,
              details: 'Viewing history',
              state: text,
              largeImageKey: image,
            },
            5000,
          )
        }
      }
      else {
        presenceData.details = 'Viewing history'
      }
    }
    else {
      presenceData.details = 'Viewing history'
    }
  }
  else if (pathname.startsWith('/c/')) {
    if (showImages) {
      const images = await getListImages()
      if (images.length === 0) {
        presenceData.details = 'Viewing a collection'
        presenceData.state = document.querySelector<HTMLDivElement>('[class*=h3]')?.textContent
      }
      else {
        for (const [i, [image, text]] of images.entries()) {
          const slide = {
            ...presenceData,
            details: `Viewing collection: ${
              document.querySelector<HTMLDivElement>('[class*=h3]')?.textContent
            }`,
            state: text,
            largeImageKey: image,
          }
          if (
            !document.querySelector<HTMLDivElement>(
              '.collection-layout-private',
            )
            && !pathname.includes('/private')
          ) {
            slide.buttons = [
              {
                label: 'View Collection',
                url: href,
              },
            ]
          }
          slideshow.addSlide(i.toString(), slide, 5000)
        }
      }
    }
    else {
      presenceData.details = 'Viewing a collection'
      presenceData.state = document.querySelector<HTMLDivElement>('[class*=h3]')?.textContent
    }
  }
  else if (pathname.startsWith('/collections')) {
    presenceData.details = 'Viewing collections'
  }
  else if (pathname.startsWith('/account')) {
    presenceData.details = 'Viewing their account'
  }
  else if (pathname.startsWith('/e/')) {
    const input = document.querySelector<HTMLInputElement>(
      '.image-prompt-input',
    )?.value
    if (showImages) {
      const images = await Promise.all(
        [
          ...document.querySelectorAll<HTMLImageElement>(
            '.task-page-generations-img .generated-image > img',
          ),
        ].map(image => getShortURL(image.src)),
      )
      const centeredImage = document.querySelector<HTMLImageElement>(
        '.edit-page-image .generated-image > img',
      )
      if (images.length === 0 && !centeredImage) {
        presenceData.details = 'Generating images'
        presenceData.state = input
      }
      else if (centeredImage) {
        presenceData.details = 'Viewing an image'
        presenceData.largeImageKey = await getShortURL(centeredImage.src)
      }
      else {
        for (const [i, image] of images.entries()) {
          slideshow.addSlide(
            i.toString(),
            {
              ...presenceData,
              details: 'Viewing a generation',
              state: input,
              largeImageKey: image,
            },
            5000,
          )
        }
      }
    }
    else {
      presenceData.details = 'Viewing a generation'
      presenceData.state = input
    }
  }
  else if (pathname.startsWith('/s/')) {
    presenceData.details = 'Viewing an image'
    presenceData.state = document.querySelector<HTMLHeadingElement>(
      '.gen-detail-caption',
    )?.textContent
    presenceData.buttons = [{ label: 'View Image', url: href }]
    if (showImages) {
      presenceData.largeImageKey = await getShortURL(
        document.querySelector<HTMLImageElement>('.generated-image > img')!.src,
      )
    }
  }
  else if (pathname.startsWith('/editor')) {
    presenceData.details = 'Using the image editor'
  }
  else {
    presenceData.details = 'Browsing'
    // eslint-disable-next-line regexp/no-useless-quantifier, regexp/optimal-quantifier-concatenation
    presenceData.state = document.title.match(/^(.*)?( \| DALL·E)?$/)?.[1]
  }

  if (presenceData.details) {
    presence.setActivity(presenceData)
    slideshow.deleteAllSlides()
  }
  else if (slideshow.getSlides().length > 0) {
    presence.setActivity(slideshow)
  }
  else {
    presence.setActivity()
  }
})
