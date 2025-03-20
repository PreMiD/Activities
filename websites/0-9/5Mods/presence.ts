const presence = new Presence({
  clientId: '651412198727352331',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/0-9/5Mods/assets/logo.jpg',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const [privacy, buttons, covers] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('covers'),
  ])
  const { href, hostname, pathname } = document.location
  const splitPath = pathname.split('/')

  if (privacy) {
    presenceData.details = 'Browsing'
    return presence.setActivity(presenceData)
  }
  switch (hostname.replace('www.', '')) {
    case 'forums.gta5-mods.com': {
      switch (splitPath[1]) {
        case '': {
          presenceData.details = 'Viewing the forum home page'
          break
        }
        case 'category': {
          presenceData.details = 'Viewing forum category'
          presenceData.state = document.querySelectorAll('[itemprop="title"]')[1]?.textContent
          presenceData.buttons = [
            {
              label: 'View Forum Category',
              url: href,
            },
          ]
          break
        }
        case 'topic': {
          presenceData.details = 'Viewing forum post about'
          presenceData.state = document
            .querySelector('[class="topic-title"]')
            ?.textContent
            ?.slice(0, 120)
          presenceData.buttons = [
            {
              label: 'View Forum Post',
              url: href,
            },
          ]
          break
        }
        case 'user': {
          presenceData.details = 'Viewing forum user'
          presenceData.state = document.querySelector('[class="fullname"]')?.textContent
          presenceData.largeImageKey = document.querySelector('[class="avatar-wrapper"]')?.firstElementChild?.getAttribute('src') ?? ActivityAssets.Logo
          presenceData.buttons = [
            {
              label: 'View Forum User',
              url: href,
            },
          ]
          break
        }
        case 'groups': {
          presenceData.details = 'Viewing forum groups'
          presenceData.buttons = [
            {
              label: 'View Forum Group',
              url: href,
            },
          ]
          break
        }
        case 'recent':
        case 'popular': {
          presenceData.details = `Viewing ${splitPath[2]} ${document
            .querySelectorAll('[itemprop="title"]')[1]
            ?.textContent
            ?.toLowerCase()} posts`
          presenceData.buttons = [
            {
              label: 'View Forum Posts',
              url: href,
            },
          ]
          break
        }
      }
      break
    }
    case 'gta5-mods.com': {
      switch (splitPath[1]) {
        case '': {
          presenceData.details = 'Viewing the home page'
          break
        }
        case 'users': {
          presenceData.details = 'Viewing user'
          presenceData.state = document.querySelector('[class="username"]')?.textContent
          presenceData.largeImageKey = document
            .querySelector('[class="img-responsive"]')
            ?.getAttribute('src') ?? ActivityAssets.Logo
          presenceData.buttons = [
            {
              label: 'View User',
              url: href,
            },
          ]
          break
        }
        case 'login': {
          presenceData.details = 'Logging in'
          break
        }
        default: {
          if (document.querySelector('li[class*="active"]')) {
            if (
              document.querySelector('[class="btn btn-primary btn-download"]')
            ) {
              presenceData.details = 'Browsing mod'
              presenceData.state = document.querySelector(
                '[class="version"]',
              )?.parentNode?.textContent
              presenceData.buttons = [
                {
                  label: 'Browse Mod',
                  url: href,
                },
              ]
            }
            else {
              presenceData.details = 'Browsing category'
              presenceData.state = document.querySelector(
                'li[class*="active"]',
              )?.textContent
              presenceData.buttons = [
                {
                  label: 'Browse Category',
                  url: href,
                },
              ]
            }
          }
          break
        }
      }
      break
    }
  }
  if (!covers)
    presenceData.largeImageKey = ActivityAssets.Logo
  if (!buttons)
    delete presenceData.buttons

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
