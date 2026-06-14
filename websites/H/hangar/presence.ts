const presence = new Presence({
  clientId: "1004301145348526090"
})

const startTimestamp = Math.floor(Date.now() / 1000)
const defaultImage = "logo"

presence.on("UpdateData", async () => {
  const title = document.title || "Hangar"
  const path = window.location.pathname

  const presenceData: PresenceData = {
    largeImageKey: defaultImage,
    largeImageText: "usehangar.gg",
    startTimestamp,
    details: "Browsing Hangar",
    state: "Viewing pages"
  }

  if (path === "/" || path === "/feed") {
    presenceData.details = "Browsing the homepage"
    presenceData.state = "Viewing the feed"
  } else if (path.startsWith("/hub/")) {
    const hubName = title.split(" | ")[0] || "A Hub"

    presenceData.details = "Viewing a Hub"
    presenceData.state = hubName
    presenceData.smallImageKey = defaultImage
    presenceData.smallImageText = "Hangar"
  } else if (path.startsWith("/profile/")) {
    const user = title.split(" | ")[0] || "A profile"

    presenceData.details = "Viewing a profile"
    presenceData.state = user
  } else if (path.startsWith("/post/")) {
    const postTitle = title.split(" | ")[0] || "A post"

    presenceData.details = "Reading a post"
    presenceData.state = postTitle
  }

  presence.setActivity(presenceData)
})
