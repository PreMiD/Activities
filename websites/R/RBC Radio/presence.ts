// Custom assets for RBC Radio
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
  Calendar: "https://i.typicalmedia.net/icons/_states/Calendar.png",
};

const presence = new Presence({
  clientId: '1137989736544354354',
});

const browsingTimestamp = Math.floor(Date.now() / 1000);

async function getStrings() {
  return presence.getStrings({
    play: 'general.playing',
    pause: 'general.paused',
    browse: 'general.browsing',
    listen: 'general.buttonListenAlong',
    viewPage: 'general.viewPage',
    btnViewPage: 'general.buttonViewPage',
    readArticle: 'general.readingArticle',
    btnReadArticle: 'general.buttonReadArticle',
    viewProfile: 'general.viewProfile',
    btnViewProfile: 'general.buttonViewProfile',
    watchingLive: 'general.watchingLive',
    viewShow: 'general.viewShow',
    viewPodcast: 'general.viewPodcast',
  });
}

let strings: Awaited<ReturnType<typeof getStrings>>;
let oldLang: string | null = null;

presence.on('UpdateData', async () => {
  let presenceData: PresenceData = {
    largeImageKey: 'https://i.typicalmedia.net/stationlogos/rbcradio.webp',
    startTimestamp: browsingTimestamp,
  };

  const [
    newLang,
    details,
    state,
    showButtons,
    showTimestamp,
    showCover,
  ] = await Promise.all([
    presence.getSetting<string>('lang').catch(() => 'en'),
    presence.getSetting<string>('details'),
    presence.getSetting<string>('state'),
    presence.getSetting<boolean>('showButtons'),
    presence.getSetting<boolean>('showTimestamp'),
    presence.getSetting<boolean>('showCover'),
  ]);

  if (oldLang !== newLang || !strings) {
    oldLang = newLang;
    strings = await getStrings();
  }

  // Get current page path first to determine context
  const path = location.pathname;

  // Check if we're on a specific content page (not homepage)
  const isOnContentPage =
    path !== '/' &&
    path !== '' &&
    (path.startsWith('/song/') ||
     path.startsWith('/show/') ||
     path.startsWith('/podcast/') ||
     path.startsWith('/news/') ||
     path.startsWith('/presenter') ||
     path.startsWith('/charts') ||
     path.startsWith('/timetable') ||
     path.startsWith('/podcasts') ||
     path.startsWith('/jobs') ||
     path.startsWith('/public-file') ||
     path.startsWith('/privacy') ||
     path.startsWith('/staff'));

  // Check if player is active (looking for play/pause button state)
  const playButton = document.querySelector('[aria-label*="Play"], [aria-label*="Pause"], .play-button, .pause-button');
  const isPlaying =
    playButton?.getAttribute('aria-label')?.toLowerCase().includes('pause') ||
    playButton?.classList.contains('playing') ||
    document.querySelector('.player-playing, [data-playing="true"]') !== null;

  // Get current song info from PLAYER ONLY (not from page content)
  const playerSongTitle =
    document.querySelector('.now-playing-title[data-song-title]')?.textContent?.trim();

  const playerSongArtist =
    document.querySelector('.now-playing-artist[data-song-artist]')?.textContent?.trim();

  const showName =
    document.querySelector('.live-show, [class*="show-name"], [data-show-name]')?.textContent?.trim();

  const presenterName =
    document.querySelector('.live-presenter, [class*="presenter-name"], [data-presenter-name]')?.textContent?.trim();

  // Get album art from player
  const playerAlbumArtElement =
    document.querySelector<HTMLImageElement>('[data-album-art]') ||
    document.querySelector<HTMLImageElement>('.album-art');

  const playerAlbumArt =
    playerAlbumArtElement?.getAttribute('data-album-art') ||
    playerAlbumArtElement?.src ||
    document.querySelector<HTMLImageElement>('[class*="album-cover"]')?.src ||
    document.querySelector<HTMLDivElement>('[class*="album"], [class*="cover"]')?.style.backgroundImage?.match(/url\(['"]?([^'"]+)['"]?\)/)?.[1];

  // Priority: Show page content if on a content page, otherwise show player status
  if (isOnContentPage) {
    // User is browsing specific pages - show page content instead of player

    if (path === '/' || path === '') {
      presenceData.details = strings.browse;
      presenceData.state = 'RBC Radio';
      presenceData.smallImageKey = CustomAssets.Browse;
      presenceData.smallImageText = strings.browse;
    } else if (path.startsWith('/news/')) {
      const articleTitle =
        document.querySelector('[data-article-title]')?.getAttribute('data-article-title') ||
        document.querySelector('.article-title')?.textContent?.trim() ||
        document.querySelector('h1')?.textContent?.trim();
      presenceData.details = strings.readArticle;
      presenceData.state = articleTitle || 'News Article';
      presenceData.smallImageKey = CustomAssets.News;
      presenceData.smallImageText = strings.readArticle;

      if (showButtons) {
        presenceData.buttons = [
          {
            label: strings.btnReadArticle,
            url: location.href,
          },
        ];
      }
    } else if (path === '/news') {
      presenceData.details = strings.viewPage;
      presenceData.state = 'News';
      presenceData.smallImageKey = CustomAssets.News;

      if (showButtons) {
        presenceData.buttons = [
          {
            label: strings.btnViewPage,
            url: location.href,
          },
        ];
      }
    } else if (path.startsWith('/podcast/')) {
      const podcastTitle =
        document.querySelector('[data-podcast-name]')?.getAttribute('data-podcast-name') ||
        document.querySelector('.podcast-title')?.textContent?.trim() ||
        document.querySelector('h1')?.textContent?.trim();
      presenceData.details = 'Viewing Podcast';
      presenceData.state = podcastTitle || 'Podcast';
      presenceData.smallImageKey = CustomAssets.Podcast;

      if (showButtons) {
        presenceData.buttons = [
          {
            label: 'View Podcast',
            url: location.href,
          },
        ];
      }
    } else if (path === '/podcasts') {
      presenceData.details = strings.viewPage;
      presenceData.state = 'Podcasts';
      presenceData.smallImageKey = CustomAssets.Podcast;

      if (showButtons) {
        presenceData.buttons = [
          {
            label: strings.btnViewPage,
            url: location.href,
          },
        ];
      }
    } else if (path === '/timetable') {
      presenceData.details = strings.viewPage;
      presenceData.state = 'Timetable';
      presenceData.smallImageKey = CustomAssets.Calendar;

      if (showButtons) {
        presenceData.buttons = [
          {
            label: strings.btnViewPage,
            url: location.href,
          },
        ];
      }
    } else if (path === '/charts') {
      presenceData.details = strings.viewPage;
      presenceData.state = 'Charts';
      presenceData.smallImageKey = CustomAssets.SongNote;

      if (showButtons) {
        presenceData.buttons = [
          {
            label: strings.btnViewPage,
            url: location.href,
          },
        ];
      }
    } else if (path === '/jobs') {
      presenceData.details = strings.viewPage;
      presenceData.state = 'Jobs';
      presenceData.smallImageKey = CustomAssets.Contact;

      if (showButtons) {
        presenceData.buttons = [
          {
            label: strings.btnViewPage,
            url: location.href,
          },
        ];
      }
    } else if (path === '/public-file') {
      presenceData.details = strings.viewPage;
      presenceData.state = 'Public File';
      presenceData.smallImageKey = CustomAssets.Reading;

      if (showButtons) {
        presenceData.buttons = [
          {
            label: strings.btnViewPage,
            url: location.href,
          },
        ];
      }
    } else if (path === '/privacy') {
      presenceData.details = strings.viewPage;
      presenceData.state = 'Privacy Policy';
      presenceData.smallImageKey = CustomAssets.Reading;
    } else if (path.startsWith('/presenters/') || path.startsWith('/presenter/')) {
      const presenterName =
        document.querySelector('[data-presenter-name]')?.getAttribute('data-presenter-name') ||
        document.querySelector('.presenter-name')?.textContent?.trim() ||
        document.querySelector('h1')?.textContent?.trim();
      presenceData.details = 'Viewing Presenter';
      presenceData.state = presenterName || 'Presenter Profile';
      presenceData.smallImageKey = CustomAssets.Radio;

      if (showButtons) {
        presenceData.buttons = [
          {
            label: 'View Profile',
            url: location.href,
          },
        ];
      }
    } else if (path === '/presenters') {
      presenceData.details = strings.viewPage;
      presenceData.state = 'Presenters';
      presenceData.smallImageKey = CustomAssets.Reading;

      if (showButtons) {
        presenceData.buttons = [
          {
            label: strings.btnViewPage,
            url: location.href,
          },
        ];
      }
    } else if (path.startsWith('/staff')) {
      const pageTitle = document.querySelector('[data-page-title]')?.getAttribute('data-page-title');
      presenceData.details = 'Staff Panel';
      presenceData.state = pageTitle || 'SHHHH';
      presenceData.smallImageKey = CustomAssets.Reading;
    } else if (path.startsWith('/song/')) {
      // Get song info from PAGE content only (exclude player using :not selector)
      const songName =
        document.querySelector('h1.song-title[data-song-title]')?.getAttribute('data-song-title') ||
        document.querySelector('h1.song-title')?.textContent?.trim() ||
        document.querySelector('h1')?.textContent?.trim();
      const songArtistPage =
        document.querySelector('p.song-artist[data-song-artist]')?.getAttribute('data-song-artist') ||
        document.querySelector('p.song-artist')?.textContent?.trim();
      const songAlbum =
        document.querySelector('p.song-album[data-song-album]')?.getAttribute('data-song-album') ||
        document.querySelector('p.song-album')?.textContent?.trim();

      presenceData.details = songName || 'Viewing Song';
      presenceData.state = songArtistPage ? `by ${songArtistPage}${songAlbum ? ` • ${songAlbum}` : ''}` : 'Song Info';
      presenceData.smallImageKey = CustomAssets.SongNote;

      // Show album art if available from the page (not player)
      const songArtwork =
        document.querySelector<HTMLImageElement>('img.song-art[data-song-art]')?.getAttribute('data-song-art') ||
        document.querySelector<HTMLImageElement>('img.song-art')?.src;

      if (showCover && songArtwork) {
        presenceData.largeImageKey = songArtwork;
      }

      if (showButtons) {
        presenceData.buttons = [
          {
            label: 'View Song Info',
            url: location.href,
          },
        ];
      }
    } else if (path.startsWith('/show/')) {
      const showNamePage =
        document.querySelector('[data-show-name]')?.getAttribute('data-show-name') ||
        document.querySelector('.show-title')?.textContent?.trim() ||
        document.querySelector('h1')?.textContent?.trim();

      presenceData.details = 'Viewing Show';
      presenceData.state = showNamePage || 'Show Profile';
      presenceData.smallImageKey = CustomAssets.RadioShows;

      // Show artwork if available
      const showArtwork =
        document.querySelector<HTMLImageElement>('[data-show-art]')?.getAttribute('data-show-art') ||
        document.querySelector<HTMLImageElement>('.show-art')?.src;

      if (showCover && showArtwork) {
        presenceData.largeImageKey = showArtwork;
      }

      if (showButtons) {
        presenceData.buttons = [
          {
            label: 'View Show',
            url: location.href,
          },
        ];
      }
    } else if (path.startsWith('/podcast/')) {
      const podcastNamePage =
        document.querySelector('[data-podcast-name]')?.getAttribute('data-podcast-name') ||
        document.querySelector('.podcast-title')?.textContent?.trim() ||
        document.querySelector('h1')?.textContent?.trim();
      const podcastAuthorPage =
        document.querySelector('[data-podcast-author]')?.getAttribute('data-podcast-author') ||
        document.querySelector('.podcast-author')?.textContent?.trim();

      presenceData.details = 'Viewing Podcast';
      presenceData.state = podcastNamePage ? `${podcastNamePage}${podcastAuthorPage ? ` • ${podcastAuthorPage}` : ''}` : 'Podcast';
      presenceData.smallImageKey = CustomAssets.Podcast;

      // Show podcast artwork if available
      const podcastArtwork =
        document.querySelector<HTMLImageElement>('[data-podcast-art]')?.getAttribute('data-podcast-art') ||
        document.querySelector<HTMLImageElement>('.podcast-art')?.src;

      if (showCover && podcastArtwork) {
        presenceData.largeImageKey = podcastArtwork;
      }

      if (showButtons) {
        presenceData.buttons = [
          {
            label: 'View Podcast',
            url: location.href,
          },
        ];
      }
    } else {
      presenceData.details = strings.browse;
      presenceData.state = 'RBC Radio';
      presenceData.smallImageKey = CustomAssets.Browse;
    }

    // Add small playing/paused indicator if music is playing in background
    if (isPlaying && playerSongTitle) {
      presenceData.smallImageKey = CustomAssets.Play;
      presenceData.smallImageText = `Playing: ${playerSongTitle}`;
    } else if (!isPlaying && playerSongTitle) {
      presenceData.smallImageKey = CustomAssets.Pause;
      presenceData.smallImageText = strings.pause;
    }
  } else {
    // User is on homepage - show player status
    if (isPlaying && (playerSongTitle || playerSongArtist)) {
      if (details !== '{0}' && details) {
        presenceData.details = replacePlaceholders(details, {
          title: playerSongTitle || 'Unknown Track',
          artist: playerSongArtist || 'Unknown Artist',
          show: showName || '',
          presenter: presenterName || '',
        });
      } else {
        presenceData.details = playerSongTitle || 'Listening to RBC Radio';
      }

      if (state !== '{0}' && state) {
        presenceData.state = replacePlaceholders(state, {
          title: playerSongTitle || '',
          artist: playerSongArtist || 'Unknown Artist',
          show: showName || '',
          presenter: presenterName || '',
        });
      } else {
        presenceData.state = playerSongArtist ? `by ${playerSongArtist}` : 'Roblox\'s #1 Hit Music Station';
      }

      presenceData.smallImageKey = CustomAssets.Play;
      presenceData.smallImageText = strings.play;

      // Show album art if enabled
      if (showCover && playerAlbumArt) {
        presenceData.largeImageKey = playerAlbumArt;
      }

      if (showButtons) {
        presenceData.buttons = [
          {
            label: strings.listen,
            url: 'https://rbcradio.xyz/',
          },
        ];
      }
    } else {
      // Not playing or paused - show browsing homepage
      presenceData.details = strings.browse;
      presenceData.state = playerSongTitle ? `Paused: ${playerSongTitle}` : 'RBC Radio';
      presenceData.smallImageKey = playerSongTitle ? CustomAssets.Pause : CustomAssets.Browse;
      presenceData.smallImageText = playerSongTitle ? strings.pause : strings.browse;
    }
  }

  if (!showTimestamp) {
    delete presenceData.startTimestamp;
  }

  if (!showButtons) {
    delete presenceData.buttons;
  }

  presence.setActivity(presenceData);
});

function replacePlaceholders(
  template: string,
  data: {
    title: string;
    artist: string;
    show: string;
    presenter: string;
  }
): string {
  return template
    .replace(/%title%/g, data.title)
    .replace(/%artist%/g, data.artist)
    .replace(/%show%/g, data.show)
    .replace(/%presenter%/g, data.presenter);
}
