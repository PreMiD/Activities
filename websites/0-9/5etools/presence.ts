const presence = new Presence({
  clientId: '1026169442478084187',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/0-9/5etools/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const { pathname, href } = window.location
  const [, pagePath] = pathname.split('/')
  const pageTitle = document.querySelector<HTMLHeadingElement>('.page__title')!.textContent!

  switch (pagePath ?? '') {
    case '':
    case 'index.html': {
      presenceData.details = 'Browsing'
      presenceData.state = 'Home page'
      break
    }
    case 'actions.html':
    case 'backgrounds.html':
    case 'bestiary.html':
    case 'charcreationoptions.html':
    case 'conditionsdiseases.html':
    case 'cultsboons.html':
    case 'dieties.html':
    case 'feats.html':
    case 'items.html':
    case 'languages.html':
    case 'objects.html':
    case 'optionalfeatures.html':
    case 'psionics.html':
    case 'races.html':
    case 'recipes.html':
    case 'rewards.html':
    case 'spells.html':
    case 'tables.html':
    case 'trapshazards.html':
    case 'variantrules.html':
    case 'vehicles.html': {
      const type = pageTitle
      presenceData.details = `Browsing ${type}`
      presenceData.state = document.querySelector<HTMLHeadingElement>('.stats-name, .stats__h-name')?.textContent
      presenceData.buttons = [
        {
          label: `View ${type.substring(0, type.length - 1)}`,
          url: href,
        },
      ]
      break
    }
    case 'blocklist.html':
    case 'converter.html':
    case 'crcalculator.html':
    case 'dmscreen.html':
    case 'encountergen.html':
    case 'inittrackerplayerview.html':
    case 'makecards.html':
    case 'lootgen.html':
    case 'renderdemo.html': {
      presenceData.details = `Using ${pageTitle}`
      switch (pagePath) {
        case 'crcalculator.html': {
          presenceData.state = document.querySelector('h4')?.textContent
          break
        }
        case 'encountergen.html': {
          presenceData.state = document.querySelector<HTMLTableCaptionElement>(
            '#pagecontent caption',
          )?.textContent
          break
        }
        case 'lootgen.html': {
          presenceData.state = document.querySelector<HTMLButtonElement>(
            '#lootgen-lhs .ui-tab__btn-tab-head.active',
          )?.textContent
          break
        }
      }
      break
    }
    case 'adventure.html': {
      presenceData.details = `Browsing adventure: ${pageTitle}`
      presenceData.state = document.querySelector<HTMLSpanElement>(
        '.entry-title-inner',
      )?.textContent
      break
    }
    case 'adventures.html': {
      presenceData.details = 'Browsing list of adventures'
      break
    }
    case 'book.html': {
      presenceData.details = `Browsing book: ${pageTitle}`
      presenceData.state = document.querySelector<HTMLSpanElement>(
        '.entry-title-inner',
      )?.textContent
      break
    }
    case 'books.html': {
      presenceData.details = 'Browsing list of books'
      break
    }
    case 'classes.html': {
      presenceData.details = 'Browsing classes'
      presenceData.state = document.querySelector<HTMLTableCellElement>(
        '.cls-tbl__disp-name',
      )?.textContent
      presenceData.buttons = [
        {
          label: 'View Class',
          url: href,
        },
      ]
      break
    }
    case 'lifegen.html': {
      presenceData.details = 'Using character background generator'
      break
    }
    case 'makebrew.html': {
      if (
        document.querySelector<HTMLDivElement>('#page_main')?.style.display
        !== 'none'
      ) {
        presenceData.details = 'Editing Homebrew content'
        presenceData.state = document.querySelector<HTMLButtonElement>(
          '#content_input .active',
        )?.textContent
      }
      else {
        presenceData.details = 'Creating Homebrew content'
        presenceData.state = document.querySelector<HTMLInputElement>('#page_source input')?.value
      }
      break
    }
    case 'maps.html': {
      presenceData.details = 'Browsing maps'
      break
    }
    case 'managehomebrew.html': {
      presenceData.details = 'Managing Homebrew content'
      break
    }
    case 'names.html': {
      presenceData.details = 'Browsing list of names'
      presenceData.state = `${
        document.querySelector<HTMLTableCaptionElement>('#pagecontent caption')
          ?.textContent
      } names`
      presenceData.buttons = [
        {
          label: 'View Names',
          url: href,
        },
      ]
      break
    }
    case 'search.html': {
      presenceData.details = 'Searching for content'
      presenceData.state = document.querySelector<HTMLInputElement>('.pg-search__ipt')?.value
      break
    }
    case 'statgen.html': {
      presenceData.details = 'Using stat generator'
      presenceData.state = document.querySelector<HTMLDivElement>(
        '.ui-tab-side__disp-active-tab-name',
      )?.textContent
      break
    }
    case 'quickreference.html': {
      presenceData.details = 'Browsing quick reference'
      presenceData.state = document.querySelector<HTMLSpanElement>(
        '.entry-title-inner',
      )?.textContent
      break
    }
    default: {
      presenceData.details = 'Browsing'
      presenceData.state = pageTitle ?? document.title.match(/^(.*) - 5etools$/)?.[1]
    }
  }

  presence.setActivity(presenceData)
})
