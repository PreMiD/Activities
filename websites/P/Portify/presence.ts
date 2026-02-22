import { Assets } from "premid";

const presence = new Presence({
  clientId: "1474148693207941130",
});
const browsingTimestamp = Math.floor(Date.now() / 1000);

function parseTime(str: string): number {
  const parts = str.split(":");
  if (parts.length < 2) return 0;
  return (Number.parseInt(parts[0] ?? "0") * 60) + Number.parseInt(parts[1] ?? "0");
}

presence.on("UpdateData", async () => {
  const strings = await presence.getStrings({
    play: "general.playing",
    pause: "general.paused",
  });

  const trackTitle = document.getElementById("player-name")?.textContent?.trim();
  const trackArtist = document.getElementById("player-artist")?.textContent?.trim();
  const isPlaying = document.getElementById("player-art-eq")?.classList.contains("visible") ?? false;
  const curTimeStr = document.getElementById("cur-time")?.textContent?.trim() || "0:00";
  const totTimeStr = document.getElementById("tot-time")?.textContent?.trim() || "0:00";
  const curSecs = parseTime(curTimeStr);
  const totSecs = parseTime(totTimeStr);
  const coverArt = (document.querySelector("#player-art img") as HTMLImageElement)?.src;
  const isProfile = window.location.pathname.includes("/user/");
  const profileName = isProfile
    ? decodeURIComponent(window.location.pathname.split("/user/")[1]?.split("/")[0] || "")
    : null;

  const presenceData: Record<string, unknown> = {
    largeImageKey: coverArt || "https://i.imgur.com/Z2tD08U.png",
    largeImageText: "Portify — Porter Robinson Fan Site",
    type: 2,
  };

  const hasTrack = trackTitle && trackTitle !== "Select a song to play";

  if (hasTrack && isPlaying && totSecs > 0) {
    const now = Math.floor(Date.now() / 1000);
    presenceData.details = `Listening to ${trackTitle}`;
    presenceData.state = `by ${trackArtist || "Porter Robinson"}`;
    presenceData.smallImageKey = Assets.Play;
    presenceData.smallImageText = strings.play;
    presenceData.startTimestamp = now - curSecs;
    presenceData.endTimestamp = now - curSecs + totSecs;
  } else if (hasTrack && !isPlaying) {
    presenceData.details = trackTitle;
    presenceData.state = `by ${trackArtist || "Porter Robinson"} — Paused`;
    presenceData.smallImageKey = Assets.Pause;
    presenceData.smallImageText = strings.pause;
  } else if (isProfile && profileName) {
    presenceData.details = "Checking a profile";
    presenceData.state = `Viewing @${profileName}`;
    presenceData.startTimestamp = browsingTimestamp;
  } else {
    presenceData.details = "Browsing the Feed";
    presenceData.state = "Connecting with the community";
    presenceData.startTimestamp = browsingTimestamp;
  }

  presence.setActivity(presenceData as PresenceData);
});
