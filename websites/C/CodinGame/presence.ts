const presence = new Presence({
  clientId: '991078618866274364',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/C/CodinGame/assets/0.png',
    startTimestamp: browsingTimestamp,
  }
  const { pathname } = document.location
  if (pathname === '/') {
    presenceData.details = 'Browsing...'
  }
  else if (pathname.includes('/home')) {
    presenceData.details = 'On the dashboard'
    presenceData.state = `${
      document.querySelectorAll(
        'div[class=\'home-content\'] > div > div > div > div > home > div > home-react > div > div > section > section > div > div > div > div',
      )[0]?.textContent
    } - Rank : ${
      document.querySelectorAll(
        'div[class=\'home-content\'] > div > div > div > div > home > div > home-react > div > div > section > section > div > div > div > div',
      )[4]?.textContent
    }`
  }
  else if (pathname.includes('/training')) {
    if (pathname.includes('/easy/')) {
      presenceData.details = 'Training: Easy'
      presenceData.state = `${
        document.querySelector('h1[class=\'title\']')?.textContent
      } (${document.querySelector('div[class=\'chart-inner\']')?.textContent}%)`
    }
    else if (pathname.includes('/medium/')) {
      presenceData.details = 'Training: Medium'
      presenceData.state = `${
        document.querySelector('h1[class=\'title\']')?.textContent
      } (${document.querySelector('div[class=\'chart-inner\']')?.textContent}%)`
    }
    else if (pathname.includes('/hard/')) {
      presenceData.details = 'Training: Hard'
      presenceData.state = `${
        document.querySelector('h1[class=\'title\']')?.textContent
      } (${document.querySelector('div[class=\'chart-inner\']')?.textContent}%)`
    }
    else if (pathname.includes('/expert/')) {
      presenceData.details = 'Training: Very Hard'
      presenceData.state = `${
        document.querySelector('h1[class=\'title\']')?.textContent
      } (${document.querySelector('div[class=\'chart-inner\']')?.textContent}%)`
    }
    else {
      presenceData.details = 'Looking at Practice'
    }
  }
  else if (pathname.includes('/multiplayer')) {
    if (pathname.includes('/clashofcode')) {
      presenceData.details = 'Looking at Clash of Code'
      presenceData.state = `Rank : ${
        document.querySelector('span[class=\'rank-value\']')?.textContent
      } th`
    }
    else if (pathname.includes('/bot-programming')) {
      presenceData.details = 'Training: Bot Programming'

      try {
        presenceData.state = `${
          document.querySelector('h1[class=\'title\']')?.textContent
        } - Rank : ${
          document.querySelectorAll(
            'div[id=\'content-details-league\'] > div > div',
          )[1]?.textContent
        }`
      }
      catch {
        presenceData.state = `${
          document.querySelector('h1[class=\'title\']')?.textContent
        } - Not yet solved`
      }
    }
    else if (pathname.includes('/codegolf')) {
      presenceData.details = 'Training: Code Golf'
      try {
        if (
          document.querySelector('div[class=\'chart-inner\']')?.textContent !== '0'
        ) {
          presenceData.state = `${
            document.querySelector('h1[class=\'title\']')?.textContent
          } (${document.querySelector('span[class=\'rank-value\']')?.textContent}${
            document.querySelector('span[class=\'rank-suffix\']')?.textContent
          }/${document.querySelector('span[class=\'rank-total\']')?.textContent})`
        }
        else {
          presenceData.state = 'Not yet solved'
        }
      }
      catch {
        presenceData.state = `${
          document.querySelector('h1[class=\'title\']')?.textContent
        } (${document.querySelector('span[class=\'rank-value\']')?.textContent}${
          document.querySelector('span[class=\'rank-suffix\']')?.textContent
        }/${document.querySelector('span[class=\'rank-total\']')?.textContent})`
      }
    }
    else if (pathname.includes('/optimization')) {
      presenceData.details = 'Training: Optimization'
      try {
        if (
          document.querySelector('div[class=\'chart-inner\']')?.textContent !== '0'
        ) {
          presenceData.state = `${
            document.querySelector('h1[class=\'title\']')?.textContent
          } (${document.querySelector('span[class=\'rank-value\']')?.textContent}${
            document.querySelector('span[class=\'rank-suffix\']')?.textContent
          }/${document.querySelector('span[class=\'rank-total\']')?.textContent})`
        }
        else {
          presenceData.state = 'Not yet solved'
        }
      }
      catch {
        presenceData.state = `${
          document.querySelector('h1[class=\'title\']')?.textContent
        } (${document.querySelector('span[class=\'rank-value\']')?.textContent}${
          document.querySelector('span[class=\'rank-suffix\']')?.textContent
        }/${document.querySelector('span[class=\'rank-total\']')?.textContent})`
      }
    }
    else {
      presenceData.details = 'Looking at a competition'
    }
  }
  else if (pathname.includes('/cooperate')) {
    presenceData.details = 'Looking at the corporate page'
  }
  else if (pathname.includes('/learn')) {
    presenceData.details = 'Looking at the learn page'
  }
  else if (pathname.includes('/events')) {
    presenceData.details = 'Looking at the events page'
  }
  else if (pathname.includes('/contribute/community')) {
    presenceData.details = 'Looking at community page'
  }
  else if (pathname.includes('/contribute/my-contributions')) {
    presenceData.details = 'Looking at their contributions'
  }
  else if (pathname.includes('/live-streams')) {
    presenceData.details = 'Looking at live streams'
  }
  else if (pathname.includes('/blog')) {
    presenceData.details = 'Looking at the blog'
  }
  else if (pathname.includes('/forum')) {
    presenceData.details = 'Looking at the forum'
  }
  else if (pathname.includes('/profile')) {
    presenceData.details = 'Looking at a profile'
  }
  else if (pathname.includes('/settings')) {
    presenceData.details = 'Looking at their settings'
  }
  else if (pathname.includes('/about')) {
    presenceData.details = 'Looking at the about page'
  }
  else if (pathname.includes('/careers')) {
    presenceData.details = 'Looking at the careers page'
  }
  else if (pathname.includes('/work')) {
    presenceData.details = 'Looking at the work page'
  }
  else if (
    pathname.includes('/legal/privacy-policy')
    && pathname.includes('/playgrounds')
  ) {
    presenceData.details = 'Looking at the privacy policy'
  }
  else if (pathname.includes('/help-center')) {
    presenceData.details = 'Looking at the FAQ page'
  }
  else if (pathname.includes('/start')) {
    presenceData.details = 'Not logged in'
  }
  else if (pathname.includes('/ide')) {
    if (pathname.includes('/ide/puzzle/')) {
      presenceData.details = `Solving the challenge: ${
        document.querySelectorAll('h1[class=\'cg-ide-title\'] > span')[
          document.querySelectorAll('h1[class=\'cg-ide-title\'] > span').length
          - 1
        ]?.textContent
      }`
      try {
        const score = document.querySelector(
          'span[class*=\'score-value\']',
        )?.textContent
        if (score === 'N/A') {
          presenceData.state = '0%'
        }
        else {
          try {
            const rank = document.querySelector(
              'span[class=\'rank-value\']',
            )?.textContent
            if (!rank) {
              presenceData.state = `${rank}th/${
                document.querySelector('span[class=\'rank-total\']')?.textContent
              }`
            }
            else {
              presenceData.state = `${score}%`
            }
          }
          catch {
            presenceData.state = `${score}%`
          }
        }
      }
      catch {
        presenceData.state = `League: ${
          document.querySelector('span[class=\'league-value\']')?.textContent
        }`
      }
    }
    else {
      presenceData.details = document.querySelectorAll(
        'h1[class=\'cg-ide-title\'] > span',
      )[
        document.querySelectorAll('h1[class=\'cg-ide-title\'] > span').length - 1
      ]?.textContent
      presenceData.state = `Time left : ${
        document.querySelector('span[class*=\'minutes\']')?.textContent
      }m : ${document.querySelector('span[class*=\'seconds\']')?.textContent}s`
    }
  }
  else if (pathname.includes('/clashofcode/clash/')) {
    presenceData.details = 'Waiting for the Clash of Code'
    presenceData.buttons = [
      {
        label: 'Join clash',
        url: document
          .querySelector('input[class=\'copy-url-button\']')
          ?.getAttribute('value') ?? '',
      },
    ]
  }
  else if (
    !pathname.includes('/legal/privacy-policy')
    && pathname.includes('/playgrounds')
  ) {
    presenceData.details = document.querySelector(
      'h1[class=\'playground_header-title\'] > span',
    )?.textContent
    presenceData.state = 'Learning'
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
