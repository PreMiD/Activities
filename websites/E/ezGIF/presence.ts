const presence = new Presence({
  clientId: '1031601950539661363',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/E/ezGIF/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const pathSplit = window.location.pathname.split('/').slice(1)
  const showImages = await presence.getSetting<boolean>('showImages')

  switch (pathSplit[0] ?? '') {
    case '': {
      presenceData.details = 'Browsing homepage'
      break
    }
    case 'archive': {
      presenceData.details = 'Browsing archived tweets'
      break
    }
    case 'help': {
      if (pathSplit[1]) {
        presenceData.details = 'Reading help article'
        presenceData.state = document.querySelector('h1')?.textContent
      }
      else {
        presenceData.details = 'Browsing help and FAQ'
      }
      break
    }
    case 'split': {
      presenceData.details = 'Extracting a frame from a GIF'
      break
    }
    default: {
      if (
        document.querySelector<HTMLFormElement>('#main form')
        || pathSplit[1]
      ) {
        presenceData.details = `Using the '${
          document.querySelector('h1')?.textContent
        }' tool`
        if (pathSplit[1]) {
          const outputImage = document.querySelector<HTMLImageElement>('#output img')
          if (outputImage && showImages)
            presenceData.largeImageKey = outputImage.src
        }
      }
      else {
        presenceData.details = 'Browsing'
        presenceData.state = document.querySelector('h1')?.textContent
      }
    }
  }

  presence.setActivity(presenceData)
})
