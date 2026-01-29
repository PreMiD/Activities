import { ActivityType } from 'premid'

const presence = new Presence({
  clientId: '1466171332008870033',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum CustomAssets {
  Logo = 'https://theintrodb.org/favicon-16x16.png',
  Fallback = 'https://iili.io/fsdSRn9.png',
}

let posterUrl: string | null = null
let posterApplied = false
let lastPathname: string | null = null

const posterObserver = new MutationObserver(() => {
  const img = document.querySelector<HTMLImageElement>(
    'img[src^="https://image.tmdb.org/t/p/"]'
  );
  if (img?.src) {
    posterUrl = img.src.replace(/\/w\d+\//, '/original/');
  }
});

posterObserver.observe(document.documentElement, {
  childList: true,
  subtree: true,
});

function getElementText(selector: string): string | null {
  return document.querySelector(selector)?.textContent?.trim() || null;
}

presence.on('UpdateData', async () => {
  const { pathname, hostname, href } = document.location;

  if (!hostname.endsWith('theintrodb.org')) return;

  if (pathname !== lastPathname) {
    posterUrl = null;
    posterApplied = false;
    lastPathname = pathname;
  }

  const presenceData: PresenceData = {
    name: 'TheIntroDB',
    type: ActivityType.Playing,
    startTimestamp: browsingTimestamp,
    smallImageKey: CustomAssets.Logo,
    smallImageText: 'Submitting Segments',
  };

  if (pathname === '/') {
    presenceData.details = 'Browsing';
    presenceData.state = 'Intro timestamps';
    presenceData.largeImageKey = CustomAssets.Logo;
    return presence.setActivity(presenceData);
  }

  if (pathname === '/mod') {
    presenceData.details = 'Mod Page';
    presenceData.state = 'Reviewing submissions';
    presenceData.largeImageKey = CustomAssets.Logo;
    return presence.setActivity(presenceData);
  }

  const mediaMatch = pathname.match(/^\/(tv|movie)\/(\d+)/);
  if (!mediaMatch) return;

  const mediaType = mediaMatch[1] === 'tv' ? 'TV Show' : 'Movie';
  const title = getElementText('h1') || 'Loading...';

  if (posterUrl && title !== 'Loading...') {
    presenceData.largeImageKey = posterUrl;
    if (!posterApplied) {
      posterApplied = true;
      presence.clearActivity();
    }
  } else {
    presenceData.largeImageKey = CustomAssets.Logo;
  }

  presenceData.details = 'Submitting Segments';
  presenceData.state = `for ${title}`;

  presenceData.buttons = [
    { label: 'View on TheIntroDB', url: href },
  ];

  presence.setActivity(presenceData);
});