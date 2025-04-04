const presence = new Presence({
  clientId: '809898713996066827',
})
const tmb = Math.floor(Date.now() / 1000)

async function getStrings() {
  return presence.getStrings({
    authentication: 'googlemessages.authentication',
    browsingConversations: 'googlemessages.browsingConversations',
    browsingOnGoogleMessages: 'googlemessages.browsingOnGoogleMessages',
    browsingSettings: 'googlemessages.browsingSettings',
    hidden: 'googlemessages.hidden',
    home: 'googlemessages.home',
    newConversation: 'googlemessages.newConversation',
    readingMessagesFrom: 'googlemessages.readingMessagesFrom',
  })
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    smallImageKey: 'https://cdn.rcd.gg/PreMiD/websites/G/Google%20Messages/assets/0.png',
    smallImageText: 'Google',
    startTimestamp: tmb,
  }
  const path = document.location.pathname.toLowerCase()
  const showcon = await presence.getSetting<boolean>('showContact')
  const strings = await getStrings()
  // Home Page
  if (path === '/' || path.includes('/intl/')) {
    presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/G/Google%20Messages/assets/logo.png'
    presenceData.details = strings.home
  }
  else if (path === '/web/authentication') {
    presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/G/Google%20Messages/assets/logo.png'
    presenceData.details = strings.authentication
  }
  else if (path === '/web/conversations') {
    presenceData.details = strings.browsingConversations
    presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/G/Google%20Messages/assets/logo.png'
  }
  else if (
    path.includes('/web/conversations/')
    && path !== '/web/conversations/new'
  ) {
    // checking parameters
    if (!showcon) {
      presenceData.state = strings.hidden
    }
    else {
      presenceData.state = document
        .querySelectorAll('.title-container')[0]
        ?.querySelector('div > span > h2')
        ?.textContent
    }
    presenceData.details = strings.readingMessagesFrom
    presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/G/Google%20Messages/assets/logo.png'
  }
  else if (path === '/web/conversations/new') {
    presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/G/Google%20Messages/assets/logo.png'
    presenceData.details = strings.newConversation
  }
  else if (path === '/web/settings') {
    presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/G/Google%20Messages/assets/logo.png'
    presenceData.details = strings.browsingSettings
  }
  else {
    presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/G/Google%20Messages/assets/logo.png'
    presenceData.details = strings.browsingOnGoogleMessages
  }
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
