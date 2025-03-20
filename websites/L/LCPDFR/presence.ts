import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1133734950055714866',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/L/LCPDFR/assets/0.png',
    startTimestamp: browsingTimestamp,
  }
  const privacy = await presence.getSetting<boolean>('privacy')
  const { search, pathname, hostname } = document.location
  const activeTab = document
    .querySelectorAll('[class="ipsTabs_item.ipsTabs_activeItem"]')[0]
    ?.textContent
    ?.trim()

  switch (hostname) {
    case 'www.lcpdfr.com': {
      if (pathname === '/') {
        presenceData.details = 'Patrolling the Home Page'
      }
      else if (pathname.includes('/downloads/')) {
        presenceData.smallImageKey = Assets.Viewing
        switch (activeTab) {
          case 'Essential Mods': {
            presenceData.details = 'Inspecting Essential Mods'
            break
          }
          case 'Vehicle Models': {
            presenceData.details = 'Analyzing Vehicle Models'
            break
          }
          case 'Vehicle Textures': {
            presenceData.details = 'Examining Vehicle Textures'
            break
          }
          case 'Scripts & Plugins': {
            presenceData.details = 'Investigating Scripts & Plugins'
            break
          }
          case 'Character': {
            presenceData.details = 'Reviewing Character Mods'
            break
          }
          case 'Audio': {
            presenceData.details = 'Exploring Audio Mods'
            break
          }
          case 'Visual & Data File': {
            presenceData.details = 'Examining Data Files'
            break
          }
          case 'Misc': {
            presenceData.details = 'Keeping an eye out for miscelaneous'
            break
          }
          default:
            presenceData.details = 'Inspecting the Download Page'
        }
      }
      else if (pathname.includes('/forums/')) {
        presenceData.details = 'Engaging in Discussions'
      }
      else if (pathname.includes('/discover/')) {
        presenceData.details = 'Investigating Recent Activity'
      }
      else if (pathname.includes('/contact-us/')) {
        presenceData.details = 'Contacting the staff'
      }
      else if (pathname.includes('/wiki/')) {
        presenceData.details = 'Studying the Wiki'
      }
      else if (pathname.includes('/login/')) {
        presenceData.details = 'Going on Duty'
      }
      else if (pathname.includes('/register/')) {
        presenceData.details = 'Signing Up for Duty'
      }
      else if (pathname.includes('/search/')) {
        const urlParameters = new URLSearchParams(search)
        const searchQuery = urlParameters.get('q')
        presenceData.details = 'Searching for:'
        presenceData.state = searchQuery
        presenceData.smallImageKey = Assets.Search
      }
      else if (pathname.includes('/profile/')) {
        presenceData.details = 'Viewing Officer:'
        presenceData.state = document.querySelector(
          'h1[class=\'ipsType_reset ipsPageHead_barText\']',
        )?.textContent
        presenceData.largeImageKey = document
          .querySelector('[class="ipsUserPhoto ipsUserPhoto_xlarge"]')
          ?.getAttribute('href')
        presenceData.smallImageKey = Assets.Viewing
      }
      else if (pathname.includes('/settings/')) {
        presenceData.details = 'Viewing Settings'
      }
      else if (pathname.includes('/guideline-hub/')) {
        presenceData.details = 'Reading the guidelines'
        presenceData.smallImageKey = Assets.Reading
      }
      else if (pathname.includes('/staff/')) {
        presenceData.details = 'Viewing the Staff'
      }
      else if (pathname.includes('/gallery/')) {
        presenceData.details = 'Looking through the Gallery'
        presenceData.smallImageKey = Assets.Viewing
      }
      else {
        presenceData.details = 'Just browsing...'
      }
      break
    }
  }

  if (privacy) {
    presenceData.details = 'Browsing undercover...'
    delete presenceData.state
    delete presenceData.smallImageKey
    if (
      presenceData.largeImageKey
      !== 'https://cdn.rcd.gg/PreMiD/websites/L/LCPDFR/assets/0.png'
    ) {
      presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/L/LCPDFR/assets/0.png'
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
