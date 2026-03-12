const presence = new Presence({
  clientId: '1327710845546922075',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/T/Timeguessr/assets/logo.jpeg',
    startTimestamp: browsingTimestamp,
  }
  const privacy = await presence.getSetting<boolean>('privacy')
  const { pathname } = document.location

  if (!privacy) {
    switch (pathname) {
      case '/':
        presenceData.details = 'Warming up the time machine'
        break
      case '/privacypolicy':
        presenceData.details = 'Reading the fine print of time travel'
        break
      case '/login':
        presenceData.details = 'Logging into the past'
        break
      case '/createaccount':
        presenceData.details = 'Joining the timeguessers'
        break
      case '/submit':
        presenceData.details = 'Contributing to the time vault'
        break
      case '/game-settings':
        presenceData.details = 'Tuning the time machine'
        break
      case '/account':
        presenceData.details = 'Managing their historical identity'
        break
      case '/friends':
        presenceData.details = 'Catching up with fellow guessers'
        break
      case '/subscriptions':
        presenceData.details = 'Supporting the time machine'
        break
    }

    if (/\/round(?:one|two|three|four|five)(?:daily)?/.test(pathname)) {
      presenceData.details = 'Pinpointing moments in history'
      presenceData.state = `${
        document.querySelector('.progressBarText2')?.textContent
      } | Score: ${
        document.querySelector('#insertScore')?.textContent ?? 0
      } | Mode: ${
        pathname
          .match(/round(one|two|three|four|five)(daily)?/)?.[0]
          .includes('daily')
          ? 'Daily'
          : 'Normal'
      }`
    }
    else if (
      pathname === '/roundresults'
      || pathname === '/dailyroundresults'
    ) {
      presenceData.details = `Round results | Total score: ${
        document.querySelector('#insertTotal')?.textContent ?? 0
      }`
      presenceData.state = `Year: ${
        document.querySelector('#insertYearScore')?.textContent || '0'
      } | Location: ${
        document.querySelector('#insertLocationScore')?.textContent || '0'
      }`
    }
    else if (pathname === '/finalscore' || pathname === '/finalscoredaily') {
      presenceData.details = 'Guessed all the places and times'
      presenceData.state = `Final score: ${
        document.querySelector('#totalText')?.textContent
      }/50,000`
    }
  }
  else {
    presenceData.details = 'Playing timeguessr under the radar'
    delete presenceData.state
  }
  presence.setActivity(presenceData)
})
