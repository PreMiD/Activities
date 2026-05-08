import { Assets, getTimestamps, timestampFromFormat } from 'premid'

const presence = new Presence({
  clientId: '1500686150845595730',
})

enum ActivityAssets {
  Logo = 'https://i.imgur.com/1fybXxK.png',
}

presence.on('UpdateData', async () => {
  const strings = await presence.getStrings({
    listeningTo: 'wavezfm.listening',
    noMusic: 'wavezfm.noMusic',
    browsing: 'wavezfm.browsing',
    peoples: 'wavezfm.peoples',
    playingTo: 'wavezfm.playingTo',
    joinRoom: 'wavezfm.joinRoom',
  })
  const { pathname } = window.location
  const wavezFMUrl = window.location.href
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    details: strings.noMusic,
  }
  if (pathname.startsWith('/~/')) {
    const songElement = document.getElementById('wavezfm-current-track-title-mobile')?.textContent || document.getElementById('wavezfm-current-track-title-desktop')?.textContent
    const djElement = document.getElementById('wavezfm-current-dj-user-desktop')?.textContent || document.getElementById('wavezfm-current-dj-user-mobile')?.textContent
    const peopleElement = document.getElementById('wavezfm-room-people-count')?.textContent
    const timeElement = document.getElementById('wavezfm-current-track-timer-mobile') || document.getElementById('wavezfm-current-track-timer-desktop')
    const times = (timeElement?.textContent || '0:00 / 0:00').split('/').map(t => t.trim())
    if (songElement && djElement && times && times.length === 2) {
      const currentStr = times[0] || '0:00'
      const endStr = times[1] || '0:00'
      const currentTimeFormat = timestampFromFormat(currentStr)
      const endTimestampFormat = timestampFromFormat(endStr)
      const [start, end] = getTimestamps(currentTimeFormat, endTimestampFormat)
      presenceData.largeImageKey = ActivityAssets.Logo
      presenceData.startTimestamp = start
      presenceData.endTimestamp = end
      presenceData.smallImageKey = Assets.Play
      presenceData.details = `${strings.listeningTo}: ${songElement}`
      presenceData.state = `DJ: ${djElement} ${strings.playingTo} ${peopleElement} ${strings.peoples}`
      presenceData.buttons = [{
        label: `${strings.joinRoom}`,
        url: `${wavezFMUrl}`,
      }]
    }
  }
  else if (pathname === '/dashboard') {
    presenceData.details = strings.browsing
    presenceData.state = 'Wavez.fm'
  }
  try {
    presence.setActivity(presenceData)
  }
  catch (e: unknown) {
    console.error('Premid Error:', e)
  }
})
