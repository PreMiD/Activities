import Presence from "../../presence";

const presence = new Presence({
  clientId: "1444556736647397476" // Palihug ilisdi sa imong Discord App client ID
});

presence.on("UpdateData", async () => {
  // Example: get video title and paused state
  const videoTitle = document.querySelector(".video-title")?.textContent;
  const paused = document.querySelector(".play-button.paused") !== null;

  presence.setActivity({
    details: videoTitle || "Explore a vast collection of movies and TV shows across all genres.",
    state: paused ? "Paused" : "BEECH.WATCH",
    largeImageKey: "beech",
    instance: false
  });
});