import { ActivityType } from 'premid'

const presence = new Presence({
  clientId: '939893132156366860',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.info('loaded')

let difficulty = ''
let characteristic = ''
let mapHash = ''
let uiState = ''
let replay = false
let playerName = ''
let mapName = ''
let artist = ''

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/A/ArcViewer/assets/logo.png',
}

enum OtherAssets {
  ThreeSixtyEasy = 'https://cdn.rcd.gg/PreMiD/websites/A/ArcViewer/assets/0.png',
  ThreeSixtyExpert = 'https://cdn.rcd.gg/PreMiD/websites/A/ArcViewer/assets/1.png',
  ThreeSixtyExpertPlus = 'https://cdn.rcd.gg/PreMiD/websites/A/ArcViewer/assets/2.png',
  ThreeSixtyHard = 'https://cdn.rcd.gg/PreMiD/websites/A/ArcViewer/assets/3.png',
  ThreeSixtyNormal = 'https://cdn.rcd.gg/PreMiD/websites/A/ArcViewer/assets/4.png',
  ThreeSixty = 'https://cdn.rcd.gg/PreMiD/websites/A/ArcViewer/assets/5.png',
  NinetyEasy = 'https://cdn.rcd.gg/PreMiD/websites/A/ArcViewer/assets/6.png',
  NinetyExpert = 'https://cdn.rcd.gg/PreMiD/websites/A/ArcViewer/assets/7.png',
  NinetyExpertPlus = 'https://cdn.rcd.gg/PreMiD/websites/A/ArcViewer/assets/8.png',
  NinetyHard = 'https://cdn.rcd.gg/PreMiD/websites/A/ArcViewer/assets/9.png',
  NinetyNormal = 'https://cdn.rcd.gg/PreMiD/websites/A/ArcViewer/assets/10.png',
  Ninety = 'https://cdn.rcd.gg/PreMiD/websites/A/ArcViewer/assets/11.png',
  LawlessEasy = 'https://cdn.rcd.gg/PreMiD/websites/A/ArcViewer/assets/12.png',
  LawlessExpert = 'https://cdn.rcd.gg/PreMiD/websites/A/ArcViewer/assets/13.png',
  LawlessExpertPlus = 'https://cdn.rcd.gg/PreMiD/websites/A/ArcViewer/assets/14.png',
  LawlessHard = 'https://cdn.rcd.gg/PreMiD/websites/A/ArcViewer/assets/15.png',
  LawlessNormal = 'https://cdn.rcd.gg/PreMiD/websites/A/ArcViewer/assets/16.png',
  Lawless = 'https://cdn.rcd.gg/PreMiD/websites/A/ArcViewer/assets/17.png',
  LightshowEasy = 'https://cdn.rcd.gg/PreMiD/websites/A/ArcViewer/assets/18.png',
  LightshowExpert = 'https://cdn.rcd.gg/PreMiD/websites/A/ArcViewer/assets/19.png',
  LightshowExpertPlus = 'https://cdn.rcd.gg/PreMiD/websites/A/ArcViewer/assets/20.png',
  LightshowHard = 'https://cdn.rcd.gg/PreMiD/websites/A/ArcViewer/assets/21.png',
  LightshowNormal = 'https://cdn.rcd.gg/PreMiD/websites/A/ArcViewer/assets/22.png',
  Lightshow = 'https://cdn.rcd.gg/PreMiD/websites/A/ArcViewer/assets/23.png',
  LegacyEasy = 'https://cdn.rcd.gg/PreMiD/websites/A/ArcViewer/assets/24.png',
  LegacyExpert = 'https://cdn.rcd.gg/PreMiD/websites/A/ArcViewer/assets/25.png',
  LegacyExpertPlus = 'https://cdn.rcd.gg/PreMiD/websites/A/ArcViewer/assets/26.png',
  LegacyHard = 'https://cdn.rcd.gg/PreMiD/websites/A/ArcViewer/assets/27.png',
  LegacyNormal = 'https://cdn.rcd.gg/PreMiD/websites/A/ArcViewer/assets/28.png',
  Legacy = 'https://cdn.rcd.gg/PreMiD/websites/A/ArcViewer/assets/29.png',
  NoArrowsEasy = 'https://cdn.rcd.gg/PreMiD/websites/A/ArcViewer/assets/30.png',
  NoArrowsExpert = 'https://cdn.rcd.gg/PreMiD/websites/A/ArcViewer/assets/31.png',
  NoArrowsExpertPlus = 'https://cdn.rcd.gg/PreMiD/websites/A/ArcViewer/assets/32.png',
  NoArrowsHard = 'https://cdn.rcd.gg/PreMiD/websites/A/ArcViewer/assets/33.png',
  NoArrowsNormal = 'https://cdn.rcd.gg/PreMiD/websites/A/ArcViewer/assets/34.png',
  NoArrows = 'https://cdn.rcd.gg/PreMiD/websites/A/ArcViewer/assets/35.png',
  OneSaberEasy = 'https://cdn.rcd.gg/PreMiD/websites/A/ArcViewer/assets/36.png',
  OneSaberExpert = 'https://cdn.rcd.gg/PreMiD/websites/A/ArcViewer/assets/37.png',
  OneSaberExpertPlus = 'https://cdn.rcd.gg/PreMiD/websites/A/ArcViewer/assets/38.png',
  OneSaberHard = 'https://cdn.rcd.gg/PreMiD/websites/A/ArcViewer/assets/39.png',
  OneSaberNormal = 'https://cdn.rcd.gg/PreMiD/websites/A/ArcViewer/assets/40.png',
  OneSaber = 'https://cdn.rcd.gg/PreMiD/websites/A/ArcViewer/assets/41.png',
  StandardEasy = 'https://cdn.rcd.gg/PreMiD/websites/A/ArcViewer/assets/42.png',
  StandardExpert = 'https://cdn.rcd.gg/PreMiD/websites/A/ArcViewer/assets/43.png',
  StandardExpertPlus = 'https://cdn.rcd.gg/PreMiD/websites/A/ArcViewer/assets/44.png',
  StandardHard = 'https://cdn.rcd.gg/PreMiD/websites/A/ArcViewer/assets/45.png',
  StandardNormal = 'https://cdn.rcd.gg/PreMiD/websites/A/ArcViewer/assets/46.png',
  Standard = 'https://cdn.rcd.gg/PreMiD/websites/A/ArcViewer/assets/47.png',
  Easy = 'https://cdn.rcd.gg/PreMiD/websites/A/ArcViewer/assets/48.png',
  Expert = 'https://cdn.rcd.gg/PreMiD/websites/A/ArcViewer/assets/49.png',
  ExpertPlus = 'https://cdn.rcd.gg/PreMiD/websites/A/ArcViewer/assets/50.png',
  Hard = 'https://cdn.rcd.gg/PreMiD/websites/A/ArcViewer/assets/51.png',
  Normal = 'https://cdn.rcd.gg/PreMiD/websites/A/ArcViewer/assets/52.png',
  UnknownEasy = 'https://cdn.rcd.gg/PreMiD/websites/A/ArcViewer/assets/53.png',
  UnknownExpert = 'https://cdn.rcd.gg/PreMiD/websites/A/ArcViewer/assets/54.png',
  UnknownExpertPlus = 'https://cdn.rcd.gg/PreMiD/websites/A/ArcViewer/assets/55.png',
  UnknownHard = 'https://cdn.rcd.gg/PreMiD/websites/A/ArcViewer/assets/56.png',
  UnknownNormal = 'https://cdn.rcd.gg/PreMiD/websites/A/ArcViewer/assets/57.png',
  Unknown = 'https://cdn.rcd.gg/PreMiD/websites/A/ArcViewer/assets/58.png',
}

presence.on('UpdateData', async () => {
  const [time, buttons, cover, mapSmallImages] = await Promise.all([
    presence.getSetting<boolean>('time'),
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('cover'),
    presence.getSetting<number>('mapSmallImages'),
  ])
  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const logs = await presence.getLogs<string>()
  const pageVars = await presence.getPageVariable<{
    'clips[0].buffer.duration': number
    'soundOffsets[0]': number
    'soundStartTimes[0]': number
    'audioCtx.currentTime': number
    'lastPlayed': number
    'playbackSpeed': number
    'playing': boolean
  }>(
    'clips[0].buffer.duration',
    'soundOffsets[0]',
    'soundStartTimes[0]',
    'audioCtx.currentTime',
    'lastPlayed',
    'playbackSpeed',
    'playing',
  )
  const { lastPlayed, playbackSpeed, playing } = pageVars

  for (const line of logs) {
    if (line.startsWith('Current diff is ')) {
      characteristic = line
        .replace('Current diff is ', '')
        .split(', ')[0]
        ?.trim() ?? ''
      difficulty = line.replace('Current diff is ', '').split(', ')[1]?.trim() ?? ''
    }
    if (
      line.startsWith('Downloading map data from:')
      || line.startsWith('Getting BeatSaver response for hash:')
    ) {
      mapHash = line.match(/[A-Z0-9]{40}/i)![0]
    }
    if (line.startsWith('UI state '))
      uiState = line.split(' ')[2]?.trim() ?? ''
    if (line.trim().startsWith('Loading difficulties asynchronously.'))
      replay = false
    if (line.trim().startsWith('Loading single difficulty for replay.'))
      replay = true
    if (line.startsWith('Loaded replay'))
      playerName = line.split(', played by ')[1]?.split(', with score ')[0] ?? ''
    if (line.startsWith('Loaded info for ')) {
      mapName = line.split(' - ')[1] ?? ''
      artist = line.split(' - ')[0]?.replace('Loaded info for ', '') ?? ''
    }
  }

  if (uiState === 'MapSelection') {
    presenceData.details = 'Selecting map or replay'
  }
  else if (uiState === 'Previewer') {
    presenceData.details = mapName
    if (replay)
      presenceData.state = playerName
    else presenceData.state = artist
    if (mapSmallImages !== 3) {
      presenceData.smallImageText = `${
        mapSmallImages === 0 || mapSmallImages === 1 ? characteristic : ''
      } ${
        mapSmallImages === 0 || mapSmallImages === 2
          ? difficulty.replace('Plus', '+')
          : ''
      }`
      presenceData.smallImageKey = OtherAssets[
        `${
          mapSmallImages === 0 || mapSmallImages === 1 ? characteristic : ''
        }${
          mapSmallImages === 0 || mapSmallImages === 2 ? difficulty : ''
        }` as keyof typeof OtherAssets
      ]
      ?? OtherAssets[
        `Unknown${
          mapSmallImages === 0 || mapSmallImages === 2 ? difficulty : ''
        }` as keyof typeof OtherAssets
      ]
    }
    if (cover && mapHash)
      presenceData.largeImageKey = `https://cdn.beatsaver.com/${mapHash}.jpg`
    presenceData.buttons = [
      {
        label: 'Preview Map',
        url: `https://allpoland.github.io/ArcViewer/?url=https://cdn.beatsaver.com/${mapHash}.zip`,
      },
    ]
    if (replay) {
      presenceData.buttons.unshift({
        label: 'View Replay',
        url: document.location.href,
      })
    }
  }

  if (playing) {
    [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(
      pageVars['soundStartTimes[0]']
      + (pageVars['audioCtx.currentTime'] - lastPlayed) * playbackSpeed,
      pageVars['clips[0].buffer.duration'] - pageVars['soundOffsets[0]'],
    )
  }

  if (!time) {
    delete presenceData.startTimestamp
    delete presenceData.endTimestamp
  }
  if (!buttons && presenceData.buttons)
    delete presenceData.buttons

  if (presenceData.details)
    presence.setActivity(presenceData)
})
