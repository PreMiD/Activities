import { Assets } from 'premid'

const presence = new Presence({
  clientId: '765876503161733140',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/Z/Zoom/assets/logo.png',
  }
  const { pathname } = document.location

  switch (true) {
    case pathname === '/myhome':
    case pathname === '/': {
      presenceData.details = 'Viewing home page'
      break
    }

    case pathname.includes('signin'): {
      presenceData.details = 'Singing in'
      break
    }
    case pathname.includes('signup'): {
      presenceData.details = 'Creating an account'
      break
    }
    case pathname.includes('profile'): {
      presenceData.details = 'Viewing their profile'
      break
    }
    case pathname.includes('webinars'): {
      presenceData.details = 'Viewing webinars'
      break
    }
    case pathname.includes('recording'): {
      presenceData.details = 'Viewing recordings'
      break
    }
    case pathname.includes('settings'): {
      presenceData.details = 'Editing their settings'
      break
    }
    case pathname.includes('meeting/schedule'): {
      presenceData.details = 'Scheduling a meeting'
      break
    }
    case pathname.includes('meetings'): {
      presenceData.details = 'Viewing meetings page'
      break
    }
    case pathname.includes('/s/'): {
      presenceData.details = 'Joining a meeting'
      break
    }
    case pathname.includes('/wc/'): {
      if (document.querySelector('#prompt > h4') && pathname.endsWith('start')) {
        presenceData.details = 'Joining a meeting'
      }
      else if (pathname.endsWith('leave')) {
        presenceData.details = 'Leaving an meeting'
      }
      else {
        if (videoEnabled()) {
          presenceData.details = 'In a video meeting'
          presenceData.smallImageKey = Assets.VideoCall
        }
        else {
          presenceData.details = 'In a meeting'
          presenceData.smallImageKey = Assets.Call
        }
        if (memberCount()) {
          presenceData.state = `${memberCount()} user${
            memberCount()! > 1 ? 's' : ''
          } in room`
        }
        presenceData.startTimestamp = browsingTimestamp
      }

      break
    }
  }
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})

function videoEnabled() {
  return (
    document
      .querySelector<HTMLButtonElement>('.send-video-container > button')
      ?.getAttribute('aria-label')
      && document
        .querySelector<HTMLButtonElement>('.send-video-container > button')
        ?.getAttribute('aria-label') !== 'start sending my video'
  )
}

function memberCount() {
  const counter = document.querySelector<HTMLSpanElement>(
    '.footer-button__number-counter',
  )?.textContent
  return counter === null ? null : Number(counter)
}
