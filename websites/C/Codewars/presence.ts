const presence = new Presence({
  clientId: '821106305241972746',
})
const timebrowsed = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const pages = document.location.pathname.split('/').filter(p => p)
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/C/Codewars/assets/logo.png',
    startTimestamp: timebrowsed,
    details: 'Browsing...',
  }
  const displayStats = await presence.getSetting<boolean>('statsdisplay')
  switch (pages[0]) {
    case 'dashboard': {
      presenceData.details = 'Viewing Dashboard'
      if (displayStats) {
        presenceData.state = `${
          document.querySelector('.ml-10px')?.textContent
        } Honor`
      }
      break
    }
    case 'topics': {
      if (pages[1]) {
        presenceData.details = 'Viewing Topic'
        presenceData.state = `Topic: ${pages[1]}`
      }
      else {
        presenceData.details = 'Viewing Forum'
      }
      break
    }
    case 'kumite': {
      presenceData.details = 'Viewing kumite'
      break
    }
    case 'subscription': {
      presenceData.details = 'Viewing Codewars Red'
      break
    }
    default:
      if (pages[0] === 'users' && pages[1] === 'leaderboard') {
        presenceData.details = 'Viewing Leaderboard'
      }
      else if (pages[0] === 'kata') {
        if (pages[2] && pages[2].startsWith('my-languages')) {
          const search = (
            document.querySelectorAll('[name="q"]')[0] as HTMLInputElement
          ).getAttribute('value') || 'All Katas'
          let difficultyFilter = document
            .querySelector<HTMLInputElement>('[Label="Difficulty"]')
            ?.getAttribute('value')
          if (difficultyFilter) {
            difficultyFilter = difficultyFilter
              ?.split(',')
              ?.map((x: string) => {
                return `${x.replace(/-/g, '').trim()} kyu`
              })
              ?.join(', ')
          }
          else {
            difficultyFilter = 'Any kyu'
          }
          presenceData.details = 'Searching Katas'
          presenceData.state = `${search} | ${difficultyFilter}`
        }
        else {
          presenceData.details = `Solving Kata | ${
            document.querySelector('.w-full>div>div>div>span')?.textContent
          }`
          presenceData.state = document.querySelector('.items-center > h4')?.textContent
        }
      }
      else if (pages[0] === 'users' && pages[1] === 'edit') {
        presenceData.details = 'Editing Account'
      }
      else if (pages[0] === 'trainer' && pages[1] === 'setup') {
        presenceData.details = 'Editing Trainer Setup'
        presenceData.state = `${
          Array.from(document.querySelectorAll('.icon-list > li > .is-active'))
            .length
        } Languages selected`
      }
      else if (
        pages[0] === 'users'
        && pages[1] !== 'leaderboard'
        && pages[1] !== 'edit'
      ) {
        const urls = Array.from(document.querySelectorAll('img')).map(
          e => e.src,
        )
        if (
          !urls.find(
            e =>
              e.includes('avatar') && e !== urls.find(e => e.includes('avatar')),
          )
        ) {
          presenceData.details = 'Viewing own profile'
          if (displayStats) {
            presenceData.state = `${
              document.querySelector('.ml-10px')?.textContent
            } Honor | ${document.querySelector('.small-hex')?.textContent}`
          }
        }
        else {
          presenceData.details = 'Viewing profile of'
          if (displayStats) {
            presenceData.state = `${pages[1]} | ${Array.from(document.querySelector('.stat-box')?.children ?? [])
              .find(e => e.textContent?.startsWith('Clan:'))
              ?.textContent
              ?.slice('Clan:'.length)}`
          }
        }
      }
  }

  if (!presenceData.details)
    presence.setActivity()
  else presence.setActivity(presenceData)
})
