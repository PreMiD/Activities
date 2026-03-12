const presence = new Presence({ clientId: '900882829154598952' })

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/K/Khan%20Academy/assets/logo.png',
  Video = 'https://cdn.rcd.gg/PreMiD/websites/K/Khan%20Academy/assets/0.png',
  Article = 'https://cdn.rcd.gg/PreMiD/websites/K/Khan%20Academy/assets/1.png',
  Exercise = 'https://cdn.rcd.gg/PreMiD/websites/K/Khan%20Academy/assets/2.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    details: 'Viewing',
  }
  const path = document.location.pathname
  const searchParams = new URLSearchParams(document.location.search)

  if (path === '/') {
    presenceData.state = '🏠 Viewing Home Page'
  }
  else if (path.includes('/courses')) {
    presenceData.state = '📚 Courses'
  }
  else if (path.includes('/progress')) {
    presenceData.state = '📊 Progress'
  }
  else if (path === '/profile/me/teachers') {
    presenceData.state = '🎓 Teachers'
  }
  else if (path.includes('/profile')) {
    presenceData.state = '👤 Profile'
  }
  else if (path.includes('/settings')) {
    presenceData.state = '⚙️ Viewing Settings'
  }
  else if (path.includes('/search')) {
    presenceData.details = '🔍 Searching'
    presenceData.state = `'${searchParams.get('page_search_query') || 'Unknown Search'}'`
  }
  else if (path.includes('/topics')) {
    presenceData.state = '🔍 Community'
  }
  else if (path.includes('/posts')) {
    presenceData.state = '🔍 Community Post'
  }
  else if (path.includes('/requests/new')) {
    presenceData.state = '⚠️ Submitting a Request'
  }
  else if (document.location.hostname.includes('support')) {
    presenceData.state = '💡 Support'
  }
  else if (path.split('/').length < 3) {
    presenceData.state = `📖 ${document.querySelector('._aemo2b3')?.textContent}`
  }
  else if (path.match(/\/(?:[vae]|quiz)\//)) {
    const breadcrumbLinks = document.querySelectorAll('a[class="_j9iwqrr"]')
    const courseName = breadcrumbLinks[1]?.textContent || ' '
    const contentTitle
      = document.querySelector('h1[data-testid="content-library-content-title"]')
        ?.textContent || ' '

    if (path.includes('/v/')) {
      presenceData.smallImageKey = ActivityAssets.Video
      presenceData.smallImageText = 'Watching a Video'
      presenceData.details = courseName
      presenceData.state = `📺 ${contentTitle}`
    }
    else if (path.includes('/a/')) {
      presenceData.smallImageKey = ActivityAssets.Article
      presenceData.smallImageText = 'Reading an Article'
      presenceData.details = courseName
      presenceData.state = `📖 ${contentTitle}`
    }
    else {
      presenceData.smallImageKey = ActivityAssets.Exercise
      presenceData.smallImageText = 'Taking a Quiz'
      presenceData.details = courseName
      presenceData.state = `📝 ${contentTitle}`
    }
  }
  else {
    presenceData.state = `📋 ${document.querySelector('.nav-breadcrumb a:last-child')?.textContent || 'Learning'}`
  }

  presence.setActivity(presenceData.details ? presenceData : {})
})
