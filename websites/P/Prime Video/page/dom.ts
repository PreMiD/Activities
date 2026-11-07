import { SELECTORS } from '../config/constants.js'

/**
 * Video element for the player. Multiple players can coexist in the DOM (the previously watched episode
 * remains paused and invisible while a live stream uses `#dv-web-player-2`): prefer the one playing,
 * then the visible one, then the most recent.
 */
export function findPlayerVideo(): HTMLVideoElement | null {
  const videos = Array.from(document.querySelectorAll<HTMLVideoElement>(SELECTORS.playerVideo))

  // Visibility reads force a layout: only needed to choose between several players
  if (videos.length === 1)
    return videos[0]!

  const visible = videos.filter(video => video.clientWidth > 0 && video.clientHeight > 0)

  return visible.find(video => !video.paused)
    ?? videos.find(video => !video.paused)
    ?? visible.at(-1)
    ?? videos.at(-1)
    ?? document.querySelector<HTMLVideoElement>(SELECTORS.playerVideoFallback)
    ?? document.querySelector<HTMLVideoElement>('video')
}

// Title of the detail page or player overlay (visible only when the overlay is displayed)
export function findPageTitle(): string | undefined {
  return document.querySelector(SELECTORS.playerTitle)?.textContent
    || document.querySelector<HTMLImageElement>(SELECTORS.detailImage)?.alt
    || document.querySelector(SELECTORS.overlayTitle)?.textContent
    || document.querySelector(SELECTORS.detailTitle)?.textContent
    || document.querySelector(SELECTORS.detailWrapperTitle)?.textContent
    || undefined
}

export function findBannerImage(): string | undefined {
  return document.querySelector<HTMLImageElement>(SELECTORS.banner)?.src
}

// Overlay subtitle: fallback only, it disappears from the DOM when the overlay is hidden
export function findOverlaySubtitle(): string | undefined {
  const element = document.querySelector<HTMLElement>(SELECTORS.overlayEpisode)
    || document.querySelector<HTMLElement>(SELECTORS.overlaySubtitle)

  return element?.textContent ?? undefined
}
