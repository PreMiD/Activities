import { ActivityType, Assets } from "premid";
const presence = new Presence({ clientId: "1395970198405644350" });
const browsingTimestamp = Math.floor(Date.now() / 1000);

enum ActivityAssets {
  Logo = "https://i.imgur.com/LOGO.png",
  Home = "https://www.anroll.net/_next/image?url=https://static.anroll.net/app-images/wallpaper_bg_black.jpg&w=1920&q=90",
  Calendar = "https://www.anroll.net/_next/image?url=https://static.anroll.net/app-images/wallpaper_bg_black.jpg&w=1920&q=90",
  Search = "https://i.imgur.com/SEARCH_IMG.png",
  Profile = "https://i.imgur.com/PROFILE_IMG.png"
}

const staticPages: Record<string, string> = {
  "": "Vendo a página inicial",
  "animes": "Procurando animes",
  "calendario": "Vendo o calendário de lançamentos",
  "ajuda": "Lendo a página de ajuda",
  "perfil": "Vendo seu perfil"
};

interface VideoData {
  duration: number;
  currentTime: number;
  paused: boolean;
}

let video: VideoData = {
  duration: 0,
  currentTime: 0,
  paused: true
};

const imageCache: Record<string, string> = {};

async function getCoverImage(): Promise<string> {
  try {
    const currentUrl = window.location.href;
    if (imageCache[currentUrl]) return imageCache[currentUrl];
    
    const ogImage = document.querySelector<HTMLMetaElement>('meta[property="og:image"]')?.content;
    if (ogImage) {
      imageCache[currentUrl] = ogImage;
      return ogImage;
    }
    
    const coverElement = document.querySelector<HTMLImageElement>("#anime_title img");
    if (coverElement?.src) {
      imageCache[currentUrl] = coverElement.src;
      return coverElement.src;
    }
    
    const bgElement = document.querySelector<HTMLElement>(".sc-kpOvIu.ixIKbI");
    if (bgElement) {
      const bgStyle = window.getComputedStyle(bgElement);
      const bgImage = bgStyle.backgroundImage.match(/url\(["']?(.*?)["']?\)/i);
      if (bgImage?.[1]) {
        imageCache[currentUrl] = bgImage[1];
        return bgImage[1];
      }
    }
    
    return ActivityAssets.Logo;
  } catch {
    return ActivityAssets.Logo;
  }
}

presence.on("iFrameData", (data: unknown) => {
  try {
    const videoData = data as VideoData;
    if (videoData?.duration) video = videoData;
  } catch (error) {
    console.error("Erro ao receber dados do iframe:", error);
  }
});

presence.on("UpdateData", async () => {
  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  };

  let showButtons = true;
  let privacyMode = false;
  let showTimestamps = true;
  let showCover = true;

  try {
    const { pathname, href } = document.location;
    const pathArr = pathname.split("/").filter(Boolean);
    
    [showButtons, privacyMode, showTimestamps, showCover] = await Promise.all([
      presence.getSetting<boolean>("buttons"),
      presence.getSetting<boolean>("privacy"),
      presence.getSetting<boolean>("timestamps"),
      presence.getSetting<boolean>("cover")
    ]);

    const firstSegment = pathArr[0] || "";
    const secondSegment = pathArr[1] || "";
    const thirdSegment = pathArr[2] || "";

    // Imagem de capa
    if (showCover) {
      presenceData.largeImageKey = await getCoverImage();
    }

    // Páginas estáticas
    if (pathArr.length === 1 && staticPages[firstSegment]) {
      presenceData.details = staticPages[firstSegment];
      
      // Imagem especial para navegação
      if (privacyMode || !showCover) {
        switch (firstSegment) {
          case "": presenceData.largeImageKey = ActivityAssets.Home; break;
          case "calendario": presenceData.largeImageKey = ActivityAssets.Calendar; break;
          case "animes": presenceData.largeImageKey = ActivityAssets.Search; break;
          case "perfil": presenceData.largeImageKey = ActivityAssets.Profile; break;
        }
      }
    }
    
    // Página de anime
    else if (pathArr.length === 2 && firstSegment === "a") {
function getAnimeTitle(): string {
  const selectors = [
    "article.animedetails h2", // Seletor principal corrigido
    "h1.anime-title",          // Alternativa 1
    ".content h1",             // Alternativa 2
    "title"                    // Fallback
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element?.textContent?.trim()) {
      let title = element.textContent.trim();
      
      if (selector === "title") {
        title = title.replace(/( - Assistir.*| - AnimesROLL)$/i, "");
      }
      
      return title;
    }
  }
  
  return "Anime Desconhecido";
}

const animeTitle = getAnimeTitle();
      
      presenceData.details = "Vendo detalhes do anime";
      presenceData.state = animeTitle;
      
      if (!privacyMode) {
        presenceData.buttons = [{ label: "Ver Anime", url: href }];
      }
    }
    
    // Assistindo anime
    else if (pathArr.length === 2 && firstSegment === "e") {
      const animeTitle = document.querySelector("#anime_title span")?.textContent?.trim() || "Anime Desconhecido";
      const episodeElement = document.querySelector("#current_ep strong");
      const episode = episodeElement?.textContent?.trim() || "Episódio Desconhecido";
      
      presenceData.details = `Assistindo ${animeTitle}`;
      presenceData.state = episode;
      
      if (showTimestamps && video.duration > 0) {
        const [startTimestamp, endTimestamp] = presence.getTimestamps(
          video.currentTime,
          video.duration
        );
        presenceData.startTimestamp = startTimestamp;
        presenceData.endTimestamp = endTimestamp;
      }
      
      presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play;
      presenceData.smallImageText = video.paused ? "Pausado" : "Assistindo";
      
      if (!privacyMode) {
        presenceData.buttons = [{ label: "Assistir Anime", url: href }];
      }
      
      if (video.paused) {
        delete presenceData.startTimestamp;
        delete presenceData.endTimestamp;
      }
    }
    
    // Página não reconhecida
    else {
      presenceData.details = privacyMode ? "Navegando..." : "Explorando o site";
    }
  } catch (error) {
    console.error("Erro na Presence:", error);
    presenceData.details = "Erro ao carregar";
  }

  if (!showButtons || privacyMode) delete presenceData.buttons;
  if (!showTimestamps) {
    delete presenceData.startTimestamp;
    delete presenceData.endTimestamp;
  }

  presence.setActivity(presenceData);
});
