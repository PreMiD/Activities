const presence = new Presence({
  clientId: '1312233249438961665',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/C/Club%20Penguin%20Journey/assets/logo.jpeg',
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
      else {
        presenceData.details = 'Waddling around'
      }
      break
    }
    case 'play.cpjourney.net': {
      if (document.location.pathname === '/') {
        const status = await presence.getPageVariable('roomId')
        presenceData.details = 'Waddling around'

        if (Number(status.roomId) === 1) {
          presenceData.state = 'Welcome Room'
        }
        else if (Number(status.roomId) === 2) {
          presenceData.state = 'Tour HQ'
        }
        else if (Number(status.roomId) === 3) {
          presenceData.state = 'The Outlook'
        }
        else if (Number(status.roomId) === 4) {
          presenceData.state = 'Ice Pond'
        }
        else if (Number(status.roomId) === 100) {
          presenceData.state = 'Town'
        }
        else if (Number(status.roomId) === 110) {
          presenceData.state = 'Coffee Shop'
        }
        else if (Number(status.roomId) === 111) {
          presenceData.state = 'Book Room'
        }
        else if (Number(status.roomId) === 120) {
          presenceData.state = 'Dance Club'
        }
        else if (Number(status.roomId) === 121) {
          presenceData.state = 'Dance Lounge'
        }
        else if (Number(status.roomId) === 122) {
          presenceData.state = 'Recycling Plant'
        }
        else if (Number(status.roomId) === 130) {
          presenceData.state = 'Gift Shop'
        }
        else if (Number(status.roomId) === 131) {
          presenceData.state = 'Gift Shop Office'
        }
        else if (Number(status.roomId) === 200) {
          presenceData.state = 'Ski Village'
        }
        else if (Number(status.roomId) === 210) {
          presenceData.state = 'Ice Pond'
        }
        else if (Number(status.roomId) === 220) {
          presenceData.state = 'Ski Lodge'
        }
        else if (Number(status.roomId) === 221) {
          presenceData.state = 'Lodge Attic'
        }
        else if (Number(status.roomId) === 230) {
          presenceData.state = 'Ski Hill'
        }
        else if (Number(status.roomId) === 300) {
          presenceData.state = 'Plaza'
        }
        else if (Number(status.roomId) === 310) {
          presenceData.state = 'Pet Shop'
        }
        else if (Number(status.roomId) === 319) {
          presenceData.state = 'Dojo Courtyard'
        }
        else if (Number(status.roomId) === 320) {
          presenceData.state = 'Dojo'
        }
        else if (Number(status.roomId) === 330) {
          presenceData.state = 'Pizza Parlor'
        }
        else if (Number(status.roomId) === 340) {
          presenceData.state = 'Stage'
        }
        else if (Number(status.roomId) === 400) {
          presenceData.state = 'Beach'
        }
        else if (Number(status.roomId) === 410) {
          presenceData.state = 'Lighthouse'
        }
        else if (Number(status.roomId) === 411) {
          presenceData.state = 'Beacon'
        }
        else if (Number(status.roomId) === 800) {
          presenceData.state = 'Dock'
        }
        else if (Number(status.roomId) === 801) {
          presenceData.state = 'Snow Forts'
        }
        else if (Number(status.roomId) === 802) {
          presenceData.state = 'Stadium'
        }
        else if (Number(status.roomId) === 803) {
          presenceData.state = 'HQ'
        }
        else if (Number(status.roomId) === 804) {
          presenceData.state = 'Boiler Room'
        }
        else if (Number(status.roomId) === 805) {
          presenceData.state = 'Iceberg'
        }
        else if (Number(status.roomId) === 806) {
          presenceData.state = 'Underground Pool'
        }
        else if (Number(status.roomId) === 807) {
          presenceData.state = 'Mine Shack'
        }
        else if (Number(status.roomId) === 808) {
          presenceData.state = 'Mine'
        }
        else if (Number(status.roomId) === 809) {
          presenceData.state = 'Forest'
        }
        else if (Number(status.roomId) === 810) {
          presenceData.state = 'Cove'
        }
        else if (Number(status.roomId) === 811) {
          presenceData.state = 'Box Dimension'
        }
        else if (Number(status.roomId) === 813) {
          presenceData.state = 'Cave Mine'
        }
        else if (Number(status.roomId) === 821) {
          presenceData.state = 'Old Boiler Room'
        }
        else if (Number(status.roomId) > 1000) {
          presenceData.state = 'in a Igloo'
        }
        else if (
          Number(status.roomId) === 1000
          || Number(status.roomId) === 851
        ) {
          presenceData.state = 'in a Party Room'
        }
        else {
          presenceData.state = 'Playing Club Penguin Journey'
        }
      }
      break
    }
  }

  presence.setActivity(presenceData)
})
