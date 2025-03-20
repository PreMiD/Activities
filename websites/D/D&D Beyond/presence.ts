const presence = new Presence({
  clientId: '1021922769111351379',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum Asset {
  info = 'https://cdn.rcd.gg/PreMiD/websites/D/D%26D%20Beyond/assets/0.png',
  logo = 'https://cdn.rcd.gg/PreMiD/websites/D/D%26D%20Beyond/assets/logo.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: Asset.logo,
    startTimestamp: browsingTimestamp,
  }
  const { pathname, href, search } = window.location
  const pathSplit = pathname.split('/').filter(path => path)
  const pageTitle = document
    .querySelector<HTMLHeadingElement>('.page-title')
    ?.textContent
    ?.trim()

  switch (pathSplit[0] ?? '') {
    case '': {
      presenceData.details = 'Browsing home page'
      break
    }
    case 'account': {
      presenceData.details = 'Managing preferences'
      presenceData.state = pageTitle
      break
    }
    case 'backgrounds': {
      if (pathSplit[1]) {
        presenceData.details = 'Viewing a background'
        presenceData.state = pageTitle
        presenceData.largeImageKey = document.querySelector<HTMLImageElement>('.image')?.src
        presenceData.buttons = [
          {
            label: 'View Background',
            url: href,
          },
        ]
      }
      else {
        presenceData.details = 'Browsing list of backgrounds'
      }
      break
    }
    case 'changelog': {
      if (pathSplit[1]) {
        presenceData.details = 'Reading a changelog'
        presenceData.state = pageTitle
      }
      else {
        presenceData.details = 'Browsing the changelog'
      }
      break
    }
    case 'characters': {
      if (pathSplit[1] === 'builder') {
        presenceData.details = 'Creating a new character'
      }
      else if (pathSplit[2] === 'builder') {
        const characterName = document.querySelector<HTMLDivElement>(
          '.character-builder-page-header-name',
        )?.textContent
        presenceData.details = 'Modifying a character'
        presenceData.largeImageKey = getComputedStyle(
          document.querySelector<HTMLDivElement>(
            '.ddbc-character-avatar__portrait',
          )!,
        ).backgroundImage?.match(/url\("(.*?)"\)/)?.[1]
        switch (pathSplit[3]) {
          case 'home': {
            presenceData.state = `Basic preferences | ${characterName}`
            break
          }
          case 'race': {
            if (pathSplit[4] === 'manage') {
              presenceData.state = `Racial traits | ${characterName}`
              presenceData.smallImageKey = document.querySelector<HTMLImageElement>(
                '.race-detail-preview-img',
              )?.src
              presenceData.smallImageText = document.querySelector(
                '.builder-page-header',
              )?.textContent
            }
            else {
              presenceData.state = `Choosing race | ${characterName}`
            }

            break
          }
          case 'class': {
            if (pathSplit[4] === 'manage')
              presenceData.state = `Class features | ${characterName}`
            else presenceData.state = `Choosing a class | ${characterName}`

            break
          }
          case 'ability-scores': {
            presenceData.state = `Ability scores | ${characterName}`
            break
          }
          case 'description': {
            presenceData.state = `Background | ${characterName}`
            presenceData.smallImageKey = Asset.info
            presenceData.smallImageText = document.querySelector<HTMLSelectElement>(
              '.description-manage-background-chooser',
            )?.selectedOptions[0]?.textContent
            break
          }
          case 'equipment': {
            presenceData.state = `Equipment | ${characterName}`
            break
          }
          default: {
            presenceData.state = characterName
            break
          }
        }
      }
      else if (pathSplit[1]) {
        presenceData.details = 'Viewing a character sheet'
        presenceData.state = document.querySelector<HTMLHeadingElement>(
          '.ddbc-character-tidbits__heading > h1',
        )?.textContent
        presenceData.largeImageKey = getComputedStyle(
          document.querySelector<HTMLDivElement>(
            '.ddbc-character-avatar__portrait',
          )!,
        ).backgroundImage?.match(/url\("(.*?)"\)/)?.[1]
        presenceData.smallImageKey = Asset.info
        presenceData.smallImageText = `${
          document.querySelector<HTMLSpanElement>(
            '.ddbc-character-summary__race',
          )?.textContent
        } (${
          document.querySelector<HTMLSpanElement>(
            '.ddbc-character-summary__classes',
          )?.textContent
        })`
        presenceData.buttons = [
          {
            label: 'View character sheet',
            url: href,
          },
        ]
      }
      else {
        presenceData.details = 'Browsing their characters'
      }
      break
    }
    case 'classes': {
      if (pathSplit[1]) {
        presenceData.details = 'Viewing a class'
        presenceData.state = pageTitle
        presenceData.largeImageKey = document.querySelector<HTMLImageElement>('.image')?.src
        presenceData.buttons = [
          {
            label: 'View class',
            url: href,
          },
        ]
      }
      else {
        presenceData.details = 'Browsing list of classes'
      }
      break
    }
    case 'encounter-builder': {
      presenceData.details = 'Creating an encounter'
      presenceData.state = document.querySelector<HTMLInputElement>('[name=encounterName]')?.value || 'Untitled Encounter'
      break
    }
    case 'encounters': {
      if (pathSplit[2] === 'edit') {
        presenceData.details = 'Editing an encounter'
        presenceData.state = document.querySelector<HTMLInputElement>('[name=encounterName]')?.value || 'Untitled Encounter'
      }
      else {
        presenceData.details = 'Viewing an encounter'
        presenceData.state = document.querySelector<HTMLHeadingElement>(
          '.ddb-page-header__title',
        )?.textContent
      }
      break
    }
    case 'equipment': {
      if (pathSplit[1]) {
        presenceData.details = 'Viewing an equipment'
        presenceData.state = pageTitle
        presenceData.largeImageKey = document.querySelector<HTMLImageElement>('.image')?.src
        presenceData.buttons = [
          {
            label: 'View equipment',
            url: href,
          },
        ]
      }
      else {
        presenceData.details = 'Browsing list of equipment'
      }
      break
    }
    case 'feats': {
      if (pathSplit[1]) {
        presenceData.details = 'Viewing a feat'
        presenceData.state = pageTitle
        presenceData.largeImageKey = document.querySelector<HTMLImageElement>('.image')?.src
        presenceData.buttons = [
          {
            label: 'View feat',
            url: href,
          },
        ]
      }
      else {
        presenceData.details = 'Browsing list of feats'
      }
      break
    }
    case 'forums': {
      if (pathSplit[1] === 'search') {
        presenceData.details = 'Searching forums'
        presenceData.state = new URLSearchParams(search).get('search')
      }
      else if (pathSplit[1]) {
        if (/^\d+-/.test(pathSplit[pathSplit.length - 1]!)) {
          presenceData.details = 'Reading a forum post'
          presenceData.state = pageTitle
          presenceData.buttons = [
            {
              label: 'Read post',
              url: href,
            },
          ]
        }
        else if (pathSplit[pathSplit.length - 1] === 'create-thread') {
          presenceData.details = 'Creating a forum post'
          presenceData.state = document.querySelector<HTMLInputElement>('#field-title')?.value
        }
        else {
          presenceData.details = 'Browsing forums'
          presenceData.state = pageTitle
        }
      }
      else {
        presenceData.details = 'Browsing forums'
        presenceData.state = 'Main page'
      }
      break
    }
    case 'homebrew': {
      switch (pathSplit[1] ?? '') {
        case '': {
          presenceData.details = 'Browsing Homebrew categories'
          break
        }
        case 'creations': {
          switch (pathSplit[2]) {
            case 'create-background': {
              presenceData.details = 'Creating a background'
              break
            }
            case 'create-feat': {
              presenceData.details = 'Creating a feat'
              break
            }
            case 'create-magic-item': {
              presenceData.details = 'Creating a magic item'
              break
            }
            case 'create-monster': {
              presenceData.details = 'Creating a monster'
              break
            }
            case 'create-race': {
              presenceData.details = 'Creating a race'
              break
            }
            case 'create-spell': {
              presenceData.details = 'Creating a spell'
              break
            }
            case 'create-subclass': {
              presenceData.details = 'Creating a subclass'
              break
            }
          }
          presenceData.state = document.querySelector<HTMLInputElement>(
            '.ddb-homebrew-create-form-fields-item-input > input',
          )?.value
          break
        }
        default: {
          presenceData.details = 'Browsing Hombrew category'
          presenceData.state = pageTitle
        }
      }
      break
    }
    case 'magic-items': {
      if (pathSplit[1]) {
        presenceData.details = 'Viewing a magic item'
        presenceData.state = pageTitle
        presenceData.smallImageKey = document.querySelector<HTMLImageElement>('.magic-item-image')?.src
        presenceData.smallImageText = document.querySelector<HTMLDivElement>('.item-info')?.textContent?.trim()
        presenceData.buttons = [
          {
            label: 'View magic item',
            url: href,
          },
        ]
      }
      else {
        presenceData.details = 'Browsing list of magic items'
      }
      break
    }
    case 'marketplace': {
      if (pathSplit[1] === 'redeem-key') {
        presenceData.details = 'Redeeming a product key'
      }
      else if (
        pathSplit[1] === 'cart'
        || pathSplit[1] === 'address'
        || pathSplit[1] === 'checkout'
      ) {
        presenceData.details = 'Purchasing materials'
      }
      else if (!pathSplit[1]) {
        presenceData.details = 'Browsing marketplace'
      }
      else {
        presenceData.details = 'Browsing marketplace'
        presenceData.state = pageTitle
        presenceData.largeImageKey = document.querySelector<HTMLImageElement>(
          '.product-hero-avatar__image',
        )?.src
      }
      break
    }
    case 'members': {
      if (pathSplit[1]) {
        const username = document
          .querySelector<HTMLLIElement>('.username')
          ?.textContent
          ?.trim()
        presenceData.details = 'Viewing a member\'s profile'
        presenceData.largeImageKey = document.querySelector<HTMLImageElement>('.user-avatar img')?.src
        if (pathSplit[2] === 'posts')
          presenceData.state = `${username}'s posts`
        else presenceData.state = username
      }
      else {
        presenceData.details = 'Viewing list of members'
      }
      break
    }
    case 'monsters': {
      if (pathSplit[1]) {
        presenceData.details = 'Viewing a monster'
        presenceData.state = pageTitle
        presenceData.largeImageKey = document.querySelector<HTMLImageElement>('.monster-image')?.src
        presenceData.buttons = [
          {
            label: 'View monster',
            url: href,
          },
        ]
      }
      else {
        presenceData.details = 'Browsing list of monsters'
      }
      break
    }
    case 'my-collection': {
      presenceData.details = 'Browsing their Homebrew collection'
      break
    }
    case 'my-creations': {
      presenceData.details = 'Browsing their Homebrew creations'
      break
    }
    case 'my-encounters': {
      presenceData.details = 'Browsing their encounters'
      break
    }
    case 'posts': {
      if (pathSplit[1]) {
        presenceData.details = 'Reading a post'
        presenceData.state = pageTitle
        presenceData.buttons = [
          {
            label: 'Read post',
            url: href,
          },
        ]
      }
      else {
        presenceData.details = 'Browsing posts'
      }
      break
    }
    case 'private-messages': {
      if (pathSplit[1] === 'send')
        presenceData.details = 'Writing a direct message'
      else presenceData.details = 'Viewing direct messages'
      break
    }
    case 'races': {
      if (pathSplit[1]) {
        presenceData.details = 'Viewing a race'
        presenceData.state = pageTitle
        presenceData.largeImageKey = document.querySelector<HTMLImageElement>('.image')?.src
        presenceData.buttons = [
          {
            label: 'View race',
            url: href,
          },
        ]
      }
      else {
        presenceData.details = 'Browsing list of races'
      }
      break
    }
    case 'search': {
      presenceData.details = 'Searching'
      presenceData.state = new URLSearchParams(search).get('q')
      break
    }
    case 'sources': {
      if (pathSplit[1]) {
        if (pathSplit[2]) {
          presenceData.details = 'Viewing a section of a source'
          presenceData.state = document.querySelector<HTMLHeadingElement>(
            '.p-article-content > h1',
          )?.textContent
          presenceData.buttons = [
            {
              label: 'Read section',
              url: href,
            },
          ]
        }
        else {
          presenceData.details = 'Viewing table of contents for source'
          presenceData.state = pageTitle
          presenceData.buttons = [
            {
              label: 'View source',
              url: href,
            },
          ]
        }
      }
      else {
        presenceData.details = 'Browsing list of sources'
      }
      break
    }
    case 'spells': {
      switch (pathSplit[1] ?? '') {
        case '': {
          presenceData.details = 'Browsing list of spells'
          break
        }
        case 'class':
        case 'school': {
          presenceData.details = 'Browsing list of spells'
          presenceData.state = pageTitle
          break
        }
        default: {
          presenceData.details = 'Viewing a spell'
          presenceData.state = pageTitle
          presenceData.smallImageKey = document.querySelector<HTMLImageElement>('.spell-image')?.src
          presenceData.smallImageText = `School of ${document
            .querySelector<HTMLDivElement>(
              '.ddb-statblock-item-school > .ddb-statblock-item-value',
            )
            ?.textContent
            ?.trim()}`
          presenceData.buttons = [
            {
              label: 'View spell',
              url: href,
            },
          ]
        }
      }
      break
    }
    case 'tag': {
      presenceData.details = `Browsing posts tagged '${pageTitle}'`
      break
    }
    case 'vehicles': {
      if (pathSplit[1]) {
        presenceData.details = 'Viewing a vehicle'
        presenceData.state = pageTitle
        presenceData.largeImageKey = document.querySelector<HTMLImageElement>('.monster-image')?.src
        presenceData.buttons = [
          {
            label: 'View vehicle',
            url: href,
          },
        ]
      }
      else {
        presenceData.details = 'Browsing list of vehicles'
      }
      break
    }
    default: {
      presenceData.details = 'Browsing'
      presenceData.state = pageTitle ?? document.title.match(/^(.*?)( - D&D Beyond)?$/)?.[1]
      break
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
