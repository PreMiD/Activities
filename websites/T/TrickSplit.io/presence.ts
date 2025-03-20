const presence = new Presence({
  clientId: '719732079180644424',
})

interface TrickSplitData {
  gameMode?: string
  region?: string
  aliveTime: number
  pos: number
  cellCount: number
  connected: boolean
}

let tsData: TrickSplitData | null = null

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/T/TrickSplit.io/assets/logo.png',
  }

  if (tsData && tsData.connected) {
    presenceData.state = `${tsData.gameMode} on ${tsData.region}`

    // In game?
    if (!document.querySelector('.end[style*=flex],.menu:not([style*=none])')) {
      // Spectating?
      if (tsData.cellCount === 0) {
        presenceData.details = 'Spectating'
      }
      else {
        presenceData.details = `Playing as ${
          localStorage.getItem('nick') || 'TrickSplit.io'
        } (#${tsData.pos})`
        presenceData.startTimestamp = tsData.aliveTime
      }
    }
    else {
      presenceData.details = 'Main Menu'
    }
  }
  else {
    presenceData.details = 'Connecting...'
  }

  // If data doesn't exist clear else set activity to the presence data
  if (!presenceData.details) {
    // Clear tray
    presence.setActivity() // Clear activity
  }
  else {
    presence.setActivity(presenceData)
  }
})

presence.on('iFrameData', (data: unknown) => {
  tsData = data as TrickSplitData
})
