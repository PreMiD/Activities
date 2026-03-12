const presence = new Presence({
  clientId: '792094839414980639',
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/S/SuperiorServers.co/assets/logo.png',
    startTimestamp: Math.floor(Date.now() / 1000),
  }
  if (document.location.hostname === 'superiorservers.co') {
    presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/S/SuperiorServers.co/assets/logo.png'
    presenceData.details = 'Portal'
    if (
      (document.location.pathname === '/' || !document.location.pathname)
      && document.location.pathname.includes('/staff')
    ) {
      const DRPStaff = document
        .querySelector('#RP_info')
        ?.textContent
        ?.substr(
          (document.querySelector('#RP_info')?.textContent?.indexOf(' of') ?? 0) + 3,
          document.querySelector('#RP_info')?.textContent?.indexOf(' entries'),
        )
        .replace(' entries', '')
      const AllServersStaff = document
        .querySelector('#NO_ID_info')
        ?.textContent
        ?.substr(
          (document.querySelector('#NO_ID_info')?.textContent?.indexOf(' of') ?? 0)
          + 3,
          document
            .querySelector('#NO_ID_info')
            ?.textContent
            ?.indexOf(' entries'),
        )
        .replace(' entries', '')
      const MilRPStaff = document
        .querySelector('#MilRP_info')
        ?.textContent
        ?.substr(
          (document.querySelector('#MilRP_info')?.textContent?.indexOf(' of') ?? 0)
          + 3,
          document
            .querySelector('#MilRP_info')
            ?.textContent
            ?.indexOf(' entries'),
        )
        .replace(' entries', '')
      const SWRPStaff = document
        .querySelector('#SWRP_info')
        ?.textContent
        ?.substr(
          (document.querySelector('#SWRP_info')?.textContent?.indexOf(' of') ?? 0) + 3,
          document.querySelector('#SWRP_info')?.textContent?.indexOf(' entries'),
        )
        .replace(' entries', '')
      const totalStaff = (
        Number.parseInt(DRPStaff ?? '')
        + Number.parseInt(SWRPStaff ?? '')
        + Number.parseInt(MilRPStaff ?? '')
        + Number.parseInt(AllServersStaff ?? '')
      ).toString()
      presenceData.details = 'Viewing the Staff list'
      presenceData.state = `${totalStaff} total members`
    }
    if (document.location.pathname.includes('/bans')) {
      const numBans = document
        .querySelector('div.dataTables_info')
        ?.textContent
        ?.substr(
          (document
            .querySelector('div.dataTables_info')
            ?.textContent
            ?.indexOf('of ') ?? 0) + 3,
          document
            .querySelector('div.dataTables_info')
            ?.textContent
            ?.indexOf(' entries'),
        )
        .replace(' entries', '')
      const currentPage = document.querySelector(
        '#bans_paginate > ul > li.paginate_button.active > a',
      )
      const lastPage = document.querySelector(
        '#bans_paginate > ul > li:nth-child(8) > a',
      )
      presenceData.details = `Viewing ${numBans} bans`
      presenceData.state = `(${currentPage?.textContent}/${lastPage?.textContent})`
    }
    if (document.location.pathname.includes('/credits')) {
      presenceData.details = 'Viewing the Credits page'
      if (document.location.pathname.includes('/darkrp'))
        presenceData.state = '(DarkRP)'
      else if (document.location.pathname.includes('/milrp'))
        presenceData.state = '(MilRP)'
      else if (document.location.pathname.includes('/cwrp'))
        presenceData.state = '(CWRP)'
    }
    if (document.location.pathname.includes('/rules')) {
      presenceData.details = 'Reading the server rules'
      if (document.location.pathname.includes('/darkrp'))
        presenceData.state = '(DarkRP)'
      else if (document.location.pathname.includes('/milrp'))
        presenceData.state = '(MilRP)'
      else if (document.location.pathname.includes('/cwrp'))
        presenceData.state = '(CWRP)'
    }
    if (document.location.pathname.includes('/leaderboard/money')) {
      presenceData.details = 'Viewing money leaderboards'
      if (document.location.pathname.includes('/darkrp'))
        presenceData.state = '(DarkRP)'
    }
    if (document.location.pathname.includes('/moneyboard')) {
      presenceData.details = 'Viewing money leaderboards'
      if (document.location.pathname.includes('/cwrp'))
        presenceData.state = '(CWRP)'
      else if (document.location.pathname.includes('/milrp'))
        presenceData.state = '(MilRP)'
    }
    if (document.location.pathname.includes('/darkrp/leaderboard/orgs')) {
      presenceData.details = 'Viewing org leaderboard'
      presenceData.state = '(DarkRP)'
    }
    if (document.location.pathname.includes('/polls')) {
      presenceData.details = 'Viewing polls'
      if (document.location.pathname.includes('/darkrp'))
        presenceData.state = '(DarkRP)'
      else if (document.location.pathname.includes('/milrp'))
        presenceData.state = '(MilRP)'
      else if (document.location.pathname.includes('/cwrp'))
        presenceData.state = '(CWRP)'
    }
    if (document.location.pathname.includes('/characters')) {
      presenceData.details = 'Using character search'
      if (document.location.pathname.includes('/darkrp'))
        presenceData.state = '(DarkRP)'
      else if (document.location.pathname.includes('/milrp'))
        presenceData.state = '(MilRP)'
      else if (document.location.pathname.includes('/cwrp'))
        presenceData.state = '(CWRP)'
    }
    if (document.location.pathname.includes('/gamemasters')) {
      if (document.location.pathname.includes('/darkrp')) {
        presenceData.state = '(DarkRP)'
      }
      else if (document.location.pathname.includes('/milrp')) {
        presenceData.details = 'Viewing MilRP GMs'
        const GMs = document
          .querySelector('#gamemasters_info')
          ?.textContent
          ?.substr(
            (document
              .querySelector('#gamemasters_info')
              ?.textContent
              ?.indexOf(' of') ?? 0) + 3,
            document
              .querySelector('#gamemasters_info')
              ?.textContent
              ?.indexOf(' entries'),
          )
          .replace(' entries', '')
        presenceData.state = `${GMs} total members`
      }
      else if (document.location.pathname.includes('/cwrp')) {
        presenceData.details = 'Viewing CWRP GMs'
        const GMs = document
          .querySelector('#gamemasters_info')
          ?.textContent
          ?.substr(
            (document
              .querySelector('#gamemasters_info')
              ?.textContent
              ?.indexOf(' of') ?? 0) + 3,
            document
              .querySelector('#gamemasters_info')
              ?.textContent
              ?.indexOf(' entries'),
          )
          .replace(' entries', '')
        presenceData.state = `${GMs} total members`
      }
    }
    if (document.location.pathname.includes('/xpboard')) {
      presenceData.details = 'Viewing XP leaderboards'
      if (document.location.pathname.includes('/milrp'))
        presenceData.state = '(MilRP)'
      else if (document.location.pathname.includes('/cwrp'))
        presenceData.state = '(CWRP)'
    }
    if (document.location.pathname.includes('/killboard')) {
      presenceData.details = 'Viewing K/D leaderboards'
      if (document.location.pathname.includes('/milrp'))
        presenceData.state = '(MilRP)'
      else if (document.location.pathname.includes('/cwrp'))
        presenceData.state = '(CWRP)'
    }
    if (document.location.pathname.includes('/minigameboard')) {
      presenceData.details = 'Viewing Minigame leaderboards'
      if (document.location.pathname.includes('/milrp'))
        presenceData.state = '(MilRP)'
      else if (document.location.pathname.includes('/cwrp'))
        presenceData.state = '(CWRP)'
    }
    if (document.location.pathname.includes('/profile/')) {
      presenceData.details = `Viewing ${
        document.querySelector(
          '#app > div:nth-child(2) > div > div.panel.panel-default > div.panel-body > div > div:nth-child(1) > span',
        )?.textContent
      }'s profile`
      let steamID32
      const steamID64 = BigInt(
        document.location.pathname
          .substr(document.location.pathname.indexOf('/', 2))
          .replace('/', '')
          .replace('/', ''),
      )
      if (steamID64 % 2n === 0n) {
        steamID32 = `STEAM_0:0:${(
          (steamID64 - 76561197960265728n)
          / 2n
        ).toString()}`
      }
      else {
        steamID32 = `STEAM_0:1:${(
          (steamID64 - 76561197960265728n)
          / 2n
        ).toString()}`
      }
      presenceData.state = steamID32
    }
  }
  else if (document.location.hostname === 'forum.superiorservers.co') {
    presenceData.details = 'Forums'
    if (document.location.pathname === '/' || !document.location.pathname)
      presenceData.state = 'Home'

    if (document.location.pathname.includes('/topic/')) {
      presenceData.state = `Viewing topic: ${
        document.querySelector(
          '#ipsLayout_mainArea > div.ipsPageHeader.ipsClearfix > div.ipsPhotoPanel.ipsPhotoPanel_small.ipsPhotoPanel_notPhone.ipsClearfix > div > h1 > span > span',
        )?.textContent
      }`
    }
    if (document.location.pathname.includes('/profile/')) {
      presenceData.state = `Viewing profile: ${
        document.querySelector(
          '#elProfileHeader > div.ipsColumns.ipsColumns_collapsePhone > div.ipsColumn.ipsColumn_fluid > div > h1',
        )?.textContent
      }`
    }
  }
  presence.setActivity(presenceData)
})
