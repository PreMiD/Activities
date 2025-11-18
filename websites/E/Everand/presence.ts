import { ActivityType, Assets, getTimestampsFromMedia } from 'premid'

const presence = new Presence({
  clientId: '1439336857077944623',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://i.imgur.com/6fv0fpL.png',
}

presence.on('UpdateData', async () => {
  const strings = await presence.getStrings({
    viewHome: 'general.viewHome',
    searchingSomething: 'general.searchSomething',
    browsing: 'general.browsing',
    browsingBooks: 'everand.browsingBooks',
    browsingAudiobooks: 'everand.browsingAudiobooks',
    browsingPodcasts: 'everand.browsingPodcasts',
    listeningToAudiobook: 'everand.listeningToAudiobook',
    listeningToPodcast: 'everand.listeningToPodcast',
    readingBook: 'everand.readingBook',
    reading: 'everand.reading',
    by: 'everand.by',
    unknownAudiobook: 'everand.unknownAudiobook',
    unknownPodcast: 'everand.unknownPodcast',
    unknownBook: 'everand.unknownBook',
    unknownAuthor: 'everand.unknownAuthor',
  })

  const privacyMode: boolean = await presence.getSetting('privacyMode')

  const { pathname } = document.location

  switch (true) {
    // Listening to a podcast
    case pathname.includes('/listen/podcast'): {
      if (privacyMode) {
        presence.setActivity({
          type: ActivityType.Listening,
          name: 'Everand',
          largeImageKey: ActivityAssets.Logo,
          details: strings.listeningToPodcast,
          startTimestamp: browsingTimestamp,
        })
      } else {
        const title = getFirstText('.title > a') ?? strings.unknownPodcast
        const author = getFirstText('.author > a') ?? strings.unknownAuthor
        presence.setActivity(await createAudioPresence('audioplayer', title, author))
      }
      return
    }
    // Listening to an audiobook
    case pathname.includes('/listen'): {
      if (privacyMode) {
        presence.setActivity({
          type: ActivityType.Listening,
          name: 'Everand',
          largeImageKey: ActivityAssets.Logo,
          details: strings.listeningToAudiobook,
          startTimestamp: browsingTimestamp,
        })
      } else {
        const title = getFirstText('.title > a') ?? strings.unknownAudiobook
        const author = getFirstText('.author > a') ?? strings.unknownAuthor
        const contentId = pathname.match(/(\d+)/)?.[1]
        presence.setActivity(await createAudioPresence(contentId, title, author))
      }
      return
    }
    // Reading a book
    case pathname.includes('/read'): {
      if (privacyMode) {
        presence.setActivity({
          name: 'Everand',
          largeImageKey: ActivityAssets.Logo,
          details: strings.readingBook,
          startTimestamp: browsingTimestamp,
        })
      } else {
        const title = document.title ?? strings.unknownBook
        presence.setActivity({
          name: 'Everand',
          largeImageKey: ActivityAssets.Logo,
          details: `${strings.reading} ${title}`,
          startTimestamp: browsingTimestamp,
        })
      } 
      return
    }
  }

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  switch (true) {
    case pathname.includes('/home'):
      presenceData.details = strings.viewHome
      break
    case pathname.includes('/search'):
      presenceData.details = strings.searchingSomething
      break
    case pathname.includes('/books'):
      presenceData.details = strings.browsingBooks
      break
    case pathname.includes('/audiobooks'):
      presenceData.details = strings.browsingAudiobooks
      break
    case pathname.includes('/podcasts'):
      presenceData.details = strings.browsingPodcasts
      break
  }

  presence.setActivity(presenceData)
})

function getFirstText(selectors: string): string | null {
  const element = document.querySelector(selectors)
  if (!element) {
    return null
  }
  const firstChild = element.firstChild
  if (!firstChild || firstChild.nodeType !== Node.TEXT_NODE) {
    return null
  }
  return firstChild.nodeValue
}

async function createAudioPresence(audioElementId: string | undefined, title: string, author: string): Promise<PresenceData> {
  const presenceData: PresenceData = {
    type: ActivityType.Listening,
    name: 'Everand',
    largeImageKey: ActivityAssets.Logo,

    details: title,
    state: `By: ${author}`,
    statusDisplayType: 2 // StatusDisplayType.Details
  }

  const cover = document.querySelector('img.cover')
  const showCoverArt: boolean = await presence.getSetting("showCover")
  if (showCoverArt && cover && cover instanceof HTMLImageElement) {
    presenceData.largeImageKey = cover.src
  }

  const audioElement = document.getElementById(audioElementId!)
  if (audioElement && audioElement instanceof HTMLAudioElement) {
    if (audioElement.paused) {
      presenceData.smallImageKey = Assets.Pause
    } else {
      presenceData.smallImageKey = Assets.Play;
      [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestampsFromMedia(audioElement)
    }
  }

  return presenceData
}