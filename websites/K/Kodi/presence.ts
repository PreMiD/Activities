import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1337578852888608838',
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/K/Kodi/assets/logo.png',
  }

  if (
    document.querySelector(
      'body.section-home.page-.active-player-kodi.kodi-shuffled-off.kodi-partymode-off.kodi-mute-off.kodi-repeat-off.kodi-media-audio.kodi-paused',
    )
  ) {
    const Name = document.querySelector('div.playing-title')
    const Artist = document.querySelector('div.playing-subtitle')
    presenceData.smallImageKey = Assets.Pause
    presenceData.smallImageText = 'Paused'

    presenceData.details = `${Name?.textContent} - ${Artist?.textContent}`
    presenceData.state = 'Paused'
  }
  else if (
    document.querySelector(
      'body.section-home.page-.active-player-kodi.kodi-shuffled-off.kodi-partymode-off.kodi-mute-off.kodi-repeat-all.kodi-media-audio.kodi-paused',
    )
  ) {
    const Name = document.querySelector('div.playing-title')
    const Artist = document.querySelector('div.playing-subtitle')
    presenceData.smallImageKey = Assets.Pause
    presenceData.smallImageText = 'Paused'

    presenceData.details = `${Name?.textContent} - ${Artist?.textContent}`
    presenceData.state = 'Paused'
  }
  else if (
    document.querySelector(
      'body.section-home.page-.active-player-kodi.kodi-shuffled-off.kodi-partymode-off.kodi-mute-off.kodi-repeat-one.kodi-media-audio.kodi-paused',
    )
  ) {
    const Name = document.querySelector('div.playing-title')
    const Artist = document.querySelector('div.playing-subtitle')
    presenceData.smallImageKey = Assets.Pause
    presenceData.smallImageText = 'Paused'

    presenceData.details = `${Name?.textContent} - ${Artist?.textContent}`
    presenceData.state = 'Paused'
  }
  else if (
    document.querySelector(
      'body.section-home.page-.active-player-kodi.kodi-shuffled-on.kodi-partymode-off.kodi-mute-off.kodi-repeat-off.kodi-media-audio.kodi-paused',
    )
  ) {
    const Name = document.querySelector('div.playing-title')
    const Artist = document.querySelector('div.playing-subtitle')
    presenceData.smallImageKey = Assets.Pause
    presenceData.smallImageText = 'Paused'

    presenceData.details = `${Name?.textContent} - ${Artist?.textContent}`
    presenceData.state = 'Paused'
  }
  else if (
    document.querySelector(
      'body.section-home.page-.active-player-kodi.kodi-shuffled-on.kodi-partymode-off.kodi-mute-off.kodi-repeat-one.kodi-media-audio.kodi-paused',
    )
  ) {
    const Name = document.querySelector('div.playing-title')
    const Artist = document.querySelector('div.playing-subtitle')
    presenceData.smallImageKey = Assets.Pause
    presenceData.smallImageText = 'Paused'

    presenceData.details = `${Name?.textContent} - ${Artist?.textContent}`
    presenceData.state = 'Paused'
  }
  else if (
    document.querySelector(
      'body.section-home.page-.active-player-kodi.kodi-shuffled-on.kodi-partymode-off.kodi-mute-off.kodi-repeat-all.kodi-media-audio.kodi-paused',
    )
  ) {
    const Name = document.querySelector('div.playing-title')
    const Artist = document.querySelector('div.playing-subtitle')
    presenceData.smallImageKey = Assets.Pause
    presenceData.smallImageText = 'Paused'

    presenceData.details = `${Name?.textContent} - ${Artist?.textContent}`
    presenceData.state = 'Paused'
  }
  else if (
    document.querySelector(
      'body.section-home.page-.active-player-kodi.kodi-shuffled-off.kodi-partymode-off.kodi-mute-off.kodi-repeat-off.kodi-media-audio.kodi-playing',
    )
  ) {
    const Name = document.querySelector('div.playing-title')
    const Artist = document.querySelector('div.playing-subtitle')
    const timeElapsed = document.querySelector('div.playing-time-current')
    const timeDuration = document.querySelector('div.playing-time-duration')
    presenceData.smallImageKey = Assets.Play
    presenceData.smallImageText = 'Playing'

    presenceData.details = `${Name?.textContent} - ${Artist?.textContent}`
    presenceData.state = `${timeElapsed?.textContent}/${timeDuration?.textContent}`
  }
  else if (
    document.querySelector(
      'body.section-home.page-.active-player-kodi.kodi-shuffled-on.kodi-partymode-off.kodi-mute-off.kodi-repeat-off.kodi-media-audio.kodi-playing',
    )
  ) {
    const Name = document.querySelector('div.playing-title')
    const Artist = document.querySelector('div.playing-subtitle')
    const timeElapsed = document.querySelector('div.playing-time-current')
    const timeDuration = document.querySelector('div.playing-time-duration')
    presenceData.smallImageKey = Assets.Play
    presenceData.smallImageText = 'Playing'

    presenceData.details = `${Name?.textContent} - ${Artist?.textContent}`
    presenceData.state = `${timeElapsed?.textContent}/${timeDuration?.textContent}`
  }
  else if (
    document.querySelector(
      'body.section-home.page-.active-player-kodi.kodi-shuffled-off.kodi-partymode-off.kodi-mute-off.kodi-repeat-all.kodi-media-audio.kodi-playing',
    )
  ) {
    const Name = document.querySelector('div.playing-title')
    const Artist = document.querySelector('div.playing-subtitle')
    const timeElapsed = document.querySelector('div.playing-time-current')
    const timeDuration = document.querySelector('div.playing-time-duration')
    presenceData.smallImageKey = Assets.Repeat
    presenceData.smallImageText = 'Repeating'

    presenceData.details = `${Name?.textContent} - ${Artist?.textContent}`
    presenceData.state = `${timeElapsed?.textContent}/${timeDuration?.textContent}`
  }
  else if (
    document.querySelector(
      'body.section-home.page-.active-player-kodi.kodi-shuffled-off.kodi-partymode-off.kodi-mute-off.kodi-repeat-one.kodi-media-audio.kodi-playing',
    )
  ) {
    const Name = document.querySelector('div.playing-title')
    const Artist = document.querySelector('div.playing-subtitle')
    const timeElapsed = document.querySelector('div.playing-time-current')
    const timeDuration = document.querySelector('div.playing-time-duration')
    presenceData.smallImageKey = Assets.RepeatOne
    presenceData.smallImageText = 'Repeating'

    presenceData.details = `${Name?.textContent} - ${Artist?.textContent}`
    presenceData.state = `${timeElapsed?.textContent}/${timeDuration?.textContent}`
  }
  else if (
    document.querySelector(
      'body.section-home.page-.active-player-kodi.kodi-shuffled-on.kodi-partymode-off.kodi-mute-off.kodi-repeat-all.kodi-media-audio.kodi-playing',
    )
  ) {
    const Name = document.querySelector('div.playing-title')
    const Artist = document.querySelector('div.playing-subtitle')
    const timeElapsed = document.querySelector('div.playing-time-current')
    const timeDuration = document.querySelector('div.playing-time-duration')
    presenceData.smallImageKey = Assets.Repeat
    presenceData.smallImageText = 'Repeating'

    presenceData.details = `${Name?.textContent} - ${Artist?.textContent}`
    presenceData.state = `${timeElapsed?.textContent}/${timeDuration?.textContent}`
  }
  else if (
    document.querySelector(
      'body.section-home.page-.active-player-kodi.kodi-shuffled-on.kodi-partymode-off.kodi-mute-off.kodi-repeat-one.kodi-media-audio.kodi-playing',
    )
  ) {
    const Name = document.querySelector('div.playing-title')
    const Artist = document.querySelector('div.playing-subtitle')
    const timeElapsed = document.querySelector('div.playing-time-current')
    const timeDuration = document.querySelector('div.playing-time-duration')
    presenceData.smallImageKey = Assets.RepeatOne
    presenceData.smallImageText = 'Repeating'

    presenceData.details = `${Name?.textContent} - ${Artist?.textContent}`
    presenceData.state = `${timeElapsed?.textContent}/${timeDuration?.textContent}`
  }
  else if (
    document.querySelector(
      'body.section-home.page-.active-player-kodi.kodi-shuffled-off.kodi-partymode-off.kodi-mute-off.kodi-repeat-off.kodi-media-audio.kodi-not-playing',
    )
  ) {
    const Name = document.querySelector('div.playing-title')
    presenceData.smallImageKey = Assets.Stop
    presenceData.smallImageText = 'Stopped'

    presenceData.details = Name?.textContent
    presenceData.state = 'Stopped'
  }
  else if (
    document.querySelector(
      'body.section-home.page-.active-player-kodi.kodi-shuffled-on.kodi-partymode-off.kodi-mute-off.kodi-repeat-off.kodi-media-audio.kodi-not-playing',
    )
  ) {
    const Name = document.querySelector('div.playing-title')
    presenceData.smallImageKey = Assets.Stop
    presenceData.smallImageText = 'Stopped'

    presenceData.details = Name?.textContent
    presenceData.state = 'Stopped'
  }
  else if (
    document.querySelector(
      'body.section-home.page-.active-player-kodi.kodi-shuffled-off.kodi-partymode-off.kodi-mute-off.kodi-repeat-off.kodi-media-video.kodi-paused',
    )
  ) {
    const Name = document.querySelector('div.playing-title')
    presenceData.smallImageKey = Assets.Pause
    presenceData.smallImageText = 'Paused'

    presenceData.details = `Watching: ${Name?.textContent}`
    presenceData.state = 'Paused'
  }
  else if (
    document.querySelector(
      'body.section-home.page-.active-player-kodi.kodi-shuffled-off.kodi-partymode-off.kodi-mute-off.kodi-repeat-off.kodi-media-video.kodi-playing',
    )
  ) {
    const Name = document.querySelector('div.playing-title')
    const timeElapsed = document.querySelector('div.playing-time-current')
    const timeDuration = document.querySelector('div.playing-time-duration')
    presenceData.smallImageKey = Assets.Play
    presenceData.smallImageText = 'Playing'

    presenceData.details = `Watching: ${Name?.textContent}`
    presenceData.state = `${timeElapsed?.textContent}/${timeDuration?.textContent}`
  }
  else if (
    document.querySelector(
      'body.section-home.page-.active-player-kodi.kodi-shuffled-off.kodi-partymode-off.kodi-mute-off.kodi-repeat-all.kodi-media-video.kodi-playing',
    )
  ) {
    const Name = document.querySelector('div.playing-title')
    const timeElapsed = document.querySelector('div.playing-time-current')
    const timeDuration = document.querySelector('div.playing-time-duration')
    presenceData.smallImageKey = Assets.Repeat
    presenceData.smallImageText = 'Repeating'

    presenceData.details = `Watching: ${Name?.textContent}`
    presenceData.state = `${timeElapsed?.textContent}/${timeDuration?.textContent}`
  }
  else if (
    document.querySelector(
      'body.section-home.page-.active-player-kodi.kodi-shuffled-off.kodi-partymode-off.kodi-mute-off.kodi-repeat-one.kodi-media-video.kodi-playing',
    )
  ) {
    const Name = document.querySelector('div.playing-title')
    const timeElapsed = document.querySelector('div.playing-time-current')
    const timeDuration = document.querySelector('div.playing-time-duration')
    presenceData.smallImageKey = Assets.RepeatOne
    presenceData.smallImageText = 'Repeating'
    presenceData.details = `Watching: ${Name?.textContent}`
    presenceData.state = `${timeElapsed?.textContent}/${timeDuration?.textContent}`
  }
  else if (
    document.querySelector(
      'body.section-home.page-.active-player-kodi.kodi-shuffled-off.kodi-partymode-off.kodi-mute-off.kodi-repeat-all.kodi-media-video.kodi-paused',
    )
  ) {
    const Name = document.querySelector('div.playing-title')
    presenceData.smallImageKey = Assets.Pause
    presenceData.smallImageText = 'Paused'

    presenceData.details = `Watching: ${Name?.textContent}`
    presenceData.state = 'Paused'
  }
  else if (
    document.querySelector(
      'body.section-home.page-.active-player-kodi.kodi-shuffled-off.kodi-partymode-off.kodi-mute-off.kodi-repeat-one.kodi-media-video.kodi-paused',
    )
  ) {
    const Name = document.querySelector('div.playing-title')
    presenceData.smallImageKey = Assets.Pause
    presenceData.smallImageText = 'Paused'

    presenceData.details = `Watching: ${Name?.textContent}`
    presenceData.state = 'Paused'
  }
  else if (
    document.querySelector(
      'body.section-home.page-.active-player-kodi.kodi-shuffled-on.kodi-partymode-off.kodi-mute-off.kodi-repeat-off.kodi-media-video.kodi-playing',
    )
  ) {
    const Name = document.querySelector('div.playing-title')
    const timeElapsed = document.querySelector('div.playing-time-current')
    const timeDuration = document.querySelector('div.playing-time-duration')
    presenceData.smallImageKey = Assets.Play
    presenceData.smallImageText = 'Playing'

    presenceData.details = `Watching: ${Name?.textContent}`
    presenceData.state = `${timeElapsed?.textContent}/${timeDuration?.textContent}`
  }
  else if (
    document.querySelector(
      'body.section-home.page-.active-player-kodi.kodi-shuffled-on.kodi-partymode-off.kodi-mute-off.kodi-repeat-all.kodi-media-video.kodi-playing',
    )
  ) {
    const Name = document.querySelector('div.playing-title')
    const timeElapsed = document.querySelector('div.playing-time-current')
    const timeDuration = document.querySelector('div.playing-time-duration')
    presenceData.smallImageKey = Assets.Repeat
    presenceData.smallImageText = 'Repeating'

    presenceData.details = `Watching: ${Name?.textContent}`
    presenceData.state = `${timeElapsed?.textContent}/${timeDuration?.textContent}`
  }
  else if (
    document.querySelector(
      'body.section-home.page-.active-player-kodi.kodi-shuffled-on.kodi-partymode-off.kodi-mute-off.kodi-repeat-one.kodi-media-video.kodi-playing',
    )
  ) {
    const Name = document.querySelector('div.playing-title')
    const timeElapsed = document.querySelector('div.playing-time-current')
    const timeDuration = document.querySelector('div.playing-time-duration')
    presenceData.smallImageKey = Assets.RepeatOne
    presenceData.smallImageText = 'Repeating'

    presenceData.details = `Watching: ${Name?.textContent}`
    presenceData.state = `${timeElapsed?.textContent}/${timeDuration?.textContent}`
  }
  else if (
    document.querySelector(
      'body.section-home.page-.active-player-kodi.kodi-shuffled-on.kodi-partymode-off.kodi-mute-off.kodi-repeat-all.kodi-media-video.kodi-paused',
    )
  ) {
    const Name = document.querySelector('div.playing-title')
    presenceData.smallImageKey = Assets.Pause
    presenceData.smallImageText = 'Paused'

    presenceData.details = `Watching: ${Name?.textContent}`
    presenceData.state = 'Paused'
  }
  else if (
    document.querySelector(
      'body.section-home.page-.active-player-kodi.kodi-shuffled-on.kodi-partymode-off.kodi-mute-off.kodi-repeat-one.kodi-media-video.kodi-paused',
    )
  ) {
    const Name = document.querySelector('div.playing-title')
    presenceData.smallImageKey = Assets.Pause
    presenceData.smallImageText = 'Paused'

    presenceData.details = `Watching: ${Name?.textContent}`
    presenceData.state = 'Paused'
  }
  else {
    const Name = document.querySelector('div.playing-title')
    const Artist = document.querySelector('div.playing-subtitle')
    const timeElapsed = document.querySelector('div.playing-time-current')
    const timeDuration = document.querySelector('div.playing-time-duration')
    presenceData.smallImageKey = Assets.Play
    presenceData.smallImageText = 'Playing'

    presenceData.details = `${Name?.textContent} - ${Artist?.textContent}`
    presenceData.state = `${timeElapsed?.textContent}/${timeDuration?.textContent}`
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
