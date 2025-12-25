const presence = new Presence({
  clientId: '1112463096368353300',
})

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/S/Songsterr/assets/logo.png',
}

const browsingTimestamp = Math.floor(Date.now() / 1000)
const slideshow = presence.createSlideshow()

presence.on('UpdateData', async () => {
  let useSlideshow: boolean = false

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  // Information needed to determine what user is doing
  const { pathname } = document.location
  const { role } = document.querySelector('#apptab') ?? {}

  // Details string to be used based on the current path name
  const path_event: { [key: string]: string } = {
    plus: 'Viewing Plans',
    mytabs: 'Checking Submitted Tabs',
    submit: 'Submitting Tabs',
    help: 'Reading FAQ',
    howtoreadtab: 'Learning How To Read A Tab',
    account: 'Viewing Account Settings',
    favorites: 'Viewing Favorite Tabs',
    payment: 'Buying Songsterr Plus',
  }

  // Role happens to be complementery when Search, My Tabs, New Tab etc. windows are open. Else a tab is on the screen.
  if (role === 'complementary') {
    if (pathname.split('/').at(-1)! in path_event) {
      presenceData.details = path_event[pathname.split('/').at(-1)!]
    }
    else if (pathname === '/') {
      const searchQuery = document.querySelector<HTMLInputElement>('#search-wrap > div > div > div > input')?.value
      if (searchQuery?.length)
        presenceData.details = `Searching tabs for ${searchQuery}`
      else
        presenceData.details = 'Searching tabs!'
    }
    else {
      presenceData.details = null
      presenceData.state = null
    }
  }
  else {
    useSlideshow = true

    const instrument = document.querySelector('button#control-mixer > div > div')?.innerHTML
    // Appends tuning notes to each other (Couldn't find a way to directly get tuning names like E Standart, Drop D etc.)
    let tuning = ''
    document.querySelectorAll('#tablature > div > svg > text').forEach((obj) => {
      tuning = tuning.concat(obj.innerHTML)
    })

    slideshow.addSlide('songInfo', {
      largeImageKey: ActivityAssets.Logo,
      startTimestamp: browsingTimestamp,
      details: `Title: ${document.querySelector('#song-ttl')?.textContent || document.querySelector('[aria-label="title"]')?.textContent}`,
      state: `Author: ${document.querySelector('#song-artist')?.textContent || document.querySelector('[aria-label="artist"]')?.textContent}`,
      buttons: [{ label: 'Play Yourself', url: document.location.href }],
    }, 5000)

    slideshow.addSlide('instrumentInfo', {
      largeImageKey: ActivityAssets.Logo,
      startTimestamp: browsingTimestamp,
      details: `Instrument: ${instrument}`,
      state: !instrument?.includes('Drums') ? `Tuning: ${tuning}` : null, // No tuning if instrument is Drums
      buttons: [{ label: 'Play Yourself', url: document.location.href }],
    }, 5000)
  }

  if (useSlideshow)
    presence.setActivity(slideshow)
  else
    presence.setActivity(presenceData)
})
