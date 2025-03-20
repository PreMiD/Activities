const presence = new Presence({
  clientId: '642393312392904705',
})
const presenceData: PresenceData = {
  largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/O/osu%20gatari/assets/logo.png',
}

presence.on('UpdateData', async () => {
  if (document.location.pathname === '/home') {
    presenceData.details = 'Viewing the homepage'
  }
  else if (document.location.pathname.startsWith('/beatmaps/rank_request')) {
    presenceData.details = 'Requesting a beatmaps'
  }
  else if (document.location.pathname.startsWith('/beatmaps')) {
    const title = document.querySelector<HTMLElement>('.map-title')
    const act = document.querySelector<HTMLElement>('.map-artist')

    if (title && act) {
      presenceData.details = 'Looking at the beatmap:'
      presenceData.state = `${act.textContent} - ${title.textContent}`
    }
    else {
      presenceData.details = 'Searching for new beatmaps'
    }
  }
  else if (document.location.pathname.startsWith('/s/')) {
    const title = document.querySelector<HTMLElement>('.map-title')
    const act = document.querySelector<HTMLElement>('.map-artist')

    if (title && act) {
      presenceData.details = 'Looking at the beatmap:'
      presenceData.state = `${act.textContent} - ${title.textContent}`
    }
    else {
      presenceData.details = 'Searching for new beatmaps'
    }
  }
  else if (document.location.pathname.startsWith('/b/')) {
    const title = document.querySelector<HTMLElement>('.map-title')
    const act = document.querySelector<HTMLElement>('.map-artist')

    if (title && act) {
      presenceData.details = 'Looking at the beatmap:'
      presenceData.state = `${act.textContent} - ${title.textContent}`
    }
    else {
      presenceData.details = 'Searching for new beatmaps'
    }
  }
  else if (document.location.pathname.startsWith('/leaderboard/osu')) {
    presenceData.details = 'Browsing rankings'
    presenceData.state = 'osu!'
  }
  else if (document.location.pathname.startsWith('/leaderboard/taiko')) {
    presenceData.details = 'Browsing rankings'
    presenceData.state = 'osu!taiko'
  }
  else if (document.location.pathname.startsWith('/leaderboard/ctb')) {
    presenceData.details = 'Browsing rankings'
    presenceData.state = 'osu!catch'
  }
  else if (document.location.pathname.startsWith('/leaderboard/mania')) {
    presenceData.details = 'Browsing rankings'
    presenceData.state = 'osu!mania'
  }
  else if (document.location.pathname.startsWith('/community/clans')) {
    presenceData.details = 'Browsing clans'
  }
  else if (document.location.pathname.startsWith('/clan/')) {
    presenceData.details = 'Browsing clans'
    presenceData.state = `${
      document.querySelector<HTMLElement>('.clan-abbr')?.textContent
    }${document.querySelector<HTMLElement>('.clan-title')?.textContent}| ${
      document.querySelector<HTMLElement>('div.clan-text-info-block > b')
        ?.textContent
    }`
  }
  else if (document.location.pathname.startsWith('/community/plays')) {
    presenceData.details = 'Browsing Top plays'
  }
  else if (document.location.pathname.startsWith('/community/livestreams')) {
    presenceData.details = 'Browsing livestreams'
  }
  else if (document.location.pathname.startsWith('/community/matches')) {
    presenceData.details = 'Browsing Tournaments'
  }
  else if (document.location.pathname.startsWith('/about')) {
    presenceData.details = 'Browsing About'
  }
  else if (document.location.pathname.startsWith('/docs/')) {
    const doc = document.querySelector<HTMLElement>('.ban-stroke1')
    const title = document.querySelector<HTMLElement>('.ban-stroke2')

    if (doc && title) {
      presenceData.details = `Browsing ${doc.textContent}`
      presenceData.state = title.textContent
    }
    else {
      presenceData.details = 'Browsing Documentation'
    }
  }
  else if (document.location.pathname.startsWith('/user/notifications')) {
    presenceData.details = 'Browsing Notifications'
  }
  else if (document.location.pathname.startsWith('/support')) {
    presenceData.details = 'Support Gatari!'
  }
  else if (document.location.pathname.startsWith('/settings/general')) {
    presenceData.details = 'Browsing account setting'
    presenceData.state = 'General'
  }
  else if (document.location.pathname.startsWith('/settings/userpage')) {
    presenceData.details = 'Browsing account setting'
    presenceData.state = 'Userpage'
  }
  else if (document.location.pathname.startsWith('/settings/appearance')) {
    presenceData.details = 'Browsing account setting'
    presenceData.state = 'Appearance'
  }
  else if (document.location.pathname.startsWith('/settings/password')) {
    presenceData.details = 'Browsing account setting'
    presenceData.state = 'Password'
  }
  else if (document.location.pathname.startsWith('/settings/accounts')) {
    presenceData.details = 'Browsing account setting'
    presenceData.state = 'Accounts'
  }
  else if (document.location.pathname.startsWith('/user/register')) {
    presenceData.details = 'Registering account'
  }
  else if (document.location.pathname.startsWith('/recover')) {
    presenceData.details = 'Recovering account'
  }
  else if (document.location.pathname.startsWith('/friends')) {
    presenceData.details = 'Browsing friend list'
  }
  else if (document.location.pathname.startsWith('/team')) {
    presenceData.details = 'Look at Garati Team'
  }
  else if (document.location.pathname.startsWith('/u')) {
    presenceData.details = `Looking at ${
      document.querySelector<HTMLElement>('.user-name')?.textContent
    }'s profile`
    presenceData.state = `Performance: ${
      document.querySelector<HTMLElement>('#chart1 > div > span')?.textContent
    }`
  }

  presence.setActivity(presenceData)
})

if (document.location.hostname === 'sig.gatari.pw')
  presenceData.details = 'Ready to generator a Signature'
