const presence = new Presence({
  clientId: '503557087041683458',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/L/LiveLinkBio/assets/logo.png',
}

async function getStrings() {
  return presence.getStrings(
    {
      browse: 'general.browsing',
    },

  )
}

let strings: Awaited<ReturnType<typeof getStrings>>
let oldLang: string | null = null

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    name: 'LiveLinkBio',
  }
  const [newLang, privacy, buttons] = await Promise.all([
    presence.getSetting<string>('lang').catch(() => 'en'),
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('buttons'),
  ])
  const { href, pathname } = document.location

  if (oldLang !== newLang || !strings) {
    oldLang = newLang
    strings = await getStrings()
  }
  if (privacy) {
    presenceData.details = strings.browse
    presence.setActivity(presenceData)
    return
  }
  const type = document.querySelector(
    'body > main > section > div.row.mb-4 > div.col-12.col-lg.d-flex.align-items-center.mb-3.mb-lg-0 > h1',
  )
  const active = document.querySelector('[class="nav-link active"]')
    ?? document.querySelector('[class="active"]')
  switch (pathname.split('/')[1]) {
    case '': {
      presenceData.details = 'Homepage'
      break
    }
    case 'affiliate': {
      presenceData.buttons = [
        {
          label: 'View Affiliates',
          url: href,
        },
      ]
      presenceData.details = 'Viewing affiliates'
      break
    }
    case 'dashboard': {
      presenceData.details = 'Viewing the dashboard'
      presenceData.buttons = [
        {
          label: 'View Dashboard',
          url: href,
        },
      ]
      break
    }
    case 'link': {
      presenceData.state = document.querySelector('[aria-expanded="true"]')?.textContent ?? ''
      if (pathname.endsWith('statistics')) {
        presenceData.details = `Viewing statistics of link: ${
          document.querySelector('[id="link_url"]')?.textContent
        }`
      }
      else {
        presenceData.details = `Editing link: ${
          document.querySelector('#link_url')?.textContent
        }`
      }
      break
    }
    case 'tools': {
      if (active)
        presenceData.details = `Using ${active.textContent}`
      else presenceData.details = 'Viewing all tools'
      break
    }
    default: {
      if (document.querySelector('body')?.className.includes('open')) {
        const title = document
          .querySelectorAll('[class="modal-title"]')[1]
          ?.textContent
          ?.replace('Edit', '')
        presenceData.details = title
        presenceData.state = document.querySelector<HTMLInputElement>('#update_name')?.value
      }
      else if (type && !active) {
        const title = type.textContent?.trim()
        presenceData.buttons = [
          {
            label: 'View All',
            url: href,
          },
        ]
        presenceData.details = `Viewing all ${title}`
      }
      else if (active) {
        presenceData.details = active.textContent?.trim()
      }
    }
  }
  if (!buttons && presenceData.buttons)
    delete presenceData.buttons

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
