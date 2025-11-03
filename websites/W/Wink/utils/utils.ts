export interface VideoData {
  paused: boolean
  duration: number
  currentTime: number
  poster?: string
  title?: string | null
}

export function getVideoContent(selector: string): VideoData | null {
  const mediaElement = document.querySelector<HTMLVideoElement>(selector)
  const title = getTextContent('title')?.replace(/Плеер/, '')?.split('смотреть')[0]?.trim()
  if (mediaElement) {
    return {
      paused: mediaElement.paused,
      duration: mediaElement.duration,
      currentTime: mediaElement.currentTime,
      poster: mediaElement?.poster,
      title: title ? capitalizeFirstLetter(title) : null,
    }
  }
  else {
    return null
  }
}

export function getTextContent(tags: string) {
  return document.querySelector(tags)?.textContent
}

export function capitalizeFirstLetter(text: string) {
  return String(text).charAt(0).toUpperCase() + String(text).slice(1)
}

export function getImage(tags: string): string | null {
  return document.querySelector<HTMLImageElement>(tags)?.src ?? null
}
