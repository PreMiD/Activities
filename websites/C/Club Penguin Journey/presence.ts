import { icons, rooms } from './assets.js'

const presence = new Presence({
  clientId: '1312233249438961665',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: icons.main,
    startTimestamp: browsingTimestamp,
  }
  switch (document.location.hostname) {
    case 'cpjourney.net': {
      if (document.location.pathname === '/') {
        presenceData.details = 'Waddling around'
        presenceData.state = 'Viewing Home'
      }
      else if (document.location.pathname.startsWith('/news/')) {
        presenceData.details = 'Reading post:'
        presenceData.state = document.querySelector('[class*=post_title]')?.textContent || ''
      }
      else if (document.location.pathname.startsWith('/news')) {
        presenceData.details = 'Waddling around'
        presenceData.state = 'Scrolling through the news'
      }
      else if (document.location.pathname.startsWith('/about')) {
        presenceData.details = 'Waddling around'
        presenceData.state = 'Learning about CPJourney'
      }
      else if (document.location.pathname.startsWith('/features')) {
        presenceData.details = 'Waddling around'
        presenceData.state = 'Discovering features'
      }
      else if (document.location.pathname.startsWith('/mascots')) {
        presenceData.details = 'Waddling around'
        presenceData.state = 'Meeting the mascots'
      }
      else if (document.location.pathname.startsWith('/parties')) {
        presenceData.details = 'Waddling around'
        presenceData.state = 'Joining the party'
      }
      else if (document.location.pathname.startsWith('/terms')) {
        presenceData.details = 'Waddling around'
        presenceData.state = 'Reading the Terms of Service'
      }
      else if (document.location.pathname.startsWith('/privacy')) {
        presenceData.details = 'Waddling around'
        presenceData.state = 'Reading the Privacy Policy'
      }
      else if (document.location.pathname.startsWith('/clear-cache')) {
        presenceData.details = 'Waddling around'
        presenceData.state = 'Learning how to Clear Cache'
      }
      else {
        presenceData.details = 'Waddling around'
      }
      break
    }
    case 'support.cpjourney.net': {
      if (document.location.pathname === '/') {
        presenceData.details = 'Waddling around'
        presenceData.state = 'Getting Support'
      }
      else if (document.location.pathname.startsWith('/articles/')) {
        presenceData.details = 'Reading support article:'
        presenceData.state = document.querySelector('[class*=article-content] > h1')?.textContent || ''
      }
      else if (document.location.pathname.startsWith('/articles')) {
        presenceData.details = 'Waddling around'
        presenceData.state = 'Finding a help article'
      }
      else if (document.location.pathname.startsWith('/ticket')) {
        presenceData.details = 'Waddling around'
        presenceData.state = 'Making a support ticket'
      }
      else if (document.location.pathname.startsWith('/login')) {
        presenceData.details = 'Waddling around'
        presenceData.state = 'Logging in for Support'
      }
      else if (document.location.pathname.startsWith('/profile')) {
        presenceData.details = 'Waddling around'
        presenceData.state = 'Managing my profile'
      }
      else {
        presenceData.details = 'Waddling around'
      }
      break
    }
    case 'status.cpjourney.net': {
      if (document.location.pathname === '/') {
        presenceData.details = 'Waddling around'
        presenceData.state = 'Checking server status'
      }
      break
    }
    case 'play.cpjourney.net': {
      if (document.location.pathname === '/') {
        const status = await presence.getPageVariable('roomId')
        presenceData.details = 'Waddling around'
        presenceData.largeImageKey = icons.main
        presenceData.smallImageKey = icons.main

        if (Number(status.roomId) === 1) {
          presenceData.state = 'Welcome Room'
          presenceData.largeImageKey = rooms.welcome
        }
        else if (Number(status.roomId) === 2) {
          presenceData.state = 'Tour HQ'
          presenceData.largeImageKey = rooms.tourhq
        }
        else if (Number(status.roomId) === 3) {
          presenceData.state = 'The Lookout'
          presenceData.largeImageKey = rooms.lookout
        }
        else if (Number(status.roomId) === 4) {
          presenceData.state = 'Ice Pond'
          presenceData.largeImageKey = rooms.pond
        }
        else if (Number(status.roomId) === 100) {
          presenceData.state = 'Town'
          presenceData.largeImageKey = rooms.town
        }
        else if (Number(status.roomId) === 110) {
          presenceData.state = 'Coffee Shop'
          presenceData.largeImageKey = rooms.coffee
        }
        else if (Number(status.roomId) === 111) {
          presenceData.state = 'Book Room'
          presenceData.largeImageKey = rooms.book
        }
        else if (Number(status.roomId) === 120) {
          presenceData.state = 'Dance Club'
          presenceData.largeImageKey = rooms.dance
        }
        else if (Number(status.roomId) === 121) {
          presenceData.state = 'Dance Lounge'
          presenceData.largeImageKey = rooms.lounge
        }
        else if (Number(status.roomId) === 122) {
          presenceData.state = 'Recycling Plant'
          presenceData.largeImageKey = rooms.recycle
        }
        else if (Number(status.roomId) === 130) {
          presenceData.state = 'Gift Shop'
          presenceData.largeImageKey = rooms.gift
        }
        else if (Number(status.roomId) === 131) {
          presenceData.state = 'Gift Shop Office'
          presenceData.largeImageKey = rooms.office
        }
        else if (Number(status.roomId) === 200) {
          presenceData.state = 'Ski Village'
          presenceData.largeImageKey = rooms.village
        }
        else if (Number(status.roomId) === 210) {
          presenceData.state = 'Sports Shop'
          presenceData.largeImageKey = rooms.sports
        }
        else if (Number(status.roomId) === 220) {
          presenceData.state = 'Ski Lodge'
          presenceData.largeImageKey = rooms.lodge
        }
        else if (Number(status.roomId) === 221) {
          presenceData.state = 'Lodge Attic'
          presenceData.largeImageKey = rooms.attic
        }
        else if (Number(status.roomId) === 230) {
          presenceData.state = 'Ski Hill'
          presenceData.largeImageKey = rooms.ski
        }
        else if (Number(status.roomId) === 300) {
          presenceData.state = 'Plaza'
          presenceData.largeImageKey = rooms.plaza
        }
        else if (Number(status.roomId) === 310) {
          presenceData.state = 'Pet Shop'
          presenceData.largeImageKey = rooms.pet
        }
        else if (Number(status.roomId) === 890) {
          presenceData.state = 'Puffle Park'
          presenceData.largeImageKey = rooms.park
        }
        else if (Number(status.roomId) === 319) {
          presenceData.state = 'Dojo Courtyard'
          presenceData.largeImageKey = rooms.court
        }
        else if (Number(status.roomId) === 320) {
          presenceData.state = 'Dojo'
          presenceData.largeImageKey = rooms.dojo
        }
        else if (Number(status.roomId) === 318) {
          presenceData.state = 'Ninja Hideout'
          presenceData.largeImageKey = rooms.ninja
        }
        else if (Number(status.roomId) === 323) {
          presenceData.state = 'EPF Command Room'
          presenceData.largeImageKey = rooms.epf
        }
        else if (Number(status.roomId) === 330) {
          presenceData.state = 'Pizza Parlor'
          presenceData.largeImageKey = rooms.pizza
        }
        else if (Number(status.roomId) === 340) {
          presenceData.state = 'Stage'
          presenceData.largeImageKey = rooms.stage
        }
        else if (Number(status.roomId) === 400) {
          presenceData.state = 'Beach'
          presenceData.largeImageKey = rooms.beach
        }
        else if (Number(status.roomId) === 410) {
          presenceData.state = 'Lighthouse'
          presenceData.largeImageKey = rooms.lighthouse
        }
        else if (Number(status.roomId) === 411) {
          presenceData.state = 'Beacon'
          presenceData.largeImageKey = rooms.beacon
        }
        else if (Number(status.roomId) === 800) {
          presenceData.state = 'Dock'
          presenceData.largeImageKey = rooms.dock
        }
        else if (Number(status.roomId) === 801) {
          presenceData.state = 'Snow Forts'
          presenceData.largeImageKey = rooms.forts
        }
        else if (Number(status.roomId) === 802) {
          presenceData.state = 'Stadium'
          presenceData.largeImageKey = rooms.stadium
        }
        else if (Number(status.roomId) === 803) {
          presenceData.state = 'HQ'
          presenceData.largeImageKey = rooms.hq
        }
        else if (Number(status.roomId) === 804) {
          presenceData.state = 'Boiler Room'
          presenceData.largeImageKey = rooms.boiler
        }
        else if (Number(status.roomId) === 805) {
          presenceData.state = 'Iceberg'
          presenceData.largeImageKey = rooms.iceberg
        }
        else if (Number(status.roomId) === 806) {
          presenceData.state = 'Underground Pool'
          presenceData.largeImageKey = rooms.pool
        }
        else if (Number(status.roomId) === 807) {
          presenceData.state = 'Mine Shack'
          presenceData.largeImageKey = rooms.shack
        }
        else if (Number(status.roomId) === 808) {
          presenceData.state = 'Mine'
          presenceData.largeImageKey = rooms.mine
        }
        else if (Number(status.roomId) === 809) {
          presenceData.state = 'Forest'
          presenceData.largeImageKey = rooms.forest
        }
        else if (Number(status.roomId) === 810) {
          presenceData.state = 'Cove'
          presenceData.largeImageKey = rooms.cove
        }
        else if (Number(status.roomId) === 811) {
          presenceData.state = 'Box Dimension'
          presenceData.largeImageKey = rooms.box
        }
        else if (Number(status.roomId) === 813) {
          presenceData.state = 'Cave Mine'
          presenceData.largeImageKey = rooms.cave
        }
        else if (Number(status.roomId) === 821) {
          presenceData.state = 'Old Boiler Room'
          presenceData.largeImageKey = rooms.old
        }
        else if (Number(status.roomId) > 1000) {
          presenceData.state = 'in a Igloo'
          presenceData.largeImageKey = icons.igloo
        }
        else if (
          Number(status.roomId) === 1000
          || Number(status.roomId) === 851
          || Number(status.roomId) === 852
          || Number(status.roomId) === 853
          || Number(status.roomId) === 855
          || Number(status.roomId) === 856
          || Number(status.roomId) === 857
          || Number(status.roomId) === 858
          || Number(status.roomId) === 859
          || Number(status.roomId) === 892
        ) {
          presenceData.state = 'in a Party Room'
          presenceData.largeImageKey = icons.party
        }
        else if (
          Number(status.roomId) === 500
          || Number(status.roomId) === 501
          || Number(status.roomId) === 502
          || Number(status.roomId) === 503
          || Number(status.roomId) === 504
          || Number(status.roomId) === 505
          || Number(status.roomId) === 506
          || Number(status.roomId) === 507
          || Number(status.roomId) === 508
          || Number(status.roomId) === 509
        ) {
          presenceData.state = 'Playing a Mission'
          presenceData.largeImageKey = icons.mission
        }
        else {
          presenceData.state = 'Playing Club Penguin Journey'
          presenceData.largeImageKey = icons.main
        }
      }
      break
    }
  }

  presence.setActivity(presenceData)
})
