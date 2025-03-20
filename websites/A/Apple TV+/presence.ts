import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '835157562432290836',
})
const startTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/A/Apple%20TV%2B/assets/logo.png',
    details: 'Browsing...',
    smallImageKey: Assets.Search,
    startTimestamp,
  }
  const [showButton, showCover, useActivityName] = await Promise.all([
    presence.getSetting<boolean>('showButton'),
    presence.getSetting<boolean>('showCover'),
    presence.getSetting<boolean>('useActivityName'),
  ])
  const video = document.querySelector('video')

  if (
    video
    && document.querySelector('.video-player-tabs')?.textContent?.trim()
  ) {
    const title = document
      .querySelector('#video-player-title')
      ?.textContent
      ?.trim()
    const subtitle = document
      .querySelector('.scrim-footer__info-subtitle-text')
      ?.textContent
      ?.trim()
    const thumbnail = document.querySelector<HTMLSourceElement>(
      '.tabs__tab-pane.video-player-tabs__info-pane source',
    )

    if (!thumbnail)
      return
    if (useActivityName)
      presenceData.name = title

    if (subtitle) {
      const [seasonNumber, episodeNumber, episodeTitle] = subtitle
        .split(/, | · /)
        .flatMap(x => Number.parseInt(x.replace(/^S|^E/, '')) || x)

      presenceData.details = useActivityName ? (episodeTitle as string) : title
      presenceData.state = useActivityName
        ? `Season ${seasonNumber}, Episode ${episodeNumber}`
        : `S${seasonNumber}:E${episodeNumber} ${episodeTitle}`
    }
    else {
      presenceData.details = title
      presenceData.state = document
        .querySelector(
          '.typ-footnote-emph.video-player-tabs__info-pane-release-data-metadata',
        )
        ?.textContent
        ?.trim()
    }

    if (showCover) {
      presenceData.largeImageKey = thumbnail.srcset
        .split(' ')
        .find(x => x.startsWith('https://'))
    }

    if (!video.paused) {
      [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestampsfromMedia(video)
    }
    else {
      presenceData.smallImageKey = Assets.Pause
    }

    presenceData.buttons = [
      {
        label: `Watch ${subtitle ? 'Episode' : 'Show'}`,
        url: location.href,
      },
    ]
  }

  if (!showButton)
    delete presenceData.buttons

  presence.setActivity(presenceData)
})
