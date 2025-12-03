const presence = new Presence({
  clientId: '1346614173517221940',
});

const cleanText = (value?: string | null) => value?.replace(/\s+/g, ' ').trim() || '';
const defaultLanguage = 'en';

async function getStrings(language: string) {
  return presence.getStrings(
    { paused: 'general.paused' },
    language,
  );
}

let cachedStrings: Awaited<ReturnType<typeof getStrings>> | null = null;
let cachedLanguage: string | null = null;

presence.on('UpdateData', async () => {
  if (!document.location.pathname.includes('/')) {
    presence.setActivity();
    return;
  }

  const language = await presence.getSetting<string>('lang').catch(() => defaultLanguage);

  if (!cachedStrings || language !== cachedLanguage) {
    cachedStrings = await getStrings(language);
    cachedLanguage = language;
  }

  const [showArtistAndSong, showTimestamp, showAlbumArt] = await Promise.all([
    presence.getSetting<boolean>('showArtistAndSong'),
    presence.getSetting<boolean>('showTimestamp'),
    presence.getSetting<boolean>('showAlbumArt'),
  ]);

  const titleElement = document.querySelector('.track-text-details h2');
  const artistElement = document.querySelector('.track-text-details p');
  const albumArtImgElement =
    document.querySelector('.now-playing-center .album-art') ||
    document.querySelector('.mobile-now-playing-glass-container .album-art');
  const playingIndicator = document.querySelector('.player-control-button.play-pause-main[title="Pause"]');
  const currentTimeDisplayElement = document.querySelector('.progress-bar-wrapper .current-time');
  const durationDisplayElement = document.querySelector('.progress-bar-wrapper .duration-time');

  const title = cleanText(titleElement?.textContent);
  const artist = cleanText(artistElement?.textContent);
  const albumArtSrc = albumArtImgElement ? albumArtImgElement.getAttribute('src') : null;

  const trackTitle = title && title !== 'Nothing Playing' ? title : undefined;
  const trackArtist = artist || undefined;
  const trackAlbumArt = showAlbumArt && albumArtSrc && !albumArtSrc.includes('placehold.co') ? albumArtSrc : undefined;

  const isPlaying = !!(playingIndicator && trackTitle);
  const currentTime = presence.timestampFromFormat(currentTimeDisplayElement?.textContent ?? '');
  const duration = presence.timestampFromFormat(durationDisplayElement?.textContent ?? '');

  if (isPlaying && trackTitle) {
    const activityData: PresenceData = {
      type: 2,
      details: trackTitle.substring(0, 128),
      ...(showArtistAndSong && trackArtist ? { state: trackArtist.substring(0, 128) } : {}),
      largeImageKey: trackAlbumArt || 'rf_white',
    };

    if (showTimestamp && duration > 0 && currentTime >= 0) {
      const [startTimestamp, endTimestamp] = presence.getTimestamps(currentTime, duration);
      activityData.startTimestamp = startTimestamp;
      activityData.endTimestamp = endTimestamp;
    }

    presence.setActivity(activityData);
    return;
  }

  if (trackTitle) {
    const pausedPresence: PresenceData = {
      type: 2,
      details: trackTitle.substring(0, 128),
      ...(showArtistAndSong && trackArtist
        ? { state: trackArtist.substring(0, 128) }
        : { state: cachedStrings?.paused || 'Paused' }),
      largeImageKey: trackAlbumArt || 'rf_white',
    };
    presence.setActivity(pausedPresence);
    return;
  }

  presence.setActivity();
});

console.log('[RF Music PreMiD] Presence Script Initialized (v3.0)');
