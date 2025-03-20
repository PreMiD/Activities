const presence = new Presence({
  clientId: '715344422039977994',
})
const strings = {
  listen: 'Listening',
  mute: 'Muted',
  record: 'Recording',
  view: 'Viewing',
  read: 'Reading',
}
const browsingTimestamp = Math.floor(Date.now() / 1000)
const modes = ['CW', 'LSB', 'USB', 'AM', 'FM', 'AMsync']

let frequency: string
let mode = 2
let intHandle: number

function updateMode(): void {
  let i = 0
  for (const node of Array.from(
    document.querySelector('div.ctl > form > div.buttonrow')?.children ?? [],
  )) {
    if ((node as HTMLElement).style.background !== '') {
      mode = i
      continue
    }
    i++
  }
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/W/WebSDR/assets/logo.png',
    smallImageText: 'University of Twente SDR',
    startTimestamp: browsingTimestamp,
  }

  switch (document.location.pathname) {
    case '/': {
      if (!intHandle)
        intHandle = setInterval(updateMode, 1000)

      frequency = (
        document.querySelector(
          'div.ctl > form > span > input',
        ) as HTMLInputElement
      ).value

      presenceData.details = `${frequency} ${modes[mode]}`

      if (document.querySelector('#recbutton')?.textContent === 'stop') {
        presenceData.state = strings.record
      }
      else if (
        (document.querySelector('#mutecheckbox') as HTMLInputElement)
          .checked === true
      ) {
        presenceData.state = strings.mute
      }
      else {
        presenceData.state = strings.listen
      }

      break
    }
    case '/wspr/': {
      presenceData.details = 'WSPR Map'
      presenceData.state = strings.view

      break
    }
    case '/chirps/': {
      presenceData.details = 'Chirp Signals'
      presenceData.state = strings.view

      break
    }
    case '/chirps/article/': {
      presenceData.details = 'Chirp Signal Article'
      presenceData.state = strings.read

      break
    }
    case '/fullday/': {
      presenceData.details = 'Full Day Waterfall'
      presenceData.state = strings.view

      break
    }
    case '/oldnews.html': {
      presenceData.details = 'Old News'
      presenceData.state = strings.read

      break
    }
    case '/qrt.html': {
      presenceData.details = 'History'
      presenceData.state = strings.read

      break
    }
  }

  if (!presenceData.details)
    presence.setActivity()
  else presence.setActivity(presenceData)
})
