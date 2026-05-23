import { Assets } from 'premid'

const presence = new Presence({
  clientId: '503557087041683458',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/Y/Yahoo%20Mail/assets/logo.png',
    startTimestamp: browsingTimestamp,
    name: 'Yahoo Mail',
  }
  const privacy = await presence.getSetting('privacy')
  const { pathname } = document.location
  if (document.querySelector('[data-test-id="message-group-subject-text"]')) {
    presenceData.details = 'Reading an email'
    presenceData.smallImageKey = Assets.Reading
  }
  else if (
    document.querySelector<HTMLInputElement>('[role="combobox"]')?.value
  ) {
    presenceData.details = 'Searching'
    presenceData.smallImageKey = Assets.Search
  }
  else if (document.querySelector('[data-test-id="recipient-input"]')) {
    presenceData.details = 'Composing an email'
  }
  else if (privacy) {
    if (pathname.includes('/folders/') || pathname.includes('/search/')) {
      if (pathname.includes('messages'))
        presenceData.details = 'Viewing an email'
      else presenceData.details = 'Viewing mail'
    }
    else {
      presenceData.details = 'Browsing'
    }
  }
  else if (document.querySelector('[data-test-is-active="true"]')) {
    presenceData.details = `Viewing ${document
      .querySelector('[data-test-is-active="true"]')
      ?.textContent
      ?.replace(/\d*/g, '')}`
  }
  else {
    presenceData.details = 'Browsing'
  }

  presence.setActivity(presenceData)
})
