const presence = new Presence({
  clientId: '1013489969379152022',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/T/The%20Odin%20Project/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const lesson = document.querySelector<HTMLHeadingElement>(
    'body > div.page-container.lesson > header > div > div > h1',
  )
  const course = document.querySelector<HTMLHeadingElement>(
    'body > div.gradient.odin-dark-bg > div > div:nth-child(1) > a > h1',
  )
  const courseTitle = document.querySelector<HTMLHeadElement>(
    'body > div.page-container.lesson > header > div > div > a > h2',
  )
  const path = document.location.pathname
  switch (path) {
    case '/paths': {
      presenceData.state = 'Viewing all Paths'
      break
    }
    case '/paths/full-stack-javascript': {
      presenceData.state = 'Viewing the Full Stack Javascript Path'
      break
    }
    case '/paths/full-stack-ruby-on-rails': {
      presenceData.state = 'Viewing the Full Stack Ruby Path'
      break
    }
    case '/paths/foundations/courses/foundations': {
      presenceData.state = 'Viewing the Foundations Path'
      break
    }
    default:
      presenceData.state = 'Viewing Dashboard'
  }

  if (path.includes('/paths/full-stack-javascript/courses/')) {
    presenceData.details = 'Full Stack Javascript - Courses'
    presenceData.state = `${course?.textContent}`
  }
  else if (path.includes('/paths/full-stack-ruby-on-rails/courses/')) {
    presenceData.details = 'Full Stack Ruby - Courses'
    presenceData.state = `${course?.textContent}`
  }
  else if (path.includes('/foundations-')) {
    presenceData.state = `${lesson?.textContent}`
    presenceData.details = 'Foundations - Lessons'
  }
  else if (path.includes('/lessons/node-')) {
    presenceData.details = courseTitle?.textContent
    presenceData.state = lesson?.textContent
  }
  else if (path.includes('/lessons/ruby-')) {
    presenceData.details = courseTitle?.textContent
    presenceData.state = lesson?.textContent
  }
  presence.setActivity(presenceData)
})
