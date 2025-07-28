interface VideoData {
  duration: number;
  currentTime: number;
  paused: boolean;
}

// Supondo que 'iFrame' seja uma classe definida em outro lugar ou uma dependência.
// Para este exemplo, declarei uma classe placeholder para evitar erros de tipo.
declare class iFrame {
  send(data: VideoData): void;
}

class IFrameHandler {
  private iframe = new iFrame();
  private lastVideoState: VideoData | null = null;

  constructor() {
    this.init();
  }

  private init(): void {
    setInterval(() => this.checkVideo(), 1000);
  }

  private getVideoElement(): HTMLVideoElement | null {
    const playerSelectors = [
      '#player0',
      '#player_html5_api',
      '.jw-video',
      '.html5-video-container > video',
      'video',
    ];

    for (const selector of playerSelectors) {
      const video = document.querySelector<HTMLVideoElement>(selector);
      if (video) return video;
    }
    return null;
  }

  private shouldUpdate(currentState: VideoData): boolean {
    if (!this.lastVideoState) return true;

    return (
      Math.abs(currentState.currentTime - this.lastVideoState.currentTime) > 1 ||
      currentState.paused !== this.lastVideoState.paused
    );
  }

  private checkVideo(): void {
    try {
      const video = this.getVideoElement();

      // Corrigido: Adicionado ')' para fechar a condição do if.
      if (video && !Number.isNaN(video.duration)) {
        const currentState: VideoData = {
          currentTime: video.currentTime,
          duration: video.duration,
          paused: video.paused,
        };

        if (this.shouldUpdate(currentState)) {
          this.iframe.send(currentState);
          this.lastVideoState = currentState;
        }
      }
    } catch (error) {
      console.error('Video check error:', error);
    }
  }
}

new IFrameHandler();
