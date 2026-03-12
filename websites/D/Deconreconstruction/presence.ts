const presence = new Presence({
  clientId: '945791824147128341',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

let vePages: string, htPages: string

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/D/Deconreconstruction/assets/0.png',
    startTimestamp: browsingTimestamp,
  }
  const { href, pathname } = document.location
  const pathArr = pathname.split('/')

  switch (pathArr[1]) {
    case '':
      presenceData.details = 'Viewing the home page'
      break

    case 'vasterror':
      switch (pathArr[2]) {
        case 'adventuremap':
          presenceData.details = 'Viewing the adventure map'
          break

        case 'credits':
          presenceData.details = 'Viewing the credits'
          break

        case 'log':
          presenceData.details = 'Viewing the Vast Error log'
          break

        default:
          presenceData.details = 'Reading Vast Error'
          presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/D/Deconreconstruction/assets/1.png'
          presenceData.state = `Page ${pathArr[2]} of ${vePages}`
          presenceData.smallImageText = document.querySelector('#command')?.textContent
          presenceData.buttons = [
            {
              label: 'Read Along',
              url: href,
            },
          ]
          break
      }
      break

    case 'thaumatrope':
      switch (pathArr[2]) {
        case 'syzygy':
          presenceData.details = 'Reading Thaumatrope: Syzygy'
          presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/D/Deconreconstruction/assets/2.png'
          presenceData.state = `Page ${pathArr[3]} of 162`
          presenceData.smallImageText = document.querySelector('#command')?.textContent
          presenceData.buttons = [
            {
              label: 'Read Along',
              url: href,
            },
          ]
          break

        case 'haustoria':
          presenceData.details = 'Reading Thaumatrope: Haustoria'
          presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/D/Deconreconstruction/assets/2.png'
          presenceData.state = `Page ${pathArr[3]} of ${htPages}`
          presenceData.smallImageText = document.querySelector('#command')?.textContent
          presenceData.buttons = [
            {
              label: 'Read Along',
              url: href,
            },
          ]
          break

        case 'log':
          presenceData.details = 'Viewing the Thaumatrope log'
          break

        default:
          presenceData.details = 'Viewing an unsupported page'
          break
      }
      break

    case 'bonus':
      switch (pathArr[2]) {
        case 'april-fools-day-2017':
          presenceData.details = 'Reading April Fools 2017'
          presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/D/Deconreconstruction/assets/3.png'
          presenceData.state = `Page ${pathArr[3]} of 4`
          presenceData.smallImageText = document.querySelector('#command')?.textContent
          presenceData.buttons = [
            {
              label: 'Read Along',
              url: href,
            },
          ]
          break

        case 'recap':
          presenceData.details = 'Viewing the Act 1 recap'
          break

        case 'revised':
          presenceData.details = 'Viewing revised pages'
          break

        default:
          presenceData.details = 'Viewing bonus content'
          break
      }
      break

    default:
      presenceData.details = 'Viewing an unsupported page'
      break
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
});

(function () {
  function getPages() {
    if (document.location.pathname.match(/^\/vasterror\/\d+$/)) {
      fetch(
        'https://api.deconreconstruction.com/pages/count?story.name=vast-error&published_at_null=false',
      ).then(async (res) => {
        vePages = await res.json()
      })
    }

    if (document.location.pathname.match(/^\/thaumatrope\/haustoria\/\d+$/)) {
      fetch(
        'https://api.deconreconstruction.com/pages/count?story.name=thaumatrope/haustoria&published_at_null=false',
      ).then(async (res) => {
        htPages = await res.json()
      })
    }
  }
  getPages()
  setInterval(getPages, 60000)
})()
