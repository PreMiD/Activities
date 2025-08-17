import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '801743263052726292',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)
let studioTimestamp = 0

enum ActivityAssets {
  Logo = 'https://assets.stickpng.com/images/631205e3b661e15cdf54dede.png',
  Paused = 'https://cdn.discordapp.com/app-assets/801743263052726292/1406529845537673246.png',
  Playing = 'https://cdn.discordapp.com/app-assets/801743263052726292/1406529845738995772.png'
}

presence.on('UpdateData', async () => {
  const showButtons = await presence.getSetting<boolean>('showButtons')
  const privacyMode = await presence.getSetting<boolean>('privacyMode')
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
    buttonViewPage: 'general.buttonViewPage',
    trending: 'bandlab.trending',
    following: 'bandlab.following',
    forYou: 'bandlab.forYou',
    videoBrowse: 'bandlab.video',
    comms: 'bandlab.comms',
    watching: 'general.watching',
    buttonWatchVideo: 'general.buttonWatchVideo',
    videoTarget: 'bandlab.videoTarget'
  })

  const { pathname, search, href } = document.location

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: studioTimestamp != 0 ? studioTimestamp : browsingTimestamp,
    type: ActivityType.Playing
  }

  if (pathname.startsWith("/feed/")) {
    presenceData.details = strings.browse

    if (pathname.includes("trending")) {
      presenceData.state = strings.trending
    } else if (pathname.includes("following")) {
      presenceData.state = strings.following
    } else if (pathname.includes("for-you")) {
      presenceData.state = strings.forYou
    } else if (pathname.includes("video")) {
      if (search.trim() === "") {
        // User is just browsing the video feed
        presenceData.state = strings.videoBrowse
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

        let homeElement = document.querySelector("post-card-header-content > div > .post-card-header-title > a") // Grabs the link element that points to the originating account in the video player

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

        presenceData.state = strings.videoTarget.replace("[1]",videoAuthor.username)
      }
    } else if (pathname.includes("communities")) {
      presenceData.state = strings.comms
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

      presenceData.largeImageKey = document.querySelector("img.ds-cover")?.getAttribute("srcset")?.split(" ")[0] || ActivityAssets.Logo // Set Discord Activity image to first provided copy of song cover art

      if (isPublic && showButtons) {
        presenceData.buttons = [
          {
            label: strings.buttonViewSong,
            url: href
          }
        ]
      }

      let bottomPlayButton = document.querySelector("button.ds-play-button")
      if (bottomPlayButton != null) { // Has the audio player on the bottom been engaged?
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
      let inputBox = document.getElementById("studio-project-name-input") as HTMLInputElement
      let title = inputBox.value.trim() || "New Project"
      presenceData.state = "Working on project: {0}".replace("{0}",title)
    }
  }

  if (pathname.startsWith("/chat")) {
    // User is reading a DM
    // Not sure how much can/should be done in this case respecting users' privacy... static text change for now
    presenceData.state = strings.readingADM
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

    let pfp = document.querySelector(".profile-card-picture > a > img")?.getAttribute("srcset")?.split(" ")[0] // Grab first profile picture of user available
    if (pfp != null) {
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
