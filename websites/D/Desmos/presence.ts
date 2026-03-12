const presence = new Presence({ clientId: '886254740399349852' })

let url: string,
  graphing: number,
  pageType: string,
  title: string | null | undefined,
  numEquations: number
const startTime: number = Date.now()

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/D/Desmos/assets/logo.jpg',
    startTimestamp: startTime,
  }
  // Getting Data
  url = document.URL
  if (url[url.length - 1] === '/')
    url = url.substring(0, url.length - 1)

  const splitUrl = url.split('/')
  const urlPage = splitUrl[splitUrl.length - 1]!
  if (urlPage === 'www.desmos.com')
    pageType = 'Home Page'
  else pageType = urlPage[0]!.toUpperCase() + urlPage.substring(1) // Capitalize page title

  if (url.includes('/calculator')) {
    // Graphing Calculator
    graphing = 2 // "Plotting a Graph: "
    title = document.querySelectorAll('.dcg-variable-title')[0]?.textContent
    numEquations = document.querySelectorAll('.dcg-template-expressioneach')[0]
      ?.childElementCount ?? 0
  }
  else if (url.includes('/geometry')) {
    // Geometry Tool
    graphing = 1 // "Using Desmos Geometry: "
    title = document.querySelectorAll('.dcg-variable-title')[0]?.textContent
    pageType = 'Geometry'
    numEquations = 0
  }
  else if (
    ['scientific', 'fourfunction', 'matrix', 'practice'].includes(urlPage)
  ) {
    graphing = 1 // "Using Desmos Scientific/Fourfunction etc. "
    if (pageType === 'Scientific' || pageType === 'Fourfunction') {
      // These three use a different container for equations
      numEquations = document.querySelectorAll('.dcg-basic-list')[0]?.childElementCount ?? 0
    }
    else if (pageType === 'Matrix') {
      numEquations = document.querySelectorAll('.dcg-matrix-list')[0]?.childElementCount ?? 0
    }
    else {
      numEquations = 0
    }
  }
  else {
    graphing = 0
  }
  // Setting Presence
  if (graphing === 2) {
    presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/D/Desmos/assets/logo.jpg'
    presenceData.smallImageText = 'Desmos Graphing Calculator'
    presenceData.details = 'Plotting a Graph: '.concat(title ?? '')
    presenceData.state = numEquations.toString().concat(' Equation')
    if (numEquations !== 1)
      presenceData.state += 's'
  }
  else {
    delete presenceData.smallImageKey
    delete presenceData.smallImageText
    if (graphing === 1) {
      presenceData.details = 'Using Desmos '.concat(pageType)
      if (numEquations > 0) {
        // Using one of the calculator apps
        presenceData.details += ' Calculator'
        presenceData.state = numEquations.toString().concat(' Expression')
        if (numEquations !== 1)
          presenceData.state += 's' // Plural
      }
      else {
        delete presenceData.state
      }

      if (title !== '')
      // If using Geometry, add title
        presenceData.details += ': '.concat(title ?? '')
    }
    else {
      presenceData.details = 'Reading '.concat(pageType)
    }
  }
  presence.setActivity(presenceData)
})
