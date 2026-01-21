import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '1460189621353709805',
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/S/Sudomemo/assets/logo.png',
  }

  const { pathname } = document.location

  if (pathname === '/' || pathname.includes('/browse')) {
    presenceData.state = 'Browsing homepage'
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = 'Browsing'
  }

  else if (pathname.includes('/categories')) {
    const categoryName = document.querySelector('.category-header > h1')?.textContent

    if (categoryName) {
      presenceData.details = 'Browsing channels in category:'
      presenceData.state = `"${categoryName}"`
    }
    else {
      presenceData.state = 'Browsing channels by categories'
    }
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = 'Browsing'
  }

  else if (pathname.includes('/channel')) {
    const channelName = document.querySelector('.card-header.theme-panel-title > span')?.textContent

    presenceData.details = 'Browsing flipnotes in channel:'
    presenceData.state = `${channelName}`
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = 'Browsing'
  }

  else if (pathname.includes('/shop')) {
    presenceData.state = 'Shopping...'
  }

  else if (pathname.includes('/news')) {
    presenceData.state = 'Reading the news'
    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = 'Reading'
  }

  else if (pathname.includes('/search')) {
    const params = new URLSearchParams(window.location.search)
    const searchquery = params.get('q')

    if (searchquery) {
      presenceData.state = `Searching for "${decodeURIComponent(searchquery)}"`
    }
    else {
      presenceData.state = 'Searching...'
    }

    presenceData.smallImageKey = Assets.Search
    presenceData.smallImageText = 'Searching'
  }

  else if (pathname.includes('/watch')) {
    const flipName = document.querySelector('.flipnote-title-name.mx-auto > h1')?.textContent || ''
    const authorName = document.querySelector('.profile-right > div > span:nth-child(1) > a')?.textContent
    const loopMode = document.querySelector('.controls__group--right > li:nth-child(2) > i')?.className
    const playingKey = document.querySelector('.controls__group--left > li > i')?.className
    const frames = document.querySelector('.controls__frameCounter')

    if (!frames) {
      if (flipName.includes(`Flipnote by`)) {
        presenceData.details = 'Untitled Flipnote'
      }
      else {
        presenceData.details = `${flipName}`
      }

      presenceData.state = `by: ${authorName}`

      if (playingKey === 'fa fa-play') {
        presenceData.smallImageKey = Assets.Pause
        presenceData.smallImageText = 'Paused'
      }
      else if (loopMode === 'far fa-repeat') {
        presenceData.smallImageKey = Assets.Repeat
        presenceData.smallImageText = 'Looping'
      }
      else {
        presenceData.smallImageKey = Assets.Play
        presenceData.smallImageText = 'Playing'
      }
    }
    else {
      if (frames && frames.textContent) {
        const parts = frames.textContent.split('/')

        if (parts.length === 2) {
          const currentFrame = parts[0]!.trim()
          const totalFrame = parts[1]!.trim()
          presenceData.name = 'Sudomemo in Filmstrip mode'
          if (flipName.includes(`Flipnote by`)) {
            presenceData.details = `Untitled Flipnote by ${authorName}`
          }
          else {
            presenceData.details = `"${flipName}" by ${authorName}`
          }
          presenceData.state = `Watching frame ${currentFrame} from ${totalFrame}`
          presenceData.smallImageKey = Assets.VideoCall
          presenceData.smallImageText = 'Filmstrip mode'
        }
      }
    }
  }

  presence.setActivity(presenceData)
})
