import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1219194850767929374',
})
let browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/M/meow.camera/assets/logo.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  presenceData.details = document.querySelector('.feeder-title')?.textContent
  presenceData.state = getStats()
  setTimestamps(document.querySelector('video')!, presenceData)
  presenceData.buttons = [
    {
      label: 'View Feeder',
      url: document.location.href,
    },
  ]
  presence.setActivity(presenceData)
})

function getStats(): string {
  const stats: string[] = []
  const time = document.querySelector('.time')
  const snack = document.querySelector('[title=\'Snack stock\']')
  const kibble = document.querySelector('[title=\'Kibble stock\']')

  if (time) {
    const timeArray: string[] = time.textContent?.split(':') ?? []
    let timeString = `🕒: ${timeArray[1]}:${timeArray[2]}`
    if (timeArray[timeArray.length - 1]?.includes('PM'))
      timeString += ' PM'
    else if (timeArray[timeArray.length - 1]?.includes('AM'))
      timeString += ' AM'

    stats.push(timeString)
  }
  if (snack)
    stats.push(`🍪: ${snack.textContent}`)
  if (kibble)
    stats.push(`🍚: ${kibble.textContent}`)

  return stats.join(' | ')
}

function setTimestamps(
  element: HTMLVideoElement,
  presenceData: PresenceData,
): void {
  if (element.paused) {
    delete presenceData.startTimestamp
    browsingTimestamp = Math.floor(Date.now() / 1000)
    presenceData.smallImageKey = Assets.Pause
  }
  else {
    presenceData.smallImageKey = Assets.Live
  }
}
