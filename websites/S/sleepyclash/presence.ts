import { Assets } from "premid"

const presence = new Presence({
  clientId: "1256371948854972610"
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = "https://www.sleepyclash.com/static/uploads/Untitled.png",
  Controller = "https://www.sleepyclash.com/static/uploads/controller.png"
}

presence.on("UpdateData", async () => {
  const path = document.location.pathname
  const segments = path.split("/").filter(Boolean)
  let details = "Browsing"

  if (path === "/") {
    details = "Browsing"
  } else if (path.startsWith("/decks")) {
    details = "Finding Decks"
  } else if (path.startsWith("/deckrater")) {
    details = "Building a Deck"
  } else if (path.startsWith("/deck/")) {
    details = "Analyzing Decks"
  } else if (path === "/matchup") {
    details = "Browsing Matchups"
  } else if (path.startsWith("/matchup/advanced")) {
    details = "Analyzing Matchups"
  } else if (path.startsWith("/card_analytics")) {
    details = "Viewing Cards"
  } else if (path.startsWith("/card/")) {
    const cardName = segments[1]
      ?.replace(/_/g, " ")
      ?.replace(/\b\w/g, l => l.toUpperCase())
    details = `Viewing ${cardName}`
  } else if (path.startsWith("/top_players")) {
    details = "Viewing Top Players"
  } else if (path.startsWith("/top_clans")) {
    details = "Viewing Top Clans"
  } else if (path.startsWith("/clanlookup")) {
    details = "Browsing Clans"
  } else if (path.startsWith("/lookup")) {
    details = "Browsing Players"
  } else if (path.startsWith("/profile")) {
    details = "Viewing Profile"
  } else if (path.startsWith("/clan") && !path.startsWith("/clanlookup")) {
    details = "Analyzing Clan"
  } else if (path.startsWith("/player") || path.startsWith("/clan_member")) {
    details = "Analyzing Player"
  }

  const presenceData: PresenceData = {
    details: details,
    largeImageKey: ActivityAssets.Logo,
    smallImageKey: ActivityAssets.Controller,
    smallImageText: "Clash Royale",
    startTimestamp: browsingTimestamp
  }

  presence.setActivity(presenceData)
})