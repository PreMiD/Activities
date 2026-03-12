import { Assets } from 'premid'

const presence = new Presence({
  clientId: '683031551193514047',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/R/ResetEra/assets/logo.png',
  }

  if (document.location.pathname === '/') {
    presenceData.startTimestamp = browsingTimestamp
    presenceData.details = 'Forum list'
  }
  else if (document.location.pathname.includes('/help')) {
    presenceData.startTimestamp = browsingTimestamp
    presenceData.details = 'Help'
  }
  else if (document.location.pathname.includes('/help/smilies/')) {
    presenceData.startTimestamp = browsingTimestamp
    presenceData.smallImageKey = Assets.Reading
    presenceData.details = 'Help'
    presenceData.state = 'Smilies'
  }
  else if (document.location.pathname.includes('/help/bb-codes/')) {
    presenceData.startTimestamp = browsingTimestamp
    presenceData.smallImageKey = Assets.Reading
    presenceData.details = 'Help'
    presenceData.state = 'BB codes'
  }
  else if (document.location.pathname.includes('/help/cookies/')) {
    presenceData.startTimestamp = browsingTimestamp
    presenceData.smallImageKey = Assets.Reading
    presenceData.details = 'Help'
    presenceData.state = 'Cookie usage'
  }
  else if (document.location.pathname.includes('/help/privacy-policy/')) {
    presenceData.startTimestamp = browsingTimestamp
    presenceData.smallImageKey = Assets.Reading
    presenceData.details = 'Help'
    presenceData.state = 'Privacy Policy'
  }
  else if (document.location.pathname.includes('/help/terms/')) {
    presenceData.startTimestamp = browsingTimestamp
    presenceData.smallImageKey = Assets.Reading
    presenceData.details = 'Help'
    presenceData.state = 'Terms and rules'
  }
  else if (document.location.pathname.includes('/misc/contact/')) {
    presenceData.startTimestamp = browsingTimestamp
    presenceData.details = 'Contact us'
  }
  else if (document.location.pathname.includes('/misc/style')) {
    presenceData.startTimestamp = browsingTimestamp
    presenceData.details = 'Style chooser'
  }
  else if (document.location.pathname.includes('/threads/')) {
    presenceData.startTimestamp = browsingTimestamp
    presenceData.smallImageKey = Assets.Reading
    presenceData.details = 'Thread'
    presenceData.state = document.querySelector('h1.p-title-value')?.textContent
  }
  else if (document.location.pathname.includes('/forums/gaming-forum.7/')) {
    presenceData.startTimestamp = browsingTimestamp
    presenceData.details = 'Gaming Forum'
  }
  else if (
    document.location.pathname.includes('/forums/gaming-hangouts.8/')
  ) {
    presenceData.startTimestamp = browsingTimestamp
    presenceData.details = 'Gaming Hangouts'
  }
  else if (document.location.pathname.includes('/forums/etcetera-forum.9/')) {
    presenceData.startTimestamp = browsingTimestamp
    presenceData.details = 'EtcetEra Forum'
  }
  else if (
    document.location.pathname.includes('/forums/etcetera-hangouts.10/')
  ) {
    presenceData.startTimestamp = browsingTimestamp
    presenceData.details = 'EtcetEra Hangouts'
  }
  else if (document.location.pathname.includes('/forums/-/latest-threads/')) {
    presenceData.startTimestamp = browsingTimestamp
    presenceData.details = 'Latest threads'
  }
  else if (document.location.pathname.includes('/trending/')) {
    presenceData.startTimestamp = browsingTimestamp
    presenceData.details = 'Trending threads'
  }
  else if (document.location.pathname.includes('/watched/threads')) {
    presenceData.startTimestamp = browsingTimestamp
    presenceData.details = 'Watched threads'
  }
  else if (document.location.pathname.includes('/members/')) {
    presenceData.startTimestamp = browsingTimestamp
    presenceData.details = 'Viewing a member'
    presenceData.state = document.querySelector('span.username')?.textContent
  }
  else if (document.location.pathname.includes('/account/account-details')) {
    presenceData.startTimestamp = browsingTimestamp
    presenceData.details = 'Settings'
    presenceData.state = 'Account details'
  }
  else if (document.location.pathname.includes('/account/alerts')) {
    presenceData.startTimestamp = browsingTimestamp
    presenceData.details = 'Alerts'
  }
  else if (document.location.pathname.includes('/account/security')) {
    presenceData.startTimestamp = browsingTimestamp
    presenceData.details = 'Settings'
    presenceData.state = 'Password and security'
  }
  else if (document.location.pathname.includes('/account/privacy')) {
    presenceData.startTimestamp = browsingTimestamp
    presenceData.details = 'Settings'
    presenceData.state = 'Privacy'
  }
  else if (document.location.pathname.includes('/account/preferences')) {
    presenceData.startTimestamp = browsingTimestamp
    presenceData.details = 'Settings'
    presenceData.state = 'Preferences'
  }
  else if (document.location.pathname.includes('/account/upgrades')) {
    presenceData.startTimestamp = browsingTimestamp
    presenceData.details = 'Settings'
    presenceData.state = 'Account Upgrades'
  }
  else if (document.location.pathname.includes('/account/following')) {
    presenceData.startTimestamp = browsingTimestamp
    presenceData.details = 'Settings'
    presenceData.state = 'Following'
  }
  else if (document.location.pathname.includes('/account/ignored')) {
    presenceData.startTimestamp = browsingTimestamp
    presenceData.details = 'Settings'
    presenceData.state = 'Ignoring'
  }
  else if (document.location.pathname.includes('/account/devices')) {
    presenceData.startTimestamp = browsingTimestamp
    presenceData.details = 'Settings'
    presenceData.state = 'Image and media options'
  }
  else if (document.location.pathname.includes('/conversations/')) {
    presenceData.startTimestamp = browsingTimestamp
    presenceData.details = 'Conversations'
  }
  else if (document.location.pathname.includes('/pages/membership/')) {
    presenceData.startTimestamp = browsingTimestamp
    presenceData.details = 'Era Clear'
  }
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
