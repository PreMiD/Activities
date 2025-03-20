const presence = new Presence({ clientId: '802246778010730548' })
const SelectorMap = {
  Red: 'div#sbettors1 > span.redtext > strong',
  Blue: 'div#sbettors2 > span.bluetext > strong',
  estatus: 'div#status > span#betstatus',
  tmode: 'span#tournament-note',
  footer: 'div#footer-alert',
  betRed: 'span#lastbet.dynamic-view > span.redtext',
  betBlue: 'span#lastbet.dynamic-view > span.bluetext',
  prize: 'span#lastbet.dynamic-view > span.greentext',
  oddsRed: 'span#lastbet.dynamic-view > span.redtext:nth-last-child(2)',
  oddsBlue: 'span#lastbet.dynamic-view > span.bluetext:nth-last-child(1)',
  betsView: 'span#lastbet.dynamic-view',
  balance: 'span#balance.dollar',
}

let fightersCheck: string
let browsingTimestamp = Math.floor(Date.now() / 1000)

function getText(selector: string) {
  return document.querySelector(selector)?.textContent
}

enum ActivityAssets {
  Salero = 'https://cdn.rcd.gg/PreMiD/websites/S/Salty%20Bet/assets/0.png',
  Trofeo = 'https://cdn.rcd.gg/PreMiD/websites/S/Salty%20Bet/assets/1.png',
  Saltgirl = 'https://cdn.rcd.gg/PreMiD/websites/S/Salty%20Bet/assets/2.png',
}

function getModeImageKey(): string[] {
  if (
    getText(SelectorMap.tmode)
    || getText(SelectorMap.footer)?.includes('bracket!')
    || getText(SelectorMap.footer)?.includes('FINAL')
  ) {
    return [ActivityAssets.Trofeo, 'Tournament Mode']
  }
  else if (
    getText(SelectorMap.footer)?.includes('exhibition')
    || getText(SelectorMap.footer)?.includes('Exhibition')
  ) {
    return [ActivityAssets.Saltgirl, 'Exhibition Mode']
  }
  else {
    return [ActivityAssets.Salero, 'Matchmaking Mode']
  }
}

function getFighters(): string {
  if (getText(SelectorMap.Red) && getText(SelectorMap.Blue))
    return `${getText(SelectorMap.Red)} VS ${getText(SelectorMap.Blue)}`
  else return 'Loading Fighters...'
}

function isBetOpen(): boolean {
  return !!getText(SelectorMap.estatus)?.includes('OPEN!')
}

function getBetStatus(show: boolean): string {
  if (!isBetOpen()) {
    if (!getText(SelectorMap.estatus)?.includes('Payouts')) {
      if (getText(SelectorMap.betsView)?.includes('|') && show) {
        if (getText(SelectorMap.betRed)?.includes('$')) {
          return (
            `$${abbrNum(
              +getText(SelectorMap.betRed)!.replace('$', ''),
              1,
            )}(Red) → `
            + `+$${abbrNum(
              +getText(SelectorMap.prize)!.replace('+$', ''),
              1,
            )} | ${getText(SelectorMap.oddsRed)}:${getText(
              SelectorMap.oddsBlue,
            )}`
          )
        }
        else {
          return (
            `$${abbrNum(
              +getText(SelectorMap.betBlue)!.replace('$', ''),
              1,
            )}(Blue) → `
            + `+$${abbrNum(
              +getText(SelectorMap.prize)!.replace('+$', ''),
              1,
            )} | ${getText(SelectorMap.oddsRed)}:${getText(
              SelectorMap.oddsBlue,
            )}`
          )
        }
      }
      else if (
        getText(SelectorMap.oddsRed)
        && getText(SelectorMap.oddsBlue)
      ) {
        return `Odds: ${getText(SelectorMap.oddsRed)}:${getText(
          SelectorMap.oddsBlue,
        )}`
      }
      else {
        return 'Loading...'
      }
    }
    else if (getText(SelectorMap.estatus)) {
      if (getText(SelectorMap.estatus)!.split('wins!')[0]!.length <= 32) {
        return `${getText(SelectorMap.estatus)!.split('wins!')[0]}wins!`
      }
      else {
        return `${getText(SelectorMap.estatus)!
          .replace('.', '')
          .split(' ')
          .splice(-2)
          .join(' ')} wins!`
      }
    }
    else {
      return 'Loading...'
    }
  }
  else if (getText(SelectorMap.estatus)) {
    return getText(SelectorMap.estatus)!
  }
  else {
    return 'Loading...'
  }
}

function abbrNum(number: number, decPlaces: number): string {
  if (number >= 1000) {
    let abbr: number | undefined, letter: string | undefined
    decPlaces = 10 ** decPlaces
    const abbrev = ['k', 'm', 'b', 't']
    for (let i = abbrev.length - 1; i >= 0; i--) {
      const size = 10 ** ((i + 1) * 3)
      if (size <= number) {
        number = Math.round((number * decPlaces) / size) / decPlaces
        if (number === 1000 && i < abbrev.length - 1) {
          number = 1
          i++
        }
        letter = abbrev[i]
        abbr = number
        break
      }
    }
    return String(abbr) + letter
  }
  else {
    return String(number)
  }
}

presence.on('UpdateData', async () => {
  const [bet, buttons] = await Promise.all([
    presence.getSetting<boolean>('bet'),
    presence.getSetting<boolean>('buttons'),
  ])
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/S/Salty%20Bet/assets/logo.png',
  }
  switch (document.location.pathname) {
    case '/':
    case '/index': {
      const [modeKey, modeText] = getModeImageKey()

      if (fightersCheck !== getFighters()) {
        presenceData.details = getFighters()
        fightersCheck = getFighters()
      }
      else {
        presenceData.details = `${getFighters()}‎`
        fightersCheck = `${getFighters()}‎`
      }

      presenceData.state = getBetStatus(bet)

      presenceData.smallImageKey = modeKey
      presenceData.smallImageText = modeText

      isBetOpen()
        ? (browsingTimestamp = Math.floor(Date.now() / 1000))
        : (presenceData.startTimestamp = browsingTimestamp)

      if (buttons) {
        switch (modeKey) {
          case 'trofeo':
            presenceData.buttons = [
              {
                label: 'Tournament Bracket',
                url: 'https://www.saltybet.com/shaker?bracket=1',
              },
            ]
            break
          case 'saltgirl':
            presenceData.buttons = [
              {
                label: 'Exhibition Queue',
                url: 'https://www.saltybet.com/shaker?activerequests=1',
              },
            ]
            break
        }
      }

      break
    }
    case '/authenticate': {
      presenceData.details = 'Signing in...'
      presenceData.startTimestamp = browsingTimestamp

      break
    }
    case '/bank': {
      presenceData.details = 'Checking Bank'
      presenceData.startTimestamp = browsingTimestamp

      break
    }
    default:
      if (document.URL === 'https://www.saltybet.com/shaker?bracket=1') {
        presenceData.details = 'Checking Tournament Bracket'
        presenceData.startTimestamp = browsingTimestamp
      }
      else if (
        document.URL === 'https://www.saltybet.com/shaker?activerequests=1'
      ) {
        presenceData.details = 'Checking Exhibition Queue'
        presenceData.startTimestamp = browsingTimestamp
      }
      else {
        presenceData.details = null
      }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
