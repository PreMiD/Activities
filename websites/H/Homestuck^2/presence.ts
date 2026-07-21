const presence = new Presence({
  clientId: '945791515169521694',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/H/Homestuck%5E2/assets/logo.png',
  Heart = 'https://cdn.rcd.gg/PreMiD/websites/H/Homestuck%5E2/assets/0.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    name: 'Homestuck: Beyond Canon',
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const { pathname } = document.location
  const pathArr = pathname.split('/')

  switch (pathArr[0]) {
    case '':
      presenceData.details = 'Viewing the home page'
      break
  }

  switch (pathArr[1]) {
    case 'story':
      presenceData.details = 'Reading Homestuck: Beyond Canon'
      presenceData.smallImageKey = ActivityAssets.Heart

      if (!pathArr[2])
        presenceData.state = `Page 1 of ${await getPages()}`
      else if (!(pathArr[2] === 'log'))
        presenceData.state = `Page ${pathArr[2]} of ${await getPages()}`

      if (pathArr[2] === 'log') {
        presenceData.details = 'Viewing the adventure log'
      }

      if (document.querySelector('h1')) {
        presenceData.smallImageText = document.querySelector('h1')?.textContent
      }
      else {
        presenceData.smallImageText = document.querySelector('.title__content')?.textContent
      }

      presenceData.buttons = [
        {
          label: 'Read Along',
          url: `https://www.beyondcanon.com${pathname}`,
        },
      ]
      break

    case 'bonus':
      presenceData.details = 'Viewing bonus content'
      switch (pathArr[2]) {
        case 'catnapped':
          presenceData.details = 'Reading Catnapped'
          presenceData.smallImageKey = ActivityAssets.Heart
          presenceData.state = `Page ${pathArr[3]} of 28`
          presenceData.smallImageText = document.querySelector('h2')?.textContent
          presenceData.buttons = [
            {
              label: 'Read Along',
              url: `https://www.beyondcanon.com${pathname}`,
            },
          ]
          break

        case 'a-treatise-on-representational-democracy':
          presenceData.details = 'Reading A Treatise on Representational Democracy'
          presenceData.smallImageKey = ActivityAssets.Heart
          presenceData.state = `Page ${pathArr[3]} of 13`
          presenceData.smallImageText = document.querySelector('h2')?.textContent
          presenceData.buttons = [
            {
              label: 'Read Along',
              url: `https://www.beyondcanon.com${pathname}`,
            },
          ]
          break

        case 'diamonds-dames-and-dads':
          presenceData.details = 'Reading Diamonds, Dames, and Dads'
          presenceData.smallImageKey = ActivityAssets.Heart
          presenceData.state = `Page ${pathArr[3]} of 46`
          presenceData.smallImageText = document.querySelector('h2')?.textContent
          presenceData.buttons = [
            {
              label: 'Read Along',
              url: `https://www.beyondcanon.com${pathname}`,
            },
          ]
          break

        case 'a-threat-sensed':
          presenceData.details = 'Reading A Threat, Sensed'
          presenceData.smallImageKey = ActivityAssets.Heart
          presenceData.state = `Page ${pathArr[3]} of 13`
          presenceData.smallImageText = document.querySelector('h2')?.textContent
          presenceData.buttons = [
            {
              label: 'Read Along',
              url: `https://www.beyondcanon.com${pathname}`,
            },
          ]
          break

        case 'the-influencers':
          presenceData.details = 'Reading The Influencers'
          presenceData.smallImageKey = ActivityAssets.Heart
          presenceData.state = `Page ${pathArr[3]} of 34`
          presenceData.smallImageText = document.querySelector('h2')?.textContent
          presenceData.buttons = [
            {
              label: 'Read Along',
              url: `https://www.beyondcanon.com${pathname}`,
            },
          ]
          break

        default:
          break
      }
      break

    case 'about':
      presenceData.details = 'Viewing the about page'
      break

    case 'contacts':
      presenceData.details = 'Viewing the contact information'
      break

    case 'credits':
      presenceData.details = 'Viewing the credits'
      break

    case 'privacy-policy':
      presenceData.details = 'Viewing the privacy policy'
      break

    case 'cookie-policy':
      presenceData.details = 'Viewing the cookie policy'
      break

    case 'recap':
      presenceData.details = 'Viewing recap'
      break

    case 'news':
      presenceData.details = 'Viewing the news page'
      break

    default:
      presenceData.details = 'Viewing an unsupported page'
      break
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.clearActivity()
})

async function getPages() {
  const response = await fetch(
    `https://api.rss2json.com/v1/api.json?rss_url=${'https://beyondcanon.com/story/feed'}`,
  )
  const data = await response.json()
  return data.items[0].title
}
