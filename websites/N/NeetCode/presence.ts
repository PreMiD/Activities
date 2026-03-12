const presence = new Presence({
  clientId: '1411956301537480746',
})

const browsingTimestamp: number = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/N/NeetCode/assets/logo.png',
}

presence.on('UpdateData', async () => {
  const { pathname, search }: Location = document.location
  const urlParams = new URLSearchParams(search)

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  if (pathname === '/' || pathname === '/home') {
    presenceData.details = 'Browsing NeetCode'
    presenceData.state = 'Homepage'
  }
  else if (pathname.includes('/courses/lessons/')) {
    presenceData.details = 'Learning on NeetCode'

    // Extract lesson name from URL
    const lessonMatch: RegExpMatchArray | null = pathname.match(/\/courses\/lessons\/([^/]+)/)
    if (lessonMatch?.[1]) {
      const lessonName: string = lessonMatch[1]
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (letter: string) => letter.toUpperCase())
      presenceData.state = `Lesson: ${lessonName}`
    }
    else {
      presenceData.state = 'Watching Lesson'
    }
  }
  else if (pathname.includes('/courses')) {
    presenceData.details = 'Learning on NeetCode'

    // Extract course name from URL
    const courseMatch: RegExpMatchArray | null = pathname.match(/\/courses\/([^/]+)/)
    if (courseMatch?.[1]) {
      const courseName: string = courseMatch[1]
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (letter: string) => letter.toUpperCase())
      presenceData.state = `Course: ${courseName}`
    }
    else {
      presenceData.state = 'Exploring Courses'
    }
  }
  else if (pathname.includes('/practice')) {
    presenceData.details = 'Practicing on NeetCode'

    const tab: string | null = urlParams.get('tab')
    if (tab) {
      switch (tab) {
        case 'coreSkills':
          presenceData.state = 'Core Skills'
          break
        case 'blind75':
          presenceData.state = 'Blind 75'
          break
        case 'neetcode150':
          presenceData.state = 'NeetCode 150'
          break
        case 'neetcode250':
          presenceData.state = 'NeetCode 250'
          break
        case 'allNC':
          presenceData.state = 'All Problems'
          break
        case 'systemDesign':
          presenceData.state = 'System Design'
          break
        default:
          presenceData.state = 'Practice Problems'
      }
    }
    else {
      presenceData.state = 'Practice Problems'
    }
  }
  else if (pathname.includes('/problems/')) {
    presenceData.details = 'Solving Problems'

    // Extract problem name from URL
    const problemMatch: RegExpMatchArray | null = pathname.match(/\/problems\/([^/]+)/)
    if (problemMatch?.[1]) {
      const problemName: string = problemMatch[1]
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (letter: string) => letter.toUpperCase())
      presenceData.state = problemName

      // Check if it's part of a specific list
      const list: string | null = urlParams.get('list')
      if (list) {
        switch (list) {
          case 'neetcode150':
            presenceData.details = 'NeetCode 150'
            break
          case 'blind75':
            presenceData.details = 'Blind 75'
            break
          case 'neetcode250':
            presenceData.details = 'NeetCode 250'
            break
        }
      }
    }
    else {
      presenceData.state = 'Coding Challenge'
    }
  }
  else if (pathname.includes('/quiz/')) {
    presenceData.details = 'Taking Quiz'

    // Extract quiz name from URL
    const quizMatch: RegExpMatchArray | null = pathname.match(/\/quiz\/([^/]+)/)
    if (quizMatch?.[1]) {
      const quizName: string = quizMatch[1]
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (letter: string) => letter.toUpperCase())
      presenceData.state = `Quiz: ${quizName}`
    }
    else {
      presenceData.state = 'Interactive Quiz'
    }
  }
  else if (pathname.includes('/roadmap')) {
    presenceData.details = 'Planning on NeetCode'
    presenceData.state = 'Following the Roadmap'
  }
  else {
    presenceData.details = 'Browsing NeetCode'
    presenceData.state = 'Exploring'
  }

  presence.setActivity(presenceData)
})
