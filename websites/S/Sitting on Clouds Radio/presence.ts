import { Assets } from 'premid'

const presence = new Presence({
  clientId: '689724677274337290',
})
const timeElapsed = Math.floor(Date.now() / 1000)
const slideshow = presence.createSlideshow()

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/S/Sitting%20on%20Clouds%20Radio/assets/logo.png',
  }
  const presenceDataSlide: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/S/Sitting%20on%20Clouds%20Radio/assets/logo.png',
  }

  if (document.querySelector('.player_playing__N2IaC')) {
    const songInfoArray = document.querySelectorAll('.marquee_marquee__1MS_n')
    presenceData.details = presenceDataSlide.details = songInfoArray[1]?.textContent
    presenceData.state = `By ${songInfoArray[0]?.textContent}`
    presenceDataSlide.state = `From ${songInfoArray[2]?.textContent}`
    presenceData.smallImageKey = presenceDataSlide.smallImageKey = Assets.Live
    presenceData.startTimestamp = presenceDataSlide.startTimestamp = timeElapsed
    slideshow.addSlide('slideArtist', presenceData, 5000)
    slideshow.addSlide('slideAlbum', presenceDataSlide, 5000)
  }
  else {
    presenceData.details = 'Not tuned in.'
    presenceData.smallImageKey = Assets.Pause
  }
  if (slideshow.getSlides().length > 0)
    presence.setActivity(slideshow)
  else presence.setActivity(presenceData)
})
