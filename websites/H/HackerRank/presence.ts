const presence = new Presence({
  clientId: '655534149871992845',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/H/HackerRank/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const path = (text: string) => {
    return document.location.pathname.includes(text)
  }
  const title = document.querySelector('h1')?.textContent

  if (path('/dashboard')) {
    presenceData.details = 'In dashboard'
  }
  else if (path('/domains')) {
    presenceData.details = 'Viewing challenges:'
    presenceData.state = title
  }
  else if (path('/challenges')) {
    presenceData.details = 'Solving a challenge:'
    presenceData.state = title
  }
  else if (path('/skills-verification')) {
    presenceData.details = 'Skills Certification'
    if (title !== 'Get Your Skills Certified')
      presenceData.state = title?.split('Skills Certification Test')[0]?.trim()
  }
  else if (path('/competitions')) {
    presenceData.details = 'Viewing a competition:'
    presenceData.state = title
  }
  else if (path('/inbox')) {
    presenceData.details = 'Viewing inbox'
  }
  else if (path('/notifications')) {
    presenceData.details = 'Viewing notifications'
  }
  else if (
    document.querySelector(
      '#content button.ui-btn.ui-btn-normal.ui-btn-primary.profile-btn-follow.ui-btn-styled',
    )
  ) {
    // profiles
    presenceData.details = 'Viewing profile of:'
    presenceData.state = `${title} (${
      document.querySelector('#content p.profile-username-heading')?.textContent
    })`
  }
  else if (
    document.location.pathname.match(/\/companies\/.*?\/jobs/g)
    && title !== 'Find Your Dream Job'
  ) {
    presenceData.details = 'Viewing a job:'
    presenceData.state = title
  }
  else if (path('/jobs/')) {
    presenceData.details = 'Viewing jobs'
  }
  else if (path('/companies')) {
    presenceData.details = 'Viewing a company:'
    presenceData.state = document
      .querySelector('p')
      ?.textContent
      ?.split('More about')[1]
      ?.trim()
  }
  else if (path('/leaderboard')) {
    presenceData.details = 'Viewing a leaderboard:'
    presenceData.state = document.querySelector(
      'span.selected-track-name',
    )?.textContent
  }
  presence.setActivity(presenceData)
})
