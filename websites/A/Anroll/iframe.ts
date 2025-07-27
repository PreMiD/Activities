interface VideoData {
  duration: number;
  currentTime: number;
  paused: boolean;
}

interface IFrame {
  send(data: VideoData): void;
}

class IFrameStub implements IFrame {
  send(_data: VideoData): void {
    // Implementação real seria diferente
  }
}

const iframe: IFrame = new IFrameStub();

let lastVideoState: VideoData | null = null;
let playerDetected = false;

const playerSelectors = [
  'media-player',
  'video[data-media-player]',
  '.vidstack-player',
  '#player-container',
  '.plyr',
  '.jwplayer',
  '.video-js',
  '#html5-player',
  '#nativePlayer',
  '#video-player',
  '[data-player]'
];

function findVideoElement(): HTMLVideoElement | null {
  try {
    // Verificar contêineres de player
    for (const selector of playerSelectors) {
      const container = document.querySelector(selector);
      if (!container) continue;

      if (container instanceof HTMLVideoElement) {
        return container;
      }

      const video = container.querySelector('video');
      if (video instanceof HTMLVideoElement) {
        return video;
      }
    }

    // Verificar iframes
    const iframes = document.querySelectorAll('iframe');
    for (const frame of iframes) {
      try {
        if (frame.contentDocument) {
          const video = frame.contentDocument.querySelector('video');
          if (video instanceof HTMLVideoElement) {
            return video;
          }
        }
      } catch (error) {
        console.debug('Iframe bloqueada:', frame.src || 'sem src');
      }
    }

    // Buscar qualquer elemento de vídeo
    return document.querySelector('video');
  } catch (error) {
    console.error('Erro na detecção de vídeo:', error);
    return null;
  }
}

function checkVideo(): void {
  try {
    const videoElement = findVideoElement();

    if (videoElement && !Number.isNaN(videoElement.duration)) {
      const currentState: VideoData = {
        currentTime: videoElement.currentTime,
        duration: videoElement.duration,
        paused: videoElement.paused
      };

      // Enviar apenas se houver mudança significativa
      const shouldUpdate = !lastVideoState ||
        Math.abs(currentState.currentTime - (lastVideoState.currentTime || 0)) > 1 ||
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
    console.error('Erro na verificação de vídeo:', error);
  }
}

// Configuração do observador de mutações
const observer = new MutationObserver(checkVideo);
observer.observe(document, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ['src', 'class', 'id']
});

// Verificação inicial e periódica
checkVideo();
const checkInterval = setInterval(checkVideo, 1000);

// Limpeza
window.addEventListener('beforeunload', () => {
  clearInterval(checkInterval);
  observer.disconnect();
});
