import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '1382462713682460672',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/A/AlternativeScans/assets/logo.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    smallImageKey: Assets.Search,
    type: ActivityType.Watching,
  }
  const { pathname, href } = document.location
  const pathArr = pathname.split('/')
  let pathred
  let img
  let titlename

  if (pathArr[1]) {
    pathred = pathArr[1].split('?')

    switch (pathArr[1]) {
      case 'series':
        img = document.querySelector<HTMLImageElement>('.cover-column img.cover-image')

        presenceData.largeImageKey = img?.src ?? ''
        presenceData.smallImageKey = Assets.Viewing

        titlename = document
          .querySelector('head > title')
          ?.textContent

        presenceData.details = `Viewing:  ${titlename}`
        presenceData.buttons = [{
          label: 'View Series',
          url: href,
        }]
        break

      case 'routes':
        presenceData.details = `Searching for Series`

        break

      default:

        if (pathred[0] === 'reader') {
          const currentUrl = new URL(href)
          const params = currentUrl.searchParams
          const seriesparam = params.get('series')
          const chapterparam = params.get('chapter')
          const idparam = params.get('id')
          let seriesparamup

          if (seriesparam) {
            seriesparamup = seriesparam.toUpperCase()
          }

          const name = document
            .querySelector<HTMLAnchorElement>('#current-chapter-name a')
            ?.textContent
            ?.trim()
            ?? ''

          presenceData.details = `${name}`
          presenceData.state = document
            .querySelector('head > title')
            ?.textContent
            ?.replace(` - ${seriesparamup}`, '')
          presenceData.largeImageKey = `https://files.alternativescans.icu/file/public-chapter-images/${seriesparam}/${chapterparam}/1.png`
          presenceData.smallImageKey = Assets.Reading
          presenceData.buttons = [{
            label: 'Read Chapter',
            url: href,
          }, {
            label: 'View Series',
            url: `https://alternativescans.icu/series/?series=${seriesparam}&id=${idparam}`,
          }]
        }
    }
  }
  else {
    presenceData.details = 'Viewing the Homepage'
  }

  if (presenceData.details) {
    presence.setActivity(presenceData)
  }
  else {
    presence.clearActivity()
  }
})
