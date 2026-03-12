import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1001288215388495953',
})
const browsingStamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/C/Crave/assets/logo.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = { largeImageKey: ActivityAssets.Logo }

  if (document.querySelector('.jw-video')) {
    // if contains video
    if (document.querySelector('.jw-icon-playback')?.ariaLabel !== 'Play') {
      // video is playing
      [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(
        presence.timestampFromFormat(
          document.querySelector('.jw-text-elapsed')?.textContent ?? '',
        ),
        presence.timestampFromFormat(
          document.querySelector('.jw-text-duration')?.textContent ?? '',
        ),
      )

      presenceData.smallImageKey = Assets.Play
      presenceData.smallImageText = 'Playing'
    }
    else {
      presenceData.smallImageKey = Assets.Pause
      presenceData.smallImageText = 'Paused'
    }

    presenceData.buttons = [
      {
        label: 'Watch',
        url: document.location.href,
      },
    ]

    if (document.querySelector('.bm-icon-episode-list')) {
      // if the video is an episode
      const details = document.querySelector('.jw-title-primary')?.textContent || ''
      // split episode details to achieve {showName, episodeNumber, episodeName}
      // regex finds the season + episode number then split the entire title with said regex
      const epDetails = details.split(/S\d+:E\d+/.exec(details)?.[0] ?? '')

      presenceData.state = `${
        /S\d+:E\d+/.exec(details)?.[0]
      } - ${epDetails[1]?.trim()}` // {episodeNumber} - {episodeName}
      presenceData.details = epDetails[0]?.trim() // {showName}
    }
    else {
      // video is a movie
      presenceData.details = document.querySelector('.jw-title-primary')?.textContent // movie title
    }
  }
  else {
    // default to browsing
    presenceData.details = 'Browsing...'
    presenceData.startTimestamp = browsingStamp
  }

  presence.setActivity(presenceData)
})
