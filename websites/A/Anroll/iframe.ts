interface VideoData {
  currentTime: number;
  duration: number;
  paused: boolean;
}

class IFrameHandler {
  private iframe = new iFrame();
  private lastVideoState: VideoData | null = null;

  constructor() {
    this.init();
  }

  private init(): void {
    setInterval(() => this.checkVideo(), 500);
  }

  private getVideoElement(): HTMLVideoElement | null {
    return document.querySelector('#player0') || 
           document.querySelector('#player_html5_api') || 
           document.querySelector('video');
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
      
      if (video && !Number.isNaN(video.duration)) {
        const currentState: VideoData = {
          currentTime: video.currentTime,
          duration: video.duration,
          paused: video.paused
        };

        if (this.shouldUpdate(currentState)) {
          this.iframe.send({ videoData: currentState });
          this.lastVideoState = currentState;
        }
      }
    } catch (error) {
      console.error('Video check error:', error);
    }
  }
}

new IFrameHandler();
