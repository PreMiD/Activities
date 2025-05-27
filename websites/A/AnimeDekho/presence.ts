import { Assets, ActivityType } from "premid";

const presence = new Presence({
  clientId: "", // Fill this if you have a custom clientId
});

const browsingTimestamp = Math.floor(Date.now() / 1000);

// Removed custom ActivityType enum; using ActivityType from "premid"

enum ActivityAssets {
  Logo = "animedekho", // This should match your uploaded PreMiD asset key
}

presence.on("UpdateData", async () => {
  // Try to get the anime title
  const titleElement = document.querySelector("h1.entry-title, h1.title, .anime-title");
  // Try to get episode and season info (adjust selectors as needed)
  const episodeElement = document.querySelector(".ep-title, .episode-title, .entry-title span, .episode, .ep");
  const seasonElement = document.querySelector(".season, .season-title");

  const animeTitle = titleElement?.textContent?.trim() || "Unknown Anime";
  const episode = episodeElement?.textContent?.match(/Episode\s*\d+/i)?.[0] || "";
  const season = seasonElement?.textContent?.match(/Season\s*\d+/i)?.[0] || "";

  // Compose state string
  let state = animeTitle;
  if (season) state += ` | ${season}`;
  if (episode) state += ` | ${episode}`;

  const presenceData = {
    type: ActivityType.Watching as ActivityType.Watching,
    details: "Watching Anime",
    state: state,
    largeImageKey: ActivityAssets.Logo,
    largeImageText: animeTitle,
    smallImageKey: Assets.Play,
    smallImageText: "Streaming",
    startTimestamp: browsingTimestamp,
  };

  presence.setActivity(presenceData);
});