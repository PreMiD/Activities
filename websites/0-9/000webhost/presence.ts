import { Assets } from 'premid'

const presence = new Presence({
  clientId: '503557087041683458',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  let presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/0-9/000webhost/assets/logo.png',
    startTimestamp: browsingTimestamp,
    name: '000webhost',
  }
  const { href, pathname } = document.location
  const [privacy, buttons] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('buttons'),
  ])
  const titleSite = document.querySelector('.current-website')

  switch (true) {
    case pathname === '/': {
      presenceData.details = 'Viewing the Homepage'
      break
    }
    case pathname.includes('/forum'): {
      switch (true) {
        case pathname.includes('/t/'): {
          presenceData.details = 'Reading forum post:'
          presenceData.state = document
            .querySelector('head > title')
            ?.textContent
            ?.replace(
              `- ${
                document.querySelector('.fancy-title')?.textContent
              } - 000webhost forum`,
              '',
            )
          presenceData.smallImageKey = Assets.Reading
          presenceData.buttons = [
            {
              label: 'View Forum Post',
              url: href,
            },
          ]
          break
        }
        case pathname.includes('/c/'): {
          presenceData.details = 'Browsing through forum category:'
          presenceData.state = document.querySelector('.category-name')?.textContent
          presenceData.buttons = [
            {
              label: 'View Forum Category',
              url: href,
            },
          ]
          break
        }
        case pathname.includes('/u/'): {
          presenceData.details = `Viewing ${
            document.querySelector('.username')?.textContent
          }'s profile`
          presenceData.buttons = [
            {
              label: 'View Profile',
              url: href,
            },
          ]
          break
        }
        default: {
          presenceData.details = 'Browsing through the forum'
          break
        }
      }
      break
    }
    default: {
      const pages: Record<string, PresenceData> = {
        '/cheap-web-hosting': { details: 'Viewing webhosting' },
        'members/website/list': { details: 'Viewing All Websites' },
        '/members/store': { details: 'Viewing the store' },
        '/build': { details: 'Managing website:' },
        '/domain': { details: 'Managing domains for:' },
        '/files': { details: 'Managing files for:' },
        '/database': { details: 'Managing databases for:' },
        '/email': { details: 'Managing emails for:' },
        '/settings': { details: 'Managing settings for:' },
        '/stats': { details: 'Viewing stats for:' },
        '/security': { details: 'Managing security settings for:' },
        '/cron-jobs': { details: 'Managing cron-jobs for:' },
        '/redirect': { details: 'Managing redirects for:' },
        '/logs': { details: 'Viewing logs for:' },
        '/backup': { details: 'Managing backups for:' },
        '/store': { details: 'Viewing the power store' },
      }

      for (const [path, data] of Object.entries(pages)) {
        if (pathname.includes(path))
          presenceData = { ...presenceData, ...data } as PresenceData
      }

      if (!presenceData.details) {
        presenceData.details = `Managing ${
          document
            .querySelector('.dashboard-sidemenu')
            ?.shadowRoot
            ?.querySelector('[class*="item--active"]')
            ?.textContent
        } settings for:`
      }
    }
  }

  if (titleSite && !privacy && !presenceData.state)
    presenceData.state = titleSite.textContent

  if (presenceData.state && privacy)
    delete presenceData.state

  if ((!buttons || privacy) && presenceData.buttons)
    delete presenceData.buttons
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
