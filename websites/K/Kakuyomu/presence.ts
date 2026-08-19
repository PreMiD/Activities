import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '1539531465811828777',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://i.postimg.cc/JhcZ6VyH/kakuyomu.png',
}

presence.on('UpdateData', async () => {
  const { pathname } = document.location

  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    largeImageKey: ActivityAssets.Logo,
    largeImageText: 'Kakuyomu (カクヨム)',
    startTimestamp: browsingTimestamp,
  }

  if (pathname.includes('/episodes/')) {
    const workTitle
      = document.querySelector('#contentMain header h1 a, #workTitle a, .widget-toc-work-title a')?.textContent?.trim()
        || document.title.split(' - ')[1]
        || 'Web Novel'

    const episodeTitle
      = document.querySelector('.widget-episode-title, h1.widget-episodeTitle')?.textContent?.trim()
        || document.title.split(' - ')[0]
        || 'Reading Episode'

    presenceData.details = `Reading: ${workTitle}`
    presenceData.state = episodeTitle
    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = 'Reading'
  }
  else if (pathname.includes('/works/')) {
    const workTitle
      = document.querySelector('#workTitle, h1#work-title')?.textContent?.trim()
        || document.title.split(' - ')[0]
        || 'Novel Overview'

    presenceData.details = 'Browsing Novel'
    presenceData.state = workTitle
    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = 'Viewing'
  }
  else {
    presenceData.details = 'Browsing Kakuyomu'
    presenceData.state = 'Finding stories...'
  }

  presence.setActivity(presenceData)
})
