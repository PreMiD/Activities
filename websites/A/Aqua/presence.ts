const presence = new Presence({
  clientId: '806984559308046336',
})

let sname: string,
  sartist: string,
  aqualisteners: string,
  aquapresenter: string

function metadataListener(this: XMLHttpRequest): void {
  const data = JSON.parse(this.responseText)
  sname = data.nowplaying.title
  sartist = data.nowplaying.artist
  aqualisteners = data.listeners.total
  aquapresenter = data.presenter.name
}

function updateMetaData(): void {
  const xhttp = new XMLHttpRequest()
  xhttp.addEventListener('load', metadataListener)
  xhttp.open('GET', 'https://api.itsaqua.net/stats', true)
  xhttp.send()
}

setInterval(updateMetaData, 10000)
window.onload = function (): void {
  updateMetaData()
}

let lastTitle: string
let lastTimeStart = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/A/Aqua/assets/logo.png',
  }
  const [changeDetails, changeState, changeSmallText] = await Promise.all([
    presence.getSetting<string>('changedetails'),
    presence.getSetting<string>('changestate'),
    presence.getSetting<string>('changesmalltext'),
  ])

  if (lastTitle !== sname) {
    lastTitle = sname
    lastTimeStart = Math.floor(Date.now() / 1000)
  }

  presenceData.startTimestamp = lastTimeStart

  if (!sname) {
    lastTitle = 'Loading...'
    sname = 'Loading...'
  }
  sartist ??= 'Loading...'
  aquapresenter ??= 'Loading...'
  aqualisteners ??= 'Loading...'

  if (aquapresenter !== 'AutoDJ') {
    if (changeDetails) {
      presenceData.details = changeDetails
        .replace('%song%', sname)
        .replace('%artist%', sartist)
    }
    else {
      presenceData.details = `🎵 | ${sartist} - ${sname}`
    }

    if (changeState)
      presenceData.state = changeState.replace('%presenter%', aquapresenter)
    else presenceData.state = `🎙️ | ${aquapresenter}`
  }
  else {
    if (changeDetails) {
      presenceData.details = changeDetails
        .replace('%song%', sname)
        .replace('%artist%', sartist)
    }
    else {
      presenceData.details = `🎵 | ${sartist} - ${sname}`
    }

    if (changeState)
      presenceData.state = changeState.replace('%presenter%', 'AutoDJ')
    else presenceData.state = '🎙️ | ' + 'AutoDJ'
  }

  if (changeSmallText) {
    presenceData.smallImageText = changeSmallText.replace(
      '%listeners%',
      aqualisteners,
    )
  }
  else {
    presenceData.smallImageText = `Listeners: ${aqualisteners}`
  }

  presence.setActivity(presenceData, true)
})
