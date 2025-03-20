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
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const { pathname } = document.location
  const pathArr = pathname.split('/')

  switch (pathArr[1]) {
    case '':
      presenceData.details = 'Viewing the home page'
      break

    case 'story':
      presenceData.details = 'Reading Homestuck^2'
      presenceData.smallImageKey = ActivityAssets.Heart
      if (!pathArr[2])
        presenceData.state = `Page 1 of ${await getPages()}`
      else presenceData.state = `Page ${pathArr[2]} of ${await getPages()}`

      if (document.querySelector('h2')) {
        presenceData.smallImageText = document.querySelector('h2')?.textContent
      }
      else {
        presenceData.smallImageText = document.querySelector('title')?.textContent
      }
      presenceData.buttons = [
        {
          label: 'Read Along',
          url: `https://www.homestuck2.com${pathname}`,
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
              url: `https://www.homestuck2.com${pathname}`,
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
              url: `https://www.homestuck2.com${pathname}`,
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
              url: `https://www.homestuck2.com${pathname}`,
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
              url: `https://www.homestuck2.com${pathname}`,
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
              url: `https://www.homestuck2.com${pathname}`,
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

    case 'log':
      presenceData.details = 'Viewing the adventure log'
      break

    case 'privacy-policy':
      presenceData.details = 'Viewing the privacy policy'
      break

    case 'recap':
      presenceData.details = 'Viewing recap'
      break

    default:
      presenceData.details = 'Viewing an unsupported page'
      break
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})

async function getPages() {
  const response = await fetch(
    `https://api.rss2json.com/v1/api.json?rss_url=${'https://homestuck2.com/story/rss'}`,
  )
  const data = await response.json()
  return data.items[0].title
}
