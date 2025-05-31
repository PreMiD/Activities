import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '1378488363597959268',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://i.imgur.com/qEvDh7E.png',
}

presence.on('UpdateData', async () => {
  const [
    { browsing },
    useWatching,
    hideBrowsing,
    {
      'Sunniesnow.game.chart.title': title,
      'Sunniesnow.game.chart.difficultyName': difficultyName,
      'Sunniesnow.game.chart.difficulty': difficulty,
      'Sunniesnow.game.chart.difficultySup': difficultySup,
      'Sunniesnow.Music.pausing': pausing,
      'Sunniesnow.Music.currentTime': currentTime,
      'Sunniesnow.Music.duration': duration,
    },
  ] = await Promise.all([
    presence.getStrings({ browsing: 'general.browsing' }),
    presence.getSetting<boolean>('useWatching'),
    presence.getSetting<boolean>('hideBrowsing'),
    presence.getPageVariable(
      'Sunniesnow.game.chart.title',
      'Sunniesnow.game.chart.difficultyName',
      'Sunniesnow.game.chart.difficulty',
      'Sunniesnow.game.chart.difficultySup',
      'Sunniesnow.Music.pausing',
      'Sunniesnow.Music.currentTime',
      'Sunniesnow.Music.duration',
    ),
  ])

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    type: useWatching ? ActivityType.Watching : ActivityType.Playing,
  }

  if (!title) {
    if (hideBrowsing) {
      presence.clearActivity()
    }
    else {
      presenceData.details = browsing
      presence.setActivity(presenceData)
    }
    return
  }

  presenceData.smallImageKey = pausing ? Assets.Pause : Assets.Play
  presenceData.details = title as string
  presenceData.state = `${difficultyName} ${difficulty}${difficultySup}`
  if (!pausing) {
    presenceData.startTimestamp = Date.now() - (currentTime as number) * 1000
    presenceData.endTimestamp = presenceData.startTimestamp + (duration as number) * 1000
  }
  presence.setActivity(presenceData)
})
