interface VideoData {
  duration: number
  currentTime: number
  paused: boolean
}

class IFrameHandler {
  private iframe = new iFrame()
  // Armazena o último estado do vídeo para evitar envios desnecessários
  private lastVideoState: VideoData | null = null
  private videoElement: HTMLVideoElement | null = null
  private checkInterval: number | null = null

  constructor() {
    this.init()
  }

  private init(): void {
    // Tenta encontrar o vídeo assim que o script é carregado
    this.findVideoElement()

    // Se não encontrar, tenta novamente a cada 2 segundos
    if (!this.videoElement) {
      const findVideoInterval = setInterval(() => {
        this.findVideoElement()
        if (this.videoElement) {
          clearInterval(findVideoInterval)
        }
      }, 2000)
    }
  }

  /**
   * Procura pelo elemento de vídeo na página usando seletores comuns.
   */
  private findVideoElement(): void {
    const playerSelectors = [
      '#player0',
      '#player_html5_api',
      '.jw-video',
      'video',
    ]

    for (const selector of playerSelectors) {
      const video = document.querySelector<HTMLVideoElement>(selector)
      if (video) {
        this.videoElement = video
        // Uma vez que o vídeo é encontrado, começa a verificação de estado
        if (this.checkInterval === null) {
          this.checkInterval = window.setInterval(() => this.checkVideoState(), 500)
        }
        return
      }
    }
  }

  /**
   * Verifica se o estado do vídeo mudou (tempo ou pausa)
   * e envia os dados se necessário.
   */
  private checkVideoState(): void {
    if (!this.videoElement || Number.isNaN(this.videoElement.duration)) {
      return
    }

    const currentState: VideoData = {
      currentTime: this.videoElement.currentTime,
      duration: this.videoElement.duration,
      paused: this.videoElement.paused,
    }

    // Compara o estado atual com o anterior para decidir se atualiza
    if (this.shouldUpdate(currentState)) {
      this.iframe.send(currentState)
      this.lastVideoState = currentState
    }
  }

  /**
   * Determina se a atualização deve ser enviada.
   * @param currentState O estado atual do vídeo.
   * @returns Verdadeiro se o estado mudou significativamente.
   */
  private shouldUpdate(currentState: VideoData): boolean {
    if (!this.lastVideoState) {
      return true
    }

    // Verifica se o tempo mudou mais de 1 segundo ou se o estado de pausa mudou.
    const timeDifference = Math.abs(currentState.currentTime - this.lastVideoState.currentTime)

    return timeDifference > 1.5 || currentState.paused !== this.lastVideoState.paused
  }
}

// Inicia o handler do iframe
const _iframeHandler = new IFrameHandler()
