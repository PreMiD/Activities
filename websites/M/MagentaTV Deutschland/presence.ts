import { ActivityType, Assets, getTimestampsFromMedia } from 'premid'

const presence = new Presence({
  clientId: '1518224294465900564',
})

presence.on('UpdateData', async () => {
  const isMagentaMusik = location.hostname.includes('magentamusik.de')

  const video = document.querySelector<HTMLVideoElement>('video')

  const title = isMagentaMusik
    ? document.title.trim()
    : document.querySelector('#PARAGRAPH-TITLE')
      ?.textContent
      ?.trim()
      || document.title.replace('MagentaTV - ', '').trim()

  if (!title)
    return presence.clearActivity()

  const logoImage = document.querySelector<HTMLImageElement>('[id^="PARAGRAPH-LOGO"]')

  const logoUrl = isMagentaMusik
    ? 'https://i.ibb.co/Gf51vGdb/Magenta-Musik.png'
    : logoImage?.src
      ?.replace(/x=\d+/, 'x=250')
      ?.replace(/y=\d+/, 'y=250')
      ?.replace('ar=keep', 'ar=ignore')
      ?? 'https://i.ibb.co/JjPZDjqb/Magenta-TV.png'

  const isLive
    = !isMagentaMusik
      && document.querySelector('#PLAYER-PREVIOUS-CHANNEL') !== null

  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    largeImageKey:
      logoUrl,
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

    if (isMagentaMusik) {
      presenceData.name = 'MagentaMusik'
    }
  }

  const detailsLink = isMagentaMusik
    ? document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    : document.querySelector<HTMLAnchorElement>('#PLAYER-INFO-DETAILS')

  if (detailsLink?.href) {
    presenceData.buttons = [
      {
        label: 'View Details',
        url: detailsLink.href,
      },
    ]
  }

  if (video) {
    const { paused } = video

    presenceData.smallImageKey = isLive
      ? Assets.Live
      : paused
        ? Assets.Pause
        : Assets.Play

    if (!paused) {
      const [startTimestamp, endTimestamp] = getTimestampsFromMedia(video)

      presenceData.startTimestamp = startTimestamp
      presenceData.endTimestamp = endTimestamp
    }
  }
  else if (isLive) {
    presenceData.smallImageKey = Assets.Live
  }

  presence.setActivity(presenceData)
})
