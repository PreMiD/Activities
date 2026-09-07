const presence = new Presence({
  clientId: '1546333183132565535',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const showNames = await presence.getSetting<boolean>('showNames')
  const { pathname } = document.location
  const presenceData: PresenceData = {
    largeImageKey: 'https://github.com/user-attachments/assets/a456896f-d063-46ee-94e6-cad07feb0f12',
    startTimestamp: browsingTimestamp,
    details: 'Browsing RNGdle',
  }

  if (pathname === '/') {
    const profileLink = document.querySelector('header a[href="/profile"]')
    const username = profileLink?.querySelector('span')?.textContent?.trim()
    const score = document.querySelector('main div.type-data.inline-flex')?.textContent?.trim()
    const lifetimeLabel = [...document.querySelectorAll('main .type-meta')]
      .find(element => element.textContent?.trim() === 'Your lifetime EP')
    const lifetime = lifetimeLabel?.parentElement?.querySelector('.type-data')?.textContent?.trim()
    const completed = [...document.querySelectorAll('main .type-meta')]
      .some(element => element.textContent?.trim() === 'Next roll in')

    presenceData.details = showNames && username && username !== 'Profile'
      ? `Playing as ${username}`
      : 'Playing the daily roll'

    const scores: string[] = []
    // The score animates while badges are revealed; only publish the final total.
    if (completed && score && /^[\d,]+ EP$/.test(score))
      scores.push(`Today: ${score}`)
    if (lifetime && /^[\d,]+ EP$/.test(lifetime))
      scores.push(`Lifetime: ${lifetime}`)

    if (scores.length)
      presenceData.state = scores.join(' | ')
  }
  else if (pathname === '/leaderboard') {
    presenceData.details = 'Browsing the leaderboard'
    const period = document.querySelector('main button.border-prose')?.textContent?.trim()
    if (period)
      presenceData.state = period
  }
  else if (/^\/u\/[^/]+\/?$/.test(pathname)) {
    const username = document.querySelector('main h1')?.textContent?.trim()
    const scoreLabel = [...document.querySelectorAll('main .type-label')]
      .find(element => element.textContent?.trim() === 'Total EP')
    const score = scoreLabel?.nextElementSibling?.textContent?.trim()

    presenceData.details = 'Viewing a player profile'
    if (showNames && username)
      presenceData.details = `Viewing ${username}'s profile`
    if (score && /^[\d,]+$/.test(score))
      presenceData.state = `Lifetime: ${score} EP`
  }
  else if (/^\/u\/[^/]+\/roll\/\d+\/?$/.test(pathname)) {
    presenceData.details = 'Viewing a roll'
    const score = document.querySelector('main .type-data')?.textContent?.trim()
    if (score && /^[\d,]+ EP$/.test(score))
      presenceData.state = `Score: ${score}`
  }
  else if (/^\/u\/[^/]+\/badges\/[^/]+\/?$/.test(pathname)) {
    presenceData.details = 'Viewing a badge collection'
  }
  else if (pathname === '/about') {
    presenceData.details = 'Reading about RNGdle'
  }
  else if (pathname === '/profile') {
    presenceData.details = 'Viewing their profile'
  }
  else if (pathname === '/friends') {
    presenceData.details = 'Viewing friends'
  }
  else {
    presence.clearActivity()
    return
  }

  presence.setActivity(presenceData)
})
