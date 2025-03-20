const presence = new Presence({
  clientId: '900882829154598952',
})
const strings = presence.getStrings({
  homepage: 'general.viewHome',
  settings: 'google classroom.settings',
  watching: 'general.watching',
  reading: 'general.readingAbout',
  writing: 'general.writing',
  profile: 'general.viewProfile',
})

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/K/Khan%20Academy/assets/logo.png',
  Video = 'https://cdn.rcd.gg/PreMiD/websites/K/Khan%20Academy/assets/0.png',
  Article = 'https://cdn.rcd.gg/PreMiD/websites/K/Khan%20Academy/assets/1.png',
  Exercise = 'https://cdn.rcd.gg/PreMiD/websites/K/Khan%20Academy/assets/2.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    details: (await strings).watching,
  }

  if (document.location.pathname === '/') {
    presenceData.state = `🏠 ${(await strings).homepage}`
  }
  else if (document.location.pathname.includes('/courses')) {
    presenceData.state = '📚 Courses'
  }
  else if (document.location.pathname.includes('/progress')) {
    presenceData.state = '📊 Progress'
  }
  else if (document.location.pathname.includes('/teachers')) {
    presenceData.state = '🎓 Teachers'
  }
  else if (document.location.pathname.includes('/profile')) {
    presenceData.details = (await strings).profile
    presenceData.state = `👀 ${
      document.querySelector('._o77ufew')?.textContent
    }`
  }
  else if (document.location.pathname.includes('/settings')) {
    presenceData.state = `⚙️ ${(await strings).settings}`
  }
  else if (document.location.pathname.includes('/search')) {
    presenceData.state = `🔍 Searching for '${
      document.location.pathname.split('page_search_query=')[1]
    }'`
  }
  else if (document.location.pathname.includes('/topics')) {
    presenceData.state = '🔍 Community'
  }
  else if (document.location.pathname.includes('/posts')) {
    presenceData.state = '🔍 Community Post'
  }
  else if (document.location.pathname.includes('/requests/new')) {
    presenceData.state = '⚠️ Submitting a Request'
  }
  else if (document.location.hostname.includes('support')) {
    presenceData.state = '💡 Support'
  }
  else if (document.location.pathname.split('/').length < 3) {
    presenceData.state = `📖 ${
      document.querySelector('._aemo2b3')?.textContent
    }`
  }
  else {
    presenceData.details = document.querySelector(
      '._io410w6, span._cmfzobe:nth-child(2) > a:nth-child(2)',
    )?.textContent
    presenceData.state = `📋 ${document
      .querySelector(
        '._1eqoe4n8, span._cmfzobe:nth-child(3) > a:nth-child(2), #uid-dialog-0-title > span:nth-child(1)',
      )
      ?.textContent
      ?.replace(/.*?:\s+/, '')}`

    if (document.location.pathname.match(/\/([vae]|quiz)\//)) {
      presenceData.smallImageText = document.querySelector(
        '._1l44zfj, [role="dialog"] [data-test-id="modal-title"]',
      )?.textContent

      if (document.location.pathname.includes('/v/'))
        presenceData.smallImageKey = ActivityAssets.Video
      else if (document.location.pathname.includes('/a/'))
        presenceData.smallImageKey = ActivityAssets.Article
      else presenceData.smallImageKey = ActivityAssets.Exercise
    }
  }

  if (!presenceData.details)
    presence.setActivity()
  else presence.setActivity(presenceData)
})
