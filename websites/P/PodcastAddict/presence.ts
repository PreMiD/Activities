import { Assets } from 'premid'

const presence = new Presence({
  clientId: '835652520637890620',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/P/PodcastAddict/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const { pathname, search } = document.location

  if (pathname === '/' && search.substr(0, 2) === '?q') {
    presenceData.details = 'Searching:'
    presenceData.state = document.querySelector('.caption')?.textContent
    presenceData.smallImageKey = Assets.Search
  }
  else if (pathname === '/') {
    presenceData.details = 'Viewing the homepage'
  }
  else if (pathname.startsWith('/app')) {
    presenceData.details = 'Reading the app page'
  }
  else if (pathname.startsWith('/ads')) {
    presenceData.details = 'Reading the ads page'
  }
  else if (pathname.startsWith('/privacy')) {
    presenceData.details = 'Reading the privacy policy & ToS page'
  }
  else if (pathname.startsWith('/submit')) {
    presenceData.details = 'Reading the podcast submission page'
  }
  else if (pathname.startsWith('/podcasters')) {
    presenceData.details = 'Reading the podcasters page'
  }
  else if (pathname.startsWith('/premium')) {
    presenceData.details = 'Reading the premium page'
  }
  else if (pathname.startsWith('/faq')) {
    presenceData.details = 'Reading the FAQ page'
  }
  else if (pathname.startsWith('/changelog')) {
    presenceData.details = 'Reading the changelog page'
  }
  else if (pathname.startsWith('/contact')) {
    presenceData.details = 'Reading the contact page'
  }
  else if (pathname.startsWith('/podcast')) {
    presenceData.details = 'Viewing:'
    presenceData.state = document.querySelector('.caption')?.textContent
    presenceData.smallImageKey = Assets.Viewing
    presenceData.buttons = [
      { label: 'View Podcast', url: window.location.href },
    ]
  }
  else if (pathname.startsWith('/episode')) {
    const elapsedTime = presence.timestampFromFormat(
      document.querySelector('#elapsedTime')?.textContent ?? '',
    )

    presenceData.buttons = [
      { label: 'Listen Along', url: window.location.href },
    ]
    presenceData.details = document.querySelector('.pure-button')?.textContent
    presenceData.state = document.querySelector('.title')?.textContent
    if (
      !document
        .querySelector('#play-pause-button')
        ?.classList
        .contains('fa-play-circle')
    ) {
      [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(
        elapsedTime,
        presence.timestampFromFormat(
          document.querySelector('#remainingTime')?.textContent?.substr(1) ?? '',
        ) + elapsedTime,
      )
      presenceData.smallImageKey = Assets.Play
    }
    else {
      presenceData.smallImageKey = Assets.Pause
    }
  }
  presence.setActivity(presenceData)
})
