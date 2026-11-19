const presence = new Presence({
  clientId: '1571304511597973604',
});

enum Assets {
  Logo = 'https://sechs-vier.de/img/og-default.png',
  Play = 'https://cdn.rcd.gg/PreMiD/resources/play.png',
  Pause = 'https://cdn.rcd.gg/PreMiD/resources/pause.png',
}

interface NowPlayingResponse {
  artist: string;
  title: string;
  cover_url: string | null;
  started_at: string;
  kind: 'song' | 'other';
  duration_sec: number;
  next?: {
    artist: string;
    title: string;
  };
}

let cachedData: NowPlayingResponse | null = null;
let lastFetch = 0;

async function getNowPlaying(): Promise<NowPlayingResponse | null> {
  const now = Date.now();
  if (cachedData && now - lastFetch < 8000) {
    return cachedData;
  }

  try {
    lastFetch = now;
    const response = await fetch('https://api.sechs-vier.de/now');
    if (response.ok) {
      cachedData = await response.json();
    }
  } catch {
    // Alte Daten beibehalten
  }

  return cachedData;
}

presence.on('UpdateData', async () => {
  const [showTimestamps, showCover] = await Promise.all([
    presence.getSetting<boolean>('timestamps'),
    presence.getSetting<boolean>('cover'),
  ]);

  const presenceData: PresenceData = {
    type: ActivityType.Listening,
    largeImageKey: Assets.Logo,
  };

  const audio = document.querySelector('audio');
  const isPlaying = audio ? !audio.paused && !audio.ended && audio.readyState > 2 : true;

  if (!isPlaying) {
    presenceData.details = 'sechs vier von hier';
    presenceData.state = 'Pausiert';
    presenceData.smallImageKey = Assets.Pause;
    presenceData.smallImageText = 'Pausiert';
    presence.setActivity(presenceData);
    return;
  }

  const data = await getNowPlaying();

  if (data && data.kind === 'song' && data.title) {
    presenceData.details = data.title;
    presenceData.state = data.artist || 'sechs vier';

    if (showCover && data.cover_url) {
      presenceData.largeImageKey = data.cover_url;
    }

    if (data.next?.title) {
      presenceData.largeImageText = `Danach: ${data.next.artist ? `${data.next.artist} – ` : ''}${data.next.title}`;
    } else {
      presenceData.largeImageText = 'sechs vier von hier';
    }

    if (showTimestamps && data.started_at && data.duration_sec > 0) {
      const startTimestamp = Math.floor(new Date(data.started_at).getTime() / 1000);
      presenceData.startTimestamp = startTimestamp;
      presenceData.endTimestamp = startTimestamp + data.duration_sec;
    }
  } else {
    presenceData.details = 'sechs vier von hier';
    presenceData.state = 'Live-Programm';
    presenceData.largeImageText = 'AStA Campusradio Darmstadt';
  }

  presenceData.smallImageKey = Assets.Play;
  presenceData.smallImageText = 'Live';

  presence.setActivity(presenceData);
});
