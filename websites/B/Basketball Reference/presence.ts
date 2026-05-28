const presence = new Presence({
  clientId: "1509365921674952724",
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on("UpdateData", async () => {
  const presenceData: PresenceData = {
    largeImageKey: "https://cdn.rcd.gg/PreMiD/websites/B/BasketballReference/assets/logo.png",
    startTimestamp: browsingTimestamp,
  }

  const { pathname } = document.location

  if (pathname.match(/^\/players\/[a-z]\/\w+\.html/)) {
    const playerName =
      (document.querySelector("h1[itemprop='name']")?.textContent || "").trim()
      || (document.title.split(" Stats")[0] || "").trim()
    presenceData.details = "Viewing player stats"
    presenceData.state = playerName
  }
  else if (pathname.match(/^\/teams\/[A-Z]+\/\d+\.html/)) {
    const teamName =
      (document.querySelector("h1")?.textContent || "").trim()
      || (document.title.split(" Roster")[0] || "").trim()
    presenceData.details = "Viewing team stats"
    presenceData.state = teamName
  }
  else if (pathname.match(/^\/leagues\/NBA_\d+\.html/)) {
    const season = pathname.match(/NBA_(\d+)/)?.[1] || ""
    presenceData.details = "Browsing season"
    presenceData.state = `NBA ${season}`
  }
  else if (pathname.startsWith("/boxscores/")) {
    presenceData.details = "Viewing box score"
    presenceData.state = document.title.replace(" Box Score", "").trim()
  }
  else if (pathname.startsWith("/leaders/")) {
    presenceData.details = "Browsing leaders & records"
    presenceData.state = "NBA Leaders"
  }
  else if (pathname.startsWith("/playoffs/")) {
    const year = pathname.match(/\d{4}/)?.[0] || ""
    presenceData.details = "Browsing playoffs"
    presenceData.state = `NBA Playoffs ${year}`
  }
  else if (pathname.includes("/search/")) {
    const query = new URLSearchParams(document.location.search).get("search") || ""
    presenceData.details = "Searching"
    presenceData.state = `"${query}"`
  }
  else {
    presenceData.details = "Browsing Basketball Reference"
    presenceData.state = "basketball-reference.com"
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else 
    presence.setActivity()
})
