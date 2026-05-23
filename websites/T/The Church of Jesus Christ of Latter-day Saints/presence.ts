import { ActivityType, Assets, getTimestamps, timestampFromFormat } from 'premid'

const presence = new Presence({
  clientId: '1383261402197917828',
})

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/T/The%20Church%20of%20Jesus%20Christ%20of%20Latter-day%20Saints/assets/logo.png',
  OldTestament = 'https://cdn.rcd.gg/PreMiD/websites/T/The%20Church%20of%20Jesus%20Christ%20of%20Latter-day%20Saints/assets/0.jpeg',
  NewTestament = 'https://cdn.rcd.gg/PreMiD/websites/T/The%20Church%20of%20Jesus%20Christ%20of%20Latter-day%20Saints/assets/1.jpeg',
  BookOfMormon = 'https://cdn.rcd.gg/PreMiD/websites/T/The%20Church%20of%20Jesus%20Christ%20of%20Latter-day%20Saints/assets/2.jpeg',
  DoctrineAndCovenants = 'https://cdn.rcd.gg/PreMiD/websites/T/The%20Church%20of%20Jesus%20Christ%20of%20Latter-day%20Saints/assets/3.jpeg',
  PearlOfGreatPrice = 'https://cdn.rcd.gg/PreMiD/websites/T/The%20Church%20of%20Jesus%20Christ%20of%20Latter-day%20Saints/assets/4.jpeg',
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
const cachedCnfrenceImgs: Map<string, string> = new Map()

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

// Always triple-update our presence to ensure that Discord
// synchronizes correctly and it gets properly displayed
function tripleUpdate() {
  if (attemptCount < 3) {
    attemptCount++
    currentState = 'triple-update'
  }
  else {
    attemptCount = 0
  }
}

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
  let browsingImage: string | undefined
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
      const year: string | undefined = location.split('-')[2]
      const month: string | undefined = location.split('-')[3]
      if (year !== undefined && month !== undefined && cachedCnfrenceImgs.has(`${year}-${month}`)) {
        browsingImage = cachedCnfrenceImgs.get(`${year}-${month}`)
      }
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
    largeImageKey: browsingImage || ActivityAssets.Logo,
    smallImageKey: Assets.Search,
    smallImageText: 'Browsing...',
    startTimestamp: currentTimestamp,
    details: browsingDetails,
  }

  // Perform triple-update
  tripleUpdate()
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
      attemptCount = 0
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

  // Perform triple-update
  tripleUpdate()
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
  const album = parsePlayerAlbum()
  const previousAlbum: string | undefined = listeningAlbum
  listeningAlbum = album

  // Fetch the song style
  const style = parsePlayerStyle()
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
    delete presenceData.endTimestamp
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
    smallImageText: 'Paused',
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

  // Perform triple-update
  tripleUpdate()
}

function parseScriptureReference(): string | undefined {
  // Attempt to parse via content title
  const contentTitle = document.querySelector('[class*=contentTitle]')
  if (contentTitle !== null) {
    if (contentTitle.children.length > 0) {
      return contentTitle.children[0]?.textContent?.trim()
    }
    else {
      return contentTitle.textContent?.trim()
    }
  }

  // Attempt to parse via the title id
  const title = document.querySelector('#title1')
  return title?.textContent?.trim()
}

function parseTalkAuthor(): string | undefined {
  // Attempt to parse via the talk author name
  let author: string | undefined
  const authorName = document.querySelector('.author-name')
  if (authorName !== null) {
    author = authorName.textContent?.trim()

    // Attempt to parse the author's calling, too
    const authorCalling = document.querySelector('.author-role')
    if (authorCalling !== null) {
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
  const preview = document.querySelector('[class*="posterFallback"]')
  if (preview !== null && preview instanceof HTMLImageElement) {
    return `${preview.src}.jpeg` // Append .jpeg to ensure correct format
  }
  return undefined
}

function parsePlayerTitle(): string | undefined {
  // Fetch the player card
  const playerCard = document.querySelector('[class*="AudioPlayerCard__TitleAndOptions"]')
  if (playerCard !== null) {
    // If it has children, we assume it's a dual title (e.g., "Book of Mormon" and "1 Nephi 1:1")
    if (playerCard.children.length > 0) {
      return playerCard.children[0]?.textContent?.trim()
    }
    else {
      return playerCard.textContent?.trim()
    }
  }
  return undefined
}

function parsePlayerTimestamp1(): number | undefined {
  const elapsedTime = document.querySelector('[class*="TimeBar__Elapsed"]')
  if (elapsedTime !== null) {
    const timeText = elapsedTime.textContent?.trim()
    if (timeText !== undefined) {
      return timestampFromFormat(timeText)
    }
  }
  return undefined
}

function parsePlayerTimestamp2(): number | undefined {
  const elapsedTime = document.querySelector('[class*="TimeBar__Duration"]')
  if (elapsedTime !== null) {
    const timeText = elapsedTime.textContent?.trim()
    if (timeText !== undefined) {
      return timestampFromFormat(timeText)
    }
  }
  return undefined
}

function parsePlayerIsPlaying(): boolean {
  // Check if the player is playing
  const controls = document.querySelector('[class*="Controls__PlaybackWrapper"]')
  if (controls !== null && controls.children.length > 1) {
    const playControl = controls.children[1]
    return playControl?.ariaPressed === 'true'
  }
  return false
}

function parsePlayerThumbnail(): string | undefined {
  // Attempt to parse the thumbnail image
  const thumbnail = document.querySelector('[class*="AudioPlayerCard__Thumbnail"] img')
  if (thumbnail !== undefined && thumbnail instanceof HTMLImageElement) {
    return `${thumbnail.src}.jpeg` // Append .jpeg to ensure correct format
  }
  return undefined
}

function parsePlayerAlbum(): string | undefined {
  // Attempt to parse the album name
  return document.querySelector('h1')?.textContent?.trim()
}

function parsePlayerStyle(): string | undefined {
  // Attempt to parse the player style
  const select = document.querySelector('[class*="AudioPlayerCard__StyledSelect"]')
  if (select !== undefined && select instanceof HTMLSelectElement) {
    // Find the selected option
    const selectedOption = select.options[select.selectedIndex]
    if (selectedOption !== undefined) {
      return selectedOption.textContent?.trim()
    }
  }
  return undefined
}

function cacheConferenceImages() {
  if (cachedCnfrenceImgs.size > 0)
    return // Images are already cached

  const references = document.querySelectorAll('[class*="portrait-"]')
  for (const reference of references) {
    const link = reference.getAttribute('href')
    if (link === null)
      continue // Skip if no link is found
    const year = link.split('/')[3] // Extract the year from the link
    const month = link.split('/')[4]?.split('?')[0] // Extract the month from the link
    if (year === undefined || month === undefined)
      continue // Skip if year or month is not found

    const image = reference.querySelector('img')
    if (image === null || !(image instanceof HTMLImageElement))
      continue // Skip if no image is found
    const imageUrl = `${image.src}.jpeg` // Append .jpeg to ensure correct format

    cachedCnfrenceImgs.set(`${year}-${month}`, imageUrl) // Cache the image URL
  }
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
            cacheConferenceImages()
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
            if (path[3] === 'collections' || path[3] === 'songs') {
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
