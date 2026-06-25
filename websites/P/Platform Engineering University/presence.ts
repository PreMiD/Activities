import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1519641524185337916',
})

enum ActivityAssets {
  Logo = 'https://i.imgur.com/iNgO4NQ.png',
}


const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp
  }

  // Information needed to determine what user is doing
  const { pathname } = document.location

  if (document.querySelector('div.lesson-page')) {
    presenceData.details = `Studying: ${document.querySelector('h1.course-title')?.textContent.trim()}`
    presenceData.state = `Lesson: ${document.querySelector('div.lesson-top > h2')?.innerHTML}`
    presenceData.buttons = [{ label: 'Learn Yourself', url: document.location.href }]
  

    if (document.querySelector('div.jw-icon-playback')?.ariaLabel == "Play") {
      presenceData.smallImageKey = Assets.Play
    } else if (document.querySelector('div.jw-icon-playback')?.ariaLabel == "Pause") {
      presenceData.smallImageKey = Assets.Pause
    }
  }
  else {
    presenceData.details = "Browsing..."
  }

  presence.setActivity(presenceData)
})