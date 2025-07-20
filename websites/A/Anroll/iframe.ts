// Adicionar esta interface no início do arquivo

interface VideoData {
  duration: number;
  currentTime: number;
  paused: boolean;
}

const iframe = new iFrame();
let lastVideoState: VideoData | null = null;

function checkVideo() {
  try {
    const playerContainers = [
      "#player-container", // Novo seletor principal
      ".plyr__video-wrapper", // Player moderno
      ".jwplayer", // JW Player
      ".video-js", // Video.js
      "#html5-player", 
      "#nativePlayer",
      "#jwPlayer",
      "#video",
      "#dplayer",
      "media-player",
      ".plyr",
      "[data-player]"
    ];

    let videoElement: HTMLVideoElement | null = null;

    // Tentar encontrar em contêineres específicos
    for (const selector of playerContainers) {
      const container = document.querySelector(selector);
      if (container) {
        videoElement = container.querySelector("video");
        if (videoElement) break;
      }
    }

    // Tentar encontrar vídeos em iframes
    if (!videoElement) {
      const iframe = document.querySelector("iframe");
      if (iframe && iframe.contentDocument) {
        videoElement = iframe.contentDocument.querySelector("video");
      }
    }

    // Último recurso: buscar qualquer vídeo na página
    if (!videoElement) {
      videoElement = document.querySelector("video");
    }

    if (videoElement && !isNaN(videoElement.duration)) {
      const currentState: VideoData = {
        currentTime: videoElement.currentTime,
        duration: videoElement.duration,
        paused: videoElement.paused,
      };

      if (
        !lastVideoState ||
        Math.abs(currentState.currentTime - lastVideoState.currentTime) > 1 ||
        currentState.paused !== lastVideoState.paused
      ) {
        iframe.send(currentState);
        lastVideoState = currentState;
      }
    }
  } catch (error) {
    console.error("Erro no iframe:", error);
  }
}

setInterval(checkVideo, 1000);

iframe.on("UpdateData", checkVideo);
