const presence = new Presence({
  clientId: '1291708616952512613',
});

const ActivityAssets = {
  DefaultLogo: 'https://i.ibb.co/Zz6JbkCV/Anime-Dekho.png',
};

function formatTitle(text: string): string {
  return text.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

interface EpisodeInfo {
  title: string;
  season: string;
  episode: string;
}

function getEpisodeInfo(url: string): EpisodeInfo | null {
  const match = url.match(/\/epi\/(.+)-(\d+)x(\d+)\//);
  if (match) {
    return {
      title: formatTitle(match[1] || ''),
      season: `Season ${match[2]}`,
      episode: `Episode ${match[3]}`,
    };
  }
  return null;
}

let lastEpisodeKey = '';
let fixedTimestamp: number | null = null;

presence.on('UpdateData', () => {
  const { pathname } = window.location;
  const presenceData: Record<string, any> = {};

  if (pathname.startsWith('/epi/')) {
    const info = getEpisodeInfo(`${pathname}/`);

    if (info) {
      const key = pathname;
      if (!fixedTimestamp || lastEpisodeKey !== key) {
        fixedTimestamp = Math.floor(Date.now() / 1000);
        lastEpisodeKey = key;
      }

      presenceData.details = info.title;
      presenceData.state = `${info.season} · ${info.episode}`;
      presenceData.startTimestamp = fixedTimestamp;

      const episodeThumbnail = document.querySelector('.post-thumbnail img') as HTMLImageElement | null;
      if (episodeThumbnail?.src) {
        presenceData.largeImageKey = episodeThumbnail.src;
        presenceData.largeImageText = info.title;
      } else {
        presenceData.largeImageKey = ActivityAssets.DefaultLogo;
      }

      presence.setActivity(presenceData);
      return;
    }
  }

  if (pathname.startsWith('/series/')) {
    const title = document.querySelector('h1')?.textContent?.trim() || 'Unknown Anime';
    const thumbnail = document.querySelector('.post-thumbnail img') as HTMLImageElement | null;

    presenceData.details = 'Reading Info';
    presenceData.state = title;

    if (thumbnail?.src) {
      presenceData.largeImageKey = thumbnail.src;
      presenceData.largeImageText = title;
    } else {
      presenceData.largeImageKey = ActivityAssets.DefaultLogo;
    }

    presence.setActivity(presenceData);
    return;
  }

  if (pathname.startsWith('/category/')) {
    const category = formatTitle(pathname.split('/')[2] || 'Browsing');
    presenceData.details = 'Browsing Category';
    presenceData.state = category;
  } else {

    presenceData.details = 'Browsing AnimeDekho';
  }

  presenceData.largeImageKey = ActivityAssets.DefaultLogo;
  presence.setActivity(presenceData);
});
