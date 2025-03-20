const presence = new Presence({
  clientId: '711393222252822539',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/B/Bungie/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const path = document.location.pathname
  if (
    window.location.hostname === 'bungie.net'
    || window.location.hostname === 'www.bungie.net'
  ) {
    presenceData.details = 'Viewing the Bungie.net Homepage'
  }
  else if (window.location.hostname === 'comics.bungie.net') {
    presenceData.details = 'Readig Destiny Comics'
  }

  switch (path) {
    case '/7/en/Destiny/NewLight': {
      presenceData.details = 'Looking at Destiny Two NewLight'
      break
    }
    case '/7/en/Destiny/Shadowkeep': {
      presenceData.details = 'Checking out Destiny Two Shadowkeep'
      break
    }
    case '/7/en/Destiny/Forsaken': {
      presenceData.details = 'Checking out Destiny Two Forsaken'
      break
    }
    case '/7/en/Seasons/SeasonOfTheWorthy': {
      presenceData.details = 'Checking out Destiny Two Season of the Worthy'
      break
    }
    case '/7/en/Seasons/SeasonOfDawn': {
      presenceData.details = 'Checking out Destiny Two Season of Dawn'
      break
    }
    case '/7/en/Seasons/SeasonOfTheUndying': {
      presenceData.details = 'Checking out Destiny Two Season of the Undying'
      break
    }
    default:
      if (path.includes('/en/Explore/Detail/News/')) {
        presenceData.details = `Reading ${
          document.querySelector('#article-container > h1')?.textContent
        }`
      }
      else if (path === '/en/News') {
        presenceData.details = 'Cheking out news from Bungie'
      }
      else if (path === '/en/ClanV2/Chat') {
        presenceData.details = `Looking at thier clan:  ${document
          .querySelector(
            '#clanSideBar > div.container-left.customScroll.customScrollOff > a > div.compact-clanidentity-containter > div.clanNameContainer > h2',
          )
          ?.textContent
          ?.replace('<span>', '')
          ?.replace('</span>', '')}`
      }
      else if (path.includes('/en/Forums/Topics')) {
        presenceData.details = `Looking at ${
          document.querySelector('head > title')?.textContent
        }`
      }
      else if (path.includes('/en/Forums/Post/')) {
        presenceData.details = `Looking at: ${
          document.querySelector('#topicPost > div > div.threadMeta > div > h1')
            ?.textContent
        }By: ${
          document.querySelector(
            '#topicPost > div > div.threadMeta > div > div > div.authorMeta > a',
          )?.textContent
        }`
      }
      else if (path.includes('/en/ClanV2/MyClans')) {
        presenceData.details = 'Looking at the clans they are apart of'
      }
      else if (path.includes('/en/ClanV2/Index')) {
        presenceData.details = `Concerding joining clan ${document.querySelector(
          '#mainContent > div.darkThemeContent.grid.full-screen > div > div.container_bodyContent.customScroll > div.header > div.clanIdentity > h1',
        )}`
      }
      else if (path.includes('/en/ClanV2/Fireteam')) {
        presenceData.details = 'Checking out the available fireteams'
      }
      else if (path.includes('/en/ClanV2/PublicFireteam')) {
        presenceData.details = `Interested in in fireteam ${
          document.querySelector(
            '#clan-container > div > div > div > div > div.activity-header > h2',
          )?.textContent
        }`
      }
      else if (path.includes('en/Groups/SuggestedGroups')) {
        presenceData.details = 'Looking at the groups Bungie suggested to them'
      }
      else if (path.includes('en/Groups/MyGroups')) {
        presenceData.details = 'Searching for groups'
      }
      else if (path.includes('en/Groups/Popular')) {
        presenceData.details = 'Looking at the groups they\'re apart of'
      }
      else if (path.includes('/en/Groups/Search')) {
        presenceData.details = 'Searching for groups'
      }
      else if (path.includes('/en/Groups/Chat')) {
        presenceData.details = `Interested/Joined group ${
          document.querySelector('#groupName')?.textContent
        }`
      }
      else if (path.includes('/en/Community/Creations')) {
        presenceData.details = 'Looking at the creations the community made'
      }
      else if (path.includes('/en/Community/Detail')) {
        presenceData.details = `Looking at ${
          document.querySelector(
            '#mainContent > div.community-detail-header > div > div > div.community-details.flex > div.title',
          )?.textContent
        } By: ${
          document.querySelector(
            '#mainContent > div.community-detail-header > div > div > div.community-meta > span:nth-child(1) > a',
          )?.textContent
        }`
      }
      else if (path === '/en/Help') {
        presenceData.details = 'Getting help from Bungie'
      }
      else if (path === '/en/Support') {
        presenceData.details = 'Getting help from Bungie'
      }
      else if (path.includes('/en/Help/Index')) {
        presenceData.details = `Helpful ${
          document.querySelector('#searchValue')?.textContent
        }`
      }
      else if (path.includes('/en/Help/Article/')) {
        presenceData.details = `Reading ${
          document.querySelector(
            '#mainContent > div.content_main > div.container_help.grid > div.container_helpContent.grid-col-9.grid-col-9-medium.grid-col-12-mobile > div.content_help > div > div.HelpItemTitle',
          )?.textContent
        }`
      }
      else if (path.includes('/en/guide/destiny2')) {
        presenceData.details = `Reading ${
          document.querySelector('#guide-container > div.header > h1')
            ?.textContent
        }`
      }
      else if (path.includes('/en/Help/Troubleshoot')) {
        presenceData.details = `Reading ${
          document.querySelector(
            '#mainContent > div.content_main > div.container_help.grid > div.container_helpContent.grid-col-9.grid-col-9-medium.grid-col-12-mobile > div.troubleshootStep > h3',
          )?.textContent
        }`
      }
      else if (path.includes('/en/Support/Troubleshoot')) {
        presenceData.details = `Reading ${
          document.querySelector(
            '#mainContent > div.content_main > div.container_help.grid > div.container_helpContent.grid-col-9.grid-col-9-medium.grid-col-12-mobile > div.troubleshootStep > h3',
          )?.textContent
        }`
      }
  }
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
