import { Assets } from 'premid'

interface VideoDetails {
  [contentId: string]: {
    metadata?: {
      shortDescription: string
      title: string
      contentSubtype:
        | 'LIVE'
        | 'REPLAY'
        | 'SHOW'
        | 'DOCUMENTARY'
        | 'FEATURE'
        | 'HIGHLIGHTS'
        | 'EXTENDED HIGHLIGHTS'
        | 'PRESS CONFERENCE'
      duration: number
      emfAttributes: {
        Global_Meeting_Name: string
        Series: 'FORMULA 1' | 'FORMULA 2' | 'FORMULA 3'
      }
    }
  }
}

const presence = new Presence({ clientId: '916438450952097834' })
const strings = presence.getStrings({
  play: 'general.playing',
  pause: 'general.paused',
  browsing: 'general.browsing',
})
const videoDetails: VideoDetails = {}
const browsingTimestamp = Math.floor(Date.now() / 1000)

let fetchingVideoDetails = false

function capitaliseFirstLetters(str: string): string {
  if (!str)
    return ''

  return str
    .split(' ')
    .map((word) => {
      return (
        word.substring(0, 1).toUpperCase() + word.substring(1).toLowerCase()
      )
    })
    .join(' ')
}

async function setWatchingVideoActivity(
  presenceData: PresenceData,
  contentId: string,
) {
  // An UpdateData event was fired before the video metadata has been fetched, ignore and wait for it to be available in another update
  if (!videoDetails[contentId])
    return

  const privacyMode = await presence.getSetting<boolean>('privacy')
  const videoMetadata = videoDetails[contentId].metadata

  if (privacyMode) {
    presenceData.details = 'Watching a video'
    delete presenceData.state
  }
  else if (['LIVE', 'REPLAY'].includes(videoMetadata?.contentSubtype ?? '')) {
    // Show which session is being watched; typically Practice 1-3, Qualifying, Sprint or Race
    presenceData.details = `Watching ${videoMetadata?.shortDescription}`
    // Show which series and event name is being watched
    presenceData.state = `${
      {
        'FORMULA 1': 'F1',
        'FORMULA 2': 'F2',
        'FORMULA 3': 'F3',
      }[videoMetadata?.emfAttributes.Series ?? 'FORMULA 1']
    } - ${videoMetadata?.emfAttributes.Global_Meeting_Name}`
  }
  else {
    // Show which type of video is being watched; Examples include "Watching Documentary", "Watching Show", "Watching Highlights"
    presenceData.details = `Watching ${capitaliseFirstLetters(
      videoMetadata?.contentSubtype ?? '',
    )}`
    // Show the title of the video being watched
    presenceData.state = videoMetadata?.title
  }

  // Video is playing / play button is pressed
  if (
    document.querySelector('.bmpui-ui-playbacktogglebutton')?.ariaPressed
    === 'true'
  ) {
    presenceData.smallImageKey = Assets.Play
    presenceData.smallImageText = videoMetadata?.contentSubtype === 'LIVE'
      ? 'Watching Live'
      : (await strings).play

    // Find the elapsed time of the current video
    const [currentTime] = document
      .querySelector('.bmpui-container-wrapper')
      ?.querySelectorAll('.bmpui-ui-playbacktimelabel') ?? []

    if (videoMetadata?.duration && currentTime) {
      [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(
        videoMetadata.duration,
        Number(currentTime?.textContent),
      )
    }
    else {
      presenceData.startTimestamp = browsingTimestamp
    }
  }
  else {
    delete presenceData.startTimestamp
    delete presenceData.endTimestamp

    presenceData.smallImageKey = Assets.Pause
    presenceData.smallImageText = (await strings).pause
  }
}

async function setBrowsingActivity(presenceData: PresenceData) {
  delete presenceData.state
  delete presenceData.endTimestamp

  presenceData.details = 'Browsing...'
  presenceData.startTimestamp = browsingTimestamp
  presenceData.smallImageKey = Assets.Search
  presenceData.smallImageText = (await strings).browsing
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/F/FormulaOneTv/assets/logo.png',
  }
  let contentId = ''

  if (document.location.href.includes('detail'))
    contentId = window.location.pathname.split('/')[2]!

  // Fetch the metadata for the current video based on the ID of the content found in the URL
  if (!videoDetails[contentId] && !fetchingVideoDetails && contentId !== '') {
    fetchingVideoDetails = true

    const response = await fetch(
      `https://f1tv.formula1.com/3.0/R/ENG/WEB_DASH/ALL/CONTENT/VIDEO/${contentId}/F1_TV_Pro_Annual/2`,
    )

    videoDetails[contentId] = (await response.json()).resultObj.containers[0]

    fetchingVideoDetails = false
  }

  // Watching video
  if (document.location.href.includes('detail'))
    await setWatchingVideoActivity(presenceData, contentId)
  // Browsing
  else await setBrowsingActivity(presenceData)

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
