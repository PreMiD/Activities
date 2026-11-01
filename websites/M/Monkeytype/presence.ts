const presence = new Presence({
  clientId: '798272335035498557',
})
const time = Math.floor(Date.now() / 1000)

function getResultStat(label: string): HTMLElement | undefined {
  return Array.from(
    document.querySelectorAll<HTMLElement>(
      '#result [data-ui-element="resultStat"]',
    ),
  ).find(
    stat =>
      stat.firstElementChild?.textContent?.trim().toLowerCase() === label,
  )
}

function getResultStatValue(label: string): string | undefined {
  const valueElement = getResultStat(label)?.querySelector<HTMLElement>(
    '[data-ui-element="resultStatValue"]',
  )
  if (!valueElement)
    return

  return (
    Array.from(valueElement.childNodes)
      .map(node => (node.nodeName === 'BR' ? ' ' : node.textContent ?? ''))
      .join('')
      .replace(/\s+/g, ' ')
      .trim() || undefined
  )
}

function getResultStatFirstLine(label: string): string | undefined {
  return getResultStat(label)
    ?.querySelector<HTMLElement>('[data-ui-element="resultStatValue"]')
    ?.firstElementChild
    ?.textContent
    ?.trim()
}

function getLiveStats(): { speed?: string, acc?: string } {
  const accElement = Array.from(
    document.querySelectorAll<HTMLElement>('#typingTest div'),
  ).find(
    element =>
      element.children.length === 0
      && /^\d+%$/.test(element.textContent?.trim() ?? ''),
  )
  const speedElement = accElement?.previousElementSibling
  const speed = speedElement?.textContent?.trim()

  return {
    speed: speed && /^\d+$/.test(speed) ? speed : undefined,
    acc: accElement?.textContent?.trim(),
  }
}

presence.on('UpdateData', () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/M/Monkeytype/assets/logo.png',
  }
  presenceData.startTimestamp = time
  let isLoading = false
  switch (document.location.pathname.toLowerCase()) {
    case '/': {
      presenceData.details = 'Idling'
      const resultElement = document.querySelector('#result')
      if (resultElement) {
        const stats = {
          wpm: resultElement.querySelector<HTMLElement>(
            '[data-ui-element="resultStat"] [data-ui-element="resultStatValue"]',
          )?.textContent,
          acc: getResultStatValue('acc'),
          raw: getResultStatValue('raw'),
          char: getResultStatValue('characters'),
          con: getResultStatValue('consistency'),
          time: getResultStatFirstLine('time'),
          testType: getResultStatValue('test type'),
        }
        if (Object.values(stats).some(v => !v)) {
          isLoading = true
        }
        else {
          presenceData.details = `Finished ${stats.testType}`
          presenceData.state = `${stats.wpm} wpm ${stats.acc} acc ${stats.raw} raw ${stats.char} ${stats.con} consistency ${stats.time}`
        }
      }
      else if (
        document.querySelector('#words letter.correct')
        || document.querySelector('#words letter.incorrect')
      ) {
        const testMode = document
          .querySelector('#premidTestMode')
          ?.textContent
          ?.trim()
        presenceData.details = `Typing ${testMode}`

        const liveStats = getLiveStats()
        if (liveStats.speed && liveStats.acc)
          presenceData.state = `${liveStats.speed} wpm ${liveStats.acc} acc`

        if (testMode?.split(' ')[0] === 'time') {
          presenceData.endTimestamp = Math.floor(Date.now() / 1000)
            + (Number.parseInt(
              document.querySelector('#premidSecondsLeft')?.textContent ?? '0',
            )
            + 1)
        }
      }

      break
    }
    case '/leaderboards': {
      presenceData.details = 'Checking leaderboards'
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
    delete presenceData.state
  }

  presence.setActivity(presenceData)
})
