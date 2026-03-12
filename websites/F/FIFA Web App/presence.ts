import { Assets } from 'premid'

const presence = new Presence({
  clientId: '690628469746434089',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/F/FIFA%20Web%20App/assets/logo.png',
  }

  presenceData.startTimestamp = browsingTimestamp

  if (
    document.querySelector(
      'body > main > section > nav > button.ut-tab-bar-item.icon-home.selected',
    )
  ) {
    // home page selected
    presenceData.details = 'Browsing...'
    if (document.querySelector('.ut-objectives-list-view')) {
      // Home > Objectives
      presenceData.details = 'Viewing objectives'
      if (
        document
          .querySelector('.tab-menu > div > a:nth-child(1)')
          ?.className
          ?.includes('selected')
      ) {
        presenceData.state = 'Season Progress'
      }
      else if (
        document
          .querySelector('.tab-menu > div > a:nth-child(2)')
          ?.className
          ?.includes('selected')
      ) {
        presenceData.state = 'Milestones'
      }
      else if (
        document
          .querySelector('.tab-menu > div > a:nth-child(3)')
          ?.className
          ?.includes('selected')
      ) {
        presenceData.state = 'Season Objectives'
      }
    }
    else if (document.querySelector('.SBCHub')) {
      // Home > SBC
      presenceData.details = 'Viewing the SBC\'s'
      if (
        document
          .querySelector('.tab-menu > div > a:nth-child(1)')
          ?.className
          ?.includes('selected')
      ) {
        presenceData.details = 'Viewing all SBC\'s'
      }
      else if (
        document
          .querySelector('.tab-menu > div > a:nth-child(2)')
          ?.className
          ?.includes('selected')
      ) {
        presenceData.details = 'Viewing their favourite SBC\'s'
      }
      else if (
        document
          .querySelector('.tab-menu > div > a:nth-child(3)')
          ?.className
          ?.includes('selected')
      ) {
        presenceData.details = 'Viewing the live SBC\'s'
      }
      else if (
        document
          .querySelector('.tab-menu > div > a:nth-child(4)')
          ?.className
          ?.includes('selected')
      ) {
        presenceData.details = 'Viewing the basic SBC\'s'
      }
      else if (
        document
          .querySelector('.tab-menu > div > a:nth-child(5)')
          ?.className
          ?.includes('selected')
      ) {
        presenceData.details = 'Viewing the advanced SBC\'s'
      }
      else if (
        document
          .querySelector('.tab-menu > div > a:nth-child(6)')
          ?.className
          ?.includes('selected')
      ) {
        presenceData.details = 'Viewing players SBC\'s'
      }
      else if (
        document
          .querySelector('.tab-menu > div > a:nth-child(7)')
          ?.className
          ?.includes('selected')
      ) {
        presenceData.details = 'Viewing icon swap SBC\'s'
      }
      else if (
        document
          .querySelector('.tab-menu > div > a:nth-child(8)')
          ?.className
          ?.includes('selected')
      ) {
        presenceData.details = 'Viewing upgrade SBC\'s'
      }
    }
    else if (
      document.querySelector('.sbc-status-container')
      && document.querySelector('.challenge-content')
    ) {
      presenceData.details = 'Viewing SBC challange:'
      presenceData.state = document.querySelector('.title')?.textContent
    }
    else if (document.querySelector('.SBCChallenges')) {
      presenceData.details = 'Viewing SBC challange:'
      presenceData.state = document.querySelector('.title')?.textContent
    }
    else if (document.querySelector('.ut-transfer-list-view')) {
      presenceData.details = 'Viewing the transfers'
    }
    else if (document.querySelector('.ut-squad-overview')) {
      presenceData.details = 'Viewing squad overview of club:'
      presenceData.state = document.querySelector('.title')?.textContent
    }
  }
  else if (
    document.querySelector(
      'body > main > section > nav > button.ut-tab-bar-item.icon-squad.selected',
    )
  ) {
    // On squads page
    presenceData.details = 'Browsing Squads...'
    if (document.querySelector('.totw')) {
      presenceData.details = 'Viewing the squad of the week'
    }
    else if (document.querySelector('.ut-squad-overview')) {
      presenceData.details = 'Viewing squad overview of club:'
      presenceData.state = document.querySelector('.title')?.textContent
    }
    else if (document.querySelector('.squad-list')) {
      presenceData.details = 'Managing their squad'
    }
  }
  else if (
    document.querySelector(
      'body > main > section > nav > button.ut-tab-bar-item.icon-sbc.selected',
    )
  ) {
    // On SBC page
    presenceData.details = 'Browsing SBC...'
    if (document.querySelector('.SBCHub')) {
      // Home > SBC
      presenceData.details = 'Viewing the SBC\'s'
      if (
        document
          .querySelector('.tab-menu > div > a:nth-child(1)')
          ?.className
          ?.includes('selected')
      ) {
        presenceData.details = 'Viewing all SBC\'s'
      }
      else if (
        document
          .querySelector('.tab-menu > div > a:nth-child(2)')
          ?.className
          ?.includes('selected')
      ) {
        presenceData.details = 'Viewing their favourite SBC\'s'
      }
      else if (
        document
          .querySelector('.tab-menu > div > a:nth-child(3)')
          ?.className
          ?.includes('selected')
      ) {
        presenceData.details = 'Viewing the live SBC\'s'
      }
      else if (
        document
          .querySelector('.tab-menu > div > a:nth-child(4)')
          ?.className
          ?.includes('selected')
      ) {
        presenceData.details = 'Viewing the basic SBC\'s'
      }
      else if (
        document
          .querySelector('.tab-menu > div > a:nth-child(5)')
          ?.className
          ?.includes('selected')
      ) {
        presenceData.details = 'Viewing the advanced SBC\'s'
      }
      else if (
        document
          .querySelector('.tab-menu > div > a:nth-child(6)')
          ?.className
          ?.includes('selected')
      ) {
        presenceData.details = 'Viewing players SBC\'s'
      }
      else if (
        document
          .querySelector('.tab-menu > div > a:nth-child(7)')
          ?.className
          ?.includes('selected')
      ) {
        presenceData.details = 'Viewing icon swap SBC\'s'
      }
      else if (
        document
          .querySelector('.tab-menu > div > a:nth-child(8)')
          ?.className
          ?.includes('selected')
      ) {
        presenceData.details = 'Viewing upgrade SBC\'s'
      }
    }
    else if (
      document.querySelector('.sbc-status-container')
      && document.querySelector('.challenge-content')
    ) {
      presenceData.details = 'Viewing SBC challange:'
      presenceData.state = document.querySelector('.title')?.textContent
    }
    else if (document.querySelector('.SBCChallenges')) {
      presenceData.details = 'Viewing SBC challange:'
      presenceData.state = document.querySelector('.title')?.textContent
    }
    else if (document.querySelector('.ut-transfer-list-view')) {
      presenceData.details = 'Viewing the transfers'
    }
    else if (document.querySelector('.ut-squad-overview')) {
      presenceData.details = 'Viewing squad overview of club:'
      presenceData.state = document.querySelector('.title')?.textContent
    }
  }
  else if (
    document.querySelector(
      'body > main > section > nav > button.ut-tab-bar-item.icon-transfer.selected',
    )
  ) {
    // On Transfer page
    presenceData.details = 'Browsing Transfers...'
    if (document.querySelector('.ut-watch-list-view')) {
      presenceData.details = 'Viewing their transfer targets'
    }
    else if (document.querySelector('.ut-transfer-list-view')) {
      presenceData.details = 'Viewing their transfer list'
    }
    else if (
      document.querySelector('.ut-pinned-list-container.SearchResults')
    ) {
      presenceData.details = 'Transfers - Searching for new players'
      presenceData.smallImageKey = Assets.Search
    }
  }
  else if (
    document.querySelector(
      'body > main > section > nav > button.ut-tab-bar-item.icon-store.selected',
    )
  ) {
    // On store page
    presenceData.details = 'Browsing Store...'
  }
  else if (
    document.querySelector(
      'body > main > section > nav > button.ut-tab-bar-item.icon-club.selected',
    )
  ) {
    // On club page
    presenceData.details = 'Browsing through their club...'
    if (document.querySelector('.paginated-item-list')) {
      presenceData.details = 'Viewing their players'
      if (
        (
          document.querySelector(
            '.ut-list-header-icon > img',
          ) as HTMLImageElement
        ).src.toLowerCase().includes('staff')
      ) {
        presenceData.details = 'Viewing their staff'
      }
      else if (document.querySelector('.consumable')) {
        presenceData.details = 'Viewing their consumables'
      }
      else if (
        (
          document.querySelector(
            '.ut-list-header-icon > img',
          ) as HTMLImageElement
        ).src.toLowerCase().includes('items')
      ) {
        presenceData.details = 'Viewing their club items'
      }
      else if (document.querySelector('.ut-undodiscard-status-bar')) {
        presenceData.details = 'Viewing Quick Sell Recovery'
      }
    }
    else if (document.querySelector('.consumable-tile')) {
      presenceData.details = 'Viewing their consumables'
    }
    else if (document.querySelector('.celebrations-tile')) {
      presenceData.details = 'Viewing their club items'
    }
  }
  else if (
    document.querySelector(
      'body > main > section > nav > button.ut-tab-bar-item.icon-leaderboards.selected',
    )
  ) {
    // On leaderboards page
    presenceData.details = 'Viewing the leaderboards'
    if (
      document
        .querySelector('.tab-menu > div > a:nth-child(1)')
        ?.className
        ?.includes('selected')
    ) {
      presenceData.details = 'Viewing leaderboard of:'
      presenceData.state = 'Match Earnings'
    }
    else if (
      document
        .querySelector('.tab-menu > div > a:nth-child(2)')
        ?.className
        ?.includes('selected')
    ) {
      presenceData.details = 'Viewing leaderboard of:'
      presenceData.state = 'Transfer Profit'
    }
    else if (
      document
        .querySelector('.tab-menu > div > a:nth-child(3)')
        ?.className
        ?.includes('selected')
    ) {
      presenceData.details = 'Viewing leaderboard of:'
      presenceData.state = 'Club Value'
    }
    else if (
      document
        .querySelector('.tab-menu > div > a:nth-child(4)')
        ?.className
        ?.includes('selected')
    ) {
      presenceData.details = 'Viewing leaderboard of:'
      presenceData.state = 'Top Squad'
    }
  }
  else if (
    document.querySelector(
      'body > main > section > nav > button.ut-tab-bar-item.icon-settings.selected',
    )
  ) {
    // On settings page
    presenceData.details = 'Viewing their settings'
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
