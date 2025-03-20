import { Assets } from 'premid'

const presence = new Presence({
  clientId: '779397757928210472',
})
const strings = presence.getStrings({
  play: 'general.playing',
  pause: 'general.paused',
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/S/StoryFire/assets/logo.png',
  }
  const video = document.querySelector<HTMLVideoElement>(
    '#storyfire-player_html5_api',
  )
  const buttons = await presence.getSetting<boolean>('buttons')

  if (document.location.pathname.startsWith('/video-details') && video) {
    const [startTimestamp, endTimestamp] = presence.getTimestamps(
      Math.floor(video.currentTime),
      Math.floor(video.duration),
    )

    presenceData.details = document.querySelector(
      '.title > div:not(.series)',
    )?.textContent
    presenceData.state = document.querySelector('.user-name')?.textContent
    if (!video.paused) {
      [presenceData.startTimestamp, presenceData.endTimestamp] = [
        startTimestamp,
        endTimestamp,
      ]
      presenceData.smallImageKey = Assets.Play
      presenceData.smallImageText = (await strings).play
    }
    else {
      presenceData.smallImageKey = Assets.Pause
      presenceData.smallImageText = (await strings).pause
    }

    if (buttons) {
      presenceData.buttons = [
        {
          label: 'Watch',
          url: document.URL,
        },
      ]
    }
  }
  else if (document.location.pathname.startsWith('/forgot-password')) {
    presenceData.details = 'Forgot Password'
  }
  else if (document.location.pathname.startsWith('/social')) {
    presenceData.details = 'Viewing social'
  }
  else if (document.location.pathname.startsWith('/leaderboard')) {
    presenceData.details = 'Viewing leaderboard'
  }
  else if (document.location.pathname.startsWith('/blaze')) {
    presenceData.details = 'Viewing Blaze page'
  }
  else if (document.location.pathname.startsWith('/profile')) {
    presenceData.details = 'Viewing their profile'
  }
  else if (document.location.pathname.startsWith('/user')) {
    presenceData.details = 'Viewing a user\'s profile'
    presenceData.state = document.querySelector('.username h3')?.textContent
  }
  else if (document.location.pathname.startsWith('/story')) {
    presenceData.details = 'Writing a story'
  }
  else if (document.location.pathname.startsWith('/legal-policies')) {
    presenceData.details = 'Viewing legal & policies'
  }
  else if (document.location.pathname.startsWith('/search')) {
    presenceData.details = 'Searching'
    presenceData.smallImageKey = Assets.Search
    if (
      (await presence.getSetting<boolean>('showsearchterm'))
      && document.querySelector('.content-header > span')
    ) {
      presenceData.state = document.querySelector(
        '.content-header > span',
      )?.childNodes[1]?.textContent
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
