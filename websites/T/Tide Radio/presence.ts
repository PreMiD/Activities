import { ActivityType } from 'premid'

const presence = new Presence({
  clientId: '1373642276890218517',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)
const DEFAULT_IMAGE = 'https://cdn.rcd.gg/PreMiD/websites/T/Tide%20Radio/assets/logo.png'

function setDefaultPresence(presenceData: PresenceData, state: string) {
  presenceData.details = 'Tide Radio'
  presenceData.state = state
  presenceData.largeImageKey = DEFAULT_IMAGE
  presenceData.smallImageKey = DEFAULT_IMAGE
  presenceData.smallImageText = 'Tide Radio'
}

presence.on('UpdateData', () => {
  const presenceData: PresenceData = {
    largeImageKey: document.querySelector<HTMLImageElement>('.avatar img')?.src || DEFAULT_IMAGE,
    startTimestamp: browsingTimestamp,
    type: ActivityType.Listening,
  }

  presenceData.details = `${
    document.querySelector('.song-artist')?.textContent
  } - ${document.querySelector('.song-title')?.textContent}`
  presenceData.state = document.querySelector('#upcomingContainer > div:first-child > a > div:nth-child(2) > div:first-child')?.textContent ?? 'Non-stop Hits'
  presenceData.smallImageKey = DEFAULT_IMAGE
  presenceData.smallImageText = 'Tide Radio'

  if (document.location.pathname.includes('/news')) {
    setDefaultPresence(presenceData, 'Viewing the latest news')
  }
  else if (document.location.pathname.includes('/about')) {
    setDefaultPresence(presenceData, 'Viewing the about page')
  }
  else if (document.location.pathname.includes('/team')) {
    setDefaultPresence(presenceData, 'Viewing the team')
  }
  else if (document.location.pathname.includes('/schedule')) {
    setDefaultPresence(presenceData, 'Viewing the schedule')
  }
  else if (document.location.pathname.includes('/playlist')) {
    setDefaultPresence(presenceData, 'Viewing the playlist')
  }
  else if (document.location.pathname.includes('/listen')) {
    setDefaultPresence(presenceData, 'Viewing ways to listen')
  }
  else if (document.location.pathname.includes('/music')) {
    setDefaultPresence(presenceData, 'Viewing the music submission form')
  }
  else if (document.location.pathname.includes('/advertise')) {
    setDefaultPresence(presenceData, 'Viewing the advertising page')
  }
  else if (document.location.pathname.includes('/catchup')) {
    setDefaultPresence(presenceData, 'Viewing the on-demand shows')
  }
  else if (document.location.pathname.includes('/travel')) {
    setDefaultPresence(presenceData, 'Viewing travel information')
  }
  else if (document.location.pathname.includes('/jobs')) {
    setDefaultPresence(presenceData, 'Viewing the jobs page')
  }
  else if (document.location.pathname.includes('/profile')) {
    presenceData.details = 'Tide Radio'
    presenceData.state = `Viewing ${document.querySelector('.name')?.textContent?.trim()}'s profile`
    presenceData.largeImageKey = document.querySelector<HTMLImageElement>('.userHeader .avatar img')?.src || DEFAULT_IMAGE
    presenceData.smallImageKey = DEFAULT_IMAGE
    presenceData.smallImageText = 'Tide Radio'
  }

  presence.setActivity(presenceData)
})
