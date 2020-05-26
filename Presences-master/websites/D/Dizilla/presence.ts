const presence = new Presence({
    clientId: "712838005165129728"
  }),
  strings = presence.getStrings({
    play: "presence.playback.playing",
    pause: "presence.playback.paused"
  }),
  pages: { [k: string]: string } = {
    "/giris-yap": "Giriş Yap",
    "/kayit-ol": "Kayıt Ol",
    "/favorilerim": "Favorilerim",
    "/favori-oyuncularim": "Favori Oyuncularım",
    "/izleyeceklerim": "İzleyeceklerim",
    "/izlediklerim": "İzlediklerim",
    "/profilim": "Profilim",
    "/duyurular": "Duyurular",
    "/altyazili-bolumler": "Altyazılı Bölümler",
    "/turkce-dublaj-bolumler": "Türkçe Dublajlı Bölümler",
    "/trend": "Trendler",
    "/imdb-top-100": "IMDb Top 100",
    "/kanallar": "Kanallar",
    "/dizi-onerileri": "Dizi Önerileri",
    "/iletisim": "İletişim"
  };

/**
 * Get Timestamps
 * @param {Number} videoTime Current video time seconds
 * @param {Number} videoDuration Video duration seconds
 */
function getTimestamps(
  videoTime: number,
  videoDuration: number
): Array<number> {
  const startTime = Date.now();
  const endTime = Math.floor(startTime / 1000) - videoTime + videoDuration;
  return [Math.floor(startTime / 1000), endTime];
}

let video: { duration: number; currentTime: number; paused: boolean };
presence.on(
  "iFrameData",
  (data: { duration: number; currentTime: number; paused: boolean }) => {
    video = data;
  }
);

presence.on("UpdateData", async () => {
  const path: string = document.location.pathname,
    showName: HTMLLinkElement = document.querySelector(
      "div.content > div > div.top-sticky-content h1 > a"
    ),
    episode: HTMLSpanElement = document.querySelector(
      "div.content > div > div.top-sticky-content span.text-white.text-small"
    ),
    object: PresenceData = {
      largeImageKey: "dz-logo"
    };

  if (path.startsWith("/dizi/")) {
    const showTitle = document.querySelector(
      "div.content > div > div.top-sticky-content div > h1 > a"
    );

    object.details = "Bir diziye göz atıyor:";
    object.state = showTitle?.textContent || "Bilinmeyen Dizi";
    object.startTimestamp = Date.now();

    presence.setActivity(object);
  } else if (path.startsWith("/oyuncular/")) {
    const actorName = document.querySelector(
      "div.content > div > div.top-sticky-content div > span"
    );

    object.details = "Bir oyuncuya göz atıyor:";
    object.state = actorName?.textContent || "Bilinmeyen Oyuncu";
    object.startTimestamp = Date.now();

    presence.setActivity(object);
  } else if (path.startsWith("/dizi-turu/")) {
    const genre = document.querySelector(
      "div.content > div > div.top-sticky-content div > h1"
    );

    object.details = "Bir türe göz atıyor:";
    object.state = genre?.textContent || "Bilinmeyen Tür";
    object.startTimestamp = Date.now();

    presence.setActivity(object);
  } else if (path.startsWith("/kanal/")) {
    const title: string = document.title.slice(
      0,
      document.title.indexOf("arşivleri")
    );

    object.details = "Bir kanala göz atıyor:";
    object.state = title || "Bilinmeyen Kanal";
    object.startTimestamp = Date.now();

    presence.setActivity(object);
  } else if (path.startsWith("/arsiv/")) {
    const url: URL = new URL(document.location.href),
      query = url.searchParams.get("q");

    object.startTimestamp = Date.now();

    if (query) {
      object.details = "Bir şey arıyor:";
      object.state = query[0].toUpperCase() + query.slice(1).toLowerCase();
      object.smallImageKey = "search";
    } else {
      object.details = "Bir sayfaya göz atıyor:";
      object.state = "Arşiv";
    }

    presence.setActivity(object);
  } else if (pages[path] || pages[path.slice(0, -1)]) {
    object.details = "Bir sayfaya göz atıyor:";
    object.state =
      pages[path] || pages[path.slice(0, -1)] || "Bilinmeyen Sayfa";
    object.startTimestamp = Date.now();

    presence.setActivity(object);
  } else if (
    !isNaN(video?.duration) &&
    showName?.innerText &&
    episode?.textContent
  ) {
    const timestamps = getTimestamps(
      Math.floor(video?.currentTime),
      Math.floor(video?.duration)
    );

    object.details = showName?.innerText || "Bilinmeyen Dizi";
    object.state = episode?.textContent || "Bilinmeyen Bölüm";
    object.smallImageKey = video?.paused ? "pause" : "play";
    object.smallImageText = video?.paused
      ? (await strings).pause
      : (await strings).play;

    if (!isNaN(timestamps[0]) && !isNaN(timestamps[1])) {
      object.startTimestamp = timestamps[0];
      object.endTimestamp = timestamps[1];
    }

    if (video.paused) {
      delete object.startTimestamp;
      delete object.endTimestamp;
    }

    presence.setTrayTitle(showName?.innerText);
    presence.setActivity(object);
  } else presence.setActivity();
});
