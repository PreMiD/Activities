const presence = new Presence({
  clientId: '1260572178068406282',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/P/PlanetXO/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }

  if (document.location.hostname === 'planetxo.uk') {
    switch (document.location.href.split('/').slice(0, -1).join('/')) {
      case 'https://planetxo.uk': {
        presenceData.details = 'Viewing the map'
        break
      }
      case 'https://planetxo.uk/xoradio': {
        presenceData.details = 'Viewing XO Radio'
        presenceData.buttons = [
          {
            label: 'Listen Along!',
            url: 'https://planetxo.uk/xoradio',
          },
        ]
        break
      }
      case 'https://planetxo.uk/panel/planetxo': {
        presenceData.details = 'Viewing the PlanetXO Global Panel'
        break
      }
      case 'https://planetxo.uk/panel/admin': {
        presenceData.details = 'Viewing the PlanetXO System Administrator Panel'
        break
      }
      case 'https://planetxo.uk/blastradio': {
        presenceData.details = 'Viewing Blast Radio'
        presenceData.buttons = [
          {
            label: 'Listen Along!',
            url: 'https://planetxo.uk/blastradio',
          },
        ]
        break
      }
      case 'https://planetxo.uk/qtfm': {
        presenceData.details = 'Viewing QTFM'
        presenceData.buttons = [
          {
            label: 'Listen Along!',
            url: 'https://planetxo.uk/qtfm',
          },
        ]
        break
      }
      case 'https://planetxo.uk/lushradio': {
        presenceData.details = 'Viewing Lush Radio'
        presenceData.buttons = [
          {
            label: 'Listen Along!',
            url: 'https://planetxo.uk/lushradio',
          },
        ]
        break
      }
      case 'https://planetxo.uk/everyradio': {
        presenceData.details = 'Viewing Every Radio'
        presenceData.buttons = [
          {
            label: 'Listen Along!',
            url: 'https://planetxo.uk/everyradio',
          },
        ]
        break
      }
      case 'https://planetxo.uk/player': {
        presenceData.details = 'Viewing Player'
        presenceData.buttons = [
          {
            label: 'Listen Along!',
            url: 'https://planetxo.uk/player',
          },
        ]
        break
      }
      case 'https://planetxo.uk/panel': {
        presenceData.details = 'Viewing PlanetXO Panel'
        presenceData.buttons = [
          {
            label: 'Join the Team?',
            url: 'https://planetxo.uk/vacancies.php',
          },
        ]
        break
      }
      case 'https://planetxo.uk/panel/xoradio': {
        presenceData.details = 'Viewing the Panel for XO Radio'
        presenceData.buttons = [
          {
            label: 'Listen Along!',
            url: 'https://planetxo.uk/xoradio',
          },
        ]
        break
      }
      case 'https://planetxo.uk/panel/blastradio': {
        presenceData.details = 'Viewing the Panel for Blast Radio'
        presenceData.buttons = [
          {
            label: 'Listen Along!',
            url: 'https://planetxo.uk/blastradio',
          },
        ]
        break
      }
      case 'https://planetxo.uk/panel/qtfm': {
        presenceData.details = 'Viewing the Panel for QTFM'
        presenceData.buttons = [
          {
            label: 'Listen Along!',
            url: 'https://planetxo.uk/qtfm',
          },
        ]
        break
      }
      case 'https://planetxo.uk/panel/lushradio': {
        presenceData.details = 'Viewing the Panel for Lush Radio'
        presenceData.buttons = [
          {
            label: 'Listen Along!',
            url: 'https://planetxo.uk/lushradio',
          },
        ]
        break
      }
      case 'https://planetxo.uk/panel/everyradio': {
        presenceData.details = 'Viewing the Panel for Every Radio'
        presenceData.buttons = [
          {
            label: 'Listen Along!',
            url: 'https://planetxo.uk/everyradio',
          },
        ]
        break
      }
      default:
        if (document.location.hostname === 'planetxo.uk')
          presenceData.details = 'Viewing PlanetXO'
        break
    }
  }

  if (document.location.hostname === 'panel.planetxo.uk')
    presenceData.details = 'Viewing the Panel for PlanetXO'

  if (document.location.hostname === 'staff.planetxo.uk')
    presenceData.details = 'Viewing the Emails for PlanetXO'

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
