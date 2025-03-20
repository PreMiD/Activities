const presence = new Presence({
  clientId: '1017866651053596795',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

/**
 * Applies state and detail changes to presenceData based on the type of action being carried out.
 *
 * @param presenceData
 * @param path The subpath for the item
 * @param type The item's type name
 */
function applySubPathState(
  presenceData: PresenceData,
  path = '',
  type: string,
) {
  const n = /^[aiueo]/i.test(type) ? 'n' : ''
  switch (path) {
    case '': {
      presenceData.details = `Viewing a${n} ${type}`
      presenceData.state = document.querySelector('h1')?.textContent
      presenceData.buttons = [
        {
          label: `View ${type}`,
          url: window.location.href,
        },
      ]
      break
    }
    case 'create': {
      presenceData.details = `Creating a${n} ${type}`
      presenceData.state = document.querySelector<HTMLInputElement>('.card-body input')?.value
      break
    }
    case 'edit': {
      presenceData.details = `Editing a${n} ${type}`
      presenceData.state = document.querySelector<HTMLInputElement>('.card-body input')?.value
      break
    }
    case 'revisions': {
      presenceData.details = `Viewing revisions for a${n} ${type}`
      presenceData.state = document.querySelector<HTMLAnchorElement>('h3 a')?.lastChild?.textContent
      break
    }
    case 'delete': {
      presenceData.details = `Deleting a${n} ${type}`
      presenceData.state = document.querySelector<HTMLHeadingElement>(
        '.card-body h4',
      )?.childNodes[7]?.textContent
      break
    }
  }
}

presence.on('UpdateData', () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/B/BookBrainz/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const { pathname } = window.location
  const pathSplit = pathname.split('/').slice(1)

  switch (pathSplit[0]) {
    case '': {
      presenceData.details = 'Browsing homepage'
      break
    }
    case 'author':
    case 'collection':
    case 'edition':
    case 'edition-group':
    case 'publisher':
    case 'series':
    case 'work': {
      if (pathSplit[1] === 'create')
        applySubPathState(presenceData, pathSplit[1], pathSplit[0])
      else applySubPathState(presenceData, pathSplit[2], pathSplit[0])
      break
    }
    case 'editor': {
      if (pathSplit[1] === 'edit') {
        presenceData.details = 'Editing their profile'
      }
      else {
        const username = document.querySelector('h1')?.textContent
        switch (pathSplit[2] ?? '') {
          case '': {
            presenceData.details = 'Viewing profile'
            presenceData.state = username
            break
          }
          case 'revisions': {
            presenceData.details = `Viewing ${username}'s revisions`
            break
          }
          case 'achievements': {
            presenceData.details = `Viewing ${username}'s achievements`
            break
          }
          case 'collections': {
            presenceData.details = `Viewing ${username}'s collections`
            break
          }
        }
      }
      break
    }
    case 'help': {
      presenceData.details = 'Reading help page'
      break
    }
    case 'revisions': {
      presenceData.details = 'Browsing revisions'
      break
    }
    case 'revision': {
      presenceData.details = 'Viewing a revision'
      presenceData.state = `#${
        document.querySelector<HTMLHeadingElement>('h1')?.lastChild?.textContent
      }`
      break
    }
    default: {
      presenceData.details = 'Browsing'
      presenceData.state = document.querySelector('h1')?.textContent
        ?? document.title.match(/^(.*?)(?: \u2013 BookBrainz)?$/)?.[1]
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
