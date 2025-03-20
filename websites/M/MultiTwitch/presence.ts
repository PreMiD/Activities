const presence = new Presence({
  clientId: '1077743931460177972',
})
const slideshow = presence.createSlideshow()
const watchingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const currentStreams = document.location.pathname
    .split('/')
    .filter((str) => {
      return str !== ''
    })
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/M/MultiTwitch/assets/0.png',
  }

  if (currentStreams.length === 0) {
    presenceData.details = 'On the home screen'
    if (await presence.getSetting('showButton')) {
      presenceData.buttons = [
        {
          label: 'Open MultiTwitch',
          url: document.location.href,
        },
      ]
    }
    presence.setActivity(presenceData)
  }
  else if (await presence.getSetting('showStreamers')) {
    for (const stream of currentStreams) {
      slideshow.addSlide(
        stream,
        {
          largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/M/MultiTwitch/assets/0.png',
          details: `Watching ${currentStreams.length} ${
            currentStreams.length > 1 ? 'streams' : 'stream'
          }`,
          state: stream,
        },
        5000,
      )
    }
    if (await presence.getSetting('showButton')) {
      for (const slide of slideshow.getSlides()) {
        const pDat = slide.data
        pDat.buttons = [
          {
            label: 'Open MultiTwitch',
            url: document.location.href,
          },
        ]
        slide.updateData(pDat)
      }
    }
    presence.setActivity(slideshow)
  }
  else {
    slideshow.deleteAllSlides()
    presenceData.details = `Watching ${currentStreams.length} ${
      currentStreams.length > 1 ? 'streams' : 'stream'
    }`
    presenceData.startTimestamp = watchingTimestamp
    presence.setActivity(presenceData)
  }
})
