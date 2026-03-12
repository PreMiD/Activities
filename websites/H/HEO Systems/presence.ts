const presence = new Presence({
  clientId: '1010270368814092400',
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/H/HEO%20Systems/assets/logo.png',
  }
  const { pathname, hostname } = document.location

  let serverName = null

  if (hostname === ('ptero.heo-systems.net') && pathname.includes('server')) {
    const serverNameElement = document.querySelector(
      'h1.font-header.text-2xl.line-clamp-1',
    )
    if (serverNameElement)
      serverName = serverNameElement.textContent?.trim()
  }

  switch (true) {
    // Game panel
    case hostname === ('ptero.heo-systems.net') && pathname.includes('activity'): {
      presenceData.details = 'Looking at the activity of a server.'
      break
    }

    case hostname === ('ptero.heo-systems.net') && pathname.includes('settings'): {
      presenceData.details = 'Changing the settings of a server.'
      break
    }

    case hostname === ('ptero.heo-systems.net') && pathname.includes('network'): {
      presenceData.details = 'Looking into network configurations of a server.'
      break
    }

    case hostname === ('ptero.heo-systems.net') && pathname.includes('backups'): {
      presenceData.details = 'Reviewing backup configurations of a server.'
      break
    }

    case hostname === ('ptero.heo-systems.net') && pathname.includes('users'): {
      presenceData.details = 'Configuring user access of a server.'
      break
    }

    case hostname === ('ptero.heo-systems.net') && pathname.includes('schedules'): {
      presenceData.details = 'Setting up task schedules of a server.'
      break
    }

    case hostname === ('ptero.heo-systems.net') && pathname.includes('databases'): {
      presenceData.details = 'Managing the databases of a server.'
      break
    }

    case hostname === ('ptero.heo-systems.net') && pathname.includes('files'): {
      presenceData.details = 'Managing the files of a server.'
      break
    }

    case hostname === ('ptero.heo-systems.net') && pathname.includes('server'): {
      presenceData.details = serverName
        ? `Managing '${serverName}'.`
        : 'Managing a server.'
      break
    }

    case hostname === ('ptero.heo-systems.net') && pathname.includes('account'): {
      presenceData.details = 'Changing account settings.'
      break
    }

    case hostname === ('ptero.heo-systems.net'): {
      presenceData.details = 'Managing servers in the Game Panel.'
      break
    }

    // Client Area
    case hostname === ('clients.heo-systems.net')
      && pathname.includes('clientarea.php?action=invoices'): {
      presenceData.details = 'Reviewing all the invoices.'
      break
    }

    case hostname === ('clients.heo-systems.net') && pathname.includes('viewinvoice'): {
      presenceData.details = 'Managing an invoice.'
      break
    }

    case hostname === ('clients.heo-systems.net') && pathname.includes('clientarea'): {
      presenceData.details = 'Managing services in the Client Area.'
      break
    }

    case hostname === ('clients.heo-systems.net') && pathname.includes('supporttickets'): {
      presenceData.details = 'Looking at all the support tickets.'
      break
    }

    case hostname === ('clients.heo-systems.net') && pathname.includes('store'): {
      presenceData.details = 'Purchasing a package.'
      break
    }

    case hostname === ('clients.heo-systems.net') && pathname.includes('viewticket'): {
      presenceData.details = 'Viewing a support ticket.'
      break
    }

    // Webhosting
    case hostname === 'heos-hosting.site' && pathname.includes('apps'): {
      presenceData.details = 'Adding apps to a website.'
      break
    }

    case hostname === 'heos-hosting.site'
      && pathname.includes('analytics'): {
      presenceData.details = 'Reviewing website analytics.'
      break
    }

    case hostname === 'heos-hosting.site'
      && pathname.includes('domains'): {
      presenceData.details = 'Managing the domains of a website.'
      break
    }

    case hostname === 'heos-hosting.site'
      && pathname.includes('emails'): {
      presenceData.details = 'Managing email configurations of a website.'
      break
    }

    case hostname === 'heos-hosting.site' && pathname.includes('files'): {
      presenceData.details = 'Managing the files of a website.'
      break
    }

    case hostname === 'heos-hosting.site'
      && pathname.includes('websites'): {
      presenceData.details = 'Managing a website.'
      break
    }

    case hostname === 'heos-hosting.site': {
      presenceData.details = 'Looking at the web hosting dashboard.'
      break
    }

    // Generic
    case hostname === 'www.heo-systems.net'
      && pathname.includes('webhosting'): {
      presenceData.details = 'Looking at web hosting packages.'
      break
    }

    case hostname === 'www.heo-systems.net'
      && pathname.includes('minecraft-hosting'): {
      presenceData.details = 'Looking at Minecraft hosting packages.'
      break
    }

    case hostname === 'www.heo-systems.net'
      && pathname.includes('discord-bot-hosting'): {
      presenceData.details = 'Looking at Discord bot hosting packages.'
      break
    }

    case hostname === 'www.heo-systems.net'
      && pathname.includes('palworld-hosting'): {
      presenceData.details = 'Looking at Palworld hosting packages.'
      break
    }

    case hostname === 'www.heo-systems.net'
      && pathname.includes('project-zomboid-hosting'): {
      presenceData.details = 'Looking at Project Zomboid hosting packages.'
      break
    }

    case hostname === 'www.heo-systems.net'
      && pathname.includes('games'): {
      presenceData.details = 'Looking at game hosting packages.'
      break
    }

    case hostname === 'www.heo-systems.net': {
      presenceData.details = 'Browsing the homepage.'
      break
    }
  }
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
