import { Assets } from 'premid'

const presence = new Presence({
  clientId: '503557087041683458',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/F/FlaviBot/assets/logo.png',
    startTimestamp: browsingTimestamp,
    name: 'FlaviBot',
  }
  const { pathname, href } = document.location

  switch (true) {
    case pathname === '/commands': {
      presenceData.details = `Viewing ${document
        .querySelector('.categorie.active')
        ?.textContent
        ?.toLowerCase()} commands`
      presenceData.buttons = [{ label: 'View Commands', url: href }]
      break
    }
    case pathname === '/status': {
      const children = document
        .querySelector('.stats')
        ?.querySelectorAll('.box')

      presenceData.details = 'Viewing the status page'
      presenceData.state = `${children?.[0]?.textContent} | ${children?.[1]?.textContent} | ${children?.[2]?.textContent}`
      presenceData.buttons = [{ label: 'View Status', url: href }]
      break
    }
    case pathname === '/team': {
      presenceData.details = 'Viewing team members'
      presenceData.buttons = [{ label: 'View Team', url: href }]
      break
    }
    case pathname === 'legal-terms': {
      presenceData.details = 'Reading the tos'
      presenceData.smallImageKey = Assets.Reading
      break
    }
    case pathname === 'privacy-policy': {
      presenceData.details = 'Reading the privacy policy'
      presenceData.smallImageKey = Assets.Reading
      break
    }
    case pathname.endsWith('/profil'): {
      presenceData.details = 'Viewing profile of'
      presenceData.state = document.querySelector('.name')?.textContent
      break
    }
    case pathname.endsWith('/premium'): {
      presenceData.details = 'Viewing premium status'
      break
    }
    case pathname.endsWith('/dashboard'): {
      presenceData.details = 'Viewing the dashboard'
      break
    }
    case !!pathname.match(/\/dashboard\/\d{18}/g)?.[0]: {
      presenceData.details = `Managing dashboard for: ${
        document.querySelector('.active_page-name')?.textContent
        ?? 'Unknown server'
      }`
      presenceData.state = document
        .querySelector('[aria-current="page"]')
        ?.textContent
        ?.replace(/(New)|(Soon)|(Beta)/, '')
      break
    }
    case pathname.includes('/leaderboard'): {
      presenceData.details = 'Viewing a leaderboard'
      presenceData.state = document.querySelector('.top > h1')?.textContent ?? ''
      presenceData.buttons = [{ label: 'View Leaderboard', url: href }]
      break
    }
    case pathname.includes('/music-player/'): {
      const isPlaying = document
        .querySelector('.action.play-big')
        ?.innerHTML
        .includes('M6 19h4V5H6v14zm8-14v14h4V5h-4z')
      const title = document.querySelector('.now-title')?.textContent
      if (!title) {
        presenceData.details = 'Viewing the music player'
      }
      else {
        delete presenceData.startTimestamp
        presenceData.details = title
        presenceData.state = document.querySelector('.author')?.textContent ?? ''

        presenceData.smallImageKey = isPlaying ? Assets.Play : Assets.Pause
        presenceData.smallImageText = isPlaying ? 'Playing' : 'Paused'
        if (isPlaying) {
          [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(
            presence.timestampFromFormat(
              document.querySelector('.time.t-left')?.textContent ?? '',
            ),
            presence.timestampFromFormat(
              document.querySelector('.time.t-right')?.textContent ?? '',
            ),
          )
        }
      }
      break
    }
  }

  presence.setActivity(presenceData)
})
