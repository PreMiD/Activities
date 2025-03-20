import { Assets } from 'premid'

const presence = new Presence({
  clientId: '842486883128705024',
})
const path = location.pathname
const timeElapsed = ~~(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/C/Codeforces/assets/logo.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: timeElapsed,
  }

  switch (path.split('/')[1]) {
    case 'top': {
      presenceData.details = 'Browsing through'
      presenceData.state = 'Top Recent Blog Posts'
      break
    }

    case 'topComments': {
      presenceData.details = 'Browsing through'
      presenceData.state = 'Top Comments'
      break
    }

    case 'blog': {
      if (path.includes('new')) {
        presenceData.details = 'Creating a new blog'
      }
      else if (path.includes('entry')) {
        presenceData.details = document.querySelector('.title > a > p')?.textContent
        presenceData.state = `By ${
          document.querySelector('.info > a')?.textContent
        }`
        presenceData.smallImageKey = Assets.Reading
      }
      else {
        presenceData.details = 'Browsing through'
        presenceData.state = document
          .querySelector('#pageContent')
          ?.lastElementChild
          ?.querySelector('div > h3')
          ?.textContent
      }

      break
    }

    case 'contests': {
      if (path.includes('with')) {
        presenceData.details = 'Viewing'
        presenceData.state = `Participated contest of ${path.split('/')[3]}`
      }
      else if (path.includes('writer')) {
        presenceData.details = 'Viewing Problemsetting'
        presenceData.state = `Contests of ${path.split('/')[3]}`
      }
      else if (!location.pathname.split('/')[2]) {
        presenceData.details = 'Browsing through'
        presenceData.state = 'Upcoming contests and Past contests'
      }
      else {
        presenceData.details = 'Waiting for contest'
        presenceData.state = document.title.split('-')[0]?.trim()
      }
      break
    }

    case 'contestRegistration': {
      presenceData.details = 'Registering for'
      presenceData.state = document.querySelector('#pageContent > h2')?.textContent
      break
    }

    case 'contestRegistrants': {
      presenceData.details = 'Viewing Registrants for'
      presenceData.state = document.title.split('-')[1]?.trim()
      break
    }

    case 'contest': {
      const contestTitle = document.querySelector('.left')?.textContent

      presenceData.details = 'Viewing Contest'
      presenceData.state = contestTitle

      if (path.includes('problem')) {
        presenceData.details = contestTitle
        presenceData.state = document.querySelector('.title')?.textContent
        presenceData.smallImageKey = Assets.Reading
        presenceData.smallImageText = 'Solving'
      }
      else if (path.includes('submit')) {
        presenceData.details = 'Submitting Solution for'
      }
      else if (path.includes('my')) {
        presenceData.details = 'Viewing their submissions'
      }
      else if (path.includes('status')) {
        presenceData.details = 'Viewing Contest Status'
      }
      else if (path.includes('hacks')) {
        presenceData.details = 'Viewing Hacks'
      }
      else if (path.includes('room')) {
        const [room, contestTitle] = document.title.split('-')

        presenceData.details = 'Viewing Room'
        presenceData.state = `${room?.trim()} | ${contestTitle?.trim()}`
      }
      else if (path.includes('standings')) {
        presenceData.details = 'Viewing Final Standings'
        presenceData.state = document.title.split('-')[1]?.trim()
      }
      else if (path.includes('ratings')) {
        presenceData.details = 'Viewing Rating Changes'
        presenceData.state = document
          .querySelector('.title')
          ?.textContent
          ?.trim()
      }
      else if (path.includes('participant')) {
        presenceData.details = `Viewing ${path.split('/')[4]}'s submissions`
        presenceData.state = document.querySelector('.left')?.textContent
      }
      else if (path.includes('submission')) {
        presenceData.details = 'Viewing Submission'
        delete presenceData.state
      }
      else if (path.includes('customtest')) {
        presenceData.details = 'Performing Custom Test'
        delete presenceData.state
      }
      break
    }

    case 'gym': {
      const gymTitle = document.querySelector('.left')?.textContent

      presenceData.details = 'Viewing Gym'
      presenceData.state = gymTitle

      if (path.includes('problem')) {
        presenceData.details = gymTitle
        presenceData.state = document.querySelector('.title')?.textContent
        presenceData.smallImageKey = Assets.Reading
        presenceData.smallImageText = 'Solving'
      }
      else if (path.includes('submit')) {
        presenceData.details = 'Submitting Solution for'
      }
      else if (path.includes('my')) {
        presenceData.details = 'Viewing their submissions'
      }
      else if (path.includes('status')) {
        presenceData.details = 'Viewing Contest Status'
      }
      else if (path.includes('standings')) {
        presenceData.details = 'Viewing Final Standings'
        presenceData.state = document.title.split('-')[1]?.trim()
      }
      else if (path.includes('customtest')) {
        presenceData.details = 'Performing Custom Test'
        delete presenceData.state
      }
      break
    }

    case 'gyms': {
      presenceData.details = 'Viewing'
      presenceData.state = 'Gyms'
      break
    }

    case 'mashups': {
      presenceData.details = 'Viewing'
      presenceData.state = 'Mashups'
      break
    }

    case 'problemset': {
      presenceData.details = 'Browsing through'
      presenceData.state = 'Problem Sets'

      if (path.includes('problem')) {
        presenceData.details = document.querySelector('.left')?.textContent
        presenceData.state = document.querySelector('.title')?.textContent
        presenceData.smallImageKey = Assets.Reading
        presenceData.smallImageText = 'Solving'
      }
      else if (path.includes('submit')) {
        presenceData.details = 'Submitting Solution for'
        presenceData.state = `${document
          .querySelector('.table-form > tbody > tr')
          ?.lastElementChild
          ?.textContent
          ?.trim()} | ${document
          .querySelector('#pageContent')
          ?.childNodes[5]
          ?.textContent
          ?.trim()}`
      }
      else if (path.includes('status')) {
        presenceData.details = 'Viewing'
        presenceData.state = 'Contest Status'
      }
      else if (path.includes('standings')) {
        presenceData.details = 'Viewing'
        presenceData.state = 'Standings'
      }
      else if (path.includes('customtest')) {
        presenceData.details = 'Performing Custom Test'
        delete presenceData.state
      }
      break
    }

    case 'group': {
      const groupTitle = document.querySelector('.left')?.textContent

      if (path.includes('contests')) {
        presenceData.details = 'Viewing Group Contest'
        presenceData.state = groupTitle
      }
      else if (path.includes('members')) {
        presenceData.details = 'Viewing Group members'
        presenceData.state = `in ${groupTitle}`
      }
      else if (path.includes('problem')) {
        presenceData.details = groupTitle
        presenceData.state = document.querySelector('.title')?.textContent
        presenceData.smallImageKey = Assets.Reading
        presenceData.smallImageText = 'Solving'
      }
      else if (path.includes('submit')) {
        presenceData.details = 'Submitting Solution for'
        presenceData.state = `Gym: ${groupTitle}`
      }
      else if (path.includes('my')) {
        presenceData.details = 'Viewing their submissions'
        presenceData.state = `Gym: ${groupTitle}`
      }
      else if (path.includes('status')) {
        presenceData.details = 'Viewing Contest Status'
        presenceData.state = `Gym: ${groupTitle}`
      }
      else if (path.includes('standings')) {
        presenceData.details = 'Viewing Final Standings'
        presenceData.state = document.title.split('-')[1]?.trim()
      }
      else if (path.includes('customtest')) {
        presenceData.details = 'Performing Custom Test'
      }
      else if (path.includes('contest')) {
        presenceData.details = `Group Contest: ${groupTitle}`
        presenceData.state = document.title.split('-')[1]?.trim()
      }
      break
    }

    case 'groups': {
      presenceData.details = 'Browsing through'
      presenceData.state = 'groups'

      if (path.includes('create')) {
        presenceData.details = 'Creating new a group'
        delete presenceData.state
      }
      break
    }

    case 'ratings': {
      presenceData.details = 'Browsing through'
      presenceData.state = 'Ratings'

      if (path.includes('all')) {
        presenceData.state = 'Ratings (all)'
      }
      else if (path.includes('friends')) {
        presenceData.details = 'Browsing through their'
        presenceData.state = 'friends rating'
      }
      else if (path.includes('country')) {
        presenceData.state = 'country ratings'
      }
      else if (path.includes('organization')) {
        presenceData.state = 'organization ratings'
      }

      break
    }

    case 'edu': {
      presenceData.details = 'Viewing'
      presenceData.state = 'Edu (Courses)'

      if (path.includes('problem')) {
        presenceData.details = document
          .querySelector('.eduCoursePath')
          ?.textContent
          ?.trim()
        presenceData.state = document.querySelector('.title')?.textContent
        presenceData.smallImageKey = Assets.Reading
        presenceData.smallImageText = 'Solving'
      }
      else if (path.includes('submit')) {
        presenceData.details = 'Submitting Solution for'
        presenceData.state = document
          .querySelector('.eduCoursePath')
          ?.textContent
          ?.trim()
      }
      else if (path.includes('status')) {
        presenceData.details = 'Viewing Submissions in'
        presenceData.state = `${document
          .querySelector('.eduLessonPath')
          ?.textContent
          ?.trim()} | ${document
          .querySelector('.eduCoursePath')
          ?.textContent
          ?.trim()}`
      }
      else if (path.includes('hacks')) {
        presenceData.details = 'Viewing hacks in'
        presenceData.state = `${document
          .querySelector('.eduLessonPath')
          ?.textContent
          ?.trim()} | ${document
          .querySelector('.eduCoursePath')
          ?.textContent
          ?.trim()}`
      }
      else if (path.includes('standings')) {
        presenceData.details = 'Viewing Final Standings in'
        presenceData.state = `${document
          .querySelector('.eduLessonPath')
          ?.textContent
          ?.trim()} | ${document
          .querySelector('.eduCoursePath')
          ?.textContent
          ?.trim()}`
      }
      else if (path.includes('customtest')) {
        presenceData.details = 'Performing Custom Test'
        delete presenceData.state
      }
      else if (path.includes('practice')) {
        presenceData.details = 'Viewing Edu practice'
        presenceData.state = document.title.split('-')[1]?.trim()
      }
      else if (path.includes('lesson')) {
        presenceData.details = 'Taking a lesson'
        presenceData.state = document
          .querySelector('.eduLessonPath')
          ?.textContent
          ?.trim()
        presenceData.smallImageKey = Assets.Reading
      }
      else if (path.split('/')[2] === 'courses') {
        presenceData.details = 'Browsing through'
        presenceData.state = 'Edu (Courses)'
      }

      break
    }

    case 'apiHelp': {
      presenceData.details = 'Reading'
      presenceData.state = 'API Help'
      presenceData.smallImageKey = Assets.Reading
      break
    }

    case 'calendar': {
      presenceData.details = 'Viewing'
      presenceData.state = 'Calendar'
      break
    }

    case 'help': {
      presenceData.details = 'Viewing'
      presenceData.state = 'Help'
      break
    }

    case 'profile': {
      presenceData.details = 'Viewing profile'
      presenceData.state = document.title.split('-')[0]?.trim()
      break
    }

    case 'settings': {
      presenceData.details = 'Editing their settings'
      break
    }

    case 'lists': {
      presenceData.details = 'Viewing their lists'

      if (path.includes('new'))
        presenceData.details = 'Creating a new list'
      break
    }

    case 'submissions': {
      presenceData.details = 'Viewing'
      presenceData.state = `${path.split('/')[2]}'s submissions`
      break
    }

    case 'favourite': {
      presenceData.details = 'Browsing through their'

      if (path.includes('blogEntries'))
        presenceData.state = 'favorite blogs'
      else if (path.includes('comments'))
        presenceData.state = 'favorite blog comments'
      else if (path.includes('problems'))
        presenceData.state = 'favorite problems'
      else if (path.includes('contest'))
        presenceData.state = 'favorite contests'
      else if (path.includes('groups'))
        presenceData.state = 'favorite groups'
      break
    }

    default: {
      presenceData.details = 'Viewing home page'
      break
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
