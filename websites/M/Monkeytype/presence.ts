const presence = new Presence({
  clientId: '798272335035498557',
})
const time = Math.floor(Date.now() / 1000)

presence.on('UpdateData', () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/M/Monkeytype/assets/logo.png',
  }
  presenceData.startTimestamp = time
  let isLoading = false
  switch (document.location.pathname.toLowerCase()) {
    case '/': {
      presenceData.details = 'Idling'
      if (
        !document
          .querySelector('.pageTest #result')
          ?.classList
          .contains('hidden')
      ) {
        const statsElem = document.querySelector('.pageTest #result .stats')
        const moreStatsElem = document.querySelector(
          '.pageTest #result .morestats',
        )
        const stats = {
          wpm: statsElem?.querySelector('.wpm .bottom')?.textContent,
          acc: statsElem?.querySelector('.acc .bottom')?.textContent,
          raw: moreStatsElem?.querySelector('.raw .bottom')?.textContent,
          char: moreStatsElem?.querySelector('.key .bottom')?.textContent,
          con: moreStatsElem?.querySelector('.consistency .bottom')?.textContent,
          time: moreStatsElem?.querySelector('.time .bottom .text')?.textContent,
        }
        if (Object.values(stats).some(v => !v)) {
          isLoading = true
        }
        else {
          presenceData.details = `Finished ${document
            .querySelector('.testType .bottom')
            ?.textContent
            ?.replaceAll('<br>', ' ')}`
          presenceData.state = `${stats.wpm} wpm ${stats.acc} acc ${stats.raw} raw ${stats.char} ${stats.con} consistency ${stats.time}`
        }
      }
      else if (
        document.querySelector('#words letter.correct')
        || document.querySelector('#words letter.incorrect')
      ) {
        presenceData.details = `Typing ${
          document.querySelector('.pageTest #premidTestMode')?.textContent
        }`
        presenceData.state = `${
          document.querySelector('.pageTest .speed')
            ?.textContent
        } wpm ${
          document.querySelector('.pageTest .acc')
            ?.textContent
        } acc`

        if (
          document
            .querySelector('#top .config .mode .text-button.active')
            ?.textContent
            ?.replace(/[\t\r\n]/g, '') === 'time'
        ) {
          presenceData.endTimestamp = Math.floor(Date.now() / 1000)
            + (Number.parseInt(
              document.querySelector('.pageTest #premidSecondsLeft')?.textContent ?? '0',
            )
            + 1)
        }
      }
      else if (
        !document
          .querySelector('#leaderboardsWrapper')
          ?.classList
          .contains('hidden')
      ) {
        presenceData.details = 'Checking leaderboards'
      }

      break
    }
    case '/about': {
      presenceData.details = 'Reading about page'
      break
    }
    case '/settings': {
      presenceData.details = 'Changing settings'
      break
    }
    case '/login': {
      presenceData.details = 'Logging in'
      break
    }
    case '/account': {
      presenceData.details = 'Checking stats'
      break
    }
  }

  if (isLoading) {
    presenceData.details = 'Loading…'
    presenceData.state = undefined
  }

  presence.setActivity(presenceData)
})
