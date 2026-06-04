import { ActivityType } from "premid";

const presence = new Presence({
  clientId: '1511505666664038460'
})
const NintendoMusicLogo = 'https://imgur.com/thYBiff.png';

presence.on('UpdateData', async () => {

  // Get the current URL
  const { pathname } = document.location

  // Getting stuff from the website
  const title = document.title;
  const audio = document.querySelector('audio')
  const isPlaying = !!document.querySelector('[aria-label="Pause"]');
  const currentTime = audio?.currentTime || 0
  const duration = audio?.duration || 0
  const now = Math.floor(Date.now() / 1000)

  const songArt = document.querySelector<HTMLImageElement>('[aria-label="Playback panel"] img')?.src || NintendoMusicLogo;
  const albumArt = document.querySelector<HTMLImageElement>('#main-column img')?.src || NintendoMusicLogo;

  // settings
  const showTimestamps = await presence.getSetting<boolean>("showTimestamps");
  const showSongArt = await presence.getSetting<boolean>("showSongArt");

  // Create the base presence data
  const presenceData: PresenceData = {
    largeImageKey: NintendoMusicLogo, // Direct URL to the logo image
    type: ActivityType.Listening
  }

  // Update the state based on the current page
  if (isPlaying && title.includes(' - Nintendo Music')) {

    const full = title.replace(" - Nintendo Music", "").trim();
    const parts = full.split(/[・·]/);
    const songName = parts[0]?.trim() || "Unknown game";
    const gameName = parts[1]?.trim() || "Nintendo";

    presenceData.details = songName;
    presenceData.state = gameName;
    presenceData.startTimestamp = now - Math.floor(currentTime);
    presenceData.endTimestamp = now + Math.floor(duration - currentTime)

    if (showSongArt) presenceData.largeImageKey = songArt;

  } else if (pathname.includes('/search')) {

    presenceData.details = "Searching..."
    presenceData.largeImageKey = NintendoMusicLogo;

  } else if (pathname.includes('/game')) {

    const full = title.replace(" - Nintendo Music", "").trim();
    const parts = full.split(/[・·]/);
    const gameName = parts[1]?.trim() || "Nintendo";
    const mainTitle = document.querySelector('#main-column h1')?.textContent

    presenceData.details = "Browsing " + mainTitle;
    presenceData.state = gameName;
    if (showSongArt) presenceData.largeImageKey = albumArt;
    presenceData.startTimestamp = Math.floor(Date.now() / 1000);

  } else if (pathname.includes('/user-playlist')) {

    const full = title.replace(" - Nintendo Music", "").trim();
    const parts = full.split(/[・·]/);
    const songName = parts[0]?.trim() || "Unknown game";

    presenceData.details = songName;
    presenceData.state = "Personal Playlist";
    if (showSongArt) presenceData.largeImageKey = albumArt;
    presenceData.startTimestamp = Math.floor(Date.now() / 1000);

  } else if (pathname.includes('/playlist')) {

    const full = title.replace(" - Nintendo Music", "").trim();
    const parts = full.split(/[・·]/);
    const songName = parts[0]?.trim() || "Unknown game";

    presenceData.details = songName;
    presenceData.state = "Official Playlist";
    if (showSongArt) presenceData.largeImageKey = albumArt;
    presenceData.startTimestamp = Math.floor(Date.now() / 1000);

  } else if (pathname.includes('/my-music')) {

    const full = title.replace(" - Nintendo Music", "").trim();
    const mainTitle = document.querySelector('#main-column h1')?.textContent

    presenceData.details = mainTitle;
    presenceData.state = "My Music";
    presenceData.largeImageKey = NintendoMusicLogo;
    presenceData.startTimestamp = Math.floor(Date.now() / 1000);

  } else {

    presenceData.details = "Browsing Music...";
    presenceData.largeImageKey = NintendoMusicLogo;
    presenceData.startTimestamp = Math.floor(Date.now() / 1000);

  }

  // if the setting is off
  if (!showTimestamps) {
    delete presenceData.startTimestamp;
    delete presenceData.endTimestamp;
  }

  // Set the activity
  if (presenceData.details) {
    presence.setActivity(presenceData)
  }
  else {
    presence.clearActivity()
  }
})