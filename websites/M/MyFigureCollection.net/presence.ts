import page from './pages/index.js'
import { ActivityAssets, browsingTimestamp, getStrings, presence } from './util.js'

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    name: 'MyFigureCollection',
  }
  const { pathname, search } = document.location
  const params = new URLSearchParams(search)
  const pathList = pathname.split('/').filter(Boolean)
  const title = document.querySelector('h1')

  const searchSection = params.get('_tb')
  const searchTab = params.get('tab')
  const searchMode = params.get('mode')

  const props: Record<string, string | null> = {}
  params.forEach((val, key) => {
    props[key] = val
  })
  if (searchSection) { // Search or specific queries
    if (page[searchSection]) {
      const instance = new page[searchSection]()
      instance.execute({
        ...props,
        presenceData,
        tab: searchTab,
        mode: searchMode ?? 'browse',
      })
    }
    else {
      const strings = await getStrings()
      presenceData.details = strings.browsing
      presence.setActivity(presenceData)
    }
  }
  else if (pathList.length === 1) {
    const strings = await getStrings()
    presenceData.details = strings.viewPage
    presenceData.state = title
    presence.setActivity(presenceData)
  }
  else if (pathList.length === 0) {
    const strings = await getStrings()
    presenceData.details = strings.viewHome
    presence.setActivity(presenceData)
  }
  else {
    // try to parse path
    const mainSection = pathList[0]
    if (mainSection && page[mainSection]) {
      const pageInstance = new page[mainSection]()
      if (pathList[1] === 'browse') {
        pageInstance.execute({
          presenceData,
          mode: 'browse',
        })
      }
      else if (pathList[1]) {
        pageInstance.execute({
          presenceData,
          mode: 'view',
          id: pathList[1],
          tab: pathList[2],
        })
      }
    }
  }
})
