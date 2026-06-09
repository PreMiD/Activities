import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '503557087041683458',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

function getActiveCourseFromTopNav(): { title: string, progress: string } | null {
  const learnLink = document.querySelector('header a[href="/learn"]')
  if (!learnLink)
    return null
  const titleEl = learnLink.nextElementSibling?.nextElementSibling as HTMLElement
  if (!titleEl)
    return null
  const text = titleEl.textContent || ''
  const parts = text.split('•')
  const title = parts[0]?.trim() || ''
  const progress = parts[1]?.trim() || ''
  if (!title)
    return null
  return { title, progress }
}

function getTodayStudyTime(): string {
  const ms = Number(localStorage.getItem('senku_studySessionTotal')) || 0
  if (ms <= 0)
    return ''
  const totalMinutes = Math.round(ms / 60000)
  if (totalMinutes <= 0) {
    const totalSeconds = Math.round(ms / 1000)
    if (totalSeconds > 0) {
      return 'Study Time: 1m'
    }
    return 'Study Time: 0m'
  }

  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours > 0) {
    return `Study Time: ${hours}h ${minutes}m`
  }
  return `Study Time: ${minutes}m`
}

function getTodayGoals(): { completed: number, total: number, percent: number } | null {
  const elements = Array.from(document.querySelectorAll('*'))
  let metaText = ''
  for (const el of elements) {
    const text = el.textContent?.trim() || ''
    if (/\d+\s+of\s+\d+\s+lectures/i.test(text) && el.children.length === 0) {
      metaText = text
      break
    }
  }

  if (!metaText)
    return null

  const match = metaText.match(/(\d+)\s+of\s+(\d+)/i)
  if (!match)
    return null

  const completed = Number(match[1])
  const total = Number(match[2])
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0

  return { completed, total, percent }
}

function getNextExam(): { name: string, date: string, daysLeft: number } | null {
  const elements = Array.from(document.querySelectorAll('*'))
  let examHeaderEl = null
  for (const el of elements) {
    if (el.textContent?.trim().includes('Next Exam') && el.children.length === 0) {
      examHeaderEl = el
      break
    }
  }

  if (!examHeaderEl)
    return null

  const parent = examHeaderEl.parentElement
  if (!parent)
    return null

  const children = Array.from(parent.children)
  const nameEl = children[1]
  const dateEl = children[2]

  const name = nameEl?.textContent?.trim() || ''
  const date = dateEl?.textContent?.trim() || ''

  if (!name || name === 'Loading...' || name === 'No Data' || name === 'All Clear! 🎉')
    return null

  let daysLeft = 9999
  const inMatch = date.match(/(?:In|Starts\s+In)\s+(\d+)\s+Day/i)
  if (inMatch) {
    daysLeft = Number(inMatch[1])
  }
  else if (/\b(?:today|tomorrow)\b/i.test(date)) {
    daysLeft = /\btoday\b/i.test(date) ? 0 : 1
  }

  return { name, date, daysLeft }
}

function getSemesterProgress(): string | null {
  const elements = Array.from(document.querySelectorAll('*'))
  let progressHeaderEl = null
  for (const el of elements) {
    if (el.textContent?.trim().includes('Semester Progress') && el.children.length === 0) {
      progressHeaderEl = el
      break
    }
  }

  if (!progressHeaderEl)
    return null

  const parent = progressHeaderEl.parentElement
  if (!parent)
    return null

  const children = Array.from(parent.children)
  const valueEl = children[1]
  const val = valueEl?.textContent?.trim() || ''

  if (!val || val === '...')
    return null

  return val
}

interface IFrameVideoData {
  duration: number
  currentTime: number
  paused: boolean
  hasVideo: boolean
}

let videoData: IFrameVideoData = {
  duration: 0,
  currentTime: 0,
  paused: true,
  hasVideo: false,
}

presence.on('iFrameData', (data: IFrameVideoData) => {
  videoData = { ...data }
})

presence.on('UpdateData', async () => {
  const [showTimestamps, showButtons] = await Promise.all([
    presence.getSetting<boolean>('showTimestamps'),
    presence.getSetting<boolean>('showButtons'),
  ])

  const { pathname, href } = document.location

  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/S/Senku%20Library/assets/logo.png',
    largeImageText: 'Senku\'s Library',
    type: ActivityType.Watching,
  }

  const todayStudyTime = getTodayStudyTime()
  const appendStudyTime = (text: string) => {
    if (todayStudyTime) {
      return `${text} | ${todayStudyTime}`
    }
    return text
  }

  // Determine which page/state we are in
  if (pathname.startsWith('/course/')) {
    // 1. Extract Course Title & overall progress
    let courseTitle = ''
    let courseProgress = ''
    const navCourse = getActiveCourseFromTopNav()

    if (navCourse) {
      courseTitle = navCourse.title
      courseProgress = navCourse.progress
    }
    else {
      const courseTitleEl = document.querySelector('.glass-panel h2')
      if (courseTitleEl) {
        courseTitle = courseTitleEl.textContent?.trim() || ''
      }
    }

    if (!courseTitle) {
      courseTitle = 'Course'
    }

    // 2. Extract Active Lesson Title, Unit / Lec indices, and Unit Name
    const activeLessonEl = document.querySelector('.course-playlist-lesson-item.is-active')
    let lessonTitle = ''
    let unitNo = ''
    let lecNo = ''
    let totalLecs = 0
    let unitName = ''

    if (activeLessonEl) {
      const titleEl = activeLessonEl.querySelector('.course-playlist-lesson-title')
      const rawTitle = titleEl?.textContent?.trim() || ''

      const indexMatch = rawTitle.match(/^(\d+)\.(\d+)/)
      if (indexMatch) {
        unitNo = indexMatch[1] || ''
        lecNo = indexMatch[2] || ''
        lessonTitle = rawTitle.slice(indexMatch[0].length).trim()

        // Find sibling elements in the same unit to count total lectures
        const innerWrapper = activeLessonEl.closest('.course-playlist-lessons-inner')
        if (innerWrapper) {
          const siblingLessons = innerWrapper.querySelectorAll('.course-playlist-lesson-item')
          totalLecs = siblingLessons.length
        }
      }
      else {
        lessonTitle = rawTitle.replace(/^\d+(?:\.\d+)?\s+/, '')
      }

      // Extract unit name instead of video title
      const lessonsEl = activeLessonEl.closest('.course-playlist-lessons')
      const chapterTitleEl = lessonsEl?.previousElementSibling?.querySelector('.chapter-title-full')
        || lessonsEl?.parentElement?.querySelector('.chapter-title-full')
      if (chapterTitleEl) {
        const fullTitle = chapterTitleEl.textContent?.trim() || ''
        unitName = fullTitle.split(':').slice(1).join(':').trim() || fullTitle
      }
    }

    if (!unitName) {
      unitName = lessonTitle || 'Overview'
    }

    presenceData.details = `Studying ${courseTitle}`
    if (courseProgress) {
      presenceData.details += ` (${courseProgress})`
    }
    presenceData.details = appendStudyTime(presenceData.details)

    if (unitNo && lecNo) {
      if (totalLecs > 0) {
        presenceData.state = `Unit ${unitNo}: ${unitName} (Lec ${lecNo}/${totalLecs})`
      }
      else {
        presenceData.state = `Unit ${unitNo}: ${unitName} (Lec ${lecNo})`
      }
    }
    else {
      presenceData.state = `Topic: ${unitName}`
    }

    // 3. Extract Video Player status & active timestamps
    const progressTrack = document.querySelector('.senku-progress-track')
    const hasCustomVideo = !!progressTrack
    const hasYtIframe = !!(document.querySelector('iframe[src*="youtube.com"]') || document.querySelector('iframe[src*="youtube-nocookie.com"]'))

    if (hasCustomVideo) {
      const duration = Number(progressTrack.getAttribute('aria-valuemax')) || 0
      const currentTime = Number(progressTrack.getAttribute('aria-valuenow')) || 0

      // Check if video is playing or paused using the footer controls SVG class names
      const pauseIcon = document.querySelector('.senku-footer-btn svg.lucide-pause')
      const isPlaying = !!pauseIcon

      presenceData.smallImageKey = isPlaying ? Assets.Play : Assets.Pause
      presenceData.smallImageText = isPlaying ? 'Playing' : 'Paused'

      if (isPlaying && duration > 0 && showTimestamps) {
        const [startTs, endTs] = getTimestamps(
          Math.floor(currentTime),
          Math.floor(duration),
        )
        presenceData.startTimestamp = startTs
        presenceData.endTimestamp = endTs
      }
      else {
        presenceData.startTimestamp = browsingTimestamp
      }
    }
    else if (hasYtIframe && videoData.hasVideo && videoData.duration > 0) {
      // Use YouTube iframe player data fetched from iframe.ts script
      const isPlaying = !videoData.paused

      presenceData.smallImageKey = isPlaying ? Assets.Play : Assets.Pause
      presenceData.smallImageText = isPlaying ? 'Playing' : 'Paused'

      if (isPlaying && showTimestamps) {
        const [startTs, endTs] = getTimestamps(
          Math.floor(videoData.currentTime),
          Math.floor(videoData.duration),
        )
        presenceData.startTimestamp = startTs
        presenceData.endTimestamp = endTs
      }
      else {
        presenceData.startTimestamp = browsingTimestamp
      }
    }
    else {
      // Document course / reading mode
      presenceData.smallImageKey = Assets.Reading
      presenceData.smallImageText = 'Reading Documents'
      presenceData.startTimestamp = browsingTimestamp
    }
  }
  else if (pathname.startsWith('/ai-tutor')) {
    presenceData.details = appendStudyTime('Consulting AI Tutor')
    presenceData.state = 'Solving study doubts'
    presenceData.smallImageKey = Assets.Search
    presenceData.smallImageText = 'AI Doubts Solving'
    presenceData.startTimestamp = browsingTimestamp
  }
  else if (pathname.startsWith('/roadmap')) {
    presenceData.details = appendStudyTime('Viewing Study Roadmap')
    presenceData.state = 'Mapping academic progress'
    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = 'Planning Career Paths'
    presenceData.startTimestamp = browsingTimestamp
  }
  else if (pathname.startsWith('/planner')) {
    presenceData.details = appendStudyTime('Managing Study Planner')
    presenceData.state = 'Scheduling lectures & prep'
    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = 'Scheduling Lectures'
    presenceData.startTimestamp = browsingTimestamp
  }
  else if (pathname.startsWith('/calendar')) {
    presenceData.details = appendStudyTime('Checking Academic Calendar')
    presenceData.state = 'Viewing schedules & exams'
    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = 'Checking Exam Dates'
    presenceData.startTimestamp = browsingTimestamp
  }
  else if (pathname.startsWith('/profile')) {
    presenceData.details = appendStudyTime('Managing Profile')
    presenceData.state = 'Tuning library vibes'
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = 'Configuring Profile'
    presenceData.startTimestamp = browsingTimestamp
  }
  else if (pathname.startsWith('/settings')) {
    presenceData.details = appendStudyTime('Managing Settings')
    presenceData.state = 'Tuning library configurations'
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = 'Configuring Settings'
    presenceData.startTimestamp = browsingTimestamp
  }
  else if (pathname.startsWith('/onboarding')) {
    presenceData.details = appendStudyTime('Setting up Library')
    presenceData.state = 'Onboarding'
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = 'Getting Started'
    presenceData.startTimestamp = browsingTimestamp
  }
  else if (pathname.startsWith('/learn')) {
    presenceData.details = appendStudyTime('Browsing Courses')
    presenceData.state = 'Selecting what to learn next'
    presenceData.smallImageKey = Assets.Search
    presenceData.smallImageText = 'Browsing Catalog'
    presenceData.startTimestamp = browsingTimestamp
  }
  else if (pathname === '/' || pathname === '/dashboard') {
    presenceData.details = appendStudyTime('At the Dashboard')

    const goals = getTodayGoals()
    const exam = getNextExam()
    const semProgress = getSemesterProgress()

    const stateParts: string[] = []
    if (goals) {
      stateParts.push(`Goals: ${goals.completed}/${goals.total} (${goals.percent}%)`)
    }
    if (semProgress) {
      stateParts.push(`Sem Progress: ${semProgress}`)
    }
    if (exam && exam.daysLeft <= 21) {
      const cleanDate = exam.date.replace(/^Expected\s+/i, '')
      stateParts.push(`Exam: ${exam.name} (${cleanDate})`)
    }

    if (stateParts.length > 0) {
      presenceData.state = stateParts.join(' | ')
    }
    else {
      presenceData.state = 'Checking study progress'
    }

    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = 'Overview'
    presenceData.startTimestamp = browsingTimestamp
  }
  else {
    presenceData.details = appendStudyTime('Browsing Library')
    presenceData.state = 'Exploring'
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = 'Exploring'
    presenceData.startTimestamp = browsingTimestamp
  }

  if (showButtons) {
    presenceData.buttons = [
      {
        label: 'Open Library',
        url: href,
      },
    ]
  }

  presence.setActivity(presenceData)
})
