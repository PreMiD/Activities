import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '1480090164213846238',
})

enum ActivityAssets {
  Logo = 'logo',
}

let cachedData: any = null
let cachedShowJam: boolean = true

setInterval(async () => {
  try {
    const [data, showJam] = await Promise.all([
      presence.getPageVariable(
        'melofy.track.title',
        'melofy.track.artist',
        'melofy.track.artworkUrl',
        'melofy.track.duration',
        'melofy.isPlaying',
        'melofy.progress',
        'melofy.partyId',
      ),
      presence.getSetting<boolean>('showJam').catch(() => true),
    ])
    cachedData = data
    cachedShowJam = showJam
  }
  catch {
  }
}, 2000)

presence.on('UpdateData', () => {
  if (!cachedData || !cachedData['melofy.track.title']) {
    presence.clearActivity()
    return
  }

  const title = cachedData['melofy.track.title']
  const artist = cachedData['melofy.track.artist']
  const artworkUrl = cachedData['melofy.track.artworkUrl']
  const duration = cachedData['melofy.track.duration']
  const isPlaying = cachedData['melofy.isPlaying']
  const progress = cachedData['melofy.progress']
  const partyId = cachedData['melofy.partyId']

  const presenceData: PresenceData = {
    type: ActivityType.Listening,
    details: title,
    state: `by ${artist}`,
    largeImageKey: artworkUrl || ActivityAssets.Logo,
    smallImageKey: isPlaying ? Assets.Play : Assets.Pause,
    smallImageText: isPlaying ? 'Playing' : 'Paused',
  }

  if (cachedShowJam && partyId) {
    presenceData.buttons = [
      {
        label: 'Join Listen Along',
        url: `https://melofy.jene.in/listen/${partyId}`,
      },
    ]
  }

  if (isPlaying && duration > 0) {
    const start = Date.now() - progress
    presenceData.startTimestamp = start
    presenceData.endTimestamp = start + duration
  }
  presence.setActivity(presenceData)
})
