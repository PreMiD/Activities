const presence = new Presence({
  clientId: '1073167802296438875',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/G/G2G/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const { pathname, href, search } = document.location

  switch (pathname.split('/')[1]) {
    case 'search': {
      presenceData.details = 'Searching something to buy'
      presenceData.state = new URLSearchParams(search).get('q')
      break
    }
    case 'categories': {
      presenceData.details = 'Browsing a category'
      presenceData.state = document.querySelector<HTMLHeadingElement>('title')?.textContent
      presenceData.buttons = [
        {
          label: 'View Category',
          url: href,
        },
      ]
      break
    }
    case 'offer': {
      presenceData.details = 'Viewing an offer'
      presenceData.state = document.querySelector<HTMLHeadingElement>('title')?.textContent
      presenceData.buttons = [
        {
          label: 'View Offer',
          url: href,
        },
      ]
      break
    }
    case 'seller': {
      presenceData.details = 'Selling something'
      break
    }
    case 'chat': {
      presenceData.details = 'Chatting with a sellet'
      break
    }
    case 'account': {
      presenceData.details = 'Viewing their account'
      break
    }
    case 'trending': {
      presenceData.details = 'Viewing a trending offer'
      presenceData.state = document.querySelector<HTMLDivElement>('div.text-h4')?.textContent
      presenceData.buttons = [
        {
          label: 'View Trending',
          url: href,
        },
      ]
      break
    }
    case 'secure': {
      presenceData.details = `Buying ${
        document.querySelector<HTMLDivElement>('div.col-8.row')?.textContent
      }`
      break
    }
    default: {
      const elem = pathname.split('/')[1]
      if (elem === '') {
        presenceData.details = 'Viewing the homepage'
        presenceData.state = 'Browsing...'
      }
      else {
        presenceData.details = `Viewing ${elem}'s profile`
        presenceData.buttons = [
          {
            label: 'View Profile',
            url: href,
          },
        ]
      }
      break
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
