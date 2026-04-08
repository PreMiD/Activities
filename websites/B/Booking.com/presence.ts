const presence = new Presence({
  clientId: '1489691688539525120',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://images2.imgbox.com/27/6a/h63rQ6Yr_o.jpg',
}

let elapsed = browsingTimestamp
let prevPath = ''

presence.on('UpdateData', async () => {
  const [privacy, buttons] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('buttons'),
  ])

  const { pathname, search } = document.location
  const h1 = document.querySelector('h1')?.textContent?.trim()
  const params = new URLSearchParams(search)

  if (pathname !== prevPath) {
    prevPath = pathname
    elapsed = Math.floor(Date.now() / 1000)
  }

  const data: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: elapsed,
  }

  switch (true) {
    case pathname.startsWith('/index') || pathname === '/': {
      data.details = 'Browsing the homepage'
      break
    }
    case pathname.includes('/searchresults'): {
      const dest = params.get('ss')
      if (dest)
        data.details = privacy ? 'Searching for accommodations' : `Searching: ${dest}`
      else
        data.details = 'Searching for accommodations'
      break
    }
    case pathname.startsWith('/hotel/'): {
      data.details = privacy ? 'Viewing a hotel' : (h1 ?? 'Viewing a hotel')
      if (buttons && !privacy)
        data.buttons = [{ label: 'View Hotel', url: document.location.href }]
      break
    }
    case pathname.startsWith('/city/'): {
      data.details = privacy ? 'Exploring a city' : (h1 ?? 'Exploring a city')
      break
    }
    case pathname.startsWith('/country/'): {
      data.details = privacy ? 'Exploring a country' : (h1 ?? 'Exploring a country')
      break
    }
    case pathname.startsWith('/region/'): {
      data.details = privacy ? 'Exploring a region' : (h1 ?? 'Exploring a region')
      break
    }
    case pathname.startsWith('/flights'): {
      data.details = 'Searching for flights'
      break
    }
    case pathname.startsWith('/cars'): {
      data.details = 'Searching for car rentals'
      break
    }
    case pathname.startsWith('/attractions') || pathname.startsWith('/things-to-do'): {
      data.details = privacy ? 'Browsing attractions' : (h1 ?? 'Browsing attractions')
      break
    }
    case pathname.startsWith('/taxi'): {
      data.details = 'Looking for airport taxis'
      break
    }
    case pathname.includes('/myreservations'): {
      data.details = 'Viewing reservations'
      break
    }
    case pathname.includes('/mysettings'): {
      data.details = 'Viewing account settings'
      break
    }
    case pathname.includes('/myfavorites') || pathname.includes('/wishlists'): {
      data.details = 'Viewing saved properties'
      break
    }
    case pathname.includes('/genius') || pathname.includes('/rewards'): {
      data.details = 'Viewing Genius rewards'
      break
    }
    case pathname.includes('/help'): {
      data.details = 'Viewing help center'
      break
    }
    default: {
      data.details = 'Browsing Booking.com'
    }
  }

  presence.setActivity(data)
})
