import { ActivityType, Assets, getTimestamps, timestampFromFormat } from 'premid'

const presence = new Presence({
  clientId: '1383261402197917828',
})

enum ActivityAssets {
  Logo = 'https://i.imgur.com/oeQLobD.png',
  OldTestament = 'https://www.churchofjesuschrist.org/imgs/6de4c15152c1c0e56b9ac5004e62d80cd04ad02d/0,0,3000,3000/512,512/0/default.jpeg',
  NewTestament = 'https://www.churchofjesuschrist.org/imgs/7d175abca40ddfa795593e4f713a44489acc6cd5/0,0,3000,3000/512,512/0/default.jpeg',
  BookOfMormon = 'https://www.churchofjesuschrist.org/imgs/59fa03a8250ea7aea58e9f3515031ea47b6ab7eb/0,0,3000,3000/512,512/0/default.jpeg',
  DoctrineAndCovenants = 'https://www.churchofjesuschrist.org/imgs/d9930401562cdd688233134c5f20a5d75b968b14/0,0,3000,3000/512,512/0/default.jpeg',
  PearlOfGreatPrice = 'https://www.churchofjesuschrist.org/imgs/16cf3d24af3de0ca15a4f6d7de71a8e870616fb9/0,0,3000,3000/512,512/0/default.jpeg',
}

enum CommonStrings {
  OldTestament = 'Old Testament',
  NewTestament = 'New Testament',
  BookOfMormon = 'Book of Mormon',
  DoctrineAndCovenants = 'Doctrine and Covenants',
  PearlOfGreatPrice = 'Pearl of Great Price',
}

// Global state variables
let currentTimestamp: number = Math.floor(Date.now() / 1000)
let currentState: string = 'initializing'
let presenceData: PresenceData = { }
let attemptCount: number = 0

// Browsing state variables
let browseLocation: string | undefined

// Reading state variables
let readingLocation: string | undefined
let readingState: string | undefined

// Listening state variables
let listeningLocation: string | undefined
let listeningTitle: string | undefined
let listeningAlbum: string | undefined
let listeningStyle: string | undefined

function setBrowsing(location: string, _additional?: string) {
  // If we are already browsing this location, do nothing
  if (currentState === 'browsing' && browseLocation === location)
    return
  const previousState: string = currentState
  const previousLocation: string | undefined = browseLocation
  currentState = 'browsing'
  browseLocation = location

  // Conditions for updating the timestamp
  if (previousState !== 'browsing' || location !== previousLocation) {
    currentTimestamp = Math.floor(Date.now() / 1000)
  }

  // Determine detailed name
  let browsingTitle: string | undefined
  if (location === 'my-home') {
    browsingTitle = 'their home page'
  }
  else if (location === 'library') {
    browsingTitle = 'the library'
  }
  else if (location === 'scriptures') {
    browsingTitle = 'the scriptures'
  }
  else if (location === 'old-testament') {
    browsingTitle = `the ${CommonStrings.OldTestament}`
  }
  else if (location === 'new-testament') {
    browsingTitle = `the ${CommonStrings.NewTestament}`
  }
  else if (location === 'book-of-mormon') {
    browsingTitle = `the ${CommonStrings.BookOfMormon}`
  }
  else if (location === 'doctrine-and-covenants') {
    browsingTitle = `the ${CommonStrings.DoctrineAndCovenants}`
  }
  else if (location === 'pearl-of-great-price') {
    browsingTitle = `the ${CommonStrings.PearlOfGreatPrice}`
  }
  else if (location.startsWith('general-conference')) {
    if (_additional !== undefined) {
      browsingTitle = `${_additional} conference talks`
    }
    else {
      browsingTitle = 'conference talks'
    }
  }
  else if (location === 'media') {
    browsingTitle = 'the media library'
  }
  else if (location === 'music') {
    browsingTitle = 'the music library'
  }
  else if (location === 'callings') {
    browsingTitle = 'callings'
  }
  else if (location === 'serve') {
    browsingTitle = 'service opportunities'
  }
  else if (location === 'temples') {
    browsingTitle = 'temples'
  }
  else if (location === 'family-history') {
    browsingTitle = 'family history'
  }

  // Set presence data
  let browsingDetails: string
  if (browsingTitle === undefined) {
    browsingDetails = 'Browsing...'
  }
  else {
    browsingDetails = `Browsing ${browsingTitle}...`
  }
  presenceData = {
    type: ActivityType.Playing,
    largeImageKey: ActivityAssets.Logo,
    smallImageKey: Assets.Search,
    smallImageText: 'Browsing...',
    startTimestamp: currentTimestamp,
    details: browsingDetails,
  }
}

function setReading(location: string, _additional?: string) {
// Parse the scripture reference
  const previousReadingState: string | undefined = readingState
  const ref = parseScriptureReference()
  if (ref !== undefined) {
    readingState = ref
  }
  else {
    // if we failed, try again, since the page may not have finished loading yet
    attemptCount++
    if (attemptCount < 15) { // 15 attempts due to poll rate of PreMiD
      currentState = 'unknown'
      readingLocation = undefined
      return
    }
    else {
      readingState = 'Reading a scripture passage...'
    }
  }

  // If we are already reading, do nothing
  if (currentState === 'reading' && location === readingLocation && readingState === previousReadingState)
    return
  const previousState: string = currentState
  const previousLocation: string | undefined = readingLocation
  currentState = 'reading'
  readingLocation = location

  // Update the timestamp
  if (previousState !== 'reading' || location !== previousLocation) {
    currentTimestamp = Math.floor(Date.now() / 1000)
  }

  // Determine detailed name
  let shortRef: string | undefined
  if (ref !== undefined) {
    if (ref.length > 20) {
      shortRef = `${ref.substring(0, 20)}...`
    }
    else {
      shortRef = ref
    }
  }
  let readingTitle: string | undefined
  let button1Title: string | undefined
  let button2Title: string | undefined
  let button2Url: string
  if (location === 'old-testament') {
    readingTitle = CommonStrings.OldTestament
    button1Title = `View ${shortRef || 'Scripture'}`
    button2Title = 'Read the Old Testament'
    button2Url = 'https://www.churchofjesuschrist.org/study/scriptures/ot'
  }
  else if (location === 'new-testament') {
    readingTitle = CommonStrings.NewTestament
    button1Title = `View ${shortRef || 'Scripture'}`
    button2Title = 'Read the New Testament'
    button2Url = 'https://www.churchofjesuschrist.org/study/scriptures/nt'
  }
  else if (location === 'book-of-mormon') {
    readingTitle = CommonStrings.BookOfMormon
    button1Title = `View ${shortRef || 'Scripture'}`
    button2Title = 'Read the Book of Mormon'
    button2Url = 'https://www.churchofjesuschrist.org/study/scriptures/bofm'
  }
  else if (location === 'doctrine-and-covenants') {
    readingTitle = CommonStrings.DoctrineAndCovenants
    button1Title = `View ${shortRef || 'Scripture'}`
    button2Title = 'Read the Doctrine and Covenants'
    button2Url = 'https://www.churchofjesuschrist.org/study/scriptures/dc-testament'
  }
  else if (location === 'pearl-of-great-price') {
    readingTitle = CommonStrings.PearlOfGreatPrice
    button1Title = `View ${shortRef || 'Scripture'}`
    button2Title = 'Read the Pearl of Great Price'
    button2Url = 'https://www.churchofjesuschrist.org/study/scriptures/pgp'
  }
  else if (location.startsWith('general-conference')) {
    readingTitle = readingState // Use the scripture reference as the title
    readingState = parseTalkAuthor() || undefined
    button1Title = 'View Conference Talk'
    if (_additional !== undefined) {
      const year: string | undefined = location.split('-')[2]
      const month: string | undefined = location.split('-')[3]
      if (year !== undefined && month !== undefined) {
        button2Title = `Read Conference ${_additional}`
        button2Url = `https://www.churchofjesuschrist.org/study/general-conference/${year}/${month}`
      }
      else {
        button2Title = undefined
        button2Url = ''
      }
    }
    else {
      button2Title = undefined
      button2Url = ''
    }
  }
  else {
    readingTitle = 'scriptures'
    button1Title = 'View Scripture'
    button2Title = undefined // No second button for general scripture reading
    button2Url = ''
  }

  // Determine reading image
  let readingImage: string | undefined
  if (location === 'old-testament') {
    readingImage = ActivityAssets.OldTestament
  }
  else if (location === 'new-testament') {
    readingImage = ActivityAssets.NewTestament
  }
  else if (location === 'book-of-mormon') {
    readingImage = ActivityAssets.BookOfMormon
  }
  else if (location === 'doctrine-and-covenants') {
    readingImage = ActivityAssets.DoctrineAndCovenants
  }
  else if (location === 'pearl-of-great-price') {
    readingImage = ActivityAssets.PearlOfGreatPrice
  }
  else if (location.startsWith('general-conference')) {
    readingImage = parseTalkPreview() || ActivityAssets.Logo // Use the talk preview image or fallback to the logo
  }
  else {
    readingImage = ActivityAssets.Logo
  }

  // Set presence data
  presenceData = {
    type: ActivityType.Playing,
    largeImageKey: readingImage,
    smallImageKey: Assets.Reading,
    smallImageText: `The ${readingTitle}`,
    startTimestamp: currentTimestamp,
    details: `Reading the ${readingTitle}`,
    state: readingState,
    buttons: [
      {
        label: button1Title,
        url: document.location.href,
      },
    ],
  }
  if (button2Title !== undefined) {
    presenceData.buttons?.push({
      label: button2Title,
      url: button2Url,
    })
  }
}

function setListening(location: string, _additional?: string) {
  // Fetch the song title
  const title = parsePlayerTitle()
  if (title === undefined) {
    return // we can't set listening state without a title
  }
  const previousTitle: string | undefined = listeningTitle
  listeningTitle = title

  // Fetch the song album
  let album = parsePlayerAlbum()
  if (album === undefined) {
    album = undefined // we don't need to set the album if it's not available
  }
  const previousAlbum: string | undefined = listeningAlbum
  listeningAlbum = album

  // Fetch the song style
  let style = parsePlayerStyle()
  if (style === undefined) {
    style = undefined // we don't need to set the style if it's not available
  }
  const previousStyle: string | undefined = listeningStyle
  listeningStyle = style

  // Attempt to parse the start and end timestamps
  const startTimestamp: number | undefined = parsePlayerTimestamp1()
  const endTimestamp: number | undefined = parsePlayerTimestamp2()
  if (startTimestamp !== undefined && endTimestamp !== undefined) {
    const timestamps = getTimestamps(startTimestamp, endTimestamp)
    presenceData.startTimestamp = timestamps[0]
    presenceData.endTimestamp = timestamps[1]
  }
  else {
    presenceData.startTimestamp = currentTimestamp
    presenceData.endTimestamp = undefined
  }

  // Attempt to parse if the player is playing
  const isPlaying: boolean = parsePlayerIsPlaying()
  if (isPlaying) {
    presenceData.smallImageKey = Assets.Play
    presenceData.smallImageText = 'Playing'
  }
  else {
    presenceData.smallImageKey = Assets.Pause
    presenceData.smallImageText = 'Paused'
  }

  // If we are already listening, update the timestamps and return
  if (currentState === 'listening' && listeningLocation === location
    && listeningTitle === previousTitle && listeningStyle === previousStyle
    && listeningAlbum === previousAlbum) {
    return
  }
  currentState = 'listening'
  listeningLocation = location

  // Attempt to parse the image thumbnail
  let thumbnail: string | undefined = parsePlayerThumbnail()
  if (thumbnail === undefined) {
    thumbnail = ActivityAssets.Logo // Fallback to the logo if no thumbnail is found
  }

  // Create a short title if the title is too long
  let shortTitle: string | undefined
  if (listeningTitle.length > 15) {
    shortTitle = `${listeningTitle.substring(0, 15)}...`
  }
  else {
    shortTitle = listeningTitle
  }

  // Construct the state
  let stateText: string | undefined
  if (listeningAlbum !== undefined && listeningStyle !== undefined) {
    stateText = `${listeningAlbum} - ${listeningStyle}`
  }
  else if (listeningAlbum !== undefined) {
    stateText = listeningAlbum
  }
  else if (listeningStyle !== undefined) {
    stateText = listeningStyle
  }
  else {
    stateText = undefined // No state text if no album or style is available
  }

  presenceData = {
    type: ActivityType.Listening,
    largeImageKey: thumbnail,
    smallImageKey: Assets.Pause,
    smallImageText: `Paused`,
    startTimestamp: currentTimestamp,
    details: listeningTitle,
    state: stateText,
    buttons: [
      {
        label: `Listen to ${shortTitle}`,
        url: document.location.href,
      },
    ],
  }
}

function parseScriptureReference(): string | undefined {
  // Attempt to parse via content title
  const contentTitle = document.getElementsByClassName('contentTitle-JbPZw')[0]
  if (contentTitle !== undefined) {
    if (contentTitle.children.length > 0) {
      // If the content title has children, we assume it's a dual title (e.g., "Book of Mormon" and "1 Nephi 1:1")
      const reference = contentTitle.children[0]?.textContent?.trim()
      if (reference !== undefined) {
        return reference
      }
      else {
        return undefined
      }
    }
    else {
      return contentTitle.textContent?.trim()
    }
  }

  // Attempt to parse via the title id
  const title = document.getElementById('title1')
  if (title !== null)
    return title.textContent?.trim()

  return undefined
}

function parseTalkAuthor(): string | undefined {
  // Attempt to parse via the talk author name
  let author: string | undefined
  const authorName = document.getElementsByClassName('author-name')[0]
  if (authorName !== undefined) {
    author = authorName.textContent?.trim()

    // Attempt to parse the author's calling, too
    const authorCalling = document.getElementsByClassName('author-role')[0]
    if (authorCalling !== undefined) {
      const calling = authorCalling.textContent?.trim()
      if (calling !== undefined && calling.length > 0) {
        author += `, ${calling}`
      }
    }

    return author
  }
  return undefined
}

function parseTalkPreview(): string | undefined {
  // Attempt to parse the talk preview image
  const preview = document.querySelectorAll('[class*="posterFallback"]')[0]
  if (preview !== undefined && preview instanceof HTMLImageElement) {
    return `${preview.src}.jpeg` // Append .jpeg to ensure correct format
  }
  return undefined
}

function parsePlayerTitle(): string | undefined {
  // Fetch the player card
  const playerCard = document.querySelectorAll('[class*="AudioPlayerCard__TitleAndOptions"]')[0]
  if (playerCard !== undefined) {
    // If it has children, we assume it's a dual title (e.g., "Book of Mormon" and "1 Nephi 1:1")
    if (playerCard.children.length > 0) {
      const title = playerCard.children[0]?.textContent?.trim()
      if (title !== undefined) {
        return title
      }
      else {
        return undefined
      }
    }
    else {
      return playerCard.textContent?.trim()
    }
  }
  return undefined
}

function parsePlayerTimestamp1(): number | undefined {
  const elapsedTime = document.querySelectorAll('[class*="TimeBar__Elapsed"]')[0]
  if (elapsedTime !== undefined) {
    const timeText = elapsedTime.textContent?.trim()
    if (timeText !== undefined) {
      return timestampFromFormat(timeText)
    }
  }
  return undefined
}

function parsePlayerTimestamp2(): number | undefined {
  const elapsedTime = document.querySelectorAll('[class*="TimeBar__Duration"]')[0]
  if (elapsedTime !== undefined) {
    const timeText = elapsedTime.textContent?.trim()
    if (timeText !== undefined) {
      return timestampFromFormat(timeText)
    }
  }
  return undefined
}

function parsePlayerIsPlaying(): boolean {
  // Check if the player is playing
  const controls = document.querySelectorAll('[class*="Controls__PlaybackWrapper"]')[0]
  if (controls !== undefined && controls.children.length > 1) {
    const playControl = controls.children[1]
    if (playControl?.ariaPressed === 'true') {
      return true // The player is playing
    }
    else {
      return false // The player is paused or stopped
    }
  }
  return false
}

function parsePlayerThumbnail(): string | undefined {
  // Attempt to parse the thumbnail image
  const thumbnail = document.querySelectorAll('[class*="AudioPlayerCard__Thumbnail"] img')[0]
  if (thumbnail !== undefined && thumbnail instanceof HTMLImageElement) {
    return `${thumbnail.src}.jpeg` // Append .jpeg to ensure correct format
  }
  return undefined
}

function parsePlayerAlbum(): string | undefined {
  // Attempt to parse the album name
  const h1 = document.getElementsByTagName('h1')[0]
  if (h1 !== undefined) {
    return h1.textContent?.trim()
  }
  return undefined
}

function parsePlayerStyle(): string | undefined {
  // Attempt to parse the player style
  const select = document.querySelectorAll('[class*="AudioPlayerCard__StyledSelect"]')[0]
  if (select !== undefined && select instanceof HTMLSelectElement) {
    // Find the selected option
    const selectedOption = select.options[select.selectedIndex]
    if (selectedOption !== undefined) {
      return selectedOption.textContent?.trim()
    }
  }
  return undefined
}

presence.on('UpdateData', async () => {
  // Determine our current state
  const path = document.location.pathname.split('/')
  if (path.length > 1) {
    // Home
    if (path[1] === 'my-home') {
      setBrowsing('my-home')

    // Libraries
    }
    else if (path[1] === 'study') {
      if (path.length > 2) {
        // Scriptures
        if (path[2] === 'scriptures') {
          if (path.length > 3) {
            if (path[3] === 'ot') {
              if (path.length > 4) {
                setReading('old-testament')
              }
              else {
                setBrowsing('old-testament')
              }
            }
            else if (path[3] === 'nt') {
              if (path.length > 4) {
                setReading('new-testament')
              }
              else {
                setBrowsing('new-testament')
              }
            }
            else if (path[3] === 'bofm') {
              if (path.length > 4) {
                setReading('book-of-mormon')
              }
              else {
                setBrowsing('book-of-mormon')
              }
            }
            else if (path[3] === 'dc-testament') {
              if (path.length > 4) {
                setReading('doctrine-and-covenants')
              }
              else {
                setBrowsing('doctrine-and-covenants')
              }
            }
            else if (path[3] === 'pgp') {
              if (path.length > 4) {
                setReading('pearl-of-great-price')
              }
              else {
                setBrowsing('pearl-of-great-price')
              }
            }
            else {
              setBrowsing('scriptures')
            }
          }
          else {
            setBrowsing('scriptures')
          }
        }
        else if (path[2] === 'general-conference') {
          if (path.length > 4) {
            const year: number = Number.parseInt(path[3] || '')
            const month: number = Number.parseInt(path[4] || '') - 1 // Months are 0-indexed in JavaScript
            if (Number.isNaN(year) || Number.isNaN(month)) {
              setBrowsing('general-conference')
            }
            else {
              const date = new Date(year, month).toLocaleString('en-US', { month: 'long', year: 'numeric' })
              // The parsed year and month are not passed here intentionally to retain URL structure
              if (path.length > 5) {
                setReading(`general-conference-${path[3]}-${path[4]}-${path[5]}`, date)
              }
              else {
                setBrowsing(`general-conference-${path[3]}-${path[4]}`, date)
              }
            }
          }
          else {
            setBrowsing('general-conference')
          }

        // Other libraries
        }
        else {
          setBrowsing('library')
        }
      }
      else {
        setBrowsing('library')
      }

    // Media
    }
    else if (path[1] === 'media') {
      if (path.length > 2) {
        if (path[2] === 'music') {
          if (path.length > 3) {
            if (path[3] === 'collections') {
              if (path.length > 4) {
                setListening(`music-collection-${path[4]}`)
              }
              else {
                setListening('music-generic')
              }
            }
            else {
              setBrowsing('music')
            }
          }
          else {
            setBrowsing('music')
          }
        }
        else {
          setBrowsing('media')
        }
      }
      else {
        setBrowsing('media')
      }

    // Callings
    }
    else if (path[1] === 'callings') {
      setBrowsing('callings')

    // Serve
    }
    else if (path[1] === 'serve') {
      setBrowsing('serve')

    // Temples
    }
    else if (path[1] === 'temples') {
      setBrowsing('temples')

    // Family History
    }
    else if (path[1] === 'family-history') {
      setBrowsing('family-history')

    // Any 'welcome' section
    }
    else if (path[1] === 'welcome') {
      if (currentState !== 'welcome') {
        currentState = 'welcome'
        currentTimestamp = Math.floor(Date.now() / 1000)
        presenceData = {
          largeImageKey: ActivityAssets.Logo,
          smallImageKey: Assets.Reading,
          smallImageText: 'Welcome to the Church of Jesus Christ of Latter-day Saints',
          startTimestamp: currentTimestamp,
          details: 'Viewing a welcome section!',
          buttons: [
            {
              label: 'Visit Welcome Page',
              url: 'https://www.churchofjesuschrist.org/welcome',
            },
          ],
        }
      }

    // Other sections
    }
    else {
      setBrowsing('')
    }
  }
  else {
    setBrowsing('')
  }

  // Set activity
  presence.setActivity(presenceData)
})
