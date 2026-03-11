const presence = new Presence({
  clientId: '990710812320612432',
})

presence.on('UpdateData', () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/Z/ZARP%20Gaming/assets/logo.jpg',
  }
  switch (window.location.host) {
    case 'zarpgaming.com':
      switch (window.location.pathname) {
        case '/index.php':
          presenceData.details = 'Viewing the home page'
          break
        case '/index.php/user-list':
          presenceData.details = 'Viewing the user list'
          break
        case '/index.php/zarp-vip':
          presenceData.details = 'Viewing the VIP page'
          break
        case '/index.php/zarp-vip/booster-pack':
          presenceData.details = 'Viewing the booster packs'
          break
        case '/index.php/help':
          presenceData.details = 'Viewing the help page'
          break
        case '/index.php/help/faq':
          presenceData.details = 'Viewing the FAQ'
          if (window.location.pathname.includes('faq/'))
            presenceData.state = document.title
          break
        case '/index.php/profile/profile-edit':
          presenceData.details = 'Editing profile'
          break
        case '/index.php/2013-11-13-21-35-14/':
          presenceData.details = 'Viewing a section:'
          presenceData.state = document.querySelector<HTMLElement>(
            '#Kunena > div.kblock.kpathway.breadcrumbs-1 > div > div > div > div.path-element > a',
          )?.textContent
          presenceData.buttons = [
            {
              label: 'Visit Section',
              url: window.location.href,
            },
          ]
          break
        case '/index.php/new-topic':
          presenceData.details = 'Creating a topic in section:'
          presenceData.state = document
            .querySelector<HTMLSelectElement>('#postcatid')
            ?.selectedOptions[0]
            ?.text
            .replace(/^[-\s]+/, '')
            .replace(/[-\s]+/g, ' ')
          break
      }

      switch (true) {
        case window.location.pathname.includes('/forum/profile/'):
          presenceData.details = 'Viewing a profile:'
          presenceData.state = document.title.replace('Profile for ', '')
          presenceData.buttons = [
            {
              label: 'Visit Profile',
              url: window.location.href,
            },
          ]
          break
        case window.location.pathname.includes('/topic/create'):
          presenceData.details = 'Creating a topic in section:'
          presenceData.state = document.querySelector<HTMLElement>(
            '#Kunena > div.kblock.kpathway.breadcrumbs-1 > div > div > div > div:nth-child(3) > a',
          )?.textContent
          break
        case window.location.pathname.endsWith('/reply'):
          presenceData.details = 'Replying to a topic:'
          presenceData.state = document.querySelector<HTMLInputElement>('#subject')?.value
          break
        case window.location.pathname.includes('/faq/'):
          presenceData.details = 'Viewing FAQ:'
          presenceData.state = document.title
          break
        case window.location.pathname.includes(
          '/index.php/forum/announcement/',
        ):
          if (window.location.pathname.includes('list')) {
            presenceData.details = 'Viewing the announcement list'
          }
          else if (window.location.pathname.includes('edit')) {
            presenceData.details = 'Editing an announcement:'
            presenceData.state = document.querySelector<HTMLInputElement>(
              '#kannouncement > div.kbody > div > form > div:nth-child(4) > label:nth-child(1) > input',
            )?.value
          }
          else {
            presenceData.details = 'Viewing an announcement:'
            presenceData.state = document.querySelector<HTMLElement>(
              '#Kunena > div.kblock.kannouncement > div.kheader > h2 > span',
            )?.textContent
          }
          break
      }

      if (!presenceData.details) {
        presenceData.details = 'Viewing a page:'
        presenceData.state = document.title
      }
      break
    case 'control.zarpgaming.com':
      presenceData.details = 'Server Control Panel'
      break
  }

  presence.setActivity(presenceData)
})
