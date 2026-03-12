const presence = new Presence({
  clientId: '895022531868774451',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/0-9/10fastfingers/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const [start, end] = presence.getTimestamps(
    presence.timestampFromFormat('00:00'),
    presence.timestampFromFormat('1:00'),
  )
  if (document.location.pathname === '/') {
    presenceData.details = 'In home page'
  }
  else if (document.location.pathname.match(/\/typing-test\/.+\/top50/g)) {
    presenceData.details = 'Viewing top 50'
  }
  else if (document.location.pathname.includes('/typing-test/')) {
    const timer = document.querySelector('#timer')?.textContent
    if (timer === '1:00') {
      presenceData.details = 'Waiting to start a typing test'
    }
    else if (timer === '0:00') {
      presenceData.details = 'Finishing a typing test:'
      presenceData.state = `In ${
        document.querySelector('#switch-typing-test-language')?.textContent
      } | ${document.querySelector('#wpm')?.textContent?.split('(')[0]} `
    }
    else {
      [presenceData.startTimestamp, presenceData.endTimestamp] = [start, end]
      presenceData.details = 'Doing a typing test:'
      presenceData.state = `In ${
        document.querySelector('#switch-typing-test-language')?.textContent
      }`
    }
  }
  else if (document.location.pathname.includes('/advanced-typing-test/')) {
    const timer = document.querySelector('#timer')?.textContent
    if (timer === '1:00') {
      presenceData.details = 'Waiting to start an advance Typing test'
    }
    else if (timer === '0:00') {
      presenceData.details = 'Finishing an advance typing test:'
      presenceData.state = `In ${
        document.querySelector('#switch-typing-test-language')?.textContent
      } | ${document.querySelector('#wpm')?.textContent?.split('(')[0]} `
    }
    else {
      presenceData.endTimestamp = end
      presenceData.details = 'Doing an advance typing test:'
      presenceData.state = `In ${
        document.querySelector('#switch-typing-test-language')?.textContent
      }`
    }
  }
  else if (document.location.pathname.includes('/competition/')) {
    const timer = document.querySelector('#timer')?.textContent
    if (timer === '1:00') {
      presenceData.details = 'Waiting to start a competition'
    }
    else if (timer === '0:00') {
      presenceData.details = 'Finishing a competition:'
      presenceData.state = `${
        document.querySelector('#wpm')?.textContent?.split('(')[0]
      } WPM `
    }
    else {
      presenceData.endTimestamp = end
      presenceData.details = 'Doing a competition'
    }
  }
  else if (document.location.pathname.includes('/text/')) {
    if (document.querySelector('#time')?.textContent === '00:00') {
      presenceData.details = 'Waiting to start a text practice'
    }
    else {
      const finalTime = document.querySelector('.col-md-6 > p > strong')

      if (finalTime) {
        presenceData.details = 'Finishing a text practice'
        presenceData.state = `Final time: ${finalTime.textContent}m`
      }
      else {
        presenceData.details = 'Doing a text practice'
      }
    }
  }
  else if (
    document.location.pathname.includes('/widget/')
    || document.location.pathname.includes('/widgets/')
  ) {
    const timer = document.querySelector('#timer')?.textContent
    if (timer?.match(/([125]0?:0{2})|(0:30)/)) {
      presenceData.details = 'Waiting to start a custom typing test'
    }
    else if (timer === '0:00') {
      presenceData.details = 'Finishing a custom typing test:'
      presenceData.state = `${
        document.querySelector('#wpm')?.textContent?.split('(')[0]
      }`
    }
    else {
      presenceData.details = ' Doing a custom typing test'
    }
  }
  else if (document.location.pathname.includes('/user/')) {
    presenceData.details = 'Viewing a user profile:'
    presenceData.state = document.querySelector('.row > h2')?.lastChild?.nodeValue
  }
  else if (document.location.pathname.includes('/top1000/')) {
    const lang = document.location.pathname.split('/')
    presenceData.details = 'Doing the top 1000 typing test:'
    presenceData.state = `In ${lang[lang.length - 3]}`
  }
  else {
    switch (document.location.pathname) {
      case '/email_settings':
        presenceData.details = 'Viewing email settings'
        break
      case '/active-user-alltime':
        presenceData.details = 'Viewing all-time records'
        break
      case '/text-practice/new':
        presenceData.details = 'Viewing text practice'
        break
      case '/multiplayer':
        presenceData.details = 'Doing a multiplayer typing test'
        break
      case '/faq':
        presenceData.details = 'Reading the FAQ'
        break
      case '/forum/':
        presenceData.details = 'Viewing the forums'
        break
      case '/supporter':
        presenceData.details = 'Viewing the list of supporters'
        break
      case '/login':
        presenceData.details = 'Logging in...'
        break
      case '/create-account':
        presenceData.details = 'Creating an account..'
        break
      case '/impressum':
        presenceData.details = 'Reading the privacy policy'
        break
      case '/gdpr':
        presenceData.details = 'Reading information about GDPR'
        break
      case '/cookie-policy':
        presenceData.details = 'Reading the cookie policy'
        break
      case '/settings':
        presenceData.details = 'Viewing their settings'
        break
      case '/achievements':
        presenceData.details = 'Viewing their achievements'
        break
      case '/translations':
        presenceData.details = 'Learning how to translate'
        break
      case '/anticheat':
        presenceData.details = 'Viewing the Anti-Cheat'
        break
      case '/top1000':
        presenceData.details = 'Viewing the top 1000 typing mode'
        break
      case '/competitions':
        presenceData.details = 'Viewing the list of competitions'
        break
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
