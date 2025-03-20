const presence = new Presence({
  clientId: '754070047193956492',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Editorial = 'https://cdn.rcd.gg/PreMiD/websites/D/DMOJ/assets/0.png',
  Post = 'https://cdn.rcd.gg/PreMiD/websites/D/DMOJ/assets/1.png',
  EditProfile = 'https://cdn.rcd.gg/PreMiD/websites/D/DMOJ/assets/2.png',
  Organization = 'https://cdn.rcd.gg/PreMiD/websites/D/DMOJ/assets/3.png',
  Problem = 'https://cdn.rcd.gg/PreMiD/websites/D/DMOJ/assets/4.png',
  About = 'https://cdn.rcd.gg/PreMiD/websites/D/DMOJ/assets/5.png',
  Home = 'https://cdn.rcd.gg/PreMiD/websites/D/DMOJ/assets/6.png',
  Contest = 'https://cdn.rcd.gg/PreMiD/websites/D/DMOJ/assets/7.png',
  Leaderboard = 'https://cdn.rcd.gg/PreMiD/websites/D/DMOJ/assets/8.png',
  Status = 'https://cdn.rcd.gg/PreMiD/websites/D/DMOJ/assets/9.png',
  SubmissionList = 'https://cdn.rcd.gg/PreMiD/websites/D/DMOJ/assets/10.png',
  Ticket = 'https://cdn.rcd.gg/PreMiD/websites/D/DMOJ/assets/11.png',
  ProblemList = 'https://cdn.rcd.gg/PreMiD/websites/D/DMOJ/assets/12.png',
  Submit = 'https://cdn.rcd.gg/PreMiD/websites/D/DMOJ/assets/13.png',
  Statistics = 'https://cdn.rcd.gg/PreMiD/websites/D/DMOJ/assets/14.png',
  Submission = 'https://cdn.rcd.gg/PreMiD/websites/D/DMOJ/assets/15.png',
  Source = 'https://cdn.rcd.gg/PreMiD/websites/D/DMOJ/assets/16.png',
  User = 'https://cdn.rcd.gg/PreMiD/websites/D/DMOJ/assets/17.png',
  Users = 'https://cdn.rcd.gg/PreMiD/websites/D/DMOJ/assets/18.png',
  Icon = 'https://cdn.rcd.gg/PreMiD/websites/D/DMOJ/assets/19.png',
}

presence.on('UpdateData', () => {
  const presenceData: PresenceData = {
    smallImageKey: ActivityAssets.Icon,
    smallImageText: 'DMOJ: Modern Online Judge',
    startTimestamp: browsingTimestamp,
  }
  const url = document.location.pathname.split('/')
  if (url.includes('post')) {
    presenceData.details = 'Viewing post:'
    presenceData.state = document
      .querySelector('#content > h2')
      ?.textContent
      ?.trim()
    presenceData.largeImageKey = ActivityAssets.Post
    presenceData.buttons = [
      { label: 'View Post', url: `https://dmoj.ca/post/${url[2]?.[2]}` },
    ]
  }
  else if (url.includes('problems')) {
    presenceData.details = 'Browsing problems'
    presenceData.largeImageKey = ActivityAssets.ProblemList
  }
  else if (url.includes('problem')) {
    const problemURL = `https://dmoj.ca/problem/${url[2]}`

    presenceData.buttons = [{ label: 'View Problem', url: problemURL }]

    if (url.includes('submit')) {
      presenceData.details = 'Submitting to problem:'
      presenceData.state = document
        .querySelector('#content > h2 > a')
        ?.textContent
        ?.trim()
      presenceData.largeImageKey = ActivityAssets.Submit
    }
    else if (url.includes('submissions')) {
      presenceData.details = 'Viewing submissions to problem:'
      presenceData.state = document.querySelectorAll('.tabs > h2 > a')[
      // eslint messed up the next line
        document.querySelectorAll('.tabs > h2 > a').length - 1
      ]?.textContent?.trim()
      presenceData.largeImageKey = ActivityAssets.SubmissionList
      presenceData.buttons.push({
        label: 'View Submissions',
        url: `${problemURL}/submissions/`,
      })
    }
    else if (url.includes('rank')) {
      presenceData.details = 'Viewing best submissions to problem:'
      presenceData.state = document
        .querySelector('.tabs > h2 > a')
        ?.textContent
        ?.trim()
      presenceData.largeImageKey = ActivityAssets.SubmissionList
      presenceData.buttons.push({
        label: 'View Best Submissions',
        url: `${problemURL}/rank/`,
      })
    }
    else if (url.includes('editorial')) {
      presenceData.details = 'Viewing editorial for problem:'
      presenceData.state = document
        .querySelector('#content > h2 > a')
        ?.textContent
        ?.trim()
      presenceData.largeImageKey = ActivityAssets.Editorial
      presenceData.buttons.push({
        label: 'View Editorial',
        url: `${problemURL}/editorial/`,
      })
    }
    else if (url.includes('tickets') && url.includes('new')) {
      presenceData.details = 'Creating a ticket for problem:'
      presenceData.state = document
        .querySelector('#content > h2 > a')
        ?.textContent
        ?.trim()
      presenceData.largeImageKey = ActivityAssets.Ticket
    }
    else {
      const problemName = document
        .querySelector('.problem-title > h2')
        ?.textContent
        ?.trim()
      const problemPoints = document.querySelector('.pi-value')?.textContent?.trim()

      presenceData.details = 'Viewing problem:'
      presenceData.largeImageKey = ActivityAssets.Problem

      if (problemPoints === '1')
        presenceData.state = `${problemName} (${problemPoints} point)`
      else presenceData.state = `${problemName} (${problemPoints} points)`
    }
  }
  else if (url.includes('submissions')) {
    if (url.includes('user')) {
      presenceData.details = 'Viewing submissions by user:'

      if (
        document.querySelector('.tabs > h2')?.textContent?.trim()
        === 'All my submissions'
      ) {
        const user = document
          .querySelector('#user-links > ul > li > a > span > span > b')
          ?.textContent
          ?.trim()
        presenceData.state = user
        presenceData.largeImageKey = ActivityAssets.SubmissionList
        presenceData.buttons = [
          {
            label: 'View Submissions',
            url: `https://dmoj.ca/submissions/user/${user}`,
          },
          { label: 'View User', url: `https://dmoj.ca/user/${user}` },
        ]
      }
      else {
        const user = document
          .querySelector('.tabs > h2 > a')
          ?.textContent
          ?.trim()
        presenceData.state = user
        presenceData.largeImageKey = ActivityAssets.SubmissionList
        presenceData.buttons = [
          {
            label: 'View Submissions',
            url: `https://dmoj.ca/submissions/user/${user}`,
          },
          { label: 'View User', url: `https://dmoj.ca/user/${user}` },
        ]
      }
    }
    else {
      presenceData.details = 'Browsing submissions'
      presenceData.largeImageKey = ActivityAssets.SubmissionList
    }
  }
  else if (url.includes('submission')) {
    presenceData.details = 'Viewing submission to problem:'
    presenceData.state = document
      .querySelector('#content > h2 > a')
      ?.textContent
      ?.trim()
    presenceData.largeImageKey = ActivityAssets.Submission
    presenceData.buttons = [
      {
        label: 'View Submission',
        url: `https://dmoj.ca/submission/${url[2]}`,
      },
    ]
  }
  else if (url.includes('src')) {
    presenceData.details = 'Viewing submission source to problem:'
    presenceData.state = document
      .querySelector('#content > h2 > a')
      ?.textContent
      ?.trim()
    presenceData.largeImageKey = ActivityAssets.Source
  }
  else if (url.includes('organizations')) {
    presenceData.details = 'Browsing organizations'
    presenceData.largeImageKey = ActivityAssets.Organization
  }
  else if (url.includes('organization')) {
    const organizationURL = `https://dmoj.ca/organization/${url[2]}`
    presenceData.state = document
      .querySelector('#content > h2')
      ?.textContent
      ?.trim()
      .replace(' Members', '')
    presenceData.buttons = [
      { label: 'View Organization', url: organizationURL },
      { label: 'View Members', url: `${organizationURL}/users` },
    ]

    if (url.includes('users')) {
      presenceData.details = 'Viewing members of organization:'
      presenceData.largeImageKey = ActivityAssets.Users
    }
    else {
      presenceData.details = 'Viewing organization:'
      presenceData.largeImageKey = ActivityAssets.Organization
    }
  }
  else if (url.includes('users')) {
    presenceData.details = 'Viewing leaderboard'
    presenceData.largeImageKey = ActivityAssets.Leaderboard
  }
  else if (url.includes('user')) {
    const userHeader = document.querySelector('.tabs > h2')?.textContent?.trim()

    if (url.includes('solved')) {
      const [, userRank] = document
        .querySelectorAll('.user-sidebar > div')[2]
        ?.textContent
        ?.trim()
        ?.split('#') ?? []

      presenceData.details = 'Viewing problems solved by:'

      if (userHeader === 'My account') {
        const user = document
          .querySelector('#user-links > ul > li > a > span > span > b')
          ?.textContent
          ?.trim()
        const userURL = `https://dmoj.ca/user/${user}`

        presenceData.state = `${user} (Rank: #${userRank})`
        presenceData.largeImageKey = ActivityAssets.SubmissionList
        presenceData.buttons = [
          { label: 'View User', url: userURL },
          { label: 'View Solved Problems', url: `${userURL}/solved` },
        ]
      }
      else {
        const [, user] = document
          .querySelector('.tabs > h2')
          ?.textContent
          ?.trim()
          ?.split(' ') ?? []
        const userURL = `https://dmoj.ca/user/${user}`

        presenceData.state = `${user} (Rank: #${userRank})`
        presenceData.largeImageKey = ActivityAssets.SubmissionList
        presenceData.buttons = [
          { label: 'View User', url: userURL },
          { label: 'View Solved Problems', url: `${userURL}/solved` },
        ]
      }
    }
    else {
      const [, userRank] = document
        .querySelectorAll('.user-sidebar > div')[2]
        ?.textContent
        ?.trim()
        ?.split('#') ?? []

      presenceData.details = 'Viewing user:'

      if (userHeader === 'My account') {
        const user = document
          .querySelector('#user-links > ul > li > a > span > span > b')
          ?.textContent
          ?.trim()
        presenceData.state = `${user} (Rank: #${userRank})`
        presenceData.largeImageKey = ActivityAssets.User
        presenceData.buttons = [
          { label: 'View User', url: `https://dmoj.ca/user/${user}` },
        ]
      }
      else {
        const [, user] = document
          .querySelector('.tabs > h2')
          ?.textContent
          ?.trim()
          ?.split(' ') ?? []

        presenceData.state = `${user} (Rank: #${userRank})`
        presenceData.largeImageKey = ActivityAssets.User
        presenceData.buttons = [
          { label: 'View User', url: `https://dmoj.ca/user/${user}` },
        ]
      }
    }
  }
  else if (url.includes('edit') && url.includes('profile')) {
    presenceData.details = 'Editing profile:'
    presenceData.state = document
      .querySelector('#user-links > ul > li > a > span > span > b')
      ?.textContent
      ?.trim()
    presenceData.largeImageKey = ActivityAssets.EditProfile
  }
  else if (url.includes('contests')) {
    presenceData.details = 'Browsing contests'
    presenceData.largeImageKey = ActivityAssets.Contest
  }
  else if (url.includes('contest')) {
    const contestURL = `https://dmoj.ca/contests/${url[2]}`

    presenceData.state = document
      .querySelector('.tabs > h2')
      ?.textContent
      ?.trim()
    presenceData.buttons = [{ label: 'View Contest', url: contestURL }]

    if (url.includes('stats')) {
      presenceData.details = 'Viewing statistics of contest:'
      presenceData.largeImageKey = ActivityAssets.Statistics
      presenceData.buttons.push({
        label: 'View Statistics',
        url: `${contestURL}/stats`,
      })
    }
    else if (url.includes('ranking')) {
      presenceData.details = 'Viewing rankings of contest:'
      presenceData.largeImageKey = ActivityAssets.Leaderboard
      presenceData.buttons.push({
        label: 'View Rankings',
        url: `${contestURL}/ranking`,
      })
    }
    else if (url.includes('participations')) {
      presenceData.details = 'Viewing participation of contest:'
      presenceData.largeImageKey = ActivityAssets.Users
      presenceData.buttons.push({
        label: 'View Participation',
        url: `${contestURL}/participations`,
      })
    }
    else {
      presenceData.details = 'Viewing contest:'
      presenceData.largeImageKey = ActivityAssets.Contest
    }
  }
  else if (url.includes('about')) {
    presenceData.details = 'Viewing about page'
    presenceData.largeImageKey = ActivityAssets.About
  }
  else if (url.includes('status')) {
    presenceData.details = 'Viewing status'
    presenceData.largeImageKey = ActivityAssets.Status
  }
  else if (url.includes('runtimes')) {
    if (url.includes('matrix')) {
      presenceData.details = 'Viewing version matrix'
      presenceData.largeImageKey = ActivityAssets.Source
    }
    else {
      presenceData.details = 'Viewing runtimes'
      presenceData.largeImageKey = ActivityAssets.Source
    }
  }
  else if (url.includes('tips')) {
    presenceData.details = 'Viewing tips'
    presenceData.largeImageKey = ActivityAssets.About
  }
  else if (url.includes('api')) {
    presenceData.details = 'Viewing API'
    presenceData.largeImageKey = ActivityAssets.Source
  }
  else {
    presenceData.details = 'Viewing home page'
    presenceData.largeImageKey = ActivityAssets.Home
  }

  presence.setActivity(presenceData)
})
