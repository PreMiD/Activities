import { Assets } from 'premid'

const presence = new Presence({
  clientId: '503557087041683458',
})
const browsingStamp = Math.floor(Date.now() / 1000)

async function getStrings() {
  return presence.getStrings(
    {
      browse: 'general.browsing',
      reading: 'general.reading',
      readingAbout: 'general.readingAbout',
      searchFor: 'general.searchFor',
      searchSomething: 'general.searchSomething',
      viewCategory: 'general.viewCategory',
      viewHome: 'general.viewHome',
    },
    'en',
  )
}
function capitalizeFirstLetter(string: string | undefined | null) {
  if (!string)
    return 'Undefined'
  return (
    string.trim().charAt(0).toUpperCase() + string.trim().slice(1).toLowerCase()
  )
}
function lowerCaseIt(string: string | undefined | null) {
  if (!string)
    return 'Undefined'
  return string.trim().toLowerCase()
}
function removePlural(string: string) {
  if (!string)
    return 'Undefined'
  else if (string.slice(-1) === 's')
    return string.slice(0, -1)
  else return string
}
enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/S/Scribd/assets/logo.png',
}
let strings: Awaited<ReturnType<typeof getStrings>>

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingStamp,
    name: 'Scribd',
  }
  const { href, pathname } = document.location
  const [privacy, buttons, covers] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('covers'),
  ])
  const pathnameSplit = pathname.split('/')
  const selected = document
    .querySelector('[data-e2e="tab-selected"]')
    ?.firstChild
    ?.textContent
    ?.toLowerCase()
    ?? pathnameSplit[2]
    ?? pathnameSplit[1]
  const subTitle = capitalizeFirstLetter(
    document
      .querySelector('[data-e2e="header_module_page_title"]')
      ?.textContent
      ?.replace(/ /g, '') ?? '',
  ).replace('doc', 'document')
  const type = selected?.match(
    /(everything)|(book)|(doc)|(podcast)|(sheeetmusic)|(snapshot)/g,
  )
    ? true
    : !!pathname.match(/(book)|(doc)|(podcast)|(sheetmusic)|(snapshot)/g)
  const search = document.querySelector<HTMLInputElement>('[type="search"]')
  const moduleList = document.querySelector(
    '[class*="Breadcrumbs-ds2-module_list__"]',
  )
  const title = document.querySelector('[data-e2e="header_module_page_title"]')

  if (!strings)
    strings = await getStrings()

  if (search?.value) {
    presenceData.details = privacy
      ? strings.searchSomething
      : strings.searchFor
    presenceData.state = search.value
    presenceData.smallImageKey = Assets.Search
    presence.setActivity(presenceData)
    return
  }
  switch (true) {
    // If type includes book or books, etc.
    case type: {
      switch (true) {
        // if a book is viewed
        case !!pathname.match(/\d{9}/g)?.[0]: {
          presenceData.details = privacy
            ? 'Viewing a book'
            : `Viewing ${removePlural(
              lowerCaseIt(
                moduleList?.childElementCount === 2
                  ? moduleList?.lastChild?.textContent
                  : moduleList?.childNodes[1]?.textContent
                    ?? document.querySelector('[class="_2mzx8C"] > span')
                      ?.textContent
                      ?? selected
                        ?.replace(/doc/g, 'document')
                        .match(
                          /(everything)|(book)|(document)|(podcast)|(snapshot)/g,
                        )?.[0]
                        ?? pathname
                          .replace(/doc/g, 'document')
                          .match(
                            /(everything)|(book)|(document)|(podcast)|(snapshot)/g,
                          )?.[0],
              ),
            )}:`
          presenceData.state = document.querySelector('[data-e2e="desktop-content-title"]')
            ?.textContent
            ?? document.querySelector('[data-e2e="doc_page_title"]')?.textContent
          presenceData.largeImageKey = document
            .querySelector('meta[property="og:image"]')
            ?.getAttribute('content') ?? ActivityAssets.Logo

          presenceData.buttons = [
            {
              label: 'View Title',
              url: href,
            },
          ]
          break
        }
        // else when viewing book categories,
        default: {
          if (title?.textContent) {
            presenceData.details = privacy
              ? strings.browse
              : `Browsing ${lowerCaseIt(title?.textContent)}`
          }
          switch (selected) {
            case 'overview': {
              presenceData.details = privacy
                ? strings.browse
                : `Browsing all ${lowerCaseIt(title?.textContent)}`
              break
            }
            case 'categories': {
              presenceData.state = 'Viewing all categories'
              break
            }
            case 'editors\' picks': {
              presenceData.state = 'Editor picked'
              break
            }
            default: {
              if (lowerCaseIt(subTitle).replace(lowerCaseIt(selected), '')) {
                presenceData.details = privacy
                  ? strings.viewCategory.replace(':', '')
                  : `Viewing ${selected} in category:`
              }
              else {
                presenceData.details = `Browsing ${selected}`
              }

              presenceData.state = lowerCaseIt(subTitle)
                .replace(lowerCaseIt(selected), '')
                .replace(/&/g, ' & ')
            }
          }
        }
      }
      break
    }

    case !!document.querySelector('[class="profile_name"]'): {
      presenceData.details = privacy
        ? `Viewing a ${
          document.querySelector('[class="contribution_type"]')?.textContent
        }`
        : `Viewing ${
          document.querySelector('[class="contribution_type"]')?.textContent
        }`

      presenceData.state = document.querySelector(
        '[class="profile_name"]',
      )?.textContent
      presenceData.largeImageKey = document
        .querySelector('[class*=\'profile_thumbnail\'] > img')
        ?.getAttribute('src') ?? ActivityAssets.Logo
      break
    }
    case pathname === '/': {
      presenceData.details = strings.viewHome
      break
    }

    // First check paths Split 1 e.g. /exampleOne/exampleTwo => exampleOne exists
    case !!pathnameSplit[1]: {
      switch (pathnameSplit[1]) {
        case 'home': {
          presenceData.details = strings.viewHome
          break
        }
        case 'read': {
          presenceData.details = privacy
            ? 'Reading a book'
            : document
                .querySelector('[property="og:title"]')
                ?.getAttribute('content')
          presenceData.state = capitalizeFirstLetter(
            document.querySelector('[class="page_counter"]')?.textContent,
          )
          break
        }
        case 'what-is-scribd': {
          presenceData.details = privacy
            ? strings.reading
            : strings.readingAbout
          presenceData.state = 'What is scribd?'
          break
        }
        case 'saved': {
          presenceData.details = privacy ? strings.browse : 'Browsing'
          presenceData.state = 'Their saved titles'
          break
        }
        case 'explore': {
          if (!pathnameSplit[2]) {
            presenceData.details = 'Viewing all categories'
          }
          else {
            presenceData.details = privacy
              ? strings.viewCategory.replace(':', '')
              : strings.viewCategory
            presenceData.state = `${capitalizeFirstLetter(
              document.querySelector('ol')?.lastElementChild?.textContent,
            )} => ${subTitle}`
          }
          break
        }
        case 'bestsellers': {
          presenceData.details = `Viewing ${
            privacy
              ? ''
              : document.querySelector('[data-e2e="pill-selected"]')
                ?.textContent ?? pathnameSplit[2]?.slice(0, -1)
          } bestsellers`
          presenceData.state = `In category: ${selected}`
          break
        }
        case 'search': {
          presenceData.details = privacy
            ? strings.searchSomething
            : strings.searchFor
          presenceData.state = document
            .querySelector('[data-testid="results-header"]')
            ?.textContent
            ?.split('“')[1]
            ?.slice(0, -1)
          break
        }
      }
      break
    }
  }

  if (privacy && presenceData.state)
    delete presenceData.state

  if ((!covers || privacy) && presenceData.largeImageKey !== ActivityAssets.Logo)
    presenceData.largeImageKey = ActivityAssets.Logo

  if ((!buttons || privacy) && presenceData.buttons)
    delete presenceData.buttons

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
