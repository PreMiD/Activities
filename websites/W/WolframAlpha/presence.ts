import { Assets } from 'premid'

const presence = new Presence({
  clientId: '826428815365373994',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)
const path = document.location.pathname

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/W/WolframAlpha/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }

  if (path.includes('/input')) {
    presenceData.details = 'Searching for:'
    presenceData.state = document.querySelector('._9CcbX')?.textContent
    presenceData.smallImageKey = Assets.Search
  }
  else if (path.includes('/examples')) {
    const title = document.querySelector('#page-title')?.textContent

    presenceData.details = 'Viewing Page:'
    presenceData.state = 'Examples page'

    switch (path.includes('/mathematics')) {
      case path.includes('/elementary-math'):
      case path.includes('/algebra'):
      case path.includes('/calculus-and-analysis'):
      case path.includes('/geometry'):
      case path.includes('/plotting-and-graphics'):
      case path.includes('/differential-equations'):
      case path.includes('/numbers'):
      case path.includes('/trigonometry'):
      case path.includes('/linear-algebra'):
      case path.includes('/discrete-mathematics'):
      case path.includes('/number-theory'):
      case path.includes('/complex analysis'):
      case path.includes('/mathematical-function'):
      case path.includes('/logic-and-set-theory'):
      case path.includes('/mathematical-definitions'):
      case path.includes('/continued-fractions'):
      case path.includes('/famous-maths-problems'):
      case path.includes('/statistics'):
      case path.includes('/common-core-maths'):
      case path.includes('/probability'):
        presenceData.details = 'Reading about:'
        presenceData.state = `${title} examples`
        presenceData.smallImageKey = Assets.Reading
        presenceData.smallImageText = 'Mathematics'
        break
      default:
        presenceData.details = 'Looking at:'
        presenceData.state = 'Mathematics examples'
        presenceData.smallImageKey = Assets.Reading
    }
    switch (path.includes('/science-and technology')) {
      case path.includes('/physiscs'):
      case path.includes('/chemistry'):
      case path.includes('/units-and-measures'):
      case path.includes('/engineering'):
      case path.includes('/computational-sciences'):
      case path.includes('/earth-sciences'):
      case path.includes('/materials'):
      case path.includes('/transportation'):
      case path.includes('/technological-world'):
      case path.includes('/life-sciences'):
      case path.includes('/space-and-astronomy'):
      case path.includes('/weather-and-meteorology'):
      case path.includes('/physical-geography'):
      case path.includes('/health-and-medicine'):
      case path.includes('/food-science'):
        presenceData.details = 'Reading about:'
        presenceData.state = `${title} examples`
        presenceData.smallImageKey = Assets.Reading
        presenceData.smallImageText = 'Science & Technology'
        break
      default:
        presenceData.details = 'Looking at:'
        presenceData.state = 'Science & technology examples'
        presenceData.smallImageKey = Assets.Reading
    }
    switch (path.includes('/society-and-culture')) {
      case path.includes('/people'):
      case path.includes('/arts-and-media'):
      case path.includes('/history'):
      case path.includes('/words-and-linguistics'):
      case path.includes('/money-and-finance'):
      case path.includes('/dates-and-times'):
      case path.includes('/food-and-nutrition'):
      case path.includes('/demographics-and-social-statistics'):
      case path.includes('/institutions-and-organizations'):
      case path.includes('/art-and-design'):
      case path.includes('/political-geography'):
      case path.includes('/points-of-interest'):
      case path.includes('/games-and-puzzles'):
      case path.includes('/economic-data'):
      case path.includes('/education'):
        presenceData.details = 'Reading about:'
        presenceData.state = `${title} examples`
        presenceData.smallImageKey = Assets.Reading
        presenceData.smallImageText = 'Society & Culture'
        break
      default:
        presenceData.details = 'Looking at:'
        presenceData.state = 'Society & culture examples'
        presenceData.smallImageKey = Assets.Reading
    }
    switch (path.includes('/every-life')) {
      case path.includes('/personal-health'):
      case path.includes('/personal-finance'):
      case path.includes('/surprises'):
      case path.includes('/household-math'):
      case path.includes('/household-science'):
      case path.includes('/entertainment'):
      case path.includes('/travel'):
      case path.includes('/dates-and-times'):
      case path.includes('/todays-world'):
      case path.includes('/hobbies'):
        presenceData.details = 'Reading about:'
        presenceData.state = `${title} examples`
        presenceData.smallImageKey = Assets.Reading
        presenceData.smallImageText = 'Everyday life'
        break
      default:
        presenceData.details = 'Looking at:'
        presenceData.state = 'Everyday life examples'
        presenceData.smallImageKey = Assets.Reading
    }
  }
  else if (path.includes('/api')) {
    presenceData.details = 'Reading about:'
    presenceData.state = 'API documentation'
    presenceData.smallImageKey = Assets.Reading
  }
  else if (path.includes('/login')) {
    presenceData.details = 'Viewing Page:'
    presenceData.state = 'Login page'
  }
  else if (path.includes('/problem-generator')) {
    if (path.includes('/quiz')) {
      const theme = document.querySelector('.categoryTitle')?.textContent?.trim()
      let determinant = 'a '
      if (theme?.startsWith('A'))
        determinant = 'an '

      presenceData.details = `Playing ${determinant}${theme} Quiz:`
      presenceData.state = `${document
        .querySelector('.topicTitle')
        ?.textContent
        ?.trim()} quiz | ${document
        .querySelector('.titleBar.Beginner')
        ?.textContent
        ?.trim()} | Correct: ${document
        .querySelector('.purpleBox')
        ?.textContent
        ?.trim()}`
    }
    else {
      presenceData.details = 'Looking at:'
      presenceData.state = 'Maths problems'
      presenceData.smallImageKey = Assets.Search
    }
  }
  else if (path.includes('/mobile')) {
    presenceData.details = 'Viewing Page:'
    presenceData.state = 'Mobile downloads page'
  }
  else if (path.includes('/pro')) {
    presenceData.details = 'Viewing Page:'
    presenceData.state = 'Pro subscribe page'
  }
  else if (path.includes('/web-apps')) {
    presenceData.details = 'Viewing Page:'
    presenceData.state = 'Web apps page'
  }
  else if (path.includes('/tour')) {
    presenceData.details = 'Viewing Page:'
    presenceData.state = 'Tour page'
  }
  else if (path.includes('/contact-us')) {
    presenceData.details = 'Viewing Page:'
    presenceData.state = 'Contact page'
  }
  else if (path.includes('/about')) {
    presenceData.details = 'Viewing Page:'
    presenceData.state = 'About page'
  }
  else if (path.includes('/resources')) {
    presenceData.details = 'Viewing Page:'
    presenceData.state = 'Resources page'
  }
  else if (path.includes('/downloads')) {
    presenceData.details = 'Viewing Page:'
    presenceData.state = 'Downloads page'
  }
  else if (path.includes('/widgets')) {
    presenceData.details = 'Viewing Page:'
    presenceData.state = 'Widgets page'
  }
  else if (path.includes('/social')) {
    presenceData.details = 'Viewing Page:'
    presenceData.state = 'Social page'
  }
  else if (path.includes('/termsofuse')) {
    presenceData.details = 'Viewing Page:'
    presenceData.state = 'ToS page'
  }
  else {
    presenceData.details = 'Viewing Page:'
    presenceData.state = 'Home page'
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
