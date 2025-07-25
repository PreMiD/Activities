interface VideoData {
  duration: number;
  currentTime: number;
  paused: boolean;
}

// If iFrame is a custom class, import or declare it properly.
// For demonstration, here's a stub. Replace with the actual implementation.
declare class IFrame {
  send(data: VideoData): void;
}
const iframe = new IFrame();

let lastVideoState: VideoData | null = null;
let playerDetected = false;

const playerSelectors: string[] = [
  // Seletores para players modernos (Vidstack)
  "media-player",
  "video[data-media-player]",
  ".vidstack-player",

  // Seletores para players comuns
  "#player-container",
  ".plyr",
  ".jwplayer",
  ".video-js",
  "#html5-player",
  "#nativePlayer",
  "#video-player",
  "[data-player]"
];

function findVideoElement(): HTMLVideoElement | null {
  try {
    // 1. Verificar contêineres de player conhecidos
    for (const selector of playerSelectors) {
      const container = document.querySelector(selector);
      if (container) {
        // Verificar se o contêiner é um elemento de vídeo
        if (container instanceof HTMLVideoElement) {
          return container;
        }

        // Procurar vídeo dentro do contêiner
        const video = container.querySelector?.("video");
        if (video && video instanceof HTMLVideoElement) return video;
      }
    }

    // 2. Verificar iframes de forma segura
    const iframes = document.querySelectorAll("iframe");
    for (let i = 0; i < iframes.length; i++) {
      const frame = iframes.item(i);
      if (!frame) continue; // Pular se frame for nulo/indefinido

      try {
        if (frame.contentDocument) {
          const video = frame.contentDocument.querySelector("video");
          if (video && video instanceof HTMLVideoElement) return video;
        }
      } catch (e) {
        console.debug(`Iframe bloqueada: ${frame.src || "sem src"}`);
      }
    }

    // 3. Buscar qualquer elemento de vídeo
    const video = document.querySelector("video");
    return video instanceof HTMLVideoElement ? video : null;
  } catch (error) {
    console.error("Erro na detecção de vídeo:", error);
    return null;
  }
}

function checkVideo(): void {
  try {
    const videoElement = findVideoElement();

    if (videoElement && !isNaN(videoElement.duration)) {
      const currentState: VideoData = {
        currentTime: videoElement.currentTime,
        duration: videoElement.duration,
        paused: videoElement.paused
      };

      // Enviar apenas se houver mudança significativa
      const shouldUpdate =
        !lastVideoState ||
        Math.abs(currentState.currentTime - lastVideoState.currentTime) > 1 ||
        currentState.paused !== lastVideoState.paused;

      if (shouldUpdate) {
        iframe.send(currentState);
        lastVideoState = currentState;
        playerDetected = true;
      }
      return;
    }

    // Resetar estado se nenhum vídeo for encontrado
    if (playerDetected) {
      iframe.send({ duration: 0, currentTime: 0, paused: true });
      playerDetected = false;
      lastVideoState = null;
    }
  } catch (error) {
    console.error("Erro na verificação de vídeo:", error);
  }
}

// Configuração do observador de mutações
const observer = new MutationObserver(() => checkVideo());
observer.observe(document, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ["src", "class", "id"]
});

// Verificação inicial e periódica
checkVideo();
const checkInterval = setInterval(checkVideo, 1000);

// Limpeza opcional ao descarregar
window.addEventListener("beforeunload", () => {
  clearInterval(checkInterval);
  observer.disconnect();
});
