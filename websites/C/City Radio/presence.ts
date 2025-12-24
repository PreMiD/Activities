const presence = new Presence({
  clientId: "1172085751534592071"
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

presence.on("UpdateData", async () => {
  const presenceData: PresenceData = {
      largeImageKey: "http://i.typicalmedia.net/stationlogos/cityradio.jpg",
      startTimestamp: Date.now()
    },
    { pathname, href, search } = document.location,
    [
      showTimestamp,
      showButtons,
      showSongInfo
    ] = await Promise.all([
      presence.getSetting<boolean>("showTimestamp"),
      presence.getSetting<boolean>("showButtons"),
      presence.getSetting<boolean>("showSongInfo")
    ]);

  if (!showTimestamp) delete presenceData.startTimestamp;

  // Check if audio player is active
  const audioElement = document.querySelector('audio[data-premid-mode]') as HTMLAudioElement;
  const isPlaying = audioElement?.getAttribute('data-premid-playing') === 'true';
  const playerMode = audioElement?.getAttribute('data-premid-mode');
  const songTitle = document.querySelector('[data-premid-title]')?.getAttribute('data-premid-title');
  const songArtist = document.querySelector('[data-premid-subtitle]')?.getAttribute('data-premid-subtitle');
  const podcastName = audioElement?.getAttribute('data-premid-podcast-name');
  const episodeName = audioElement?.getAttribute('data-premid-episode-name');
  const artwork = audioElement?.getAttribute('data-premid-artwork');

  // Home page
  if (pathname === "/" || pathname === "/home") {
    if (isPlaying && playerMode === 'radio' && showSongInfo && songTitle) {
      if (artwork) presenceData.largeImageKey = artwork;
      presenceData.details = `🎵 ${songTitle}`;
      if (songArtist) presenceData.state = `by ${songArtist}`;
      presenceData.smallImageKey = CustomAssets.Play;
      presenceData.smallImageText = "Listening to Radio";
    } else if (isPlaying && playerMode === 'radio') {
      if (artwork) presenceData.largeImageKey = artwork;
      presenceData.details = "Listening to Live Radio";
      presenceData.state = "City Radio - Live Stream";
      presenceData.smallImageKey = CustomAssets.Radio;
      presenceData.smallImageText = "Live Radio";
    } else if (isPlaying && playerMode === 'podcast' && episodeName && podcastName) {
      if (artwork) presenceData.largeImageKey = artwork;
      presenceData.details = `🎧 ${podcastName}`;
      presenceData.state = episodeName;
      presenceData.smallImageKey = CustomAssets.Play;
      presenceData.smallImageText = "Listening to Podcast";
    } else {
      presenceData.details = "Viewing Home Page";
      presenceData.state = "Browsing City Radio";
      presenceData.smallImageKey = CustomAssets.Browse;
      presenceData.smallImageText = "Browsing";
    }

    if (showButtons) {
      presenceData.buttons = [
        {
          label: "Listen Now",
          url: href
        }
      ];
    }
  }

  // Shows page
  else if (pathname === "/shows") {
    presenceData.details = "Browsing Shows";
    presenceData.state = "Looking for radio shows";
    presenceData.smallImageKey = CustomAssets.RadioShows;
    presenceData.smallImageText = "Radio Shows";

    if (showButtons) {
      presenceData.buttons = [
        {
          label: "View Shows",
          url: href
        }
      ];
    }
  }

  // Individual show page
  else if (pathname.startsWith("/shows/")) {
    const showTitle = document.querySelector('[data-premid-show-title]')?.getAttribute('data-premid-show-title');
    const showImage = document.querySelector('[data-premid-show-image]')?.getAttribute('data-premid-show-image');
    if (showTitle) {
      if (showImage) presenceData.largeImageKey = showImage;
      presenceData.details = "Viewing Show";
      presenceData.state = showTitle;
      presenceData.smallImageKey = CustomAssets.RadioShows;
      presenceData.smallImageText = "Show Details";

    if (showButtons) {
      presenceData.buttons = [
        {
          label: "View Show",
          url: href
        },
        {
          label: "All Shows",
          url: href.split("/shows/")[0] + "/shows"
        }
      ];
      }
    }
  }

  // Jocks page
  else if (pathname === "/jocks") {
    presenceData.details = "Browsing Jocks";
    presenceData.state = "Looking at radio hosts";
    presenceData.smallImageKey = CustomAssets.Browse;
    presenceData.smallImageText = "Browsing Jocks";

    if (showButtons) {
      presenceData.buttons = [
        {
          label: "View Jocks",
          url: href
        }
      ];
    }
  }

  // Individual jock page
  else if (pathname.startsWith("/jocks/")) {
    const jockName = document.querySelector('[data-premid-jock-name]')?.getAttribute('data-premid-jock-name');
    const jockImage = document.querySelector('[data-premid-jock-image]')?.getAttribute('data-premid-jock-image');
    if (jockName) {
      if (jockImage) presenceData.largeImageKey = jockImage;
      presenceData.details = "Viewing Jock Profile";
      presenceData.state = jockName;
      presenceData.smallImageKey = CustomAssets.Browse;
      presenceData.smallImageText = "Jock Profile";

    if (showButtons) {
      presenceData.buttons = [
        {
          label: "View Profile",
          url: href
        },
        {
          label: "All Jocks",
          url: href.split("/jocks/")[0] + "/jocks"
        }
      ];
      }
    }
  }

  // Podcasts page
  else if (pathname === "/podcasts") {
    presenceData.details = "Browsing Podcasts";
    presenceData.state = "Looking for podcasts";
    presenceData.smallImageKey = CustomAssets.Podcast;
    presenceData.smallImageText = "Podcasts";

    if (showButtons) {
      presenceData.buttons = [
        {
          label: "View Podcasts",
          url: href
        }
      ];
    }
  }

  // Individual podcast page
  else if (pathname.startsWith("/podcast/")) {
    const podcastTitle = document.querySelector('[data-premid-podcast-title]')?.getAttribute('data-premid-podcast-title');
    const podcastAuthor = document.querySelector('[data-premid-podcast-author]')?.getAttribute('data-premid-podcast-author');
    const podcastImage = document.querySelector('[data-premid-podcast-image]')?.getAttribute('data-premid-podcast-image');

    if (isPlaying && playerMode === 'podcast' && episodeName && podcastName) {
      if (artwork) presenceData.largeImageKey = artwork;
      presenceData.details = `🎧 ${podcastName}`;
      presenceData.state = episodeName;
      presenceData.smallImageKey = CustomAssets.Play;
      presenceData.smallImageText = "Playing Podcast";
    } else if (podcastTitle) {
      if (podcastImage) presenceData.largeImageKey = podcastImage;
      presenceData.details = "Viewing Podcast";
      presenceData.state = podcastAuthor ? `by ${podcastAuthor}` : podcastTitle;
      presenceData.smallImageKey = CustomAssets.Podcast;
      presenceData.smallImageText = "Podcast";
    }

    if (showButtons) {
      presenceData.buttons = [
        {
          label: "Listen to Podcast",
          url: href
        },
        {
          label: "All Podcasts",
          url: href.split("/podcast/")[0] + "/podcasts"
        }
      ];
    }
  }

  // TMG Content/News page
  else if (pathname === "/tmg-content" || pathname.startsWith("/tmg")) {
    if (pathname === "/tmg-content") {
      presenceData.details = "Browsing TMG Content";
      presenceData.state = "Typical Media Group News";
      presenceData.smallImageKey = CustomAssets.News;
      presenceData.smallImageText = "TMG Content";
    } else if (pathname.startsWith("/tmg-content/news/") || pathname.startsWith("/tmg-content/article/")) {
      const articleTitle = document.querySelector('[data-premid-article-title]')?.getAttribute('data-premid-article-title');
      const articleType = document.querySelector('[data-premid-article-type]')?.getAttribute('data-premid-article-type');
      if (articleTitle) {
        presenceData.details = articleType === 'news' ? "Reading News" : "Reading Article";
        presenceData.state = articleTitle;
        presenceData.smallImageKey = CustomAssets.Reading;
        presenceData.smallImageText = "Reading";
      }
    }

    if (showButtons) {
      presenceData.buttons = [
        {
          label: "View Content",
          url: href
        }
      ];
    }
  }

  // Contact page
  else if (pathname === "/contact") {
    presenceData.details = "Contact Page";
    presenceData.state = "Getting in touch";
    presenceData.smallImageKey = CustomAssets.Contact;
    presenceData.smallImageText = "Contact";

    if (showButtons) {
      presenceData.buttons = [
        {
          label: "Contact Us",
          url: href
        }
      ];
    }
  }

  // Staff Login
  else if (pathname === "/staff/login") {
    presenceData.details = "Staff Area";
    presenceData.state = "Logging in...";
    presenceData.smallImageKey = CustomAssets.Browse;
    presenceData.smallImageText = "Staff Login";
  }

  // Staff Dashboard
  else if (pathname === "/staff/dashboard") {
    const urlParams = new URLSearchParams(search);
    const tab = urlParams.get("tab") || "jocks";

    presenceData.details = "Staff Dashboard";
    presenceData.state = `Managing ${tab.charAt(0).toUpperCase() + tab.slice(1)}`;
    presenceData.smallImageKey = CustomAssets.Upload;
    presenceData.smallImageText = "Staff Area";
  }

  // Default fallback
  else {
    presenceData.details = "Browsing City Radio";
    presenceData.state = "Exploring the website";
    presenceData.smallImageKey = CustomAssets.Browse;
    presenceData.smallImageText = "Browsing";

    if (showButtons) {
      presenceData.buttons = [
        {
          label: "Visit Website",
          url: "https://935cityradio.com"
        }
      ];
    }
  }

  if (presenceData.details) presence.setActivity(presenceData);
  else presence.setActivity();
});
