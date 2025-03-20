import { Assets } from 'premid'

interface ChannelSlotData {
  displayTitle: string
  start: string
  end: string
  seriesNumber?: number
  episodeNumber?: number
}

interface ChannelMetadata {
  id: string
  name: string
  slots: {
    now: ChannelSlotData
    next: ChannelSlotData
  }
  slug: string
}

interface LiveChannelNextData {
  props: {
    pageProps: {
      channelSlug: string
      channels: ChannelMetadata[]
    }
  }
}

interface CategoriesNextData {
  props: {
    pageProps: {
      category: {
        slug: string
        title: string
      }
    }
  }
}

interface ProgrammeNextData {
  props: {
    pageProps: {
      programme: {
        heroCtaLabel?: string
        title: string
      }
      episode: {
        productionType: string
        episode: number
        series: number
      }
    }
  }
}

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/I/ITVX/assets/logo.png',
}

const presence = new Presence({
  clientId: '1043125926793318420',
})

function fetchNextData<T>(): T | null {
  const nextDataElement = document.querySelector('#__NEXT_DATA__')

  if (!nextDataElement?.textContent)
    return null

  return JSON.parse(nextDataElement.textContent)
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: Date.now(),
  }
  const { pathname: path } = document.location
  const privacyMode = await presence.getSetting<boolean>('privacy')

  if (privacyMode) {
    presenceData.details = 'Watching ITVX'
  }
  else {
    switch (path) {
      case '/': {
        presenceData.details = 'Browsing ITVX'
        presenceData.state = 'Home Page'

        break
      }
      case '/watch': {
        const nextData = fetchNextData<LiveChannelNextData>()!
        // When you first go to watch a channel, the slug is null and the default channel is ITV1
        const currentChannelMetadata = nextData.props.pageProps.channels.find(
          x => x.slug === (nextData.props.pageProps.channelSlug || 'itv'),
        )!

        // At the moment, it doesn't seem the title of the current programme changes when it transitions from one programme
        // to the next. Use the channel slot data start and end times to determine which title to show.
        let currentSlot: ChannelSlotData

        const nowSlotTimestamps = [
          new Date(currentChannelMetadata.slots.now.start).getTime(),
          new Date(currentChannelMetadata.slots.now.end).getTime(),
        ]
        const timestampNow = Date.now()

        // If the current timestamp is after the slot starts, and before it ends
        if (
          timestampNow > nowSlotTimestamps[0]!
          && timestampNow < nowSlotTimestamps[1]!
        ) {
          currentSlot = currentChannelMetadata.slots.now
        }
        else {
          currentSlot = currentChannelMetadata.slots.next
        }

        const seriesNum = currentSlot.seriesNumber
        const epNum = currentSlot.episodeNumber

        presenceData.details = `Watching ${currentChannelMetadata.name} Live`
        presenceData.state = currentSlot.displayTitle
        presenceData.smallImageKey = Assets.Live
        presenceData.smallImageText = 'Live'

        if (seriesNum && epNum)
          presenceData.state += ` (S${seriesNum} E${epNum})`

        break
      }
      case '/watch/tv-guide': {
        presenceData.details = 'Browsing ITV'
        presenceData.state = 'Viewing the TV Guide'

        break
      }
      default:
        if (path.startsWith('/watch/collections/films')) {
          presenceData.details = 'Browsing ITVX'
          presenceData.state = 'Viewing Films'
        }
        else if (path.startsWith('/watch/categories')) {
          presenceData.details = 'Browsing ITVX'
          presenceData.state = `Viewing ${
            fetchNextData<CategoriesNextData>()?.props.pageProps.category.title
          } Category`
        }
        else if (
          /^[-+]?[0-9A-F]+(?:\.[0-9A-F]*)?$/i.test(
            path.split('/')[path.split('/').length - 1]!,
          )
        ) {
          delete presenceData.startTimestamp

          const nextData = fetchNextData<ProgrammeNextData>()!
          presenceData.details = `Watching ${nextData.props.pageProps.programme.title}`

          if (
            nextData.props.pageProps.programme.heroCtaLabel
            && nextData.props.pageProps.episode.productionType !== 'FILM'
          ) {
            presenceData.state = nextData.props.pageProps.programme.heroCtaLabel
          }

          const [video] = document.querySelectorAll('video')

          if (video && !video.paused) {
            [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(
              Math.floor(video.currentTime),
              Math.floor(video.duration),
            )

            presenceData.smallImageKey = Assets.Play
            presenceData.smallImageText = 'Playing'
          }
          else {
            presenceData.smallImageKey = Assets.Pause
            presenceData.smallImageText = 'Paused'
          }
        }
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
