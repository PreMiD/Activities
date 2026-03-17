import { Assets } from 'premid'

const presence = new Presence({
  clientId: '632002763483512843',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

async function getStrings() {
  return presence.getStrings(
    {
      browse: 'general.browsing',
      search: 'general.searchFor',
      viewCategory: 'general.viewCategory',
      buttonViewPage: 'general.buttonViewPage',
      viewHome: 'general.viewHome',
    },

  )
}

function capitalizeFirstLetter(string: string) {
  if (string) {
    return (
      string.trim().charAt(0).toUpperCase()
      + string.trim().slice(1).toLowerCase()
    )
  }
}

enum ActivityAssets {
  Loading = 'https://cdn.rcd.gg/PreMiD/websites/M/MEE6/assets/0.gif',
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/M/MEE6/assets/1.png',
}
let strings: Awaited<ReturnType<typeof getStrings>>
let oldLang: string | null = null
presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const { pathname, hostname, href } = document.location
  const [newLang, privacy, buttons, covers] = await Promise.all([
    presence.getSetting<string>('lang').catch(() => 'en'),
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('covers'),
  ])
  const pathnameSplit = pathname.split('/')

  if (oldLang !== newLang || !strings) {
    oldLang = newLang
    strings = await getStrings()
  }
  if (privacy) {
    presenceData.details = strings.browse
    presence.setActivity(presenceData)
    return
  }
  switch (hostname.replace('www.', '')) {
    case 'mee6.xyz': {
      if (document.querySelector('[class="sc-hKMtZM bHyJDw"]')) {
        presenceData.details = `Rank card | ${
          document.querySelector('[class="sc-jgbSNz bsZrWF"]')?.textContent
        }`
        presenceData.largeImageKey = document.querySelector('svg > image')?.getAttribute('xlink:href')
          ?? ActivityAssets.Logo
      }
      else {
        switch (pathnameSplit[2]) {
          case '': {
            presenceData.details = strings.viewHome
            break
          }
          case 'plugins': {
            presenceData.details = `Viewing plugin ${pathnameSplit[3]}`
            break
          }
          case 'monetize': {
            presenceData.details = 'Viewing monetisation options'
            break
          }
          case 'custom-bot': {
            presenceData.details = 'Viewing custom bot options'
            break
          }
          case 'pro':
          case 'premium': {
            presenceData.details = 'Viewing premium & pro options'
            break
          }
          case 'careers': {
            presenceData.details = 'Viewing open careers'
            break
          }
          case 'terms': {
            presenceData.details = 'Reading the terms'
            presenceData.smallImageKey = Assets.Reading
            break
          }
          case 'privacy': {
            presenceData.details = 'Reading the privacy statement'
            presenceData.smallImageKey = Assets.Reading
            break
          }
          case 'memberships': {
            presenceData.details = 'Managing their subscriptions'
            break
          }
          case 'dashboard': {
            switch (pathnameSplit[4]) {
              case '': {
                if (pathnameSplit[3]) {
                  presenceData.details = document.querySelector(
                    '[class*="whitespace-nowrap !text-whit"]',
                  )?.textContent
                  presenceData.largeImageKey = document
                    .querySelector('[class="sc-lmHNfd PQUIq"]')
                    ?.querySelector('img')
                    ?.getAttribute('src')
                }
                else {
                  presenceData.details = 'Viewing the dashboard'
                }
                break
              }
              default: {
                if (
                  document.querySelector(
                    '[class="uppercase text-dark-400 text-xs font-semibold"]',
                  )
                  && pathname.includes('commands')
                ) {
                  presenceData.details = 'Editing custom command'
                  presenceData.state = capitalizeFirstLetter(
                    document.querySelector('[id="item_header__name"]')
                      ?.textContent ?? '',
                  )
                }
                else if (pathname.includes('command/config/')) {
                  const command = document.querySelector(
                    '[class="sc-jdAMXn dmHLow sc-cmYsgE fhihFI"]',
                  )
                  if (!command) {
                    presenceData.details = 'Loading'
                    presenceData.smallImageKey = ActivityAssets.Loading
                  }
                  else {
                    presenceData.details = 'Editing command'
                    presenceData.state = command.textContent?.slice(4)
                  }
                }
                else {
                  presenceData.details = 'Viewing module'
                  presenceData.state = capitalizeFirstLetter(
                    document.querySelector(
                      '[class="font-bold text-dark-100 text-h5"]',
                    )?.textContent ?? pathnameSplit[4]!.trim(),
                  )
                }
              }
            }
            break
          }
          case 'tutorials': {
            if (!pathnameSplit[3]) {
              presenceData.details = 'Reading tutorials about:'
              presenceData.state = document.querySelector(
                'div[dir="ltr"]',
              )?.firstElementChild?.textContent
              presenceData.smallImageKey = Assets.Reading
            }
            else {
              presenceData.details = 'Viewing all tutorials'
            }

            break
          }
          default: {
            presenceData.details = strings.browse
          }
        }
      }
      break
    }
    case 'help.mee6.xyz': {
      const search = document.querySelector<HTMLInputElement>(
        '[class="special ui-autocomplete-input"]',
      )
      if (search?.value) {
        presenceData.details = strings.search
        presenceData.state = search.value
        presenceData.smallImageKey = Assets.Search
      }
      else if (document.querySelector('[class="article__title"]')) {
        presenceData.details = 'Reading support article about'
        presenceData.state = document.querySelector(
          '[class="article__title"]',
        )?.textContent
        presenceData.smallImageKey = Assets.Reading
      }
      else {
        presenceData.details = strings.browse
      }
      break
    }
  }

  if (!pathnameSplit[2]) {
    presenceData.buttons = [
      {
        label: strings.buttonViewPage,
        url: href,
      },
    ]
  }
  if (!covers && presenceData.largeImageKey !== ActivityAssets.Logo)
    presenceData.largeImageKey = ActivityAssets.Logo
  if (!buttons && presenceData.buttons)
    delete presenceData.buttons
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
