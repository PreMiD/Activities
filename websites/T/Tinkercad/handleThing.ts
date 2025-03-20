export function handleThing(
  presenceData: PresenceData,
  link: string,
  isEdit: boolean,
): void {
  if (!link) {
    presenceData.state = 'Browing the Community Gallery'
  }
  else {
    const username = document.querySelector('#design-detail-username')?.textContent || null
    const in3d = document.querySelector('.editor-3d-container') || null // 3D
    const inCircuit = document.querySelector('.editor') || null // circuit
    const nameFull = document.title
    const editType = nameFull.split('design')[0]?.trim() || null
    const thingNameEl = document.querySelector('.sitemenu__title__span')
      || document.querySelector('#topnav-title')
      || null

    // this is a preview of a post
    if (!isEdit) {
      const thingType = document
        .querySelector('.user-lockup-type')
        ?.textContent
        ?.replace('by', '')
        .trim()

      if (document.querySelector('.design-detail-top-public')) {
        presenceData.details = `Viewing ${nameFull}`
        presenceData.state = `By ${username}`
        if (in3d) {
          presenceData.details += ' (3D interactive)'
        }
        else if (inCircuit) {
          const activeClasses = document
            .querySelector('.sitemenu__right')
            ?.querySelector('[class*=\'active\']')
            ?.getAttribute('href')
          let sectActive: string

          if (activeClasses === '#breadboard')
            sectActive = 'Circuit View'
          else if (activeClasses === '#schematic_view')
            sectActive = 'Schematic View'
          else sectActive = 'Component List'
          presenceData.details += ` (in ${sectActive})`
        }

        presenceData.buttons = [
          { label: `View ${thingType}`, url: document.location.href },
        ]
      }
      else if (document.querySelector('.design-detail-top-private')) {
        presenceData.details = `Viewing Private ${thingType}`
        delete presenceData.smallImageKey
        delete presenceData.buttons
      }
    }
    else {
      // the user is editing
      presenceData.details = `Editing a ${editType} design`
      presenceData.state = thingNameEl?.textContent || ''
      presenceData.startTimestamp = Math.floor(Date.now() / 1000)
    }
  }
}

export function handleCodeblocks(
  presenceData: PresenceData,
  isEdit: boolean,
): void {
  const title = document.querySelector('.design-detail-header-title')?.textContent ?? ''
  const username = document.querySelector('#design-detail-username')?.textContent ?? ''

  if (isEdit) {
    // get name
    const blockname = document
      .querySelector('.header-group')
      ?.querySelector('.inline-text-input')
      ?.textContent

    presenceData.details = `Editing ${blockname} (codeblock)`
    delete presenceData.buttons
  }
  else if (document.querySelector('.design-detail-top-public')) {
    presenceData.details = `Viewing ${title} (codeblock)`
    presenceData.state = `By ${username}`

    presenceData.buttons = [
      { label: 'View codeblock', url: document.location.href },
    ]
  }
  else {
    delete presenceData.buttons
    delete presenceData.details
    presenceData.details = 'Editing Code Block'
  }
}
