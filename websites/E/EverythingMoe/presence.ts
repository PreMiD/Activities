const presence = new Presence({
  clientId: '1370078552581603489',
})

const startTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', () => {
  const { pathname, search, hash } = document.location

  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/E/EverythingMoe/assets/logo.png',
    startTimestamp,
  }

  const cleanTitle = document.title.replace(/\s*[-|–]\s*EverythingMoe\s*$/i, '').trim()

  const updatePresence = () => {
    switch (true) {
      case pathname === '/' && !search: {
        presenceData.details = '🏠 On the homepage'
        presenceData.state = 'Exploring EverythingMoe'
        break
      }

      case pathname === '/contribute' && !search && !hash: {
        presenceData.details = '🧾 On the contribute page'
        presenceData.state = 'Viewing Contribute'
        break
      }

      case pathname === '/contribute' && hash === '#add': {
        presenceData.details = '🧾 On the contribute page'
        presenceData.state = 'Suggesting for adding a site'
        break
      }

      case pathname === '/contribute' && hash === '#info': {
        presenceData.details = '🧾 On the contribute page'
        presenceData.state = 'Viewing contribution info'
        break
      }

      case pathname === '/contribute' && hash === '#remove': {
        presenceData.details = '🧾 On the contribute page'
        presenceData.state = 'Requesting site removal'
        break
      }

      case pathname === '/contribute' && hash === '#edit': {
        presenceData.details = '🧾 On the contribute page'
        presenceData.state = 'Editing site information'
        break
      }

      case search.includes('section=streaming'): {
        presenceData.details = '🎬 Looking for anime streaming sites'
        presenceData.state = cleanTitle
        break
      }

      case search.includes('section=download'): {
        presenceData.details = '📥 Browsing download sources'
        presenceData.state = cleanTitle
        break
      }

      case search.includes('section=music'): {
        presenceData.details = '🎵 Looking for anime music sources'
        presenceData.state = cleanTitle
        break
      }

      case search.includes('section=donghua'): {
        presenceData.details = '🇨🇳 Looking for online Donghua streams'
        presenceData.state = cleanTitle
        break
      }

      case search.includes('section=manga'): {
        presenceData.details = '📖 Looking for online manga sources'
        presenceData.state = cleanTitle
        break
      }

      case search.includes('section=schedule'): {
        presenceData.details = '🗓️ Looking for online anime schedules'
        presenceData.state = cleanTitle
        break
      }

      case search.includes('section=database'): {
        presenceData.details = '📚 Browsing databases & trackers'
        presenceData.state = cleanTitle
        break
      }

      case search.includes('section=novel'): {
        presenceData.details = '📘 Looking for novel reading sources'
        presenceData.state = cleanTitle
        break
      }

      case search.includes('section=western'): {
        presenceData.details = '🎞️ Looking for western streaming sources'
        presenceData.state = cleanTitle
        break
      }

      case search.includes('section=tools'): {
        presenceData.details = '🛠️ Exploring tools'
        presenceData.state = cleanTitle
        break
      }

      case search.includes('section=utils'): {
        presenceData.details = '🔧 Exploring misc utilities'
        presenceData.state = cleanTitle
        break
      }

      case search.includes('section=drama'): {
        presenceData.details = '📺 Looking for Asian drama sources'
        presenceData.state = cleanTitle
        break
      }

      case search.includes('section=quiz'): {
        presenceData.details = '❓ Looking for online quizzes provider'
        presenceData.state = cleanTitle
        break
      }

      case search.includes('section=trend'): {
        presenceData.details = '📈 Viewing anime trend stats providers'
        presenceData.state = cleanTitle
        break
      }

      case search.includes('section=game'): {
        presenceData.details = '🎮 Looking for anime-related games'
        presenceData.state = cleanTitle
        break
      }

      case search.includes('section=wiki'): {
        presenceData.details = '📖 Reading wikis & guides'
        presenceData.state = cleanTitle
        break
      }

      case search.includes('section=artboard'): {
        presenceData.details = '🎨 Viewing artboards'
        presenceData.state = cleanTitle
        break
      }

      case search.includes('section=mobileapp'): {
        presenceData.details = '📱 Looking for mobile streaming apps'
        presenceData.state = cleanTitle
        break
      }

      case search.includes('section=vtuber'): {
        presenceData.details = '👾 Discovering VTubers'
        presenceData.state = cleanTitle
        break
      }

      case search.includes('section=amv'): {
        presenceData.details = '📺 Browsing AMVs'
        presenceData.state = cleanTitle
        break
      }

      case search.includes('section=forums'): {
        presenceData.details = '💬 Browsing anime communities'
        presenceData.state = cleanTitle
        break
      }

      case pathname === '/post/info.html': {
        presenceData.details = '💁‍♂️ Reading about EverythingMoe'
        presenceData.state = 'About & Info page'
        break
      }

      case pathname.startsWith('/post/'): {
        presenceData.details = '📰 Viewing articles'
        presenceData.state = cleanTitle || 'Articles'
        break
      }

      case pathname === '/graveyard': {
        presenceData.details = '⚰️ Looking at dead sites'
        presenceData.state = 'The Graveyard'
        break
      }

      case pathname === '/changelog': {
        presenceData.details = '📝 Reading the changelog'
        presenceData.state = 'Recent updates'
        break
      }

      case pathname.startsWith('/s/'): {
        const isNSFW = !!document.querySelector('.nsfwtag')
        presenceData.details = '🔗 Viewing listed sites'
        if (!isNSFW) {
          presenceData.state = cleanTitle
        }
        break
      }

      default: {
        presenceData.details = '🌐 Exploring EverythingMoe'
        presenceData.state = cleanTitle
        break
      }
    }

    presenceData.details
      ? presence.setActivity(presenceData)
      : presence.clearActivity()
  }

  if (document.readyState === 'complete') {
    updatePresence()
  }
  else {
    window.addEventListener('load', updatePresence)
  }
})
