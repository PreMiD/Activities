const presence = new Presence({
  clientId: '1112463096368353300',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/S/Songsterr/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const { pathname } = document.location
  const { role } = document.querySelector('#apptab') ?? {}
  const obj: { [key: string]: string } = {
    plus: 'Viewing Plans',
    mytabs: 'Checking Submitted Tabs',
    submit: 'Submitting Tabs',
    help: 'Reading FAQ',
    howtoreadtab: 'Learning How To Read A Tab',
    account: 'Viewing Account Settings',
    favorites: 'Viewing Favorite Tabs',
    payment: 'Buying Songsterr Plus',
  }

  if (role === 'complementary') {
    if (pathname.split('/').at(-1)! in obj) {
      presenceData.details = obj[pathname.split('/').at(-1)!]
    }
    else {
      presenceData.details = `Searching tabs for ${
        document.querySelector<HTMLInputElement>(
          '#search-wrap > div > div > div > input',
        )?.value
      }`
    }
  }
  else {
    presenceData.state = `Author: ${
      document.querySelector('[aria-label="artist"]')?.textContent
    }`
    presenceData.details = `Title: ${
      document.querySelector('[aria-label="title"]')?.textContent
    }`
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
