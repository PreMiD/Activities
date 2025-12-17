import { getSpecificLineInfos } from './functions/getLinesInfos.js'

const presence = new Presence({
  clientId: '1384869884281753680',
})

async function getStrings() {
  return presence.getStrings({
    deleteAccount: 'tbm.deleteAccount',
    direction: 'tbm.direction',
    editTheirPersonnalInfo: 'tbm.editTheirPersonnalInfo',
    editingAccount: 'tbm.editingAccount',
    from: 'tbm.from',
    noData: 'tbm.noData',
    searchProduct: 'tbm.searchProduct',
    searchRoutes: 'tbm.searchRoutes',
    searchStop: 'tbm.searchStop',
    stop: 'tbm.stop',
    to: 'tbm.to',
    unknowPage: 'tbm.unknowPage',
    viewCategory: 'tbm.viewCategory',
    viewDashboard: 'tbm.viewDashboard',
    viewDocumentation: 'tbm.viewDocumentation',
    viewDynamicPlan: 'tbm.viewDynamicPlan',
    viewHelpPage: 'tbm.viewHelpPage',
    viewHome: 'general.viewHome',
    viewLineInfos: 'tbm.viewLineInfos',
    viewLines: 'tbm.viewLines',
    viewLinesSchedules: 'tbm.viewLinesSchedules',
    viewOffer: 'tbm.viewOffer',
    viewPage: 'general.viewPage',
    viewPointsScale: 'tbm.viewPointsScale',
    viewProduct: 'tbm.viewProduct',
    viewSchedules: 'tbm.viewSchedules',
    viewShop: 'tbm.viewShop',
    viewTBMShop: 'tbm.viewTBMShop',
    viewTheirOrders: 'tbm.viewTheirOrders',
    viewTheirPointsHistory: 'tbm.viewTheirPointsHistory',
    viewTheirProfile: 'tbm.viewTheirProfile',
    viewTrafficInfo: 'tbm.viewTrafficInfo',
    viewTrafficInfos: 'tbm.viewTrafficInfos',
  })
}
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/T/TBM/assets/logo.png',
  OldLogo = 'https://cdn.rcd.gg/PreMiD/websites/T/TBM/assets/0.jpeg',
  NewLogo = 'https://cdn.rcd.gg/PreMiD/websites/T/TBM/assets/1.png',
  TBMFid = 'https://cdn.rcd.gg/PreMiD/websites/T/TBM/assets/2.png',
  Routes = 'https://cdn.rcd.gg/PreMiD/websites/T/TBM/assets/3.png',
  Schedules = 'https://cdn.rcd.gg/PreMiD/websites/T/TBM/assets/4.png',
  Traffic = 'https://cdn.rcd.gg/PreMiD/websites/T/TBM/assets/5.png',
  Lines = 'https://cdn.rcd.gg/PreMiD/websites/T/TBM/assets/6.png',
  Bike = 'https://cdn.rcd.gg/PreMiD/websites/T/TBM/assets/7.png',
  Parking = 'https://cdn.rcd.gg/PreMiD/websites/T/TBM/assets/8.png',
}

async function svgToPng(svgUrl: string): Promise<string | undefined> {
  if (!svgUrl || !svgUrl.endsWith('.svg'))
    return

  const response = await fetch(svgUrl)
  const svgText = await response.text()

  const fillMatch = svgText.match(/<rect[^>]*fill="([^"]+)"/i)
  const backgroundColor = fillMatch ? fillMatch[1] : '#ffffff'

  const img = new Image()
  const svgBlob = new Blob([svgText], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(svgBlob)
  img.src = url

  await new Promise((resolve, reject) => {
    img.onload = resolve
    img.onerror = reject
  })

  const maxSize = Math.max(img.width, img.height)
  const canvas = document.createElement('canvas')
  canvas.width = maxSize
  canvas.height = maxSize
  const ctx = canvas.getContext('2d')

  let png: string | undefined
  if (ctx) {
    ctx.fillStyle = backgroundColor!
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const x = (maxSize - img.width) / 2
    const y = (maxSize - img.height) / 2
    ctx.drawImage(img, x, y, img.width, img.height)

    png = canvas.toDataURL('image/png')
  }

  URL.revokeObjectURL(url)
  return png
}

function isValidUUID(uuid: string) {
  const regex = /^[a-f0-9]{8}-[a-f0-9]{4}-1[a-f0-9]{3}-[a-f0-9]{4}-[a-f0-9]{12}$/i
  return regex.test(uuid)
}

presence.on('UpdateData', async () => {
  const logo = await presence.getSetting<number>('logo')
  const presenceData: PresenceData = {
    largeImageKey: [ActivityAssets.Logo, ActivityAssets.OldLogo, ActivityAssets.NewLogo][logo] || ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const strings = await getStrings()
  const path = document.location.pathname?.split('/')
  const completePath = document.location.pathname
  let svgImg: HTMLImageElement | null = null

  switch (document.location.hostname) {
    case 'www.infotbm.com': {
      if (/^\/(?:fr|en|es)$/.test(completePath)) {
        presenceData.details = strings.viewHome
      }
      else if (/\/(?:horaires|schedules|horarios)(?:\/|$)/.test(completePath)) {
        presenceData.details = strings.viewLinesSchedules
        presenceData.smallImageKey = ActivityAssets.Schedules

        if (/\/(?:recherche|search|buscar)$/.test(completePath)) {
          presenceData.details = strings.searchStop
          presenceData.state = `${strings.direction} ${document.querySelector('.direction-wrapper > a.active p:nth-of-type(2)')?.textContent || ''}`
          svgImg = document.querySelector<HTMLImageElement>('.tbm-lines-name-wrapper > img')
          if (svgImg) {
            presenceData.smallImageKey = await svgToPng(svgImg?.src)
            presenceData.smallImageText = svgImg?.alt
          }
        }
        else if (/\/(?:detail|detalle)(?:\/|$)/.test(completePath)) {
          presenceData.details = strings.viewSchedules
          presenceData.state = `${strings.stop} ${document.querySelector('.tbm-lines-name-wrapper')?.textContent || strings.noData} - ${strings.direction} ${document.querySelector('svg[aria-label="Direction"]')?.nextElementSibling?.textContent || strings.noData}`
          svgImg = document.querySelector<HTMLImageElement>('.tbm-lines-name-wrapper > img')
          if (svgImg) {
            presenceData.smallImageKey = await svgToPng(svgImg?.src)
            presenceData.smallImageText = svgImg?.alt
          }
        }
      }
      else if (/\/(?:itineraires|routes|rutas)(?:\/|$)/.test(completePath)) {
        const departureInput = document.querySelector<HTMLInputElement>('.route-search-input input#autosuggest_route\\.search\\.from')?.value
        const arrivalInput = document.querySelector<HTMLInputElement>('.route-search-input input#autosuggest_route\\.search\\.to')?.value
        presenceData.details = strings.searchRoutes
        presenceData.state = `${strings.from} ${departureInput || document.querySelector('.roadmap-step-first h3')?.textContent || strings.noData} → ${strings.to} ${arrivalInput || document.querySelector('.roadmap-step-last h3')?.textContent || strings.noData}`
        presenceData.smallImageKey = ActivityAssets.Routes
        svgImg = document.querySelector('.traffic-wrapper button.active > svg')
        if (svgImg) {
          presenceData.smallImageText = svgImg?.getAttribute('aria-label')
        }
        else {
          presenceData.smallImageText = document.querySelector('.roadmap-summary .duration span')?.textContent
        }
      }
      else if (/\/(?:perturbations|traffic-info|perturbaciones)(?:\/|$)/.test(completePath)) {
        presenceData.details = strings.viewTrafficInfos
        presenceData.state = document.querySelector('.tab-wrapper > a.active')?.textContent
        presenceData.smallImageKey = ActivityAssets.Traffic

        if (/\/(?:ligne|line|linea)(?:\/|$)/.test(completePath) && isValidUUID(path[path.length - 1]!)) {
          presenceData.details = strings.viewTrafficInfo
          presenceData.state = document.querySelector('.tbm-lines-name-wrapper > span.lh-xbig')?.textContent || document.querySelector('.tbm-lines-name-wrapper > span:nth-of-type(2)')?.textContent
          svgImg = document.querySelector<HTMLImageElement>('.tbm-lines-name-wrapper img')
          if (svgImg) {
            presenceData.smallImageKey = await svgToPng(svgImg?.src)
            presenceData.smallImageText = svgImg?.alt
          }
        }
        else if (/\/(?:ligne|line|linea)(?:\/|$)/.test(completePath)) {
          const status = document.querySelector('.traffic-list > h3')?.firstChild?.textContent || document.querySelector('.traffic-list p')?.textContent
          const number = document.querySelector('.traffic-list > h3 > span')?.textContent
          presenceData.state = `${status} ${number ? `: ${number}` : ''}`
          svgImg = document.querySelector<HTMLImageElement>('.tbm-lines-name-wrapper > img')
          if (svgImg) {
            presenceData.smallImageKey = await svgToPng(svgImg?.src)
            presenceData.smallImageText = svgImg?.alt
          }
        }
        else if (/\/(?:stations|estaciones)(?:\/|$)/.test(completePath) && isValidUUID(path[path.length - 1]!)) {
          presenceData.details = strings.viewTrafficInfo
          presenceData.state = document.querySelector('.tbm-lines-name-wrapper span.lh-xbig')?.textContent
          presenceData.smallImageKey = ActivityAssets.Bike
          presenceData.smallImageText = document.querySelector('.tbm-lines-name-wrapper p')?.textContent || ''
        }
        else if (/\/(?:stations|estaciones)\//.test(completePath)) {
          presenceData.state = `${document.querySelector('.traffic-list > h3')?.firstChild?.textContent} : ${document.querySelector('.traffic-list > h3 > span')?.textContent}`
          presenceData.smallImageKey = ActivityAssets.Bike
          presenceData.smallImageText = document.querySelector('.tbm-lines-name-wrapper > span.lh-xbig')?.textContent || ''
        }
        else if (/\/(?:stations|estaciones)$/.test(completePath)) {
          presenceData.state = document.querySelector('.traffic-list > h3 > p')?.textContent
          presenceData.smallImageKey = ActivityAssets.Bike
          presenceData.smallImageText = document.querySelector('div.tbm-block > h2')?.textContent || ''
        }
        else if (/\/(?:parc-relais|park-and-rides|aparcamientos-disuasorios)(?:\/|$)/.test(completePath) && isValidUUID(path[path.length - 1]!)) {
          presenceData.details = strings.viewTrafficInfo
          presenceData.state = document.querySelector('.tbm-lines-name-wrapper > span.lh-xbig')?.textContent || document.querySelector('.tbm-lines-name-wrapper > span:nth-of-type(2)')?.textContent
          svgImg = document.querySelector<HTMLImageElement>('.tbm-lines-name-wrapper img')
          if (svgImg) {
            presenceData.smallImageKey = await svgToPng(svgImg?.src)
            presenceData.smallImageText = svgImg?.alt
          }
        }
      }
      else if (/\/plane?s\/(?:plan-dynamique|dynamic-plan|plan-dinamico)(?:\/|$)/.test(completePath)) {
        presenceData.details = strings.viewDynamicPlan
        if (/\/lines(?:\/|$)/.test(completePath)) {
          const activeLine = document.querySelector('.plan-dynamic .lc-line-header .lc-direction')?.getAttribute('aria-label')
          const lineCode = document.querySelector('.plan-dynamic .lc-active-line .lc-line img')?.getAttribute('alt')
          const lineDirection = document.querySelector('.plan-dynamic .lc-line-header .lc-direction > strong')
          const selectedStop = document.querySelector('.plan-dynamic .lc-stop-opened > span')
          presenceData.state = selectedStop ? `${strings.stop} ${selectedStop?.textContent} - ${strings.direction} ${lineDirection?.textContent}` : (activeLine ? `${strings.direction} ${lineDirection?.textContent}` : document.querySelector('.plan-dynamic .lc-board-title')?.textContent)
          if (lineCode && activeLine) {
            const lineData = await getSpecificLineInfos(lineCode)
            presenceData.smallImageKey = await svgToPng(lineData!.iconUrl!)
            presenceData.smallImageText = lineData?.name
          }
        }
        else if (/\/(?:p\+r|vcub|pointsdevente|velo)(?:\/|$)/.test(completePath)) {
          presenceData.state = document.querySelector('.plan-dynamic .lc-selected > span')?.textContent || document.querySelector('.plan-dynamic .lc-board-title')?.textContent
        }
        else {
          presenceData.state = document.querySelector('.plan-dynamic .lc-infobox')?.textContent || ''
        }
      }
      else if (/\/(?:lignes|lines|lineas)(?:\/|$)/.test(completePath)) {
        presenceData.details = strings.viewLines
        presenceData.smallImageKey = ActivityAssets.Lines
        if (document.querySelector('.title-line')) {
          presenceData.details = strings.viewLineInfos
          presenceData.state = `${document.querySelector('.lines > h2:nth-of-type(1)')?.textContent} ↔ ${document.querySelector('.lines > h2:nth-of-type(2)')?.textContent}`
          svgImg = document.querySelector<HTMLImageElement>('.tbm-icon-picto > img')
          if (svgImg) {
            presenceData.smallImageKey = await svgToPng(svgImg?.src)
            presenceData.smallImageText = svgImg?.alt
          }
        }
      }
      else if (/\/(?:mon-compte|my-account|mi-cuenta)(?:\/|$)/.test(completePath)) {
        presenceData.details = strings.editingAccount
      }
      else {
        presenceData.details = strings.viewPage
        presenceData.state = document.title?.split(/ ([|\-–]) TBM/)[0]?.trim() || strings.unknowPage
      }
      break
    }
    case 'tbmfid.infotbm.com': {
      presenceData.name = 'TBM Fid\''
      presenceData.largeImageKey = ActivityAssets.TBMFid

      if (!path[1]) {
        presenceData.details = strings.viewHome
      }
      else if (path[1] === 'shop') {
        presenceData.details = strings.viewShop
        if (path[2]) {
          presenceData.details = strings.viewOffer
          presenceData.state = document.querySelector('[data-cy="offer-details-offer-title"]')?.textContent
        }
      }
      else if (path[1] === 'dashboard') {
        presenceData.details = strings.viewDashboard
        if (path[2] === 'profile') {
          presenceData.details = strings.viewTheirProfile
          switch (path[3]) {
            case 'update': {
              presenceData.details = strings.editTheirPersonnalInfo
              break
            }
            case 'history': {
              presenceData.details = strings.viewTheirPointsHistory
              break
            }
            case 'orders': {
              presenceData.details = strings.viewTheirOrders
              break
            }
            case 'documentation': {
              presenceData.details = strings.viewDocumentation
              if (path[4] === 'deleteAccount') {
                presenceData.details = strings.deleteAccount
              }
              break
            }
            case 'help': {
              presenceData.details = strings.viewHelpPage
              break
            }
          }
        }
      }
      else if (path[1] === 'scalePoints') {
        presenceData.details = strings.viewPointsScale
      }
      else {
        presenceData.details = strings.viewPage
        presenceData.state = document.title?.split(/ ([|\-–]) TBM/)[0]?.trim() || strings.unknowPage
      }
      break
    }
    case 'boutique.infotbm.com': {
      if (completePath === '/') {
        presenceData.details = strings.viewTBMShop
      }
      else if (/\/products\/\d(?:\/|$)/.test(completePath)) {
        presenceData.details = strings.viewProduct
        presenceData.state = document.querySelector('main h1')?.textContent || document.title?.split(' - ')[0]?.trim()
      }
      else if (/\/categories\/\d(?:\/|$)/.test(completePath)) {
        presenceData.details = strings.viewCategory
        presenceData.state = document.querySelector('main h2 span:nth-child(2)')?.textContent || document.title?.split(' - ')[0]?.trim()
      }
      else if (/\/search(?:\/|$)/.test(completePath)) {
        presenceData.details = strings.searchProduct
      }
      else if (/\/account(?:\/|$)/.test(completePath)) {
        presenceData.details = strings.editingAccount
      }
      else {
        presenceData.details = strings.viewPage
        presenceData.state = document.title?.split(/ ([|\-–]) /)[0]?.trim() || strings.unknowPage
      }
      break
    }
    default:
      presenceData.details = strings.viewPage
      presenceData.state = document.title?.split(/ ([|\-–]) (TBM)?/)[0]?.trim() || strings.unknowPage
      break
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
