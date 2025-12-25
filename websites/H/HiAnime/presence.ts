import { Assets, ActivityType } from 'premid';

const presence = new Presence({
  clientId: '1453822836467699954',
});

const browsingTimestamp = Math.floor(Date.now() / 1000);
let videoState: { paused: boolean; currentTime: number; duration: number } | null = null;

// Listen for data from iframe.ts
presence.on('iFrameData', (data: any) => {
  videoState = data;
});

presence.on('UpdateData', async () => {
  const presenceData: any = {
    type: ActivityType.Watching, // Sets activity to "Watching HiAnime"
    largeImageKey: 'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/png/hi-anime.png', // Fallback
    largeImageText: 'HiAnime',
    startTimestamp: browsingTimestamp,
  };

  if (document.location.pathname.includes('/watch/')) {
    // Scrape Title and Banner from the HiAnime page
    const animeTitle = document.querySelector('.film-name .name')?.textContent || 
                       document.querySelector('.breadcrumb-item.active')?.textContent;
    
    // Select the anime poster image
    const posterImg = document.querySelector('.film-poster-img') as HTMLImageElement;
    const bannerUrl = posterImg?.src;

    const episodeNum = document.querySelector('.ssl-item.active .ssli-order')?.textContent;

    if (animeTitle) {
      presenceData.details = animeTitle.trim(); // Heading: Anime Name
      presenceData.state = episodeNum ? `Episode ${episodeNum.trim()}` : 'Watching Anime';

      if (bannerUrl) {
        presenceData.largeImageKey = bannerUrl; // Shows Anime Banner
        presenceData.largeImageText = animeTitle.trim();
      }

      // Sync time using IFrame data
      if (videoState && !videoState.paused) {
        presenceData.startTimestamp = Math.floor(Date.now() / 1000) - Math.floor(videoState.currentTime);
        presenceData.endTimestamp = presenceData.startTimestamp + Math.floor(videoState.duration);
        presenceData.smallImageKey = Assets.Play;
      } else {
        presenceData.state = `Paused: ${presenceData.state}`;
        presenceData.smallImageKey = Assets.Pause;
        delete presenceData.endTimestamp;
      }
    }
  } else {
    presenceData.details = 'Browsing Anime';
    presenceData.state = 'Finding something to watch...';
    presenceData.smallImageKey = Assets.Search;
  }

  presence.setActivity(presenceData);
});