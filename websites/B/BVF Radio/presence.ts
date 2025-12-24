const presence = new Presence({
  clientId: "1439901141579071641"
});

const CustomAssets = {
  Play: "https://i.typicalmedia.net/icons/_states/play.png",
  Pause: "https://i.typicalmedia.net/icons/_states/Pause.png",
  Browse: "https://i.typicalmedia.net/icons/_states/Browse.png",
  Radio: "https://i.typicalmedia.net/icons/_states/Radio.png",
  Video: "https://i.typicalmedia.net/icons/_states/Video.png",
  Reading: "https://i.typicalmedia.net/icons/_states/Reading.png",
  News: "https://i.typicalmedia.net/icons/_states/News.png",
  Weather: "https://i.typicalmedia.net/icons/_states/Weather.png",
  Contact: "https://i.typicalmedia.net/icons/_states/Contact.png",
  Advertising: "https://i.typicalmedia.net/icons/_states/Advertising.png",
  Upload: "https://i.typicalmedia.net/icons/_states/Upload.png",
  SongNote: "https://i.typicalmedia.net/icons/_states/SongNote.png",
  Search: "https://i.typicalmedia.net/icons/_states/Search.png",
  Tv: "https://i.typicalmedia.net/icons/_states/Tv.png",
  RadioShows: "https://i.typicalmedia.net/icons/_states/RadioShows.png",
  Podcast: "https://i.typicalmedia.net/icons/_states/Podcast.png",
  Calendar: "https://i.typicalmedia.net/icons/_states/Calendar.png"
};

let lastPlaybackState = false;
let startTimestamp = Date.now();

presence.on("UpdateData", async () => {
  const presenceData = {} as PresenceData;

  const settings = await presence.getSetting<boolean>("showButtons");
  const showTimestamp = await presence.getSetting<boolean>("showTimestamp");
  const showSongInfo = await presence.getSetting<boolean>("showSongInfo");

  const path = window.location.pathname;
  const hostname = window.location.hostname;

  const isPlaying = document.querySelector('button[aria-label="Pause"]') !== null;

  if (isPlaying !== lastPlaybackState) {
    startTimestamp = Date.now();
    lastPlaybackState = isPlaying;
  }

  if (path === "/" || path === "") {
    const currentSongTitle = document.querySelector('h2.text-4xl.md\\:text-5xl.font-black.text-white')?.textContent?.trim();
    const currentArtist = document.querySelector('p.text-2xl.text-gray-300.font-bold')?.textContent?.trim();
    const artwork = document.querySelector('.aspect-square img')?.getAttribute('src');
    const liveDJ = document.querySelector('p.text-white.text-sm.font-black')?.textContent?.trim();

    presenceData.largeImageKey = artwork || "https://i.typicalmedia.net/stationlogos/bvf.png";
    presenceData.largeImageText = liveDJ ? `Live with ${liveDJ}` : "BVF Radio";

    if (isPlaying && currentSongTitle && currentArtist && showSongInfo) {
      presenceData.details = "Listening to BVF";
      presenceData.state = `${currentSongTitle} - ${currentArtist}`;
      presenceData.smallImageKey = CustomAssets.Play;
      presenceData.smallImageText = "Playing";

      if (showTimestamp) {
        presenceData.startTimestamp = startTimestamp;
      }

      if (settings) {
        presenceData.buttons = [
          {
            label: "Listen Live",
            url: `https://${hostname}`
          }
        ];
      }
    } else if (isPlaying) {
      presenceData.details = "Listening to BVF Radio";
      presenceData.state = "Live Stream";
      presenceData.smallImageKey = CustomAssets.Radio;
      presenceData.smallImageText = "BVF";

      if (showTimestamp) {
        presenceData.startTimestamp = startTimestamp;
      }
    } else {
      presenceData.details = "Browsing Home";
      presenceData.state = "BVF Radio";
      presenceData.smallImageKey = CustomAssets.Browse;
      presenceData.smallImageText = "Browsing";
    }
  } else if (path.startsWith("/shows")) {
    if (path === "/shows" || path === "/shows/") {
      presenceData.largeImageKey = "https://i.typicalmedia.net/stationlogos/bvf.png";
      presenceData.largeImageText = "BVF Radio";
      presenceData.details = "Browsing Shows";
      presenceData.state = "Viewing all shows";
      presenceData.smallImageKey = CustomAssets.RadioShows;
      presenceData.smallImageText = "Radio Shows";
    } else {
      const showTitle = document.querySelector('h1.text-3xl.md\\:text-5xl.font-black.text-white')?.textContent?.trim();
      const showImage = document.querySelector('.w-48.h-48.rounded-2xl img, .aspect-square img')?.getAttribute('src');

      presenceData.largeImageKey = showImage || "https://i.typicalmedia.net/stationlogos/bvf.png";
      presenceData.largeImageText = showTitle || "BVF Radio";

      if (showTitle) {
        presenceData.details = "Viewing Show";
        presenceData.state = showTitle;
        presenceData.smallImageKey = CustomAssets.RadioShows;
        presenceData.smallImageText = "Radio Show";

        if (settings) {
          presenceData.buttons = [
            {
              label: "View Show",
              url: window.location.href
            }
          ];
        }
      }
    }
  } else if (path.startsWith("/jocks") || path.startsWith("/presenters")) {
    if (path === "/jocks" || path === "/jocks/" || path === "/presenters" || path === "/presenters/") {
      presenceData.largeImageKey = "https://i.typicalmedia.net/stationlogos/bvf.png";
      presenceData.largeImageText = "BVF Radio";
      presenceData.details = "Browsing Presenters";
      presenceData.state = "Viewing all presenters";
      presenceData.smallImageKey = CustomAssets.Browse;
      presenceData.smallImageText = "Browsing";
    } else {
      const jockName = document.querySelector('h1.text-3xl.md\\:text-5xl.font-black.text-white')?.textContent?.trim();
      const jockImage = document.querySelector('.w-48.h-48.rounded-2xl img, .aspect-square img')?.getAttribute('src');

      presenceData.largeImageKey = jockImage || "https://i.typicalmedia.net/stationlogos/bvf.png";
      presenceData.largeImageText = jockName || "BVF Radio";

      if (jockName) {
        presenceData.details = "Viewing Presenter";
        presenceData.state = jockName;
        presenceData.smallImageKey = CustomAssets.Radio;
        presenceData.smallImageText = "Presenter";

        if (settings) {
          presenceData.buttons = [
            {
              label: "View Profile",
              url: window.location.href
            }
          ];
        }
      }
    }
  } else if (path.startsWith("/podcasts")) {
    if (path === "/podcasts" || path === "/podcasts/") {
      presenceData.largeImageKey = "https://i.typicalmedia.net/stationlogos/bvf.png";
      presenceData.largeImageText = "BVF Radio";
      presenceData.details = "Browsing Podcasts";
      presenceData.state = "Viewing all podcasts";
      presenceData.smallImageKey = CustomAssets.Podcast;
      presenceData.smallImageText = "Podcasts";
    } else {
      const podcastTitle = document.querySelector('h1.text-4xl.md\\:text-5xl.font-black.text-white')?.textContent?.trim();
      const episodePlaying = document.querySelector('button[aria-label="Pause"]') !== null;
      const episodeTitle = document.querySelector('h2.text-4xl.md\\:text-5xl.font-black.text-white')?.textContent?.trim();
      const podcastImage = document.querySelector('.aspect-square img, .w-full.max-w-sm img')?.getAttribute('src');

      presenceData.largeImageKey = podcastImage || "https://i.typicalmedia.net/stationlogos/bvf.png";
      presenceData.largeImageText = podcastTitle || "BVF Radio";

      if (episodePlaying && episodeTitle) {
        presenceData.details = `Listening to ${podcastTitle || 'Podcast'}`;
        presenceData.state = episodeTitle;
        presenceData.smallImageKey = CustomAssets.Play;
        presenceData.smallImageText = "Playing Episode";

        if (showTimestamp) {
          presenceData.startTimestamp = startTimestamp;
        }

        if (settings) {
          presenceData.buttons = [
            {
              label: "Listen Now",
              url: window.location.href
            }
          ];
        }
      } else if (podcastTitle) {
        presenceData.details = "Viewing Podcast";
        presenceData.state = podcastTitle;
        presenceData.smallImageKey = CustomAssets.Podcast;
        presenceData.smallImageText = "Podcast";

        if (settings) {
          presenceData.buttons = [
            {
              label: "View Podcast",
              url: window.location.href
            }
          ];
        }
      }
    }
  } else if (path.startsWith("/news")) {
    const articleTitle = document.querySelector('h1.text-4xl.md\\:text-5xl.font-black.text-white')?.textContent?.trim();
    const articleImage = document.querySelector('.aspect-video img')?.getAttribute('src');

    presenceData.largeImageKey = articleImage || "https://i.typicalmedia.net/stationlogos/bvf.png";
    presenceData.largeImageText = articleTitle || "BVF Media Group";

    if (articleTitle) {
      presenceData.details = "Reading News";
      presenceData.state = articleTitle.length > 50 ? articleTitle.substring(0, 47) + "..." : articleTitle;
      presenceData.smallImageKey = CustomAssets.Reading;
      presenceData.smallImageText = "Reading";

      if (settings) {
        presenceData.buttons = [
          {
            label: "Read Article",
            url: window.location.href
          }
        ];
      }
    } else {
      presenceData.largeImageKey = "https://i.typicalmedia.net/stationlogos/bvf.png";
      presenceData.largeImageText = "BVF Radio";
      presenceData.details = "Browsing News";
      presenceData.state = "BVF Media Group";
      presenceData.smallImageKey = CustomAssets.News;
      presenceData.smallImageText = "News";
    }
  } else if (path.startsWith("/articles")) {
    const articleTitle = document.querySelector('h1')?.textContent?.trim();
    const articleImage = document.querySelector('img')?.getAttribute('src');
    const contentType = path.includes('/articles/') ? 'Article' : 'Content';

    presenceData.largeImageKey = articleImage || "https://i.typicalmedia.net/stationlogos/bvf.png";
    presenceData.largeImageText = articleTitle || "TMG Media Hub";

    if (articleTitle) {
      presenceData.details = `Reading ${contentType}`;
      presenceData.state = articleTitle.length > 50 ? articleTitle.substring(0, 47) + "..." : articleTitle;
      presenceData.smallImageKey = CustomAssets.Reading;
      presenceData.smallImageText = "Reading";

      if (settings) {
        presenceData.buttons = [
          {
            label: `Read ${contentType}`,
            url: window.location.href
          }
        ];
      }
    } else {
      presenceData.largeImageKey = "https://i.typicalmedia.net/stationlogos/bvf.png";
      presenceData.largeImageText = "BVF Radio";
      presenceData.details = "Browsing Content";
      presenceData.state = "TMG Media Hub";
      presenceData.smallImageKey = CustomAssets.Browse;
      presenceData.smallImageText = "Browsing";
    }
  } else if (path === "/contact") {
    presenceData.largeImageKey = "https://i.typicalmedia.net/stationlogos/bvf.png";
    presenceData.largeImageText = "BVF Radio";
    presenceData.details = "Contact Page";
    presenceData.state = "Getting in touch";
    presenceData.smallImageKey = CustomAssets.Contact;
    presenceData.smallImageText = "Contact";
  } else if (path.startsWith("/staff")) {
    presenceData.largeImageKey = "https://i.typicalmedia.net/stationlogos/bvf.png";
    presenceData.largeImageText = "BVF Radio";
    if (path === "/staff/login") {
      presenceData.details = "Staff Login";
      presenceData.state = "Accessing staff area";
      presenceData.smallImageKey = CustomAssets.Browse;
      presenceData.smallImageText = "Login";
    } else {
      presenceData.details = "Staff Dashboard";
      presenceData.state = "Managing station";
      presenceData.smallImageKey = CustomAssets.Upload;
      presenceData.smallImageText = "Staff Area";
    }
  } else {
    presenceData.largeImageKey = "https://i.typicalmedia.net/stationlogos/bvf.png";
    presenceData.largeImageText = "BVF Radio";
    presenceData.details = "Browsing BVF Radio";
    presenceData.state = "Exploring the site";
    presenceData.smallImageKey = CustomAssets.Browse;
    presenceData.smallImageText = "Browsing";
  }


  presence.setActivity(presenceData);
});
