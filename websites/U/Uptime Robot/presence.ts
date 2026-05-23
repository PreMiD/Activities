const presence = new Presence({
  clientId: '503557087041683458',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/U/Uptime%20Robot/assets/logo.jpg',
    startTimestamp: browsingTimestamp,
    name: 'Uptime Robot',
  }

  if (document.location.hostname === 'uptimerobot.com') {
    if (document.location.pathname.includes('/login')) {
      presenceData.details = 'Logging in'
    }
    else if (document.location.pathname.includes('/signUp')) {
      presenceData.details = 'Signing up'
    }
    else if (document.location.pathname.includes('/dashboard')) {
      presenceData.details = 'Viewing:'
      const user = document.querySelector(
        '#main-content > div.row-fluid.page-head > h2 > span',
      )
      presenceData.state = user?.textContent
    }
    else if (document.location.pathname.includes('/support')) {
      presenceData.details = 'Viewing the support page'
    }
    else if (document.location.pathname.includes('/faq')) {
      presenceData.details = 'Viewing the FAQ page'
    }
    else if (
      document.querySelector(
        'body > content > content > div:nth-child(3) > div:nth-child(3) > div.content > div.titleTopic',
      )
    ) {
      const thread = document.querySelector(
        'body > content > content > div:nth-child(3) > div:nth-child(3) > div.content > div.titleTopic',
      )
      presenceData.details = 'Viewing thread:'
      presenceData.state = thread?.textContent
    }
    else if (document.location.pathname.includes('/about')) {
      presenceData.details = 'Viewing the about page'
    }
    else if (document.location.pathname.includes('/privacyPolicy')) {
      presenceData.details = 'Viewing privacy'
      presenceData.state = 'and policy page'
    }
    else if (document.location.pathname.includes('/locations')) {
      presenceData.details = 'Viewing locations page'
    }
    else if (document.location.pathname.includes('/pricing')) {
      presenceData.details = 'Looking at the pricing page'
    }
    else if (document.location.pathname.includes('/api')) {
      presenceData.details = 'Looking at the api page'
    }
    else if (document.location.pathname.includes('/termsOfService')) {
      presenceData.details = 'Viewing the TOS'
    }
    else if (document.location.pathname.includes('/account/')) {
      presenceData.details = 'Forums, account settings'
    }
    else if (document.location.pathname.includes('/members/')) {
      if (document.URL.includes('key=staff_members')) {
        presenceData.details = 'Viewing the list'
        presenceData.state = 'of staff members'
      }
      else if (document.URL.includes('key=todays_birthdays')) {
        presenceData.details = 'Viewing list of members'
        presenceData.state = 'with today as their birthday'
      }
      else if (document.location.pathname.includes('/banned')) {
        presenceData.details = 'Viewing the list'
        presenceData.state = 'of banned users'
      }
      else if (document.location.pathname.includes('/list')) {
        presenceData.details = 'Viewing the list'
        presenceData.state = 'of all users'
      }
      else if (document.URL.includes('key=most_likes')) {
        presenceData.details = 'Viewing list of members'
        presenceData.state = 'with the most reactions'
      }
      else if (document.URL.includes('key=most_messages')) {
        presenceData.details = 'Viewing list of members'
        presenceData.state = 'with the most messages'
      }
      else if (
        document.querySelector(
          '#top > div.p-body > div > div > div > div.p-body-content > div > div.block > div > div > div > div > div > h1 > span > span',
        )
      ) {
        const user = document.querySelector(
          '#top > div.p-body > div > div > div > div.p-body-content > div > div.block > div > div > div > div > div > h1 > span > span',
        )
        presenceData.details = 'Viewing user:'
        presenceData.state = user?.textContent
      }
      else if (
        document.querySelector(
          '#top > div.p-body > div > div > div > div.p-body-content > div > div.block > div > div > div > div > div > h1 > span',
        )
      ) {
        const user = document.querySelector(
          '#top > div.p-body > div > div > div > div.p-body-content > div > div.block > div > div > div > div > div > h1 > span',
        )
        presenceData.details = 'Viewing user:'
        presenceData.state = user?.textContent
      }
      else {
        presenceData.details = 'Viewing overview of members'
      }
    }
    else if (document.location.pathname.includes('/forums/')) {
      const title = document.querySelector<HTMLElement>(
        '#top > div.p-body > div > div.uix_titlebar > div > div > div > h1',
      )
      if (title) {
        presenceData.details = 'Forums, viewing category:'
        presenceData.state = title.textContent
      }
      else {
        presenceData.details = 'Forums, Browsing...'
      }
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
