const presence = new Presence({
  clientId: '799635921522655262',
})
const browsingTimestamp: number = Math.floor(Date.now() / 1000)

let details: string
let state: string
let lives: string
let level: string
let strikes = '0 of 3'
let numbers = '4'

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/H/Human%20Benchmark/assets/logo.png',
  }
  const showTime = await presence.getSetting<boolean>('stamp')

  if (showTime)
    presenceData.startTimestamp = browsingTimestamp

  switch (document.location.pathname) {
    case '/': {
      details = 'Browsing...'
      state = 'On the homepage'

      break
    }
    case '/tests/reactiontime': {
      if (!document.querySelector('.css-0')) {
        details = 'Testing...'
        state = 'Reaction Speed'
      }
      else {
        details = 'Viewing Results (Reaction Speed)'
        state = `Time: ${document.querySelector('.css-0')?.textContent}`
      }

      break
    }
    case '/tests/sequence': {
      if (!document.querySelector('.css-0')) {
        details = 'Testing...'
        state = 'Sequence Memory'
      }
      else {
        details = 'Viewing Results (Sequence Memory)'
        state = `${document.querySelector('.css-0')?.textContent}`
      }

      break
    }
    case '/tests/aim': {
      if (!document.querySelector('.css-0')) {
        details = 'Playing...'
        state = 'Aim Trainer'
      }
      else {
        details = 'Viewing Results (Aim Trainer)'
        state = `Average Time: ${document.querySelector('.css-0')?.textContent}`
      }

      break
    }
    case '/tests/number-memory': {
      if (!document.querySelector('.level')) {
        details = 'Testing...'
        state = 'Number Memory'
      }
      else {
        details = 'Viewing Results (Number Memory)'
        state = `${document.querySelector('.level > span')?.textContent} ${
          document.querySelector('.level > .number')?.textContent
        }`
      }

      break
    }
    case '/tests/chimp': {
      if (
        !document.querySelector('.css-0')
        && !document.querySelector('.css-1tl77r2')
      ) {
        details = 'Testing...'
        state = `Chimp Test (${numbers} numbers, ${strikes} strikes)`
      }
      else if (document.querySelector('.css-1tl77r2')) {
        numbers = document.querySelector('.css-0')?.textContent ?? ''
        strikes = document.querySelector('.css-1tl77r2')?.textContent ?? ''
        details = 'Testing...'
        state = `Chimp Test (${numbers} numbers, ${strikes} strikes)`
      }
      else if (
        !document.querySelector('.css-1tl77r2')
        && document.querySelector('.css-0')
      ) {
        details = 'Viewing Results (Chimp Test)'
        state = `Score: ${document.querySelector('.css-0')?.textContent}`
      }

      break
    }
    case '/tests/memory': {
      if (
        !document.querySelector('.css-0')
        && !document.querySelector('.big-score')
      ) {
        details = 'Testing...'
        state = 'Visual Memory'
      }
      else if (document.querySelector('.big-score')) {
        lives = document
          .querySelector('.big-score')
          ?.querySelectorAll('.score')
          ?.item(1)
          ?.textContent
          ?.split('  ')
          ?.join(' ') ?? ''
        level = document
          .querySelector('.big-score')
          ?.querySelectorAll('.score')
          ?.item(0)
          ?.textContent
          ?.split('  ')
          ?.join(' ') ?? ''
        details = 'Testing...'
        state = `Visual Memory (${level}, ${lives})`
      }
      else {
        details = 'Viewing Results (Visual Memory)'
        state = `${document.querySelector('.css-0')?.textContent}`
      }

      break
    }
    case '/tests/hearing': {
      if (!document.querySelector('.css-0')) {
        details = 'Testing...'
        state = 'Hearing'
      }
      else {
        details = 'Viewing Results (Hearing)'
        state = `Heard the frequency at: ${
          document.querySelector('.css-0')?.textContent
        }`
      }

      break
    }
    case '/tests/typing': {
      if (!document.querySelector('.css-0')) {
        details = 'Testing...'
        state = 'Typing'
      }
      else {
        details = 'Viewing Results (Typing)'
        state = `WPM: ${
          document.querySelector('.css-0')?.textContent?.split('wpm')[0]
        }`
      }

      break
    }
    case '/dashboard': {
      details = 'Browsing...'
      state = 'User\'s Dashboard'

      break
    }
    default: {
      details = 'Browsing...'
      state = 'An Unsupported Page'
    }
  }

  presenceData.details = details
  presenceData.state = state

  presence.setActivity(presenceData)
})
