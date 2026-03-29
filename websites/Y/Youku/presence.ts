import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1487705643983835156',
});

let browsingTimestamp = Date.now();
let wasWatchingVideo = false;
let lastVideoState: { paused: boolean; currentTime: number } | null = null;

presence.on('UpdateData', async () => {
  const [privacy, showTimestamp, showButtons, showProgress, , showVideoDetails, compactMode] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('showTimestamp'),
    presence.getSetting<boolean>('showButtons'),
    presence.getSetting<boolean>('showProgress'),
    presence.getSetting<boolean>('use24HourTime'),
    presence.getSetting<boolean>('showVideoDetails'),
    presence.getSetting<boolean>('compactMode'),
  ]);

  // Enhanced video detection with multiple Youku-specific selectors
  const video = document.querySelector<HTMLVideoElement>('video')
                || document.querySelector<HTMLVideoElement>('.video-player video')
                || document.querySelector<HTMLVideoElement>('[data-testid="video-player"] video')
                || document.querySelector<HTMLVideoElement>('.youku-player video')
                || document.querySelector<HTMLVideoElement>('#player video')
                || document.querySelector<HTMLVideoElement>('.vjs-tech video') // Video.js player
                || document.querySelector<HTMLVideoElement>('.prism-player video'); // Aliplayer

  // Enhanced title extraction and formatting
  const metaTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content')
                   || document.querySelector('meta[name="title"]')?.getAttribute('content')
                   || document.querySelector('h1')?.textContent;

  let cleanTitle = metaTitle?.trim() || document.title.replace(/ - (YOUKU|优酷).*/i, '').trim();

  // Better title formatting for mixed languages
  if (cleanTitle) {
    // Extract episode number if present
    const episodeMatch = cleanTitle.match(/第(\d+)集/);
    const episodeNumber = episodeMatch ? `Episode ${episodeMatch[1]}` : null;

    // Remove episode number from title for cleaner display
    cleanTitle = cleanTitle.replace(/第\d+集/, '').trim();

    // Remove duplicate titles (common in Chinese dramas)
    const titleParts = cleanTitle.split(/\s+/);
    const uniqueParts = titleParts.filter((part, index) => titleParts.indexOf(part) === index);
    cleanTitle = uniqueParts.join(' ');

    // Handle long titles - prioritize meaningful content
    if (cleanTitle.length > 50) {
      // Try to find a good breaking point
      const breakPoint = cleanTitle.lastIndexOf(' ', 50);
      if (breakPoint > 20)
        cleanTitle = cleanTitle.substring(0, breakPoint) + '...';
      else
        cleanTitle = cleanTitle.substring(0, 50) + '...';
    }

    // Combine title and episode info
    if (episodeNumber && !cleanTitle.includes(episodeNumber))
      cleanTitle = `${cleanTitle} - ${episodeNumber}`;
  }
  // Prioritize show cover art over video frames
  const posterImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content')
                      || document.querySelector('meta[itemprop="image"]')?.getAttribute('content')
                      || document.querySelector('link[rel="image_src"]')?.getAttribute('content')
                      || document.querySelector('.show-poster img, .series-poster img, .drama-poster img')?.getAttribute('src')
                      || document.querySelector('img[src*="oss-process=image/resize"]')?.getAttribute('src')
                      || document.querySelector('.poster img, .cover img')?.getAttribute('src')
                      || document.querySelector('video')?.getAttribute('poster');

  // Get episode/season info if available
  const episodeInfo = document.querySelector('.episode-info, .season-info, [data-episode]')?.textContent?.trim();
  const currentEpisode = document.querySelector('.current-episode, .episode-number')?.textContent?.trim();

  const data: PresenceData = {
    type: ActivityType.Watching,
    largeImageKey: posterImage || 'https://i.imgur.com/8B7k1t7.png', // 512x512 Youku logo
    largeImageText: 'Youku',
  };

  // Enhanced video validation with more flexible checks
  const isValidVideo = video
    && (video.src || video.currentSrc) // Check both src and currentSrc
    && !isNaN(video.duration)
    && video.duration && video.duration > 0
    && video.readyState >= 2 // HAVE_CURRENT_DATA or higher
    && !video.ended
    && video.readyState > 0; // Make sure it's actually loaded

  if (isValidVideo) {
    const isPaused = video.paused || video.ended;
    const currentTime = Math.floor(video.currentTime);
    const duration = Math.floor(video.duration);

    // Always update timestamps for real-time progress
    const stateChanged = !lastVideoState
      || lastVideoState.paused !== isPaused
      || Math.abs(lastVideoState.currentTime - currentTime) > 2; // Reduced threshold for more frequent updates

    if (stateChanged || !isPaused)
      lastVideoState = { paused: isPaused, currentTime };

    data.details = privacy ? 'Watching Content' : (compactMode ? truncateTitle(cleanTitle, 35) : cleanTitle);
    let stateText = isPaused ? 'Paused' : (episodeInfo || 'Watching Chinese Drama');

    if (showVideoDetails && !privacy && !isPaused) {
      const quality = getVideoQuality();
      const speed = getPlaybackSpeed();
      const details = [];
      if (quality)
        details.push(quality);
      if (speed && speed !== '1x')
        details.push(speed);
      if (details.length > 0)
        stateText = `${stateText} • ${details.join(' • ')}`;
    }

    data.state = stateText;

    if (!isPaused) {
      data.smallImageKey = Assets.Play;
      if (showProgress) {
        const progress = Math.floor((currentTime / duration) * 100);
        data.smallImageText = `${progress}% • ${formatTime(currentTime, duration)}`;
      }
      else {
        data.smallImageText = formatTime(currentTime, duration);
      }
      // Always update timestamps for real-time progress when playing
      if (showTimestamp)
        [data.startTimestamp, data.endTimestamp] = getTimestamps(currentTime, duration);
    }
    else {
      data.smallImageKey = Assets.Pause;
      data.smallImageText = `Paused • ${formatTime(currentTime, duration)}`;
      // Keep timestamps when paused to show current position
    }

    wasWatchingVideo = true;
  }
  else {
    // Reset video state when no valid video found
    if (wasWatchingVideo) {
      browsingTimestamp = Date.now();
      wasWatchingVideo = false;
      lastVideoState = null;
    }

    // Enhanced browsing detection
    const currentUrl = window.location.href;
    const isHomePage = window.location.pathname === '/' || window.location.pathname === '';
    const isSearchPage = currentUrl.includes('/search') || currentUrl.includes('/search?');
    const isCategoryPage = currentUrl.includes('/category') || currentUrl.includes('/show/');

    if (isHomePage) {
      data.details = compactMode ? 'Youku' : 'Browsing Youku';
      data.state = 'Home Page';
    }
    else if (isSearchPage) {
      data.details = compactMode ? 'Searching' : 'Searching Content';
      data.state = 'Looking for videos';
    }
    else if (isCategoryPage) {
      data.details = compactMode ? 'Browsing' : 'Browsing Category';
      data.state = 'Exploring shows';
    }
    else {
      data.details = compactMode ? 'Youku' : 'Browsing Youku';
      data.state = 'Exploring Content';
    }

    if (showTimestamp)
      data.startTimestamp = browsingTimestamp;
  }

  // Enhanced buttons with better labels
  if (showButtons && !privacy) {
    const buttons: { label: string; url: string }[] = [
      {
        label: isValidVideo ? 'Watch Now' : 'View Page',
        url: window.location.href,
      },
    ];

    // Add series button if on a show page
    const currentUrl2 = window.location.href;
    const seriesLink = document.querySelector('a[href*="/show/"]')?.getAttribute('href');
    if (seriesLink && !currentUrl2.includes(seriesLink)) {
      buttons.push({
        label: 'View Series',
        url: seriesLink.startsWith('http') ? seriesLink : `https://www.youku.tv${seriesLink}`,
      });
    }

    // Convert array to tuple for PreMiD
    if (buttons.length > 0)
      data.buttons = [buttons[0], buttons[1]] as [ButtonData, ButtonData?];
  }

  presence.setActivity(data);
});

// Helper function to format time
function formatTime(current: number, total: number): string {
  const formatSeconds = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = secs % 60;

    if (hours > 0)
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return `${formatSeconds(current)} / ${formatSeconds(total)}`;
}

// Helper function to truncate title
function truncateTitle(title: string, maxLength: number): string {
  return title.length > maxLength ? title.substring(0, maxLength - 3) + '...' : title;
}

// Helper function to get video quality
function getVideoQuality(): string | null {
  const qualitySelectors = [
    '.quality-selector .active',
    '[data-quality]',
    '.video-quality .selected',
  ];

  for (const selector of qualitySelectors) {
    const element = document.querySelector(selector);
    if (element?.textContent) {
      const quality = element.textContent.trim();
      if (/\d{3,4}p|HD|4K/i.test(quality))
        return quality;
    }
  }

  // Fallback: search for quality text in all elements
  const allElements = document.querySelectorAll('*');
  for (const element of allElements) {
    const text = element.textContent?.trim();
    if (text && /\d{3,4}p|HD|4K/i.test(text) && text.length < 10)
      return text;
  }

  return null;
}

// Helper function to get playback speed
function getPlaybackSpeed(): string | null {
  const speedSelectors = [
    '.speed-selector .active',
    '[data-speed]',
    '.playback-speed .selected',
  ];

  for (const selector of speedSelectors) {
    const element = document.querySelector(selector);
    if (element?.textContent) {
      const speed = element.textContent.trim();
      if (/\d+(\.\d+)?x/i.test(speed))
        return speed;
    }
  }

  // Fallback: search for speed text in all elements
  const allElements = document.querySelectorAll('*');
  for (const element of allElements) {
    const text = element.textContent?.trim();
    if (text && /\d+(\.\d+)?x/i.test(text) && text.length < 10)
      return text;
  }

  return null;
}
