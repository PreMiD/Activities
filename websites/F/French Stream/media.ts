export interface MediaSample {
  currentTime: number
  duration: number
  paused: boolean
  ended: boolean
  playbackRate: number
}

export function sampleVideo(video: HTMLVideoElement | null): MediaSample | null {
  if (!video || video.readyState < 2 || video.played.length === 0
    || video.closest('.jw-flag-ads, .video-ads, [data-ad="true"]')
    || !Number.isFinite(video.duration) || video.duration <= 0
    || !Number.isFinite(video.currentTime) || video.currentTime < 0
    || video.currentTime > video.duration
    || !Number.isFinite(video.playbackRate) || video.playbackRate <= 0) {
    return null
  }
  return {
    currentTime: video.currentTime,
    duration: video.duration,
    paused: video.paused,
    ended: video.ended,
    playbackRate: video.playbackRate,
  }
}

export function validSample(value: unknown): value is MediaSample {
  if (!value || typeof value !== 'object')
    return false
  const sample = value as MediaSample
  return Number.isFinite(sample.currentTime) && sample.currentTime >= 0
    && Number.isFinite(sample.duration) && sample.duration > 0
    && sample.currentTime <= sample.duration
    && Number.isFinite(sample.playbackRate) && sample.playbackRate > 0
    && typeof sample.paused === 'boolean' && typeof sample.ended === 'boolean'
}
