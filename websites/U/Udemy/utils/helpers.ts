import { UNKNOWN_COURSE, UNKNOWN_LECTURE } from './constants.js'

export function getVideoInfo() {
  const video = document.querySelector('video')
  if (!video || video.readyState === 0)
    return null

  const courseTitle = document.querySelector('h1[data-purpose=course-header-title] a')?.textContent || UNKNOWN_COURSE
  const currentLecture = document.querySelector('div[data-purpose="curriculum-item-viewer-content"] section')?.ariaLabel?.split(', ')?.[1]?.match(/\d+:\s*.+/)?.[0] || document.querySelector('li[class*=curriculum-item-link--is-current] span > span')
    ?.textContent || UNKNOWN_LECTURE

  return {
    title: courseTitle,
    lecture: currentLecture,
    isPlaying: !video.paused,
    currentTime: video.currentTime,
    duration: video.duration,
    video,
  }
}

export function getCourseInfo() {
  return (
    document.querySelector('h1[data-purpose="lead-title"]')?.textContent || UNKNOWN_COURSE
  )
}

export function normalizePath(pathname: string) {
  return pathname.replace(/\/$/, '')
}
