import { Assets } from 'premid'

const presence = new Presence({ clientId: '760624576550928455' })
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/F/FurAffinity/assets/logo.png',
}

async function getStrings() {
  return presence.getStrings(
    {
      browse: 'general.browsing',
      search: 'general.searchFor',
      viewHome: 'general.viewHome',
      buttonViewPage: 'general.buttonViewPage',
      buttonViewProfile: 'general.buttonViewProfile',
    },

  )
}
function imgPath(path: string, hostname: string) {
  if (!path)
    return ActivityAssets.Logo
  if (path.includes(hostname))
    return `https://${path.replace('//', '')}`
  else return `https://${hostname}${path}`
}

let strings: Awaited<ReturnType<typeof getStrings>>
let oldLang: string | null = null

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const search = document.querySelector<HTMLInputElement>('input[type="search"]')
  const { pathname, hash, hostname, href } = document.location
  const [newLang, privacy, buttons, covers] = await Promise.all([
    presence.getSetting<string>('lang').catch(() => 'en'),
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('covers'),
  ])
  const username = document.querySelector('username')?.textContent?.trim()
  const profilePic = imgPath(
    document
      .querySelector('userpage-nav-avatar > a > img')
      ?.getAttribute('src') ?? '',
    hostname,
  )
  const current = document
    .querySelectorAll('[class="current"]')?.[1]
    ?.textContent
    ?.toLowerCase()

  if (oldLang !== newLang || !strings) {
    oldLang = newLang
    strings = await getStrings()
  }

  if (privacy) {
    presenceData.details = strings.browse
    presence.setActivity(presenceData)
    return
  }
  if (search?.value) {
    presenceData.details = strings.search
    presenceData.state = search.value
    presenceData.smallImageKey = Assets.Search
    presence.setActivity(presenceData)
    return
  }
  switch (pathname.split('/')[1]) {
    case '': {
      presenceData.details = strings.viewHome
      break
    }
    case 'help': {
      presenceData.details = 'Browsing help articles'
      break
    }
    case 'browse': {
      presenceData.details = `Browsing page ${
        document
          .querySelector('[class="highlight"]')
          ?.textContent
          ?.split('#')[1]
      }`
      break
    }
    case 'journals': {
      const journalName = document
        .querySelector('form input[name*="subject"')
        ?.getAttribute('value')
      if (pathname.includes('journals/')) {
        presenceData.details = `Reading ${document
          .querySelector('username')
          ?.textContent
          ?.trim()}'s journal`
        presenceData.largeImageKey = profilePic
      }
      else if (!journalName) {
        presenceData.details = 'Creates a Journal'
      }
      else {
        presenceData.details = 'Updating a journal'
        presenceData.state = journalName
      }
      presenceData.buttons = [
        {
          label: 'Read Journal',
          url: href,
        },
      ]
      break
    }
    case 'msg': {
      switch (hash) {
        case '#message': {
          presenceData.details = 'Reading a note'
          presenceData.state = `"${
            document.querySelector('#message h2')?.textContent
          }"`
          break
        }
        case '#MsgForm': {
          presenceData.details = 'Writing a note'
          break
        }
      }
      break
    }
    case 'view': {
      if (
        document.querySelector('.rating-box')?.textContent?.trim() !== 'General'
      ) {
        presenceData.details = 'Viewing a post'
      }
      else {
        presenceData.details = document.querySelector(
          '[class="submission-title"]',
        )?.textContent
        presenceData.state = document.querySelector(
          '[class="submission-id-sub-container"] > a > strong',
        )?.textContent
        presenceData.buttons = [
          {
            label: 'View post',
            url: href,
          },
        ]
      }
      break
    }
    default: {
      if (document.querySelector('userpage-nav-header') && username) {
        if (current === 'home') {
          presenceData.details = `Viewing ${username}'s profile`
          presenceData.buttons = [
            {
              label: strings.buttonViewProfile,
              url: href,
            },
          ]
        }
        else {
          presenceData.details = `Viewing ${username}'s ${current}`
        }
        presenceData.largeImageKey = profilePic
      }
      else if (document.querySelector('[class="section-header"]')) {
        presenceData.details = `Reading ${
          document
            .querySelector('[class="section-header"]')
            ?.querySelector('h2')
            ?.textContent
        }`
      }
      else {
        presenceData.details = strings.browse
      }
    }
  }
  if (!presenceData.buttons && pathname !== '/') {
    presenceData.buttons = [
      {
        label: strings.buttonViewPage,
        url: href,
      },
    ]
  }
  if (!buttons && presenceData.buttons)
    delete presenceData.buttons
  if (!covers && presenceData.largeImageKey !== ActivityAssets.Logo)
    presenceData.largeImageKey = ActivityAssets.Logo
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
