const presence = new Presence({
  clientId: '939893060672827402',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)
const assets = {
  s90e: 'https://cdn.rcd.gg/PreMiD/websites/H/Hitbloq/assets/0.png',
  s360h: 'https://cdn.rcd.gg/PreMiD/websites/H/Hitbloq/assets/1.png',
  s360e: 'https://cdn.rcd.gg/PreMiD/websites/H/Hitbloq/assets/2.png',
  s90n: 'https://cdn.rcd.gg/PreMiD/websites/H/Hitbloq/assets/3.png',
  s90ex: 'https://cdn.rcd.gg/PreMiD/websites/H/Hitbloq/assets/4.png',
  s1sh: 'https://cdn.rcd.gg/PreMiD/websites/H/Hitbloq/assets/5.png',
  s1sn: 'https://cdn.rcd.gg/PreMiD/websites/H/Hitbloq/assets/6.png',
  s1se: 'https://cdn.rcd.gg/PreMiD/websites/H/Hitbloq/assets/7.png',
  snan: 'https://cdn.rcd.gg/PreMiD/websites/H/Hitbloq/assets/8.png',
  sn: 'https://cdn.rcd.gg/PreMiD/websites/H/Hitbloq/assets/9.png',
  s1sex: 'https://cdn.rcd.gg/PreMiD/websites/H/Hitbloq/assets/10.png',
  snaex: 'https://cdn.rcd.gg/PreMiD/websites/H/Hitbloq/assets/11.png',
  snae: 'https://cdn.rcd.gg/PreMiD/websites/H/Hitbloq/assets/12.png',
  s360ex: 'https://cdn.rcd.gg/PreMiD/websites/H/Hitbloq/assets/13.png',
  sllex: 'https://cdn.rcd.gg/PreMiD/websites/H/Hitbloq/assets/14.png',
  sep: 'https://cdn.rcd.gg/PreMiD/websites/H/Hitbloq/assets/15.png',
  s1sep: 'https://cdn.rcd.gg/PreMiD/websites/H/Hitbloq/assets/16.png',
  sllep: 'https://cdn.rcd.gg/PreMiD/websites/H/Hitbloq/assets/17.png',
  s360ep: 'https://cdn.rcd.gg/PreMiD/websites/H/Hitbloq/assets/18.png',
  sllh: 'https://cdn.rcd.gg/PreMiD/websites/H/Hitbloq/assets/19.png',
  se: 'https://cdn.rcd.gg/PreMiD/websites/H/Hitbloq/assets/20.png',
  snaep: 'https://cdn.rcd.gg/PreMiD/websites/H/Hitbloq/assets/21.png',
  sex: 'https://cdn.rcd.gg/PreMiD/websites/H/Hitbloq/assets/22.png',
  slle: 'https://cdn.rcd.gg/PreMiD/websites/H/Hitbloq/assets/23.png',
  snah: 'https://cdn.rcd.gg/PreMiD/websites/H/Hitbloq/assets/24.png',
  sh: 'https://cdn.rcd.gg/PreMiD/websites/H/Hitbloq/assets/25.png',
  s90h: 'https://cdn.rcd.gg/PreMiD/websites/H/Hitbloq/assets/26.png',
  slln: 'https://cdn.rcd.gg/PreMiD/websites/H/Hitbloq/assets/27.png',
  s360n: 'https://cdn.rcd.gg/PreMiD/websites/H/Hitbloq/assets/28.png',
  s90ep: 'https://cdn.rcd.gg/PreMiD/websites/H/Hitbloq/assets/29.png',
}

presence.on('UpdateData', async () => {
  const [time, buttons, cover] = await Promise.all([
    presence.getSetting<boolean>('time'),
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('cover'),
  ])
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/H/Hitbloq/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  presenceData.details = document.location.pathname.split('/')[1]
  switch (document.location.pathname.split('/')[1]) {
    case 'map_pool': {
      presenceData.details = 'Viewing map pool'
      presenceData.state = document
        .querySelector<HTMLMetaElement>('[property=\'og:title\']')
        ?.content
        .replace(' Map Pool', '')
      presenceData.buttons = [
        {
          label: 'View Page',
          url: document.location.href,
        },
      ]
      if (cover) {
        presenceData.largeImageKey = document.querySelector<HTMLMetaElement>(
          '[property=\'og:image\']',
        )?.content
      }
      break
    }
    case 'ladder': {
      presenceData.details = 'Viewing ladder'
      presenceData.state = document
        .querySelector<HTMLMetaElement>('[property=\'og:title\']')
        ?.content
        .replace(' Ladder', '')
      break
    }
    case 'ranked_list': {
      presenceData.details = 'Viewing ranked list'
      presenceData.state = document
        .querySelector<HTMLMetaElement>('[property=\'og:title\']')
        ?.content
        .replace(' Ranked List', '')
      break
    }
    case 'user': {
      presenceData.details = `User: ${
        document.querySelector('.player-profile-username > b')?.textContent
      }`
      presenceData.state = `Pool: ${
        document.querySelector('title')?.textContent?.split('\'s Profile - ')[1]
      }`
      presenceData.largeImageKey = document.querySelector<HTMLImageElement>(
        '.player-profile-image',
      )?.src
      presenceData.buttons = [
        {
          label: 'View Profile',
          url: document.location.href,
        },
      ]
      break
    }
    case 'leaderboard': {
      presenceData.details = document.querySelector('.leaderboard-title')?.textContent
      presenceData.state = document.querySelector('.leaderboard-data')?.childNodes[2]?.textContent
      presenceData.largeImageKey = document.querySelector<HTMLImageElement>('.leaderboard-cover')?.src
      presenceData.buttons = [
        {
          label: 'View Page',
          url: document.location.href,
        },
      ]
      presenceData.smallImageKey = assets[
        `${document.location.pathname.split('_')[2]}${
          document.location.pathname.split('_')[1]
        }` as keyof typeof assets
      ]
      let characteristic
      switch (document.location.pathname.split('_')[2]) {
        case 's': {
          characteristic = 'Standard'
          break
        }
        case 'sll': {
          characteristic = 'Lawless'
          break
        }
        case 's90': {
          characteristic = '90 Degree'
          break
        }
        case 's360': {
          characteristic = '360 Degree'
          break
        }
        case 's1s': {
          characteristic = 'One Saber'
          break
        }
        case 'sna': {
          characteristic = 'No Arrows'
          break
        }
      }
      let difficulty
      switch (document.location.pathname.split('_')[1]) {
        case 'e': {
          difficulty = 'Easy'
          break
        }
        case 'n': {
          difficulty = 'Normal'
          break
        }
        case 'h': {
          difficulty = 'Hard'
          break
        }
        case 'ex': {
          difficulty = 'Expert'
          break
        }
        case 'ep': {
          difficulty = 'Expert+'
          break
        }
      }
      presenceData.smallImageText = `${characteristic} ${difficulty}`
      break
    }
    case 'map_pools': {
      presenceData.details = 'Browsing map pools'
      break
    }
    case 'about': {
      presenceData.details = 'Viewing the about page'
      break
    }
    case 'contact': {
      presenceData.details = 'Viewing the contact page'
      break
    }
    case 'actions': {
      presenceData.details = 'Viewing the action queue'
      break
    }
    case 'add_user': {
      presenceData.details = 'Adding user'
      break
    }
    case '': {
      presenceData.details = 'Viewing the home page'
      break
    }
  }

  if (!time)
    delete presenceData.startTimestamp

  if (!buttons)
    delete presenceData.buttons

  presence.setActivity(presenceData)
})
