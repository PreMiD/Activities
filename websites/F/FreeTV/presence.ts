import { ActivityType, Assets, getTimestamps, timestampFromFormat } from 'premid'

const presence = new Presence({
  clientId: '1492623215435055305',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://i.imgur.com/u75ktEz.png',
}

function extractSeasonEpisode(title: string) {
  const regex = /S(\d+)[\s-]*E(\d+)/i
  const match = title.match(regex)
  if (match && match[1] && match[2]) {
    const season = Number.parseInt(match[1], 10)
    const episode = Number.parseInt(match[2], 10)
    return `Season ${season}, Episode ${episode}`
  }
  return ''
}

function cleanTitle(title: string) {
  const regex = /S\d+[\s-]*E\d+/i
  let cleaned = title.replace(regex, '').trim()
  cleaned = cleaned.replace(/-$/, '').trim()
  return cleaned
}

function formatTimestamps(cursorTime: number, currentTime: string, duration: string) {
  if (duration?.startsWith('-')) {
    return getTimestamps(
      timestampFromFormat(currentTime?.trim()),
      timestampFromFormat(duration?.replaceAll('-', '')?.trim()) + timestampFromFormat(currentTime?.trim()),
    )
  }
  else {
    const date = new Date()
    date.setHours(0, 0, 0, 0)
    return getTimestamps(
      cursorTime - (date.getTime() / 1000) - timestampFromFormat(currentTime?.replaceAll('h', ':')?.trim().concat(':00')),
      timestampFromFormat(duration?.replaceAll('h', ':').trim().concat(':00')) - timestampFromFormat(currentTime?.replaceAll('h', ':')?.trim().concat(':00')),
    )
  }
}

presence.on('UpdateData', async () => {
  const strings = await presence.getStrings({
    play: 'general.playing',
    pause: 'general.paused',
    browse: 'general.browsing',
    browsingFreeTV: 'freetv.browsingFreeTV',
    browsingFreeCine: 'freetv.browsingFreeCine',
    watchingFreeTV: 'freetv.watchingFreeTV',
    lookingForChannel: 'freetv.lookingForChannel',
    browsingChannels: 'freetv.browsingChannels',
    browsingReplays: 'freetv.browsingReplays',
    browsingReplayCollections: 'freetv.browsingReplayCollections',
    browsingVOD: 'freetv.browsingVOD',
    browsingTVGuide: 'freetv.browsingTVGuide',
    browsingTheirList: 'freetv.browsingTheirList',
    managingTheirSettings: 'freetv.managingTheirSettings',
    watchingAChannel: 'freetv.watchingAChannel',
  })
  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const [privacy, usePresenceName, showChannelOnHomepage, showChannelLogo] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('usePresenceName'),
    presence.getSetting<boolean>('showChannelOnHomepage'),
    presence.getSetting<boolean>('showChannelLogo'),
  ])
  const path = document.location.pathname
  const playerContainer = document.querySelector<HTMLVideoElement>('.shaka-video-container video#PlayerVideoElement') || document.querySelector<HTMLVideoElement>('video#PlayerVideoElement')

  const channelName = document.querySelector('.LiveChannelRowContainer.selected .LiveChannelHeader')
  const channelIcon = document.querySelector<HTMLImageElement>('.shaka-video-container .CircularProgress img') || document.querySelector<HTMLImageElement>('.LiveChannelRowContainer.selected .CircularProgress img') || document.querySelector<HTMLImageElement>('.ProgramTitle .CircularProgress img')
  const programTitle = document.querySelector('.shaka-video-container .ProgramInfoHeaderTitles div:nth-of-type(1)') || document.querySelector('.LiveChannelRowContainer.selected .LiveChannelTitle') || document.querySelector('.ProgramTitle')
  const programSubtitle = document.querySelector('.shaka-video-container .ProgramInfoHeaderTitles div:nth-of-type(2)') || document.querySelector('.LiveChannelRowContainer.selected .LiveChannelSubtitle')
  const programTimestamp = document.querySelectorAll('.shaka-video-container .SeekBarTimestamp')
  const seasonEpisode = programTitle ? extractSeasonEpisode(programTitle.textContent || '') : ''
  const thumbnail = document.querySelector<HTMLImageElement>('.UIThumbnailPictureImage') || document.querySelector<HTMLImageElement>('.UIThumbnail img')

  switch (true) {
    case playerContainer !== null:
      if (!privacy && showChannelOnHomepage) {
        presenceData.name = usePresenceName && programTitle?.textContent ? cleanTitle(programTitle.textContent.trim()) : 'FreeTV'
        presenceData.details = programTitle ? cleanTitle(programTitle.textContent?.trim() || '') : strings.watchingFreeTV
        presenceData.state = programSubtitle?.textContent !== '' ? cleanTitle(programSubtitle?.textContent?.trim() || '') : channelName?.textContent || ''
        if (programTimestamp[0] && programTimestamp[1] && programTimestamp[2]) {
          [presenceData.startTimestamp, presenceData.endTimestamp] = formatTimestamps(playerContainer.currentTime, programTimestamp[1]?.textContent, programTimestamp[2]?.textContent)
        }
        if (showChannelLogo && channelIcon) {
          const highResSrc = channelIcon?.src?.replace(/\/w\d+$/, '')
          presenceData.largeImageKey = highResSrc ? `https://wsrv.nl/?url=${encodeURIComponent(highResSrc)}&w=512&h=512&fit=contain&cbg=transparent` : ActivityAssets.Logo
        }
        presenceData.largeImageText = seasonEpisode || channelName?.textContent?.trim() || ''
      }
      else {
        presenceData.details = strings.browsingFreeTV
        presenceData.state = strings.watchingAChannel
      }
      break
    case path.includes('/home/channels'):
      presenceData.details = strings.browsingChannels
      break
    case path.includes('/home/replay') || path.includes('/replay/'):
      presenceData.details = strings.browsingReplays
      if (!privacy && document.querySelector('.BackLinkContainer')?.textContent !== '') {
        presenceData.state = document.querySelector('.BackLinkContainer')?.textContent?.trim() || ''
      }
      break
    case path.includes('/replay_collection'): {
      presenceData.details = strings.browsingReplayCollections
      presenceData.state = !privacy ? programTitle?.textContent?.trim() || '' : ''
      if (!privacy && showChannelLogo && channelIcon) {
        presenceData.largeImageKey = !privacy ? thumbnail?.src || ActivityAssets.Logo : ActivityAssets.Logo
        const highResSrc = channelIcon?.src?.replace(/\/w\d+$/, '')
        presenceData.smallImageKey = highResSrc ? `https://wsrv.nl/?url=${encodeURIComponent(highResSrc)}&w=512&h=512&fit=contain&cbg=transparent` : ''
      }
      break
    }
    case path.includes('/home/oqee_cine'):
      presenceData.details = strings.browsingFreeCine
      break
    case path.includes('/vod/contents'):
      presenceData.details = strings.browsingVOD
      presenceData.state = !privacy ? document.querySelector('.content .details .header .h3')?.textContent?.trim() || '' : ''
      presenceData.largeImageKey = !privacy ? thumbnail?.src || ActivityAssets.Logo : ActivityAssets.Logo
      break
    case path.includes('/home/tv_guide'):
      presenceData.details = strings.browsingTVGuide
      break
    case path.includes('/home/vod') || path.includes('/vod/'):
      presenceData.details = strings.browsingVOD
      if (!privacy && document.querySelector('.BackLinkContainer')?.textContent !== '') {
        presenceData.state = document.querySelector('.BackLinkContainer')?.textContent?.trim() || ''
      }
      break
    case path.includes('/home/my_list'):
      presenceData.details = strings.browsingTheirList
      break
    case path.includes('/settings'):
      presenceData.details = strings.managingTheirSettings
      break
    default:
      presenceData.details = strings.browse
      presenceData.state = strings.lookingForChannel
      break
  }

  if (playerContainer && playerContainer.paused) {
    presenceData.smallImageKey = Assets.Pause
    presenceData.smallImageText = strings.pause
    delete presenceData.startTimestamp
    delete presenceData.endTimestamp
  }
  else if (playerContainer && !playerContainer.paused) {
    presenceData.smallImageKey = Assets.Play
    presenceData.smallImageText = strings.play
  }
  else {
    presenceData.startTimestamp = browsingTimestamp
    delete presenceData.endTimestamp
  }

  if (presenceData.details) {
    presence.setActivity(presenceData)
  }
  else {
    presence.clearActivity()
  }
})
