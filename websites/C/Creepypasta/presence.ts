const presence = new Presence({
  clientId: '929823434572202005',
})
const browsingStamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const [time, buttons] = await Promise.all([
    presence.getSetting<boolean>('time'),
    presence.getSetting<boolean>('buttons'),
  ])
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/C/Creepypasta/assets/logo.png',
    startTimestamp: browsingStamp,
  }
  const orderBy = document.getElementsByName('_orderby')[0] as HTMLSelectElement

  switch (document.location.pathname) {
    case '/':
      presenceData.details = 'Viewing Home Page'
      break
    case '/archive/top-ranked/':
      presenceData.details = 'Browsing Top-Ranked'
      if (orderBy.selectedIndex !== 0) {
        presenceData.state = `Sorted By ${
          orderBy.options[orderBy.selectedIndex]?.text
        }`
      }
      break
    case '/archive/famous-creepypastas/':
      presenceData.details = 'Browsing Famous'
      if (orderBy.selectedIndex !== 0) {
        presenceData.state = `Sorted By ${
          orderBy.options[orderBy.selectedIndex]?.text
        }`
      }
      break
    case '/archive/':
      presenceData.details = 'Browsing Recently Published'
      if (orderBy.selectedIndex !== 0) {
        presenceData.state = `Sorted By ${
          orderBy.options[orderBy.selectedIndex]?.text
        }`
      }
      break
    case '/archive/sorted/':
      presenceData.details = 'Browsing Sorted Stories'
      if (orderBy.selectedIndex !== 0) {
        presenceData.state = `Sorted By ${
          orderBy.options[orderBy.selectedIndex]?.text
        }`
      }
      break
    case '/archive/sorted-by-category/':
      presenceData.details = `Browsing ${
        (
          document.getElementsByName('tx_category')[0] as HTMLSelectElement
        ).options[
          (document.getElementsByName('tx_category')[0] as HTMLSelectElement)
            .selectedIndex
        ]?.text.split('(')[0]
      }`
      if (orderBy.selectedIndex !== 0) {
        presenceData.state = `Sorted By ${
          orderBy.options[orderBy.selectedIndex]?.text
        }`
      }
      break
    case '/archive/sorted-by-length/':
      if (
        (document.getElementsByName('tx_story_length')[0] as HTMLSelectElement)
          .selectedIndex !== 0
      ) {
        presenceData.details = `Browsing ${
          (
            document.getElementsByName(
              'tx_story_length',
            )[0] as HTMLSelectElement
          ).options[
            (
              document.getElementsByName(
                'tx_story_length',
              )[0] as HTMLSelectElement
            ).selectedIndex
          ]?.text.split(/\(|\)/)[1]
        }`
      }
      else {
        presenceData.details = 'Browsing By Length'
      }
      if (orderBy.selectedIndex !== 0) {
        presenceData.state = `Sorted By ${
          orderBy.options[orderBy.selectedIndex]?.text
        }`
      }
      break
    case '/archive/sorted-by-author/':
      presenceData.details = `Browsing ${
        (
          document.getElementsByName('tx_authors')[0] as HTMLSelectElement
        ).options[
          (document.getElementsByName('tx_authors')[0] as HTMLSelectElement)
            .selectedIndex
        ]?.text.split('(')[0]
      }`
      if (orderBy.selectedIndex !== 0) {
        presenceData.state = `Sorted By ${
          orderBy.options[orderBy.selectedIndex]?.text
        }`
      }
      break
    case '/archive/sorted-by-title/':
      presenceData.details = 'Browsing By Title'
      if (orderBy.selectedIndex !== 0) {
        presenceData.state = `Sorted By ${
          orderBy.options[orderBy.selectedIndex]?.text
        }`
      }
      break
    case '/submit-your-pasta/':
      presenceData.details = 'Submitting Story'
      break
    case '/submit-your-pasta/guidelines/':
      presenceData.details = 'Reading Submission Guidelines'
      break
    default:
      presenceData.details = `Reading ${
        document.querySelector('h1.entry-title')?.textContent
      }`
      presenceData.state = document.querySelector(
        'div.gdrts-rating-text',
      )?.textContent
      presenceData.buttons = [
        {
          label: 'View Page',
          url: document.location.href,
        },
      ]
  }
  if (
    document.querySelector('[class$=\'ast-dropdown-active\']')
    || document.location.href.includes('?s=')
  ) {
    presenceData.details = 'Searching'
    presenceData.state = document.querySelector<HTMLInputElement>('.search-field')?.value
  }

  if (!time)
    delete presenceData.startTimestamp
  if (!buttons && presenceData.buttons)
    delete presenceData.buttons

  presence.setActivity(presenceData)
})
