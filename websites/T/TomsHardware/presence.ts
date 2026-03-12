const presence = new Presence({
  clientId: '889780989386170420',
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/T/TomsHardware/assets/logo.png',
  }
  const { href } = document.location

  let { pathname } = document.location

  if (pathname.includes('uk/'))
    pathname = pathname.replace('uk/', '')
  if (pathname.includes('uk'))
    pathname = pathname.replace('uk', '')

  if (href.includes('news')) {
    if (pathname.split('/')[2]) {
      presenceData.details = 'Reading an article...'
      presenceData.state = `Article: '${pathname
        .split('/')[2]
        ?.replace('.html', '')}'`
    }
    else {
      presenceData.details = 'Scrolling through news articles...'
    }
  }
  else if (href.includes('reviews')) {
    if (pathname.split('/')[2]) {
      presenceData.details = 'Reading a review...'
      presenceData.state = `Review: '${pathname
        .split('/')[2]
        ?.replace('.html', '')}'`
    }
    else {
      presenceData.details = 'Scrolling through reviews...'
    }
  }
  else if (href.includes('best-picks')) {
    if (pathname.split('/')[2]) {
      presenceData.details = 'Looking at best picks...'
      presenceData.state = `The best picks for: '${pathname
        .split('/')[3]
        ?.replace('.html', '')
        .replace('best-', '')}'`
    }
    else {
      presenceData.details = 'Scrolling through best picks...'
    }
  }
  else if (href.includes('coupons')) {
    if (pathname.includes('?')) {
      presenceData.details = 'Looking at a coupon...'
    }
    else if (pathname.split('/')[2]) {
      presenceData.details = 'Looking at coupons...'
      presenceData.state = `Coupons for: '${pathname
        .split('/')[3]
        ?.replace('.html', '')}'`
    }
    else {
      presenceData.details = 'Scrolling through coupons...'
    }
  }
  else if (href.includes('forums.')) {
    if (pathname.includes('forums')) {
      presenceData.state = `Category: '${pathname
        .split('/')[2]
        ?.split('.')[0]
        ?.replace('.html', '')}'`
    }
    else if (pathname.includes('threads')) {
      presenceData.state = `Category: '${pathname
        .split('/')[2]
        ?.split('.')[0]
        ?.replace('.html', '')}'`
    }
    else if (pathname.includes('featured')) {
      presenceData.state = 'Looking at featured threads...'
    }
    else if (pathname.includes('whats-new')) {
      presenceData.state = 'Looking at new threads...'
    }
    else if (pathname.includes('members')) {
      presenceData.state = 'Looking at members...'
    }
    else if (pathname.includes('help')) {
      presenceData.state = 'Getting help...'
    }
    else if (pathname.includes('search')) {
      presenceData.state = 'Searching the forums...'
    }
    else if (pathname.includes('billboard')) {
      presenceData.state = 'Looking at the billboard...'
    }
    else if (pathname.includes('register')) {
      presenceData.state = 'Registering an account...'
    }

    presenceData.details = 'Visiting the forums...'
  }
  else if (href.includes('topics')) {
    if (pathname.split('/')[3]) {
      presenceData.state = `Subcategory: '${pathname
        .split('/')[3]
        ?.replace('.html', '')}'`
    }
    presenceData.details = `Looking at the topic: ${pathname.split('/')[2]}`
  }
  else if (href.includes('feeds')) {
    presenceData.details = 'Visiting the RSS page...'
  }
  else if (href.includes('search')) {
    if (pathname.split('=')[1]) {
      presenceData.state = `Searching Term: '${pathname
        .split('=')[1]
        ?.replace('.html', '')}'`
    }
    presenceData.details = 'Searching the site...'
  }
  else if (pathname && pathname.length > 2) {
    presenceData.details = 'Browsing...'
    presenceData.state = `On the page '${pathname.split('/')[1]}'`
  }
  else {
    presenceData.details = 'Visiting the front page...'
  }

  presence.setActivity(presenceData)
})
