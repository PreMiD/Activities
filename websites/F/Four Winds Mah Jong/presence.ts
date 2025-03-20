import knowledgeBaseHandler from './pages/knowledge.js'
import pocketPCHandler from './pages/pocketpc.js'
import ppcHandler from './pages/ppc.js'
import storeHandler from './pages/store.js'

const presence = new Presence({
  clientId: '1221562084253499452',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum PresenceAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/F/Four%20Winds%20Mah%20Jong/assets/logo.png',
}

const staticPages: Record<string, PresenceData> = {
  '/': {
    details: 'Viewing the homepage',
  },
  '/purchase.htm': {
    details: 'Viewing the purchase page',
  },
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: PresenceAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const { pathname } = document.location
  const pathList = pathname.split('/').filter(Boolean)
  const pageTitle = document.querySelector('h3')

  if (staticPages[pathname]) {
    Object.assign(presenceData, staticPages[pathname])
  }
  else if (pathname.startsWith('/intro')) {
    presenceData.details = 'Reading the introduction'
    presenceData.state = pageTitle
  }
  else if (pathname.startsWith('/features')) {
    presenceData.details = 'Viewing the features'
    presenceData.state = pageTitle
  }
  else if (pathname.startsWith('/gallery')) {
    presenceData.details = 'Viewing the gallery'
    presenceData.state = pageTitle
  }
  else if (pathname.startsWith('/downloads')) {
    presenceData.details = 'Viewing the downloads'
    presenceData.state = pageTitle
  }
  else if (pathname.startsWith('/support')) {
    presenceData.details = 'Viewing support resources'
    presenceData.state = pageTitle
  }
  else {
    switch (pathList[0]) {
      case 'ppc': {
        ppcHandler(pathList.slice(1), presenceData)
        break
      }
      case 'pocketpc': {
        pocketPCHandler(pathList.slice(1), presenceData)
        break
      }
      case 'kb': {
        knowledgeBaseHandler(presenceData)
        break
      }
      case 'store': {
        storeHandler(pathList.slice(1), presenceData)
        break
      }
      default: {
        presenceData.details = 'Viewing a page'
        presenceData.state = pageTitle
      }
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.clearActivity()
})
