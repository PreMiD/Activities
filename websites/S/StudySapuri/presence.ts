import { ActivityType, Assets, StatusDisplayType, getTimestampsFromMedia } from 'premid'

const ACTIVITY_NAME = 'スタディサプリ'
const DASHBOARD_URL = 'https://learn.studysapuri.jp/ja/dashboard'
const LEARNING_HOST = 'learn.studysapuri.jp'

type SupportedLanguage = 'en' | 'ja'

interface ActivityTextSet {
  browsingSite: string
  browsingDashboard: string
  browsingCourseCatalog: string
  browsingMyCourses: string
  browsingCourse: string
  studying: string
}

interface CommonStrings {
  playing: string
  paused: string
}

interface LessonRoute {
  topicId: string
  lessonNumber: number
}

interface CourseRoute {
  courseId: string
}

interface TopicChapter {
  title?: string
}

interface TopicContents {
  name?: string
  lesson?: {
    chapters?: TopicChapter[]
  }
}

interface CourseTopic {
  id?: string
}

interface CourseBundle {
  name?: string
  topics?: CourseTopic[]
}

interface CourseDetails {
  name?: string
  bundles?: CourseBundle[]
}

interface PresenceContext {
  commonStrings: CommonStrings
  showTimestamp: boolean
  texts: ActivityTextSet
}

enum ActivityAsset {
  Logo = 'https://i.imgur.com/SZzhg15.png',
}

const LOCALIZED_TEXT: Record<SupportedLanguage, ActivityTextSet> = {
  en: {
    browsingSite: 'Browsing StudySapuri',
    browsingDashboard: 'Browsing the dashboard',
    browsingCourseCatalog: 'Browsing the course catalog',
    browsingMyCourses: 'Browsing My Courses',
    browsingCourse: 'Viewing a course',
    studying: 'Studying',
  },
  ja: {
    browsingSite: 'スタディサプリを閲覧中',
    browsingDashboard: 'ダッシュボードを閲覧中',
    browsingCourseCatalog: '講座一覧を閲覧中',
    browsingMyCourses: 'マイ講座を閲覧中',
    browsingCourse: '講座を閲覧中',
    studying: '勉強中',
  },
}

const presence = new Presence({
  clientId: '1489808432776351795',
})

const topicCache = new Map<string, Promise<TopicContents | null>>()
const courseCache = new Map<string, Promise<CourseDetails | null>>()

function normalizeText(value: string | null | undefined) {
  if (typeof value !== 'string') {
    return null
  }

  const text = value.replace(/\s+/g, ' ').trim()
  return text.length > 0 ? text : null
}

function clampText(value: string | null | undefined, maxLength = 128) {
  const text = normalizeText(value)
  if (!text) {
    return null
  }

  if (text.length <= maxLength) {
    return text
  }

  return `${text.slice(0, Math.max(0, maxLength - 3))}...`
}

function getPathSegments() {
  return window.location.pathname.split('/').filter(Boolean)
}

function getNormalizedPathname() {
  return window.location.pathname.replace(/^\/[a-z]{2}(?=\/|$)/i, '') || '/'
}

function isLearningHost() {
  return window.location.hostname === LEARNING_HOST
}

function getLessonRoute(): LessonRoute | null {
  const segments = getPathSegments()
  const topicsIndex = segments.indexOf('topics')

  if (topicsIndex === -1) {
    return null
  }

  const topicId = segments[topicsIndex + 1]
  const pageType = segments[topicsIndex + 2]
  const lessonNumber = Number.parseInt(segments[topicsIndex + 3] || '', 10)

  if (!topicId || pageType !== 'lessons' || !Number.isFinite(lessonNumber)) {
    return null
  }

  return {
    topicId,
    lessonNumber,
  }
}

function getCourseRoute(): CourseRoute | null {
  const segments = getPathSegments()
  const coursesIndex = segments.indexOf('courses')

  if (coursesIndex === -1) {
    return null
  }

  const courseId = segments[coursesIndex + 1]

  if (!courseId) {
    return null
  }

  return { courseId }
}

function getCourseLink() {
  return document.querySelector<HTMLAnchorElement>('a[href*="/courses/"]')
}

function getCourseIdFromPage() {
  const courseRoute = getCourseRoute()

  if (courseRoute) {
    return courseRoute.courseId
  }

  const courseLink = getCourseLink()
  const href = courseLink?.getAttribute('href') || courseLink?.href || ''
  const match = href.match(/\/courses\/([^/?#]+)/)

  return match ? match[1] : null
}

function getCourseUrlFromPage() {
  const courseRoute = getCourseRoute()

  if (courseRoute) {
    return window.location.href
  }

  const courseLink = getCourseLink()
  const href = courseLink?.getAttribute('href') || courseLink?.href || ''

  if (!href) {
    return null
  }

  try {
    return new URL(href, window.location.origin).toString()
  }
  catch {
    return null
  }
}

function getCurrentVideo() {
  return document.querySelector('video')
}

function getCurrentChapterLabel() {
  return clampText(document.querySelector('h2')?.textContent)
}

function getCurrentCourseHeading() {
  return clampText(document.querySelector('h1')?.textContent)
}

function getAccessToken() {
  const tokenCookie = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith('qlearn_access_token='))

  if (!tokenCookie) {
    return null
  }

  return decodeURIComponent(tokenCookie.split('=').slice(1).join('='))
}

// The learning site exposes stable, authenticated APIs for course and topic labels.
// Using them is more resilient than depending on hashed class names in the SPA UI.
async function fetchStudySapuriJson<T>(path: string): Promise<T | null> {
  const token = getAccessToken()

  if (!token) {
    return null
  }

  try {
    const response = await fetch(path, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
      credentials: 'same-origin',
    })

    if (!response.ok) {
      return null
    }

    return await response.json()
  }
  catch {
    return null
  }
}

function getCachedValue<T>(
  cache: Map<string, Promise<T | null>>,
  key: string,
  load: () => Promise<T | null>,
): Promise<T | null> {
  if (!cache.has(key)) {
    cache.set(
      key,
      load()
        .then((result: T | null) => {
          if (!result) {
            cache.delete(key)
          }

          return result
        })
        .catch(() => {
          cache.delete(key)
          return null
        }),
    )
  }

  return cache.get(key)!
}

function getTopicContents(topicId: string) {
  return getCachedValue(topicCache, topicId, () =>
    fetchStudySapuriJson<TopicContents>(`/v1/topic/${topicId}/contents?sections=true`),
  )
}

function getCourseDetails(courseId: string) {
  return getCachedValue(courseCache, courseId, () =>
    fetchStudySapuriJson<CourseDetails>(`/v2/course/${courseId}?with_topic_status=true`),
  )
}

function findBundleForTopic(courseDetails: CourseDetails | null, topicId: string) {
  if (!courseDetails || !Array.isArray(courseDetails.bundles)) {
    return null
  }

  return (
    courseDetails.bundles.find(
      (bundle: CourseBundle) =>
        Array.isArray(bundle.topics) &&
        bundle.topics.some((topic: CourseTopic) => topic?.id === topicId),
    ) || null
  )
}

function getVideoTimestamps(video: HTMLVideoElement) {
  if (!Number.isFinite(video.currentTime) || !Number.isFinite(video.duration)) {
    return null
  }

  if (video.duration <= 0) {
    return null
  }

  return getTimestampsFromMedia(video)
}

function resolveLanguage(languageSetting: string | null | undefined): SupportedLanguage {
  return languageSetting?.toLowerCase().startsWith('ja') ? 'ja' : 'en'
}

async function getCommonStrings(fallbackLanguage: SupportedLanguage) {
  try {
    return await presence.getStrings({
      paused: 'general.paused',
      playing: 'general.playing',
    }) as CommonStrings
  }
  catch {
    if (fallbackLanguage === 'ja') {
      return {
        paused: '一時停止中',
        playing: '再生中',
      }
    }

    return {
      paused: 'Paused',
      playing: 'Playing',
    }
  }
}

async function buildLessonPresence(route: LessonRoute, context: PresenceContext) {
  const courseId = getCourseIdFromPage()
  const courseUrl = getCourseUrlFromPage()

  const [topicContents, courseDetails] = await Promise.all([
    getTopicContents(route.topicId),
    courseId ? getCourseDetails(courseId) : Promise.resolve(null),
  ])

  const matchedBundle = findBundleForTopic(courseDetails, route.topicId)
  const currentChapter = topicContents?.lesson?.chapters?.[route.lessonNumber - 1] || null

  const courseName = clampText(courseDetails?.name) || getCurrentCourseHeading() || ACTIVITY_NAME
  const lessonName = clampText(matchedBundle?.name)
  const topicName = clampText(topicContents?.name)
  const chapterLabel = getCurrentChapterLabel() || clampText(currentChapter?.title) || topicName
  const stateParts = [lessonName, chapterLabel].filter(Boolean)
  const video = getCurrentVideo()
  const isPlaying = Boolean(video && !video.paused)
  const timestamps = context.showTimestamp && video && !video.paused
    ? getVideoTimestamps(video)
    : null

  const presenceData: PresenceData = {
    name: ACTIVITY_NAME,
    type: ActivityType.Watching,
    details: courseName,
    detailsUrl: courseUrl || DASHBOARD_URL,
    state: clampText(stateParts.join(' / ')) || context.texts.studying,
    stateUrl: window.location.href,
    statusDisplayType: StatusDisplayType.Name,
    largeImageKey: ActivityAsset.Logo,
    smallImageKey: isPlaying ? Assets.Play : Assets.Pause,
    smallImageText: isPlaying ? context.commonStrings.playing : context.commonStrings.paused,
  }

  if (timestamps) {
    presenceData.startTimestamp = timestamps[0]
    presenceData.endTimestamp = timestamps[1]
  }

  return presenceData
}

async function buildCoursePresence(route: CourseRoute, context: PresenceContext) {
  const courseDetails = await getCourseDetails(route.courseId)
  const courseName = clampText(courseDetails?.name) || getCurrentCourseHeading() || context.texts.browsingCourse

  const presenceData: PresenceData = {
    name: ACTIVITY_NAME,
    details: courseName,
    detailsUrl: window.location.href,
    state: context.texts.browsingCourse,
    stateUrl: window.location.href,
    statusDisplayType: StatusDisplayType.Name,
    largeImageKey: ActivityAsset.Logo,
  }

  return presenceData
}

function getGenericDetails(texts: ActivityTextSet) {
  if (!isLearningHost()) {
    return texts.browsingSite
  }

  switch (getNormalizedPathname()) {
    case '/dashboard':
      return texts.browsingDashboard
    case '/course_sets':
      return texts.browsingCourseCatalog
    case '/my_courses':
      return texts.browsingMyCourses
    default:
      return texts.studying
  }
}

function buildGenericPresence(context: PresenceContext) {
  const presenceData: PresenceData = {
    name: ACTIVITY_NAME,
    details: getGenericDetails(context.texts),
    detailsUrl: isLearningHost() ? DASHBOARD_URL : window.location.origin,
    state: ACTIVITY_NAME,
    stateUrl: window.location.href,
    statusDisplayType: StatusDisplayType.Name,
    largeImageKey: ActivityAsset.Logo,
  }

  return presenceData
}

presence.on('UpdateData', async () => {
  const [languageSetting, showTimestamp] = await Promise.all([
    presence.getSetting<string>('lang'),
    presence.getSetting<boolean>('showTimestamp'),
  ])

  const language = resolveLanguage(languageSetting)
  const context: PresenceContext = {
    commonStrings: await getCommonStrings(language),
    showTimestamp: Boolean(showTimestamp),
    texts: LOCALIZED_TEXT[language],
  }

  const lessonRoute = getLessonRoute()
  const courseRoute = getCourseRoute()

  const presenceData = lessonRoute
    ? await buildLessonPresence(lessonRoute, context)
    : courseRoute
      ? await buildCoursePresence(courseRoute, context)
      : buildGenericPresence(context)

  if (!presenceData.details) {
    presence.clearActivity()
    return
  }

  presence.setActivity(presenceData)
})
