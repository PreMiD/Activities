const presence = new Presence({
  clientId: '635876670146084880',
})

const assets = {
  diff_hard: 'https://cdn.rcd.gg/PreMiD/websites/G/GDBrowser/assets/0.png',
  diff_easy: 'https://cdn.rcd.gg/PreMiD/websites/G/GDBrowser/assets/1.png',
  diff_normal: 'https://cdn.rcd.gg/PreMiD/websites/G/GDBrowser/assets/2.png',
  diff_insane: 'https://cdn.rcd.gg/PreMiD/websites/G/GDBrowser/assets/3.png',
  diff_harder: 'https://cdn.rcd.gg/PreMiD/websites/G/GDBrowser/assets/4.png',
  diff_demon: 'https://cdn.rcd.gg/PreMiD/websites/G/GDBrowser/assets/5.png',
  diff_auto: 'https://cdn.rcd.gg/PreMiD/websites/G/GDBrowser/assets/6.png',
  diff_medium_demon: 'https://cdn.rcd.gg/PreMiD/websites/G/GDBrowser/assets/7.png',
  diff_extreme_demon: 'https://cdn.rcd.gg/PreMiD/websites/G/GDBrowser/assets/8.png',
  diff_hard_demon: 'https://cdn.rcd.gg/PreMiD/websites/G/GDBrowser/assets/9.png',
  diff_easy_demon: 'https://cdn.rcd.gg/PreMiD/websites/G/GDBrowser/assets/10.png',
  diff_insane_demon: 'https://cdn.rcd.gg/PreMiD/websites/G/GDBrowser/assets/11.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/G/GDBrowser/assets/logo.png',
  }
  const q = new URLSearchParams(document.location.search)

  if (
    (document.location.pathname.toLowerCase() !== '/'
      && document.location.pathname.toLowerCase() === '/daily')
    || document.location.pathname.toLowerCase() === '/weekly'
  ) {
    presenceData.state = `🔽 ${
      document.querySelectorAll('.inline.smaller.spaced')[0]?.textContent
    } | 👍 ${document.querySelectorAll('.inline.smaller.spaced')[1]} | 🔵 ${
      document.querySelectorAll('.orbs')[1]?.textContent
    }`
    presenceData.details = `${
      document.querySelectorAll('h1')[0]?.textContent
    } ${document.querySelector('#authorLink')?.textContent}`
    presenceData.smallImageKey = assets[
      `diff_${document
        .querySelector('#difficultytext')
        ?.textContent
        ?.toLowerCase()
        ?.replace('<br>', '_')}` as keyof typeof assets
    ]
    presenceData.smallImageText = `${document
      .querySelector('#difficultytext')
      ?.textContent
      ?.replace('<br>', ' ')}`
  }

  // Homepage
  if (document.location.pathname.toLowerCase() === '/') {
    if (
      document.querySelector<HTMLElement>('#credits')?.style.display
      === 'block'
    ) {
      presenceData.details = 'Viewing the credits'
      presenceData.state = '❤'
    }
    else {
      presenceData.details = 'Viewing the homepage'
    }
  }

  // other stuff
  if (document.location.pathname.toLowerCase() === '/iconkit')
    presenceData.details = 'In the iconkit'

  if (document.location.pathname.toLowerCase().includes('/search')) {
    if (document.location.pathname.toLowerCase() === '/search') {
      presenceData.details = 'Searching for levels'
    }
    else {
      presenceData.details = 'Searching for levels'

      if (Number.parseInt(q.get('mappack')!) === 1)
        presenceData.state = 'Viewing a map pack'

      switch (q.get('type')) {
        case 'recent':
          presenceData.state = '🕒 Viewing recent levels'
          break
        case 'mostdownloaded':
          presenceData.state = '🔽 Viewing top downloaded levels'
          break
        case 'mostliked':
          presenceData.state = '👍 Viewing top liked levels'
          break
        case 'trending':
          presenceData.state = '📈 Viewing trending levels'
          break
        case 'magic':
          presenceData.state = '✨ Viewing magic levels'
          break
        case 'awarded':
          presenceData.state = '⭐ Viewing awarded levels'
          break
        case 'featured':
          presenceData.state = '⭐ Viewing featured levels'
          break
        case 'followed':
          presenceData.state = '💙 Viewing followed levels'
          break
        default:
          switch (q.get('diff')) {
            case '1':
              presenceData.state = '😄 Viewing Easy levels'
              break
            case '2':
              presenceData.state = '😃 Viewing Normal levels'
              break
            case '3':
              presenceData.state = '😅 Viewing Hard levels'
              break
            case '4':
              presenceData.state = '😐 Viewing Harder levels'
              break
            case '5':
              presenceData.state = '🙁 Viewing Insane levels'
              break
            case '-1':
              presenceData.state = '😶 Viewing Unrated levels'
              break
            case '-2':
              switch (q.get('demonFilter')) {
                case '1':
                  presenceData.state = '😠 Viewing Easy Demons'
                  break
                case '2':
                  presenceData.state = '😡 Viewing Medium Demons'
                  break
                case '3':
                  presenceData.state = '🤬 Viewing Hard Demons'
                  break
                case '4':
                  presenceData.state = '😈 Viewing Insane Demons'
                  break
                case '5':
                  presenceData.state = '👿 Viewing Extreme Demons'
                  break
              }
              break
            default:
              presenceData.state = `Searching for ${
                document.querySelector('#header')?.textContent
              }`
              break
          }
      }
    }
  }

  if (document.location.pathname.toLowerCase().includes('/mappacks'))
    presenceData.details = 'Viewing the Map Packs'

  if (document.location.pathname.toLowerCase().includes('/gauntlets'))
    presenceData.details = 'Viewing the Gauntlets'

  if (document.location.pathname.toLowerCase().includes('/leaderboards'))
    presenceData.details = 'Viewing the leaderboards'

  if (document.location.pathname.toLowerCase() === '/messages')
    presenceData.details = 'Checking messages'

  if (document.location.pathname.toLowerCase().includes('/profile')) {
    presenceData.details = `Looking at ${
      document.location.href.split('/')[4]
    }'s profile`
  }

  presence.setActivity(presenceData)
})
