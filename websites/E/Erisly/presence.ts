import { Assets } from 'premid'

const presence = new Presence({
  clientId: '732586216272429126',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/E/Erisly/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }

  switch (document.location.hostname) {
    case 'erisly.com': {
      if (document.location.pathname.includes('/partners')) {
        presenceData.details = 'Viewing Erisly\'s Partners'
      }
      else if (document.location.pathname.includes('/commands')) {
        presenceData.details = `Viewing ${document
          .querySelector('.category-item.active')
          ?.textContent
          ?.replace('- ', '')}`
      }
      else if (document.location.pathname.includes('/changelog')) {
        presenceData.details = 'Reading the latest changelog'
        presenceData.smallImageKey = Assets.Reading
      }
      else if (document.location.pathname.includes('/premium')) {
        presenceData.details = 'Viewing Premium perks'
      }
      else if (document.location.pathname.includes('/about')) {
        presenceData.details = 'Reading about Erisly'
        presenceData.smallImageKey = Assets.Reading
      }
      else if (document.location.pathname.includes('/fanart')) {
        presenceData.details = 'Viewing Erisly\'s Fan Art Collection'
      }
      else if (document.location.pathname.includes('/team')) {
        presenceData.details = 'Meeting Erisly\'s Team'
      }
      else if (document.location.pathname === '/') {
        presenceData.details = 'Viewing the home page'
      }

      break
    }
    case 'giveaways.erisly.com': {
      presenceData.details = 'Entering a Giveaway'
      break
    }
    case 'translate.erisly.com': {
      presenceData.details = 'Helping Erisly'
      presenceData.state = 'learn a language'

      break
    }
    case 'wiki.erisly.com': {
      let firstHeading = document.querySelector('#firstHeading') !== null
        ? document.querySelector('#firstHeading')?.textContent
        : document.querySelector('.page-heading')?.textContent
      const firstHeadingSplit = firstHeading?.split(' ')
      const firstHeadingVerb = firstHeadingSplit?.shift()

      if (
        document.location.pathname === '/w/index.php'
        && firstHeadingVerb?.endsWith('ing')
      ) {
        firstHeading = firstHeadingSplit?.join(' ')
        presenceData.details = `Wiki - ${firstHeadingVerb}:`
      }
      else {
        presenceData.details = 'Wiki - Viewing page:'
      }

      presenceData.state = firstHeading

      break
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
