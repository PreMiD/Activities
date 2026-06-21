import { ActivityType, Assets, getTimestampsFromMedia } from 'premid'

const presence = new Presence({
  clientId: '1518224294465900564',
})

presence.on('UpdateData', async () => {
  const video = document.querySelector('video')

  const title
    = document.querySelector('#PARAGRAPH-TITLE')
      ?.textContent
      ?.trim()
      || document.title.replace('MagentaTV - ', '').trim()

  if (!title)
    return presence.clearActivity()

  const logoImage = document.querySelector(
    '[id^="PARAGRAPH-LOGO"]',
  ) as HTMLImageElement | null

  const logoUrl = logoImage?.src
    ?.replace(/x=\d+/, 'x=250')
    ?.replace(/y=\d+/, 'y=250')
    ?.replace('ar=keep', 'ar=ignore')

  const isLive
    = document.querySelector('#PLAYER-PREVIOUS-CHANNEL') !== null

  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    largeImageKey:
      logoUrl
      ?? 'https://is1-ssl.mzstatic.com/image/thumb/PurpleSource211/v4/cc/0e/46/cc0e4697-6748-4d0d-81b4-e882be3c7df6/Placeholder.mill/512x512.png',
  }

  const parts = title.split(' - ')

  if (parts.length >= 3) {
    const seriesName = parts[0]!
    const seasonEpisode = parts[1]!
    const episodeTitle = parts.slice(2).join(' - ')

    presenceData.name = seriesName
    presenceData.details = episodeTitle
    presenceData.state = seasonEpisode
  }
  else {
    presenceData.details = title

    if (isLive)
      presenceData.state = 'Live TV'
  }

  const detailsLink = document.querySelector<HTMLAnchorElement>(
    '#PLAYER-INFO-DETAILS',
  )

  if (detailsLink?.href) {
    presenceData.buttons = [
      {
        label: 'View Details',
        url: detailsLink.href,
      },
    ]
  }

  if (video instanceof HTMLVideoElement) {
    const { paused } = video

    presenceData.smallImageKey = isLive
      ? Assets.Live
      : paused
        ? Assets.Pause
        : Assets.Play

    if (!paused) {
      const [startTimestamp, endTimestamp]
        = getTimestampsFromMedia(video)

      presenceData.startTimestamp = startTimestamp
      presenceData.endTimestamp = endTimestamp
    }
  }
  else if (isLive) {
    presenceData.smallImageKey = Assets.Live
  }

  presence.setActivity(presenceData)
})
