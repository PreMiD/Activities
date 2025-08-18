import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '801743263052726292',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)
let studioTimestamp : number = 0

enum ActivityAssets {
  Logo = 'https://assets.stickpng.com/images/631205e3b661e15cdf54dede.png',
  Paused = 'https://cdn.discordapp.com/app-assets/801743263052726292/1406529845537673246.png',
  Playing = 'https://cdn.discordapp.com/app-assets/801743263052726292/1406529845738995772.png',
  Search = 'https://cdn.discordapp.com/app-assets/801743263052726292/1406882846286807152.png'
}

presence.on('UpdateData', async () => {
  const showButtons = await presence.getSetting<boolean>('showButtons')
  const privacyMode = await presence.getSetting<boolean>('privacyMode')
  const privacyModeStrict = await presence.getSetting<boolean>('privacyModeStrict')
  const userLanguage = await presence.getSetting<string>('lang') || "en"
  const titleArtistFormat = await presence.getSetting<string>('titleArtistFormat') || "%title% - %artist%"
  
  const strings = await presence.getStrings({
    play: 'general.playing',
    pause: 'general.paused',
    browse: 'general.browsing',
    view: 'general.view',
    buttonViewSong: 'general.buttonViewSong',
    listening: 'general.listeningTo',
    listening_unspecified: 'general.listeningMusic',
    viewUser: 'general.viewUser',
    readingADM: 'general.readingADM',
    readingDM: 'general.readingDM',
    buttonViewPage: 'general.buttonViewPage',
    trending: 'bandlab.trending',
    following: 'bandlab.following',
    forYou: 'bandlab.forYou',
    videoBrowse: 'bandlab.video',
    comms: 'bandlab.comms',
    watching: 'general.watching',
    buttonWatchVideo: 'general.buttonWatchVideo',
    videoTarget: 'bandlab.videoTarget',
    searchUnspecified: 'general.searchSomething',
    search: 'general.searchFor',
    searchHint: 'general.search'
  })

  function firstSrcFromSrcsetProvided(e: Element | null): string | undefined {
    return e === null ? ActivityAssets.Logo : e.getAttribute("srcset")?.split(" ")[0] 
    // Reads the first image in srcset - images on BandLab have multiple src's, we only need one for the scope of the RPC
    // If e doesn't exist, safely return BandLab logo
  }

  const { pathname, search, href } = document.location

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: studioTimestamp != 0 ? studioTimestamp : browsingTimestamp,
    type: ActivityType.Playing
  }

  if (pathname.startsWith("/feed/")) {
    presenceData.details = strings.browse

    if (pathname.includes("trending")) {
      presenceData.state = "Looking at what's trending"
    } else if (pathname.includes("following")) {
      presenceData.state = "Catching up with the people they follow"
    } else if (pathname.includes("for-you")) {
      presenceData.state = "The For You page"
    } else if (pathname.includes("video")) {
      if (search.trim() === "") {
        // User is just browsing the video feed
        presenceData.state = "Looking at popular videos"
      } else if (search.includes("postId")) {
        // User is watching a specific video
        presenceData.details = strings.watching

        let videoAuthor: {
          element: Element | null;
          target: string;
          username: string
        } = {
          element: null,
          target: "",
          username: ""
        }

        let homeElement : Element | null = document.querySelector("post-card-header-content > div > .post-card-header-title > a") // Grabs the link element that points to the originating account in the video player

        if (homeElement) {
          videoAuthor.element = homeElement
          videoAuthor.target = homeElement?.getAttribute("href") || "" // The link to the account
          videoAuthor.username = homeElement?.textContent || "a BandLab user" // The display name of the account
        }

        if (showButtons) {
          presenceData.buttons = [
            {
              label: strings.buttonWatchVideo,
              url: href
            },
            {
              label: strings.viewUser,
              url: videoAuthor.target
            }
          ]
        }

        presenceData.state = "A video by [1]".replace("[1]",videoAuthor.username)
      }
    } else if (pathname.includes("communities")) {
      presenceData.state = "Looking for communities"
    }
  }

  if (pathname.startsWith("/library/projects/") && !pathname.includes("likes")) {
    presenceData.state = "Looking at their saved projects"
  }

  if (pathname.startsWith("/track/")) {
    studioTimestamp = 0 // Reset Studio timestamp here, because people leaving Studio get sent to a /track/ link

    let isPublic : boolean = document.querySelector("post-private-badge") === null; // Verifies that the post is public by checking if the "Private" badge exists

    if (!isPublic && privacyMode) {
      presenceData.state = strings.listening_unspecified
    } else {
      let title : string = document.querySelector(".track-page-player-title-name")?.textContent?.trim() || "A song"
      let artist : string = document.querySelector("a.track-card-subtitle-text")?.textContent?.trim() || "someone"

      presenceData.details = strings.view
      presenceData.state = titleArtistFormat.replace("%title%",title).replace("%artist%",artist) // Example: tell me - ToxiPlays

      presenceData.largeImageKey = firstSrcFromSrcsetProvided(document.querySelector("img.ds-cover")) // Set Discord Activity image to first provided copy of song cover art
      presenceData.smallImageKey = ActivityAssets.Logo
      presenceData.smallImageText = "BandLab"

      if (isPublic && showButtons) {
        presenceData.buttons = [
          {
            label: strings.buttonViewSong,
            url: href
          }
        ]
      }

      let bottomPlayButton : Element | null = document.querySelector("button.ds-play-button")
      if (bottomPlayButton) { // Has the audio player on the bottom been engaged?
        if (bottomPlayButton.className.includes("status-paused")) {
          presenceData.smallImageKey = ActivityAssets.Paused,
          presenceData.smallImageText = strings.pause
        } else if (bottomPlayButton.className.includes("status-playing")) {
          presenceData.details = strings.listening.replace("{0}{1}",`:`) // Listening to:
          presenceData.smallImageKey = ActivityAssets.Playing,
          presenceData.smallImageText = strings.play
        }
      }
    }
  }

  if (pathname.includes("/studio")) {
    presenceData.details = "In the Studio"

    if (studioTimestamp === 0) {
      studioTimestamp = Math.floor(Date.now() / 1000)
    }

    if (privacyMode) {
      presenceData.state = "Cooking up some heat"
    } else {
      let inputBox : HTMLInputElement = document.getElementById("studio-project-name-input")
      let title : string = inputBox.value.trim() || "New Project"
      presenceData.state = "Working on project: {0}".replace("{0}",title)
    }
  }

  if (pathname.startsWith("/chat")) {

    if (privacyModeStrict) {
      presenceData.state = strings.readingADM
    } else if (!privacyModeStrict && document.querySelector("header.conversation-partner")) { // Checking if user info for the DM recipient exists
      let dmRecipientName : string | null | undefined = document.querySelector(".profile-tile-title > a")?.textContent
      let dmSubtitleName : string | null | undefined = document.querySelector(".profile-tile-subtitle-wrap > ng-pluralize")?.textContent || document.querySelector(".profile-tile-subtitle-wrap > a")?.textContent || "a BandLab user" // Checking for band ("X Members") or user ("@username")
      
      presenceData.details = strings.readingDM
      presenceData.state = `${dmRecipientName} (${dmSubtitleName})`

      presenceData.largeImageKey = firstSrcFromSrcsetProvided(document.querySelector("header.profile-tile-header > a > img.profile-tile-picture") || document.querySelector("a.profile-tile-header > img")) // 1: User DMs, 2: Band DMs

      presenceData.smallImageKey = ActivityAssets.Logo
      presenceData.smallImageText = "BandLab"
    } else {
      presenceData.state = strings.readingADM
    }
  }

  if (pathname.startsWith("/search/")) {
    presenceData.smallImageKey = ActivityAssets.Search
    presenceData.smallImageText = strings.searchHint

    if (privacyModeStrict) {
      presenceData.state = strings.searchUnspecified
    } else {
      presenceData.details = strings.search
      presenceData.state = new URLSearchParams(document.location.search).get("q") // Get search query from URL parameter
    }
  }

  if (document.querySelector(".profile-card-title") != null) {
    // We are on a profile page (we can't test on a specific pathname for these kinds of pages)
    // Either that, or we are on a band starting with "/band/" - they have similar formats
    
    presenceData.details = pathname.startsWith("/band/") ? "Viewing band:" : strings.viewUser
    presenceData.buttons = [
      {
        label: strings.buttonViewPage,
        url: href
      }
    ]

    let pfp : string = firstSrcFromSrcsetProvided(document.querySelector(".profile-card-picture > a > img")) // Grab first profile picture of user available

    if (pfp != ActivityAssets.Logo) {
      presenceData.largeImageKey = pfp
      presenceData.smallImageKey = ActivityAssets.Logo
      presenceData.smallImageText = "BandLab"
    } else {
      presenceData.largeImageKey = ActivityAssets.Logo
    }

    presenceData.state = `${document.querySelector(".profile-card-title")?.textContent?.trim()}${pathname.startsWith("/band/") ? "" : " ("+document.querySelector(".profile-card-subtitle > a")?.textContent?.trim()+")"}` // For users... [display name] {@[username]} | Example: JoeSchmoe (@j_milbo). For bands... Just shows the band name
  }

  if (presenceData.state) {
    presence.setActivity(presenceData)
  } else {
    presence.clearActivity()
  }
})
