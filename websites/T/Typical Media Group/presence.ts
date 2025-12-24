const presence = new Presence({
  clientId: "1405798741075824793"
});

const Assets = {
  TmgLogo: "https://i.typicalmedia.net/TMG_NEW.png",
  TmgIcon: "https://i.typicalmedia.net/TMG_NEW.png",
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
  Tv: "https://i.typicalmedia.net/icons/_states/Tv.png"
};

const strings = presence.getStrings({
  play: 'general.playing',
  pause: 'general.paused',
  browsing: 'general.browsing',
  live: 'general.live',
  viewing: 'general.viewing',
  reading: 'general.reading',
  watching: 'general.watching'
});

let startTimestamp: number | null = null;
let lastStation: string | null = null;
let wasPlaying = false;

function getAlbumArt(): string | null {
  const logoElement = document.querySelector('[data-station-logo]');
  let imageUrl = logoElement?.getAttribute('data-station-logo') || (logoElement as HTMLImageElement)?.src;

  if (!imageUrl) {
    const imgElements = document.querySelectorAll('img[src*="framerusercontent"], img[src*="typicalmedia"], img[src*="azura"], img[alt*="logo"], img[alt*="station"], img[alt*="album"], img[alt*="art"]');
    for (let i = 0; i < imgElements.length; i++) {
      const img = imgElements[i];
      const src = (img as HTMLImageElement).src;
      if (src && src.startsWith('http')) {
        imageUrl = src;
        break;
      }
    }
  }

  if (imageUrl && imageUrl.startsWith('http')) {
    return imageUrl;
  }

  return null;
}

function getStationData() {
  const stationElement = document.querySelector('[data-station-name]');
  const stationApiUrlElement = document.querySelector('[data-station-apiurl]');
  const trackElement = document.querySelector('[data-track-title]');
  const artistElement = document.querySelector('[data-track-artist]');
  const playingElement = document.querySelector('[data-playing]');
  const sloganElement = document.querySelector('[data-station-slogan]');
  const tunerFreqElement = document.querySelector('[data-tuner-frequency]');
  const signalStrengthElement = document.querySelector('[data-signal-strength]');
  const hdRadioElement = document.querySelector('[data-hd-radio]');
  const hdChannelElement = document.querySelector('[data-hd-channel]');
  const rdsPsElement = document.querySelector('[data-rds-ps]');

  return {
    stationName: stationElement?.getAttribute('data-station-name') || null,
    stationApiUrl: stationApiUrlElement?.getAttribute('data-station-apiurl') || null,
    slogan: sloganElement?.getAttribute('data-station-slogan') || stationElement?.getAttribute('data-station-slogan') || null,
    isPlaying: playingElement?.getAttribute('data-playing') === 'true',
    trackTitle: trackElement?.getAttribute('data-track-title') || null,
    artistName: artistElement?.getAttribute('data-track-artist') || null,
    imageUrl: getAlbumArt(),
    tunerFrequency: tunerFreqElement?.getAttribute('data-tuner-frequency') || null,
    signalStrength: signalStrengthElement?.getAttribute('data-signal-strength') || null,
    isHDRadio: hdRadioElement?.getAttribute('data-hd-radio') === 'true',
    hdChannel: hdChannelElement?.getAttribute('data-hd-channel') || null,
    rdsPS: rdsPsElement?.getAttribute('data-rds-ps') || null
  };
}


function checkLength(text: string, maxLength: number = 128): string {
  if (text.length > maxLength) {
    return `${text.substring(0, maxLength - 3)}...`;
  }
  return text;
}

presence.on("UpdateData", async () => {
  const presenceData: PresenceData = {} as PresenceData;

  const showButtons = await presence.getSetting<boolean>("buttons");
  const privacyMode = await presence.getSetting<boolean>("privacy");
  const showTimestamps = await presence.getSetting<boolean>("timestamps");

  try {
    const path = window.location.pathname;
    const stationData = getStationData();

    if (stationData.isPlaying && lastStation !== stationData.stationName) {
      startTimestamp = Math.floor(Date.now() / 1000);
      lastStation = stationData.stationName;
      wasPlaying = true;
    } else if (!stationData.isPlaying && wasPlaying) {
      startTimestamp = null;
      wasPlaying = false;
    }

    if (stationData.stationName) {
      if (stationData.imageUrl) {
        presenceData.largeImageKey = stationData.imageUrl;
        presenceData.largeImageText = checkLength(stationData.stationName);
      } else {
        presenceData.largeImageKey = Assets.TmgLogo;
        presenceData.largeImageText = checkLength(stationData.stationName);
      }

      const isSecretRadio = path.startsWith('/secret-radio') || stationData.tunerFrequency !== null;

      if (stationData.isPlaying) {
        if (stationData.trackTitle && stationData.artistName && stationData.trackTitle !== 'Live Radio') {
          presenceData.details = privacyMode
            ? "Listening to music"
            : checkLength(stationData.trackTitle);

          let stateText = privacyMode
            ? "on a station"
            : checkLength(`${stationData.artistName} • ${stationData.stationName}`);

          // Add frequency for Secret Radio even with track info
          if (isSecretRadio && stationData.tunerFrequency) {
            stateText += ` • FM ${stationData.tunerFrequency}`;
          }

          if (isSecretRadio && stationData.isHDRadio && stationData.hdChannel) {
            stateText += ` • HD${stationData.hdChannel}`;
          }

          presenceData.state = checkLength(stateText);
        } else {
          let detailsText = privacyMode
            ? "Listening to radio"
            : checkLength(`Listening to ${stationData.stationName}`);

          if (isSecretRadio && stationData.tunerFrequency) {
            detailsText = privacyMode
              ? `Tuned to FM ${stationData.tunerFrequency}`
              : `${stationData.stationName} • FM ${stationData.tunerFrequency}`;
          }

          presenceData.details = detailsText;

          let stateText = privacyMode ? "Live" : checkLength(stationData.slogan || "Live Radio");

          if (isSecretRadio) {
            // Add RDS PS text in brackets like real FM radios
            if (stationData.rdsPS) {
              stateText = `((( ${stationData.rdsPS.trim()} )))`;
            }

            if (stationData.isHDRadio && stationData.hdChannel) {
              stateText += ` • HD${stationData.hdChannel}`;
            }
            if (stationData.signalStrength) {
              const strength = parseInt(stationData.signalStrength);
              const bars = strength > 85 ? '▰▰▰▰▰' : strength > 70 ? '▰▰▰▰▱' : strength > 50 ? '▰▰▰▱▱' : strength > 30 ? '▰▰▱▱▱' : '▰▱▱▱▱';
              stateText += ` • ${bars}`;
            }
          }

          presenceData.state = checkLength(stateText);
        }

        presenceData.smallImageKey = Assets.Play;
        presenceData.smallImageText = (await strings).play;

        if (showTimestamps && startTimestamp) {
          presenceData.startTimestamp = startTimestamp;
        }

        if (showButtons && !privacyMode) {
          if (isSecretRadio) {
            presenceData.buttons = [
              {
                label: "Open Radio Tuner",
                url: "https://typicalmedia.net/secret-radio"
              }
            ];
          } else if (stationData.stationApiUrl) {
            presenceData.buttons = [
              {
                label: "Listen Live",
                url: `https://typicalmedia.net/station/${stationData.stationApiUrl}`
              },
              {
                label: "View All Stations",
                url: "https://typicalmedia.net/stations"
              }
            ];
          }
        }
      } else {
        presenceData.details = privacyMode
          ? "Viewing a station"
          : checkLength(`Viewing ${stationData.stationName}`);

        let stateText = checkLength(stationData.slogan || "Paused");

        if (isSecretRadio && stationData.tunerFrequency) {
          stateText = `Tuned to FM ${stationData.tunerFrequency}`;
        }

        presenceData.state = stateText;
        presenceData.smallImageKey = Assets.Pause;
        presenceData.smallImageText = (await strings).pause;

        if (showButtons && !privacyMode) {
          if (isSecretRadio) {
            presenceData.buttons = [
              {
                label: "Open Radio Tuner",
                url: "https://typicalmedia.net/secret-radio"
              }
            ];
          } else if (stationData.stationApiUrl) {
            presenceData.buttons = [
              {
                label: "View Station",
                url: `https://typicalmedia.net/station/${stationData.stationApiUrl}`
              }
            ];
          }
        }
      }
    } else {
      if (path === '/' || path === '/home') {
        presenceData.details = "Browsing Home";
        presenceData.state = "Discovering stations";
        presenceData.smallImageKey = Assets.Browse;
        presenceData.smallImageText = (await strings).browsing;

        if (showButtons && !privacyMode) {
          presenceData.buttons = [
            { label: "Visit Home", url: "https://typicalmedia.net" }
          ];
        }
      } else if (path === '/stations') {
        presenceData.details = "Browsing Stations";
        presenceData.state = "Looking for music";
        presenceData.smallImageKey = Assets.Radio;
        presenceData.smallImageText = "Browsing Stations";

        if (showButtons && !privacyMode) {
          presenceData.buttons = [
            { label: "View Stations", url: "https://typicalmedia.net/stations" }
          ];
        }
      } else if (path.startsWith('/station/')) {
        const stationSlug = path.replace('/station/', '').split('?')[0];

        if (stationSlug) {
          const stationTitle = stationSlug
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

          presenceData.details = `Viewing ${stationTitle}`;
          presenceData.state = "Exploring station";
          presenceData.smallImageKey = Assets.Radio;
          presenceData.smallImageText = "Viewing Station";

          if (showButtons && !privacyMode) {
            presenceData.buttons = [
              { label: "View Station", url: window.location.href }
            ];
          }
        }
      } else if (path.startsWith('/aurora-tv')) {
        if (path.includes('/broadcasts')) {
          presenceData.details = "Watching Broadcasts";
          presenceData.state = "Aurora TV";
          presenceData.smallImageKey = Assets.Radio;
          presenceData.smallImageText = (await strings).live;
        } else if (path.includes('/shows')) {
          presenceData.details = "Browsing Shows";
          presenceData.state = "Aurora TV";
          presenceData.smallImageKey = Assets.Video;
          presenceData.smallImageText = "Watching Shows";
        } else if (path.includes('/socials')) {
          presenceData.details = "Viewing Social Posts";
          presenceData.state = "Aurora TV";
          presenceData.smallImageKey = Assets.Reading;
          presenceData.smallImageText = "Reading Socials";
        } else if (path.includes('/articles')) {
          presenceData.details = "Reading Articles";
          presenceData.state = "Aurora TV";
          presenceData.smallImageKey = Assets.News;
          presenceData.smallImageText = "Reading Articles";
        } else if (path.includes('/advances')) {
          presenceData.details = "Viewing Advances";
          presenceData.state = "Aurora TV";
          presenceData.smallImageKey = Assets.Reading;
          presenceData.smallImageText = "Reading Advances";
        } else {
          presenceData.details = "Browsing Aurora TV";
          presenceData.state = "Entertainment & News";
          presenceData.smallImageKey = Assets.Video;
          presenceData.smallImageText = "Browsing TV";
        }

        if (showButtons && !privacyMode) {
          presenceData.buttons = [
            { label: "Watch Aurora TV", url: "https://typicalmedia.net/aurora-tv" }
          ];
        }
      } else if (path.startsWith('/news')) {
        const newsTitle = document.querySelector('h1')?.textContent;
        const category = document.querySelector('[data-category]')?.textContent;
        const author = document.querySelector('[data-author]')?.textContent;

        if (path.includes('/post/') && newsTitle) {
          presenceData.details = "Reading Article";
          presenceData.state = checkLength(newsTitle);
          presenceData.smallImageKey = Assets.News;
          presenceData.smallImageText = "Reading News";

          if (showButtons && !privacyMode) {
            presenceData.buttons = [
              { label: "Read Article", url: window.location.href },
              { label: "View News", url: "https://typicalmedia.net/news" }
            ];
          }
        } else if (path.includes('/category/') && category) {
          presenceData.details = `Browsing ${category}`;
          presenceData.state = "News Category";
          presenceData.smallImageKey = Assets.News;
          presenceData.smallImageText = "Browsing News";

          if (showButtons && !privacyMode) {
            presenceData.buttons = [
              { label: "View Category", url: window.location.href }
            ];
          }
        } else if (path.includes('/author/') && author) {
          presenceData.details = `Reading by ${author}`;
          presenceData.state = "News Author";
          presenceData.smallImageKey = Assets.News;
          presenceData.smallImageText = "Reading News";

          if (showButtons && !privacyMode) {
            presenceData.buttons = [
              { label: "View Author", url: window.location.href }
            ];
          }
        } else {
          presenceData.details = "Browsing News";
          presenceData.state = "Staying informed";
          presenceData.smallImageKey = Assets.News;
          presenceData.smallImageText = "Browsing News";

          if (showButtons && !privacyMode) {
            presenceData.buttons = [
              { label: "Read News", url: "https://typicalmedia.net/news" }
            ];
          }
        }
      } else if (path === '/weather') {
        presenceData.details = "Checking Weather";
        presenceData.state = "Local forecast";
        presenceData.smallImageKey = Assets.Weather;
        presenceData.smallImageText = "Viewing Weather";

        if (showButtons && !privacyMode) {
          presenceData.buttons = [
            { label: "View Weather", url: "https://typicalmedia.net/weather" }
          ];
        }
      } else if (path === '/about') {
        presenceData.details = "Learning About TMG";
        presenceData.state = "Company information";
        presenceData.smallImageKey = Assets.Reading;
        presenceData.smallImageText = "Reading About";

        if (showButtons && !privacyMode) {
          presenceData.buttons = [
            { label: "About TMG", url: "https://typicalmedia.net/about" }
          ];
        }
      } else if (path === '/contact') {
        presenceData.details = "Contact Page";
        presenceData.state = "Getting in touch";
        presenceData.smallImageKey = Assets.Contact;
        presenceData.smallImageText = "Contact Form";

        if (showButtons && !privacyMode) {
          presenceData.buttons = [
            { label: "Contact Us", url: "https://typicalmedia.net/contact" }
          ];
        }
      } else if (path.startsWith('/advertising')) {
        if (path.includes('/cost')) {
          presenceData.details = "Viewing Advertising Costs";
          presenceData.state = "Planning campaign";
        } else if (path.includes('/faq')) {
          presenceData.details = "Reading Advertising FAQ";
          presenceData.state = "Getting answers";
        } else if (path.includes('/how-to-get-started')) {
          presenceData.details = "Getting Started";
          presenceData.state = "Advertising Guide";
        } else if (path.includes('/is-radio-right')) {
          presenceData.details = "Is Radio Right?";
          presenceData.state = "Learning about radio advertising";
        } else if (path.includes('/should-i-advertise')) {
          presenceData.details = "Should I Advertise?";
          presenceData.state = "Exploring options";
        } else {
          presenceData.details = "Browsing Advertising";
          presenceData.state = "Business solutions";
        }

        presenceData.smallImageKey = Assets.Advertising;
        presenceData.smallImageText = "Advertising Info";

        if (showButtons && !privacyMode) {
          presenceData.buttons = [
            { label: "Advertise with Us", url: "https://typicalmedia.net/advertising" }
          ];
        }
      } else if (path === '/broadcast') {
        presenceData.details = "Broadcast Services";
        presenceData.state = "Professional solutions";
        presenceData.smallImageKey = Assets.Radio;
        presenceData.smallImageText = "Broadcast Services";

        if (showButtons && !privacyMode) {
          presenceData.buttons = [
            { label: "Learn More", url: "https://typicalmedia.net/broadcast" }
          ];
        }
      } else if (path === '/submit-station') {
        presenceData.details = "Submitting Station";
        presenceData.state = "Adding new content";
        presenceData.smallImageKey = Assets.Upload;
        presenceData.smallImageText = "Uploading Station";

        if (showButtons && !privacyMode) {
          presenceData.buttons = [
            { label: "Submit Station", url: "https://typicalmedia.net/submit-station" }
          ];
        }
      } else if (path === '/music-submission') {
        presenceData.details = "Submitting Music";
        presenceData.state = "Sharing content";
        presenceData.smallImageKey = Assets.SongNote;
        presenceData.smallImageText = "Submitting Music";

        if (showButtons && !privacyMode) {
          presenceData.buttons = [
            { label: "Submit Music", url: "https://typicalmedia.net/music-submission" }
          ];
        }
      } else if (path.startsWith('/contest')) {
        if (path.includes('/success')) {
          presenceData.details = "Contest Entry Submitted";
          presenceData.state = "Good luck!";
        } else if (path === '/contests') {
          presenceData.details = "Browsing Contests";
          presenceData.state = "Win prizes!";
        } else {
          const contestTitle = document.querySelector('h1')?.textContent;
          presenceData.details = contestTitle ? checkLength(contestTitle) : "Viewing Contest";
          presenceData.state = "Enter to win";
        }

        if (showButtons && !privacyMode) {
          presenceData.buttons = [
            { label: "View Contests", url: "https://typicalmedia.net/contests" }
          ];
        }
      } else if (path === '/portfolio') {
        presenceData.details = "Viewing Portfolio";
        presenceData.state = "Our work";

        if (showButtons && !privacyMode) {
          presenceData.buttons = [
            { label: "View Portfolio", url: "https://typicalmedia.net/portfolio" }
          ];
        }
      } else if (path === '/media-kit') {
        presenceData.details = "Viewing Media Kit";
        presenceData.state = "Brand resources";

        if (showButtons && !privacyMode) {
          presenceData.buttons = [
            { label: "Download Media Kit", url: "https://typicalmedia.net/media-kit" }
          ];
        }
      } else if (path === '/privacy-policy') {
        presenceData.details = "Reading Privacy Policy";
        presenceData.state = "Legal information";
      } else if (path === '/terms-of-service') {
        presenceData.details = "Reading Terms of Service";
        presenceData.state = "Legal information";
      } else if (path === '/contest-rules') {
        presenceData.details = "Reading Contest Rules";
        presenceData.state = "Official rules";
      } else if (path.startsWith('/embed')) {
        presenceData.details = "Embedded Player";
        presenceData.state = "Listening";
      } else if (path.startsWith('/secret-radio')) {
        const tunerFreq = document.querySelector('[data-tuner-frequency]')?.getAttribute('data-tuner-frequency');
        const signalStrength = document.querySelector('[data-signal-strength]')?.getAttribute('data-signal-strength');

        presenceData.details = "Using Radio Tuner";

        if (tunerFreq) {
          let stateText = `Tuned to FM ${tunerFreq}`;

          if (signalStrength) {
            const strength = parseInt(signalStrength);
            if (strength < 30) {
              stateText += " • Scanning...";
            } else if (strength < 70) {
              stateText += " • Weak signal";
            }
          }

          presenceData.state = stateText;
        } else {
          presenceData.state = "Scanning frequencies";
        }

        presenceData.smallImageKey = Assets.Search;
        presenceData.smallImageText = (await strings).browsing;

        if (showButtons && !privacyMode) {
          presenceData.buttons = [
            { label: "Open Radio Tuner", url: "https://typicalmedia.net/secret-radio" }
          ];
        }
      } else {
        presenceData.details = "Browsing TMG";
        presenceData.state = (await strings).browsing;
        presenceData.smallImageKey = Assets.TmgIcon;
        presenceData.smallImageText = "Typical Media Group";

        if (showButtons && !privacyMode) {
          presenceData.buttons = [
            { label: "Visit Website", url: "https://typicalmedia.net" }
          ];
        }
      }
    }
  } catch (error) {
    console.error("[PreMiD] Error:", error);
    presenceData.details = "Browsing TMG";
  }

  if (!presenceData.largeImageKey) {
    presenceData.largeImageKey = Assets.TmgLogo;
    presenceData.largeImageText = "Typical Media Group";
  }

  if (!presenceData.details) {
    presenceData.details = "Browsing TMG";
  }

  if (presenceData.details || presenceData.state) {
    presence.setActivity(presenceData);
  }
});
