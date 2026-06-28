import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1392901069956190280', // Ghosty ID
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://images-ext-1.discordapp.net/external/zxeFfLcwtFrN41UxLJ54W0j5tzwKdh30j_tHShGU9bY/https/cdn.discordapp.com/avatars/1392901069956190280/ba825fe334c139e6c6b47d71ac47ed8e.webp',
}

presence.on('UpdateData', async () => {
  const { hostname, pathname } = document.location

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    smallImageKey: Assets.Play,
    details: 'Böngészik',
  }

  // ghostybot.hu
  if (hostname.includes('ghostybot.hu')) {
    if (pathname === '/' || pathname === '') {
      presenceData.state = 'Főoldalt Nézi'
    }

    else if (pathname.includes('commands')) {
      presenceData.state = 'Dashboardot Nézi'
    }

    else if (pathname.includes('status')) {
      presenceData.state = 'Státusz Oldalt Nézi'
    }

    else if (pathname.includes('faq')) {
      presenceData.state = 'GYIK Oldalt Nézi'
    }

    else if (pathname.includes('support')) {
      presenceData.state = 'Support Oldalt Nézi'
    }

    else if (pathname.includes('privacy')) {
      presenceData.state = 'Adatvédelmi Oldalt Nézi'
    }

    else if (pathname.includes('terms')) {
      presenceData.state = 'Felhasználási Feltételeket Nézi'
    }
    else if (pathname.includes('globalban-rules')) {
      presenceData.state = 'A Globalban Szabályzatot Nézi'
    }
    else if (pathname.includes('partners')) {
      presenceData.state = 'A Partnereket Nézi'
    }
    else if (pathname.includes('collabs')) {
      presenceData.state = 'A Collabsokat Nézi'
    }
  }

  // ghosty.instatus.com
  else if (hostname.includes('ghosty.instatus.com')) {
    presenceData.state = 'Státusz Oldalt Nézi'
  }

  // ghostydcbot.hu
  else if (hostname.includes('ghostydcbot.hu')) {
    if (pathname === 'welcome-to-the-documention') {
      presenceData.state = 'Az Üdvőzlő Oldalt Nézi'
    }

    else if (pathname.includes('installation')) {
      presenceData.state = 'A Telepítési Információkat Nézi'
    }

    else if (pathname.includes('permissions')) {
      presenceData.state = 'A Jogosultságok Információit Nézi'
    }

    else if (pathname.includes('log-chnnel-set')) {
      presenceData.state = 'Log Csatorna Beállítását Nézi'
    }

    else if (pathname.includes('configuring-security-systems')) {
      presenceData.state = 'A Védelmi Rendszerek Beállítását Nézi'
    }
    else if (pathname.includes('autorole')) {
      presenceData.state = 'Az Autorole Beállítását Nézi'
    }
    else if (pathname.includes('automod')) {
      presenceData.state = 'Az Automod Beállítását Nézi'
    }
    else if (pathname.includes('guild-tag-system')) {
      presenceData.state = 'A Guild Címke Rendszer Beállítását Nézi'
    }
  }

  // Ha van state → Presence aktív
  if (presenceData.state)
    presence.setActivity(presenceData)
  else
    presence.clearActivity()
})
