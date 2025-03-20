const presence = new Presence({
  clientId: '1073136952905318401',
})
/**
 * Returns current player status
 */
function playStatus(): string | undefined {
  let status: string | undefined
  const playButtonText = document.querySelector('#stream-play')?.textContent ?? undefined
  if (playButtonText === 'Play Stream')
    status = 'Stopped'
  else if (playButtonText === 'Stop Stream')
    status = 'Playing'
  else status = playButtonText
  return status
}
function currentSong(): string | undefined {
  return document.querySelector('#np')?.textContent ?? undefined
}

presence.on('UpdateData', async () => {
  const { pathname } = document.location
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/R/R-a-d.io/assets/logo.png',
  }
  if (pathname.includes('/news')) {
    presenceData.details = 'Reading news'
    // Current article title if currently being open
    if (pathname.split('/').length === 3) {
      presenceData.state = document.querySelector(
        '[class="panel-title"] > a',
      )?.textContent
    }
  }
  else if (pathname.includes('/irc')) {
    presenceData.details = 'Chatting'
  }
  else if (pathname.includes('/search')) {
    const title = pathname.split('/')[2]
    // If searching for something
    if (title)
      presenceData.details = `Searching for: ${title}`
    else presenceData.details = 'Searching'
  }
  else if (pathname.includes('/last-played')) {
    presenceData.details = 'Looking at last played songs'
    // For page number
    presenceData.state = `On page ${
      document.querySelector(
        '#radio-container > section > div > div > ul > li.active',
      )?.textContent
    }`
  }
  else if (pathname.includes('/queue')) {
    presenceData.details = 'Looking at queue'
  }
  else if (pathname.includes('/faves')) {
    presenceData.details = 'Looking at favorites'
    const username = pathname.split('/')[2]
    if (username)
      presenceData.details = `Looking at ${username}'s favorites`
  }
  else if (pathname.includes('/staff')) {
    presenceData.details = 'Looking at staff list'
  }
  else if (pathname.includes('/submit')) {
    presenceData.details = 'Submitting a song'
  }
  else if (pathname === '/') {
    presenceData.details = playStatus()

    // Only add bottom row status and timestamp if playing
    if (presenceData.details === 'Playing') {
      presenceData.state = currentSong();
      [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(
        presence.timestampFromFormat(
          document.querySelector('#progress-current')?.textContent ?? '',
        ),
        presence.timestampFromFormat(
          document.querySelector('#progress-length')?.textContent ?? '',
        ),
      )
    }
  }

  // Update the presence with all the values from the presenceData object
  // Set second parameter to true since we provide timestamps according to PreMiD documentation
  presence.setActivity(presenceData, presenceData.details === 'Playing')
})
