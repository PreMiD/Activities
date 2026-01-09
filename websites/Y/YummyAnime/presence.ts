// presence.ts

const presence = new Presence({
  clientId: "1045800378228281345",
});

let videoData = {
  duration: 0,
  currentTime: 0,
  paused: true,
  hasData: false,
};

presence.on("iFrameData", (data: any) => {
  videoData = { ...data, hasData: true };
});

presence.on("UpdateData", async () => {
  const { pathname } = document.location;

  const presenceData: any = {
    largeImageKey: "https://files.catbox.moe/13g54b.jpg",
    largeImageText: "YummyAnime",
    type: 3,
  };

  // --- 1. ГЛАВНАЯ ---
  if (pathname === "/" || pathname === "/index.html") {
    presenceData.details = "На главной странице";
    presenceData.state = "Выбирает аниме";
    presence.setActivity(presenceData);
    return;
  }

  // --- 2. ПРОВЕРКА: ЭТО АНИМЕ? ---
  // Ищем уникальный элемент страницы аниме (постер слева)
  const isAnimePage = document.querySelector(".poster-block");

  if (!isAnimePage) {
    // ЭТО НЕ АНИМЕ (Профиль, Каталог, Новости и т.д.)
    presenceData.details = "На сайте YummyAnime";

    // Пытаемся найти заголовок (например "Профиль пользователя X")
    const pageTitle = document.querySelector("h1")?.textContent?.trim();

    if (pageTitle) {
      presenceData.state = pageTitle;
    } else {
      // Если заголовка нет, удаляем state, чтобы не было пустой строки или "Читает описание"
      delete presenceData.state;
    }

    // Чистим всё лишнее
    delete presenceData.startTimestamp;
    delete presenceData.endTimestamp;

    presence.setActivity(presenceData);
    return;
  }

  // --- 3. ЛОГИКА АНИМЕ ---

  // ЗАГОЛОВОК
  const titleHeader = document.querySelector("h1");
  if (titleHeader) {
    presenceData.details = titleHeader.textContent?.trim();
  } else {
    presenceData.details = "Смотрит аниме";
  }

  // ОБЛОЖКА
  const posterImg = document.querySelector(
    "div.poster-block img",
  ) as HTMLImageElement;
  if (posterImg && posterImg.src) {
    if (posterImg.src.startsWith("//")) {
      presenceData.largeImageKey = `https:${posterImg.getAttribute("src")}`;
    } else if (posterImg.src.startsWith("/")) {
      presenceData.largeImageKey = `https://site.yummyani.me${posterImg.getAttribute("src")}`;
    } else {
      presenceData.largeImageKey = posterImg.src;
    }
  }

  // НОМЕР СЕРИИ
  const activeBtn = document.querySelector('div[class*="pQCG"]');
  let currentEpisode = "";
  if (activeBtn) {
    const text = activeBtn.textContent?.trim();
    if (text && !isNaN(Number(text))) currentEpisode = text;
  }

  // СТАТУС ПЛЕЕРА
  if (videoData.hasData) {
    if (!videoData.paused) {
      // === PLAY ===
      presenceData.state = currentEpisode
        ? `Смотрит серию: ${currentEpisode}`
        : "Смотрит видео";
      presenceData.smallImageKey = "play";
      presenceData.smallImageText = "Воспроизведение";

      // ТАЙМЕР: ТОЛЬКО "ОСТАЛОСЬ"
      const now = Date.now();
      const remainingMs = (videoData.duration - videoData.currentTime) * 1000;

      // Передаем только время окончания.
      // Discord автоматически покажет "XX:XX left" (или "осталось")
      presenceData.endTimestamp = now + remainingMs;

      // startTimestamp НЕ ПЕРЕДАЕМ (удаляем)
      delete presenceData.startTimestamp;
    } else {
      // === PAUSE ===
      presenceData.state = currentEpisode
        ? `Серия ${currentEpisode} (Пауза)`
        : "На паузе";
      presenceData.smallImageKey = "pause";
      presenceData.smallImageText = "Пауза";

      delete presenceData.startTimestamp;
      delete presenceData.endTimestamp;
    }
  } else {
    // === NO PLAYER ACTIVE ===
    const videoElement = document.querySelector("#video");
    let isWatchingBlock = false;

    if (videoElement) {
      const rect = videoElement.getBoundingClientRect();
      const viewHeight = Math.max(
        document.documentElement.clientHeight,
        window.innerHeight,
      );
      if (!(rect.bottom < 0 || rect.top - viewHeight >= 0))
        isWatchingBlock = true;
    }

    if (currentEpisode && isWatchingBlock) {
      presenceData.state = `Готовится к просмотру: ${currentEpisode}`;
    } else {
      presenceData.state = "Читает описание";
    }

    delete presenceData.startTimestamp;
    delete presenceData.endTimestamp;
  }

  presence.setActivity(presenceData);
});
