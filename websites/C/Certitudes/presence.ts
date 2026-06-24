import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1449159419924578437',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/C/Certitudes/assets/logo.png',
  Cemantix = 'https://cdn.rcd.gg/PreMiD/websites/C/Certitudes/assets/0.png',
  Cemantle = 'https://cdn.rcd.gg/PreMiD/websites/C/Certitudes/assets/1.png',
  Pedantix = 'https://cdn.rcd.gg/PreMiD/websites/C/Certitudes/assets/2.png',
  Pedantle = 'https://cdn.rcd.gg/PreMiD/websites/C/Certitudes/assets/3.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const privacy = await presence.getSetting<boolean>('privacy')
  const { hostname, href, pathname } = document.location

  if (hostname === 'www.certitudes.org' || hostname === 'certitudes.org') {
    if (pathname === '/') {
      presenceData.details = 'Viewing the homepage'
    }
    else {
      presenceData.details = 'Viewing page:'
      presenceData.state = document.title
    }
  }
  else if (hostname === 'cemantix.certitudes.org' || hostname === 'cemantle.certitudes.org') {
    const dayNum = document.querySelector('#puzzle-num')?.textContent || localStorage.getItem('puzzleNumber')

    const guesses = document.querySelectorAll('#guesses tr')
    const topGuess = guesses[1]
    const topGuessWord = topGuess?.querySelector('td.word')
    const topGuessTemp = topGuess?.querySelector('td.number:nth-of-type(3)')
    const topGuessPourcent = topGuess?.querySelector('td.number:nth-of-type(5)')
    const topGuessEmoji = topGuess?.querySelector('td.emoji')

    const guessed = document.querySelector('#guessed')
    const guessedWord = guessed?.querySelector('td.word')
    const guessedTemp = guessed?.querySelector('td.number:nth-of-type(3)')
    const guessedPourcent = guessed?.querySelector('td.number:nth-of-type(5)')
    const guessedEmoji = guessed?.querySelector('td.emoji')

    const formatWithGuessed = `${guessedWord ? `${guessedWord?.textContent} • ` : ''}${guessedTemp ? `(${guessedTemp?.textContent}°C${guessedEmoji?.textContent}` : ''}${guessedPourcent && guessedPourcent?.textContent !== '' ? ` | ${guessedPourcent?.textContent}‰` : ''}${guessedTemp?.textContent ? `)` : ''}`
    const formatWithoutGuessed = `${topGuessWord ? `${topGuessWord?.textContent} • ` : ''}${topGuessTemp ? `(${topGuessTemp?.textContent}°C${topGuessEmoji?.textContent}` : ''}${topGuessPourcent && topGuessPourcent?.textContent !== '' ? ` | ${topGuessPourcent?.textContent}‰` : ''}${topGuessTemp?.textContent ? `)` : ''}`

    const sink = document.querySelector('tr.sink')
    const guessesLength = !sink && guessedWord ? guesses.length : (guesses.length === 0 ? 0 : guesses.length - 1)

    presenceData.name = hostname === 'cemantix.certitudes.org' ? 'Cémantix' : 'Cemantle'
    if (guessedTemp?.textContent !== '100,00' && topGuessTemp?.textContent !== '100,00' && guessedPourcent?.textContent !== '1000' && topGuessPourcent?.textContent !== '1000') {
      presenceData.details = `Searching for the word of the day #${dayNum || '??'}`
      presenceData.state = guessedWord ? formatWithGuessed : formatWithoutGuessed
    }
    else {
      presenceData.details = `Solved the word of the day #${dayNum || '??'}!`
      presenceData.state = !privacy ? (guessedWord && formatWithGuessed !== '' ? formatWithGuessed : formatWithoutGuessed) : ''
    }
    presenceData.largeImageKey = hostname === 'cemantix.certitudes.org' ? ActivityAssets.Cemantix : ActivityAssets.Cemantle
    presenceData.smallImageKey = Assets.Search
    presenceData.smallImageText = `${guessesLength} guess${guessesLength > 1 ? 'es' : ''} made`
    presenceData.buttons = [
      {
        label: 'Play Now',
        url: href,
      },
    ]
  }
  else if (hostname === 'pedantix.certitudes.org' || hostname === 'pedantle.certitudes.org') {
    const dayNum = document.querySelector('#puzzle-num')?.textContent || localStorage.getItem('p/puzzleNumber')

    let goodWords = 0
    let incorrectWords = 0
    let unknownWords = 0
    const words = document.querySelectorAll('span.w')
    for (const word of words) {
      const wordStyle = word.getAttribute('style')
      const wordContent = word.textContent.replace(/\u00A0/g, ' ').trim()
      if (wordStyle?.includes('display')) {
        goodWords++
      }
      else if (wordContent !== '') {
        incorrectWords++
      }
      else {
        unknownWords++
      }
    }

    const guessNumber = Number(document.querySelector('#guesses td.number')?.textContent) || 0
    const lastGuess = document.querySelector('#guesses td.word')?.textContent
    const solved = document.querySelector('#success')
    const finalWord = document.querySelector('h2')?.textContent?.trim()

    const formatWithGuess = `${lastGuess ? `${lastGuess} • ` : ''}${!goodWords && !incorrectWords ? '(' : (!goodWords ? '(' : '')}${goodWords ? `(${goodWords}🟩` : ''}${(goodWords && incorrectWords) || (goodWords && unknownWords) ? ', ' : ''}${incorrectWords ? `${incorrectWords}🟧` : ''}${(goodWords && unknownWords) || (incorrectWords && unknownWords) ? ', ' : ''}${unknownWords ? `${unknownWords}🟥)` : ''}${!incorrectWords && !unknownWords ? ')' : (!unknownWords ? ')' : '')}`
    const formatWithoutGuess = `${!goodWords && !incorrectWords ? '(' : (!goodWords ? '(' : '')}${goodWords ? `(${goodWords}🟩` : ''}${(goodWords && incorrectWords) || (goodWords && unknownWords) ? ', ' : ''}${incorrectWords ? `${incorrectWords}🟧` : ''}${(goodWords && unknownWords) || (incorrectWords && unknownWords) ? ', ' : ''}${unknownWords ? `${unknownWords}🟥)` : ''}${!incorrectWords && !unknownWords ? ')' : (!unknownWords ? ')' : '')}`

    presenceData.name = hostname === 'pedantix.certitudes.org' ? 'Pédantix' : 'Pedantle'
    if (!solved?.getAttribute('style')) {
      presenceData.details = `Searching for the wiki page of the day #${dayNum || '??'}`
      presenceData.state = formatWithGuess?.replace(', ,', ',')
    }
    else {
      presenceData.details = `Solved the wiki page of the day #${dayNum || '??'}!`
      presenceData.state = !privacy ? `${finalWord} • ${formatWithoutGuess?.replace(', ,', ',')}` : formatWithoutGuess?.replace(', ,', ',')
    }
    presenceData.largeImageKey = hostname === 'pedantix.certitudes.org' ? ActivityAssets.Pedantix : ActivityAssets.Pedantle
    presenceData.smallImageKey = Assets.Search
    presenceData.smallImageText = `${guessNumber} word${guessNumber > 1 ? 's' : ''} guessed`
    presenceData.buttons = [
      {
        label: 'Play Now',
        url: href,
      },
    ]
  }
  else if (hostname === 'cipher.certitudes.org') {
    presenceData.name = 'Cipher Tools'
    presenceData.details = 'Viewing page:'
    presenceData.state = document.querySelector('.r_header')?.textContent || document.title
  }
  else {
    presenceData.details = 'Viewing page:'
    presenceData.state = document.title
  }

  presence.setActivity(presenceData)
})
