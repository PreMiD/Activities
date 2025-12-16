const presence = new Presence({
  clientId: '503557087041683458',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/S/Shard%20Hosting/assets/logo.png',
    startTimestamp: browsingTimestamp,
    name: 'Shard Hosting',
  }

  switch (document.location.hostname) {
    case 'shardhosting.co.uk': {
      if (document.location.pathname.includes('/web-hosting')) {
        presenceData.details = 'Web Hosting'
        presenceData.state = 'Exploring Packages'
      }
      else if (document.location.pathname.includes('/bot-hosting')) {
        presenceData.details = 'Bot Hosting'
        presenceData.state = 'Exploring Packages'
      }
      else if (document.location.pathname.includes('/about-us')) {
        presenceData.details = 'About Us'
        presenceData.state = 'People behind Shard!'
      }
      else if (
        document.location.pathname.includes('/hardware-and-locations')
      ) {
        presenceData.details = 'Hardware & Locations'
        presenceData.state = 'Browsing all over the world!'
      }
      else if (document.location.pathname.includes('/contact')) {
        presenceData.details = 'Contact Us'
        presenceData.state = 'Support & Help'
      }
      else if (document.location.pathname.includes('/partners')) {
        presenceData.details = 'Partners'
        presenceData.state = 'Amazing People!'
      }
      else if (document.location.pathname.includes('/help-center')) {
        presenceData.details = 'Help Center'
        presenceData.state = 'Guides, Tutorials and Articles.'
      }
      else if (document.location.pathname.includes('/terms-of-service')) {
        presenceData.details = 'Terms of Service'
        presenceData.state = 'Legal Stuff, who cares?'
      }

      break
    }
    case 'billing.shardhosting.co.uk': {
      if (document.location.pathname.includes('knowledgebase')) {
        const [article] = document.title.split(' - ')
        if (article === 'Knowledgebase')
          presenceData.state = 'Browsing Articles'
        else presenceData.state = article
        presenceData.details = 'Knowledgebase'
      }
      else if (document.location.pathname.includes('clientarea')) {
        presenceData.details = 'Client Area'
        presenceData.state = 'Account Management'
      }
      else if (document.location.pathname.includes('cart')) {
        presenceData.details = 'Shopping'
        presenceData.state = 'Server Hosting'
      }
      else if (document.location.pathname.includes('announcements')) {
        presenceData.details = 'Announcements'
        presenceData.state = 'Reading Important Updates!'
      }
      else if (document.location.pathname.includes('affiliates')) {
        presenceData.details = 'Affiliates'
        presenceData.state = 'Money???'
      }
      else if (document.location.pathname.includes('submitticket')) {
        presenceData.details = 'Support Ticket'
        presenceData.state = 'Opening a Ticket'
      }

      break
    }
    case 'control.shardhosting.co.uk': {
      const [serverName] = document.title.split(' | ')
      if (document.location.pathname === '/') {
        presenceData.details = 'Viewing Servers'
        presenceData.state = 'Browsing Services!'
      }
      else if (document.location.pathname.includes('files')) {
        presenceData.details = `Managing ${serverName}`
        presenceData.state = 'File Manager'
      }
      else if (document.location.pathname.includes('databases')) {
        presenceData.details = `Managing ${serverName}`
        presenceData.state = 'Databases'
      }
      else if (document.location.pathname.includes('schedules')) {
        presenceData.details = `Managing ${serverName}`
        presenceData.state = 'Schedules'
      }
      else if (document.location.pathname.includes('users')) {
        presenceData.details = `Managing ${serverName}`
        presenceData.state = 'Subusers'
      }
      else if (document.location.pathname.includes('backups')) {
        presenceData.details = `Managing ${serverName}`
        presenceData.state = 'Backups'
      }
      else if (document.location.pathname.includes('subdomains')) {
        presenceData.details = `Managing ${serverName}`
        presenceData.state = 'Subdomains'
      }
      else if (document.location.pathname.includes('network')) {
        presenceData.details = `Managing ${serverName}`
        presenceData.state = 'Network'
      }
      else if (document.location.pathname.includes('startup')) {
        presenceData.details = `Managing ${serverName}`
        presenceData.state = 'Startup'
      }
      else if (document.location.pathname.includes('settings')) {
        presenceData.details = `Managing ${serverName}`
        presenceData.state = 'Settings'
      }
      else if (document.location.pathname.includes('server')) {
        presenceData.details = `Managing ${serverName}`
        presenceData.state = 'Watching Console and hunting bugs!'
      }
      else if (document.location.pathname.includes('account')) {
        presenceData.details = 'Account Settings'
        presenceData.state = 'Changing Information'
      }

      break
    }
    case 'status.shardhosting.co.uk': {
      presenceData.details = 'Server Status'
      presenceData.state = 'Guess what! Someone broke it! Blame Ashley!'

      break
    }
    case 'web-ore-01.shardhosting.co.uk': {
      presenceData.details = 'Web Hosting'
      presenceData.state = 'Managing cPanel'

      break
    }
  }

  if (!presenceData.details)
    presence.setActivity()
  else presence.setActivity(presenceData)
})
