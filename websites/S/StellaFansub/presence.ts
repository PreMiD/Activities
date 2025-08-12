import { ActivityType } from 'premid';

const presence = new Presence({
  clientId: '1404828900978200586',
});

const START = Math.floor(Date.now() / 1000);

// Görselleri URL olarak kullanıyoruz
enum Images {
  Logo = 'https://stellafansub.com/assets/logo.png',
  Listening = 'https://stellafansub.com/assets/listening.png',
}

type Btn = { label: string; url: string };

interface YTInfo {
  playing: boolean;
  title?: string;
  url?: string;
}

function readDataset(): {
  ds: Record<string, string>;
  yt: YTInfo;
  path: string;
  url: string;
  title: string;
} {
  const el = document.getElementById('premid-state') as HTMLElement | null;
  const ds = (el?.dataset || {}) as Record<string, string>;

  const yt: YTInfo = {
    playing: ds.ytPlaying === '1',
    title: ds.ytTitle,
    url: ds.ytUrl,
  };

  return {
    ds,
    yt,
    path: window.location.pathname,
    url: ds.url || window.location.href,
    title: ds.title || document.title || '',
  };
}

function updatePresence(): void {
  const { ds, yt, path, url, title } = readDataset();

  let details = '';
  let state = '';
  const buttons: Btn[] = [];

  if (/^\/reader\/\d+\/\d+/.test(path)) {
    const chapter = ds.chapter || path.split('/').pop() || '';
    details = chapter ? `${chapter}. Bölümü okuyor` : 'Bölüm okuyor';
    state = ds.series || title || 'Okuma';
    buttons.push({ label: 'Bölümü Aç', url });
  } else if (/^\/series\//.test(path)) {
    details = 'Seri sayfasına bakıyor';
    state = ds.series || title || 'Seri';
    buttons.push({ label: 'Seri Sayfası', url });
  } else {
    details = 'Sitede geziniyor';
    state = ds.title || 'Ana sayfa';
    buttons.push({ label: 'Siteyi Aç', url });
  }

  let smallImageKey: string | undefined;
  let smallImageText: string | undefined;

  if (yt.playing && yt.url) {
    smallImageKey = Images.Listening;
    smallImageText = yt.title || 'YouTube';
    if (buttons.length < 2) {
      buttons.push({ label: 'YouTube — Şu An', url: yt.url });
    }
  }

  const data: PresenceData = {
    type: ActivityType.Watching,
    details,
    state,
    largeImageKey: Images.Logo,
    smallImageKey,
    smallImageText,
    startTimestamp: START,
  };

  // PreMiD, butonları 1 veya 2 öğeli tuple bekler
  if (buttons.length === 1) {
    data.buttons = [buttons[0]] as [Btn];
  } else if (buttons.length >= 2) {
    data.buttons = [buttons[0], buttons[1]] as [Btn, Btn];
  }

  presence.setActivity(data);
}

// DOM değişimlerini dinle
const mo = new MutationObserver(() => {
  updatePresence();
});
mo.observe(document.body, { childList: true, subtree: true });

document.addEventListener('DOMContentLoaded', updatePresence);
window.addEventListener('popstate', updatePresence);