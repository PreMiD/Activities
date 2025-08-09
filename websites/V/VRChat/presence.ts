/* Global variables */
const presence = new Presence({
  clientId: '772597423188082729',
})

let profile: string

function getUserName(): void {
  // Get your own username
  const tempusername = document.querySelector('.leftbar')?.querySelector('a[href*="/user/"]')
  if (tempusername?.textContent)
    profile = tempusername.textContent
}

async function getProfileDetails() {
  // Gets profile from the user you're viewing.
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/V/VRChat/assets/logo.png',
  }
  const privacymode = await presence.getSetting<boolean>('privacy')
  const profileElement = document.querySelector('h2')
  // Check if h2 contains "'s Profile"
  let viewingprofilename = null
  if (profileElement?.textContent?.includes('\'s Profile')) {
    // If it does, get the username from the textContent
    viewingprofilename = profileElement.textContent.split('\'s Profile')[0]
  }
  if (privacymode === false) {
    if (
      document
        .querySelector(
          '[aria-label="Unfriend"]',
        )
        ?.textContent
        ?.includes('Unfriend')
    ) {
      presenceData.details = 'Viewing Friend:'
      presenceData.state = viewingprofilename
      presence.setActivity(presenceData)
    }
    else {
      presenceData.details = 'Viewing User:'
      presenceData.state = viewingprofilename
      presence.setActivity(presenceData)
    }
  }
  else {
    presenceData.details = 'Viewing User'
    presence.setActivity(presenceData)
  }
}
/* Main eventHandler */
presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/V/VRChat/assets/logo.png',
  }
  const privacymode = await presence.getSetting<boolean>('privacy')

  switch (document.location.hostname) {
    case 'hello.vrchat.com': {
      presenceData.details = 'Landing Page:'
      /* Home Page */
      switch (document.location.pathname) {
        case '/':
          presenceData.state = 'Main Page'
          presence.setActivity(presenceData)
          break
        case '/community-guidelines':
          presenceData.state = 'Community Guidelines'
          presence.setActivity(presenceData)
          break
        case '/events':
          presenceData.state = 'Events Calendar'
          presence.setActivity(presenceData)
          break
        case '/legal':
          /* Viewing ToU */
          presenceData.state = 'EULA'
          presence.setActivity(presenceData)
          break
        case '/privacy':
          /* Viewing Privacy */
          presenceData.state = 'Privacy Policy'
          presence.setActivity(presenceData)
          break
        case '/community-faq':
          presenceData.state = 'Community FAQ'
          presence.setActivity(presenceData)
          break
        case '/developer-faq':
          presenceData.state = 'Developer FAQ'
          presence.setActivity(presenceData)
          break
        case '/careers':
          presenceData.state = 'Careers'
          presence.setActivity(presenceData)
          break
        case '/press':
          presenceData.state = 'Press'
          presence.setActivity(presenceData)
          break
        case '/contact':
          presenceData.state = 'Contact'
          presence.setActivity(presenceData)
          break
        case '/vrchatplus':
          presenceData.state = 'VRChat Plus'
          presence.setActivity(presenceData)
          break
      }

      break
    }
    case 'vrchat.com': {
      if (document.location.pathname.includes('/home')) {
        if (document.location.pathname.includes('/launch')) {
          presenceData.details = 'Launching world instance'
          presence.setActivity(presenceData)
        }
        else {
          /* Portal */
          if (privacymode === false) {
            getUserName()
            presenceData.state = `User: ${profile}`
          }
          if (document.location.pathname.includes('/worlds')) {
            presenceData.details = 'Browsing Worlds'
            presence.setActivity(presenceData)
          }
          else if (document.location.pathname.includes('/world')) {
            /* Viewing a specific world */
            presenceData.details = 'Viewing World:'
            if (privacymode === false) {
              presenceData.state = document.querySelector('.col-md-12 > h3')?.textContent
            }
            else {
              presenceData.details = 'Viewing a world'
            }

            presence.setActivity(presenceData)
          }
          else if (document.location.pathname.includes('/avatars')) {
            /* Viewing Avatars */
            presenceData.details = 'Browsing Avatars'
            presence.setActivity(presenceData)
          }
          else if (document.location.pathname.includes('/messages')) {
            /* Viewing Messages */
            presenceData.details = 'Viewing Messages'
            presence.setActivity(presenceData)
          }
          else if (document.location.pathname.includes('/user')) {
            /* Viewing a specific user */
            getProfileDetails()
          }
          else if (document.location.pathname.includes('/profile')) {
            /* Viewing Profile */
            presenceData.details = 'Viewing Profile'
            presence.setActivity(presenceData)
          }
          else if (document.location.pathname.includes('/group')) {
            /* Viewing Group */
            presenceData.details = 'Viewing Group:'
            if (privacymode === false) {
              presenceData.state = document.querySelector('.home-content')?.querySelector('h2')?.textContent
            }
            else {
              presenceData.details = 'Viewing a group'
            }

            presence.setActivity(presenceData)
          }
          else if (document.location.pathname.includes('/search')) {
            /* Searching */
            if (!privacymode) {
              presenceData.details = 'Searching:'
              presenceData.state = window.location
                .toString()
                .slice(window.location.toString().lastIndexOf('/') + 1)
              presence.setActivity(presenceData)
            }
            else {
              presenceData.details = 'Searching'
              presence.setActivity(presenceData)
            }
          }
          else if (document.location.pathname.includes('/avatar')) {
            presenceData.details = 'Viewing Avatar:'
            if (privacymode === false) {
              const avatarName = document.querySelector('.home-content')?.querySelector('h2')?.textContent
              const avatarCreator = Array.from(document.querySelector('.home-content')?.querySelectorAll('span') || []).find(
                a => a.textContent?.includes('By'),
              )?.querySelector('a')?.textContent
              presenceData.state = `${avatarName} - ${avatarCreator}`
            }
            else {
              presenceData.details = 'Viewing an avatar'
            }

            presence.setActivity(presenceData)
          }
          else if (
            document.location.pathname.includes('/playermoderations')
          ) {
            /* Viewing blocks & mutes */
            presenceData.details = 'Viewing Blocks & Mutes'
            presence.setActivity(presenceData)
          }
          else if (document.location.pathname.includes('/accountlink')) {
            /* Viewing the account link page */
            presenceData.details = 'Merging Account'
            presence.setActivity(presenceData)
          }
          else if (document.location.pathname.includes('/download')) {
            /* Viewing Download Page */
            presenceData.details = 'Download Page'
            presence.setActivity(presenceData)
          }
          else if (
            document.location.pathname.includes('/login') /* Login Page */
          ) {
            presenceData.state = 'Logging in'
            presence.setActivity(presenceData)
          }
          else if (document.location.pathname.includes('/register')) {
            /* Register Page */
            presenceData.state = 'Creating an account'
            presence.setActivity(presenceData)
          }
          else if (document.location.pathname.includes('/password')) {
            /* Password Page */
            presenceData.state = 'Resetting Password'
            presence.setActivity(presenceData)
          }
          else if (document.location.pathname.includes('/twofactorauth')) {
            /* 2FA Page */
            presenceData.state = 'Awaiting Authentication'
            presence.setActivity(presenceData)
          }
          else {
            presenceData.details = 'Home Page'
            presence.setActivity(presenceData)
          }
        }
      }

      break
    }
    case 'feedback.vrchat.com': {
      if (!privacymode) {
        if (document.location.pathname.includes('/p/')) {
          /* Viewing a post */
          presenceData.details = 'Viewing feedback post:'
          presenceData.state = document.querySelector('div.postTitle')?.textContent
          presence.setActivity(presenceData)
        }
        else if (document.location.pathname === '/') {
          presenceData.details = 'Browsing feedback...'
          presence.setActivity(presenceData)
        }
        else {
          /* Not viewing a post, display category */
          presenceData.details = 'Browsing feedback...'
          presenceData.state = document.querySelector(
            'div.optionContent > div',
          )?.textContent
          presence.setActivity(presenceData)
        }
      }
      else {
        presenceData.details = 'Browsing feedback...'
        presence.setActivity(presenceData)
      }

      break
    }
  }
})
