import { Assets } from 'premid'

const presence = new Presence({
  clientId: '503557087041683458',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const showTimestamp = await presence.getSetting<boolean>('timestamp')
  const showButtons = await presence.getSetting<boolean>('buttons')
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/S/ShareX/assets/logo.png',
    smallImageText: 'Navigating on getsharex.com',
    buttons: [
      {
        label: 'View Page',
        url: document.location.href,
      },
    ],
    name: 'ShareX',
  }
  // Main Pages
  if (document.location.pathname === '/') {
    presenceData.state = 'Browsing Home Page'
    delete presenceData.buttons
  }
  else if (document.location.pathname.includes('/downloads')) {
    presenceData.state = 'Browsing Downloads Page'
    presenceData.smallImageKey = Assets.Downloading
  }
  else if (document.location.pathname.includes('/screenshots')) {
    presenceData.state = 'Viewing Screenshots'
  }
  else if (document.location.pathname.includes('/changelog')) {
    presenceData.details = 'Reading Changelog'
    presenceData.state = document.querySelector('h2')?.textContent
  }
  else if (document.location.pathname.includes('/donate')) {
    presenceData.state = 'Browsing Donations Page'
  }
  else if (document.location.pathname.includes('/image-effects')) {
    presenceData.state = 'Browsing Image Effects'
  }
  else if (document.location.pathname.includes('/actions')) {
    presenceData.state = 'Browsing Actions Page'
  }
  else if (document.location.pathname.includes('/brand-assets')) {
    presenceData.state = 'Browsing Brand Assets'
  }

  // Docs
  if (document.location.pathname.includes('/faq'))
    presenceData.state = 'Browsing FAQ'
  else if (document.location.pathname.includes('/dev-builds'))
    presenceData.state = 'Browsing Dev Builds'
  else if (document.location.pathname.includes('/region-capture'))
    presenceData.state = 'Browsing RC Keybinds'
  else if (document.location.pathname.includes('/command-line-arguments'))
    presenceData.state = 'Browsing CLI Page'
  else if (document.location.pathname.includes('/translation'))
    presenceData.state = 'Reading Translation Guide'
  else if (document.location.pathname.includes('/custom-uploader'))
    presenceData.state = 'Reading Custom Uploaders Guide'
  else if (document.location.pathname.includes('amazon-s3'))
    presenceData.state = 'Reading Amazon S3 Guide'
  else if (document.location.pathname.includes('/google-cloud-storage'))
    presenceData.state = 'Reading Google Cloud Guide'
  else if (document.location.pathname.includes('website-capture'))
    presenceData.state = 'Reading Website Capture Guide'

  // Start Browsing Timestamp
  if (showTimestamp)
    presenceData.startTimestamp = browsingTimestamp

  // If Buttons option is off, delete buttons
  if (!showButtons)
    delete presenceData.buttons

  // Activate Presence
  presence.setActivity(presenceData)
})
