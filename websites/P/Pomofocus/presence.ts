const presence = new Presence({
  clientId: '1350359904300564510',
})

let idleTS = sessionStorage.getItem('idleTimestamp')
if (!idleTS) {
  idleTS = String(Math.floor(Date.now() / 1000))
  sessionStorage.setItem('idleTimestamp', idleTS)
}
const idleTimestamp = Number(idleTS)
let focusStartTS: number | null = null

function updatePresence() {
  const presenceData: PresenceData = {
    details: 'Idling 💤',
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/P/Pomofocus/assets/logo.png',
  }

  const title = document.title.trim()
  const isBreak = title.includes('Time for a break!') || title.includes('Timer for a break!')
  const isTimerRunning = /^\d{2}:\d{2}/.test(title) && !title.startsWith('25:00')

  if (isBreak) {
    presenceData.details = 'Taking a break ☕'
    presenceData.state = 'Chilling ☕'
    focusStartTS = null
  }
  else if (isTimerRunning) {
    if (focusStartTS === null) {
      focusStartTS = Math.floor(Date.now() / 1000)
    }

    const taskText = document.querySelector('.task-content')?.textContent?.trim()
    const pomoInfo = document.querySelector('body')?.textContent?.match(/Pomos:\s*(\d+)\s*\/\s*(\d+)/)
    const done = pomoInfo?.[1]
    const total = pomoInfo?.[2]

    presenceData.details = taskText || 'Focusing 📖'
    presenceData.state = done && total ? `${done} / ${total} tasks done ✅` : undefined
    presenceData.startTimestamp = focusStartTS
  }
  else {
    presenceData.details = 'Idling 💤'
    presenceData.startTimestamp = idleTimestamp
    focusStartTS = null
  }

  presence.setActivity(presenceData)
}

presence.on('UpdateData', updatePresence)
