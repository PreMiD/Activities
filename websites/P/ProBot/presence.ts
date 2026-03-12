const presence = new Presence({
  clientId: '655050505726197781',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/P/ProBot/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }

  if (document.location.pathname === '/') {
    presenceData.details = 'Viewing the main page'
  }
  else if (document.location.pathname.includes('/dashboard')) {
    presenceData.details = 'Viewing the dashboard'
    presenceData.buttons = [
      {
        label: 'Go to Dashboard',
        url: document.location.href,
      },
    ]
  }
  else if (document.location.pathname.includes('/commands')) {
    presenceData.details = 'Viewing a page:'
    presenceData.state = 'Commands'
    presenceData.buttons = [
      {
        label: 'View ProBot Commands',
        url: document.location.href,
      },
    ]
  }
  else if (document.location.pathname.includes('premium')) {
    if (document.location.pathname.includes('/manage'))
      presenceData.details = 'Managing their Premium settings'
    else presenceData.details = 'Reading more about Premium'
  }
  else if (document.location.pathname.includes('/store')) {
    presenceData.details = 'Managing their'
    if (document.location.pathname.includes('/profile'))
      presenceData.state = 'Profile Backgrounds'
    else if (document.location.pathname.includes('/rank'))
      presenceData.state = 'ID Backgrounds'
    else presenceData.state = 'Purchased items'
  }
  else if (document.location.pathname.includes('/badges')) {
    presenceData.details = 'Managing their'
    presenceData.state = 'Profile Badges'
  }
  else if (document.location.pathname.includes('/xp')) {
    presenceData.details = 'Viewing leaderboard:'
    presenceData.state = 'Most XP'
    presenceData.buttons = [
      {
        label: 'View the leaderboard',
        url: document.location.href,
      },
    ]
  }
  else if (document.location.pathname.includes('/credits')) {
    presenceData.details = 'Viewing leaderboard:'
    presenceData.state = 'Most credits'
    presenceData.buttons = [
      {
        label: 'View the leaderboard',
        url: document.location.href,
      },
    ]
  }
  else if (document.location.pathname.includes('/daily')) {
    presenceData.details = 'Claiming their daily credits'
  }
  else if (document.location.pathname.includes('/transactions')) {
    presenceData.details = 'Viewing their'
    presenceData.state = 'Credit transactions history'
  }
  else if (document.location.pathname.includes('terms-of-use')) {
    presenceData.details = 'Reading the Terms Of Use'
    presenceData.buttons = [
      {
        label: 'Read the Terms of Use',
        url: document.location.href,
      },
    ]
  }
  else if (document.location.pathname.includes('privacy-policy')) {
    presenceData.details = 'Reading the Privacy Policy'
    presenceData.buttons = [
      {
        label: 'Read the Privacy Policy',
        url: document.location.href,
      },
    ]
  }
  else if (document.location.pathname.includes('refund-policy')) {
    presenceData.details = 'Reading the Refund Policy'
    presenceData.buttons = [
      {
        label: 'Read the Refund Policy',
        url: document.location.href,
      },
    ]
  }
  else if (document.location.pathname.includes('/server/')) {
    presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/P/ProBot/assets/logo.png'
    presenceData.largeImageKey = document.querySelector<HTMLImageElement>(
      '#sidebar_sidebar__avatar__QDGRP',
    )?.src
    presenceData.smallImageText = document.querySelector(
      '#sidebar_sidebar__server-info__03ViT > h4',
    )?.textContent
    if (document.location.pathname.includes('/settings')) {
      presenceData.details = 'Changing the Server Settings'
    }
    else if (document.location.pathname.includes('embed')) {
      presenceData.details = 'Managing the Embed Messages'
    }
    else if (document.location.pathname.includes('panel_logs')) {
      presenceData.details = 'Viewing Control Panel Logs'
    }
    else if (document.location.pathname.includes('mod_actions')) {
      presenceData.details = 'Viewing Moderation Actions'
    }
    else if (document.location.pathname.includes('utility')) {
      presenceData.details = 'Changing Module Settings'
      presenceData.state = 'Utility Commands'
    }
    else if (document.location.pathname.includes('mod')) {
      presenceData.details = 'Changing Module Settings'
      presenceData.state = 'Moderation Commands'
    }
    else if (document.location.pathname.includes('automod')) {
      presenceData.details = 'Changing Module Settings'
      presenceData.state = 'Automod Features'
    }
    else if (document.location.pathname.includes('welcomer')) {
      presenceData.details = 'Changing Module Settings'
      presenceData.state = 'Welcome & Goodbye Features'
    }
    else if (document.location.pathname.includes('auto_responder')) {
      presenceData.details = 'Changing Module Settings'
      presenceData.state = 'Auto Responder Features'
    }
    else if (document.location.pathname.includes('leveling')) {
      presenceData.details = 'Changing Module Settings'
      presenceData.state = 'Leveling System Features'
    }
    else if (document.location.pathname.includes('logs')) {
      presenceData.details = 'Changing Module Settings'
      presenceData.state = 'Server Log Features'
    }
    else if (document.location.pathname.includes('colors')) {
      presenceData.details = 'Changing Module Settings'
      presenceData.state = 'Color Commands & Features'
    }
    else if (document.location.pathname.includes('autoroles')) {
      presenceData.details = 'Changing Module Settings'
      presenceData.state = 'Auto Role Features'
    }
    else if (document.location.pathname.includes('reaction_roles')) {
      presenceData.details = 'Changing Module Settings'
      presenceData.state = 'Reaction Roles'
    }
    else if (document.location.pathname.includes('music')) {
      presenceData.details = 'Changing Module Settings'
      presenceData.state = 'Music Commands'
    }
    else if (document.location.pathname.includes('temp_link')) {
      presenceData.details = 'Changing Module Settings'
      presenceData.state = 'Temp Link Features'
    }
    else if (document.location.pathname.includes('voice_online')) {
      presenceData.details = 'Changing Module Settings'
      presenceData.state = 'Voice Online Feature'
    }
    else if (document.location.pathname.includes('anti_raid')) {
      presenceData.details = 'Changing Module Settings'
      presenceData.state = 'Anti-Raid Features'
    }
    else if (document.location.pathname.includes('protection')) {
      presenceData.details = 'Changing Module Settings'
      presenceData.state = 'VIP Protection Features'
    }
    else {
      presenceData.details = 'Server Overview page'
      presenceData.state = presenceData.smallImageText = document.querySelector(
        '#sidebar_sidebar__server-info__03ViT > h4',
      )?.textContent
    }
  }

  presence.setActivity(presenceData)
})
