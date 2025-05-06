import { Assets } from 'premid'

const presence = new Presence({
  clientId: '503557087041683458',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/D/Discord%20ID/assets/logo.png',
}

function getEl(el: HTMLElement | null) {
  return (
    el?.closest('p')?.querySelector('.resulth > span')?.textContent
    ?? el?.closest('p')?.querySelector('.resulth')?.textContent
    ?? 'Unknown'
  )
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    name: 'Discord ID',
  }
  const { hostname, href } = document.location
  const [privacy, covers, idAndUsername] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('covers'),
    presence.getSetting<boolean>('idAndUsername'),
  ])

  switch (true) {
    case hostname.includes('wiki.discord.id'): {
      const search = document.querySelector<HTMLInputElement>(
        '[placeholder="Search content…"]',
      )
      switch (true) {
        case privacy: {
          presenceData.details = 'Browsing the wiki'
          break
        }
        case search && !!search.value: {
          presenceData.details = 'Searching for'
          presenceData.smallImageKey = Assets.Search
          presenceData.state = search.value
          break
        }
        default: {
          presenceData.details = 'Reading'
          presenceData.state = document.querySelector(
            '[data-testid="page.title"]',
          )?.textContent
          presenceData.smallImageKey = Assets.Reading
          break
        }
      }
      break
    }
    case hostname === 'discord.id': {
      if (privacy) {
        presenceData.details = 'Browsing Lookup'
      }
      else {
        const id = getEl(document.querySelector('.fas.fa-user'))
        const username = getEl(document.querySelector('.fas.fa-hashtag'))
        const badge = document.querySelectorAll('.badgepng')
        if (
          document.querySelector<HTMLInputElement>('#inputid')?.value
          && !document.querySelector('#captchaPopup___BV_modal_header_')
        ) {
          if (badge.length > 0) {
            presenceData.smallImageKey = `${href}${badge[
              badge.length - 1
            ]?.getAttribute('src')}`
            presenceData.smallImageText = `Created on: ${getEl(
              document.querySelector('.fas.fa-asterisk'),
            )}`
          }
          presenceData.largeImageKey = document.querySelector<HTMLImageElement>('.avyimg') ?? ActivityAssets.Logo
          switch (true) {
            case idAndUsername: {
              if (!username)
                presenceData.details = 'Viewing IDs'
              else presenceData.details = 'Viewing user'
              break
            }
            case !!id && !!username: {
              presenceData.details = 'Viewing user'
              presenceData.state = `${username} (${id})`
              break
            }
            case !!id && !username: {
              presenceData.details = 'Viewing id'
              presenceData.state = id
              break
            }
          }
        }
        else {
          presenceData.details = 'Browsing'
        }
      }
      break
    }
  }

  if (!covers && presenceData.largeImageKey !== ActivityAssets.Logo)
    presenceData.largeImageKey = ActivityAssets.Logo

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
