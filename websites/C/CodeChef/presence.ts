import { Assets } from 'premid'

const presence = new Presence({
  clientId: '503557087041683458',
})
const timeElapsed: number = ~~(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/C/CodeChef/assets/logo.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: timeElapsed,
    name: 'CodeChef',
  }

  switch (location.host.split('.')[0]) {
    case 'blog': {
      // ? https://blog.codechef.com
      presenceData.details = 'Viewing Blogs'
      presenceData.smallImageKey = Assets.Reading
      if (location.pathname.split('/')[1] === 'all-blogs') {
        presenceData.details = 'Viewing All Blogs'
      }
      else if (location.pathname.split('/')[1] === 'author') {
        presenceData.details = 'Viewing Profile: '
        presenceData.state = `Author: ${location.pathname.split('/')[2]}`
      }
      else if (location.pathname.split('/')[4]) {
        presenceData.details = `Reading: ${
          document.querySelector('.posttitle')?.textContent
        }`
        presenceData.state = `Author: ${
          document.querySelector('.author-username')?.textContent
        }`
        presenceData.smallImageKey = Assets.Reading
      }
      break
    }

    case 'discuss': {
      // ? https://discuss.codechef.com
      presenceData.details = 'Viewing Discussions'
      if (location.pathname.split('/')[1] === 't') {
        presenceData.details = 'Reading Discussions:'
        presenceData.state = document.querySelector('.fancy-title')?.textContent
        presenceData.smallImageKey = Assets.Reading
      }
      break
    }

    default: {
      if (location.pathname.split('/')[1] === '') {
        presenceData.details = 'Viewing Home Page'
      }
      else if (location.pathname.split('/').includes('tags')) {
        presenceData.details = 'Viewing:'
        presenceData.state = 'Problems By Tag Name'
      }
      else if (location.pathname.split('/').includes('problems')) {
        presenceData.details = document.querySelector('.breadcrumbs')?.lastElementChild?.textContent
        presenceData.state = `Solving: ${document.title.split('|')[0]}`
      }
      else {
        // ? https://codechef.com
        switch (location.pathname.split('/')[1]) {
          case 'ide': {
            presenceData.details = 'Using IDE'
            presenceData.state = `Editing ${
              document.querySelector('.chosen-single')?.childNodes[0]?.textContent
            } file`
            break
          }

          case 'AIMICPC': {
            presenceData.details = 'Viewing:'
            presenceData.state = 'AIM ICPC - Weekly Training Series'
            break
          }

          case 'LEARNDSA': {
            presenceData.details = 'Viewing:'
            presenceData.state = 'DSA Learning Series'
            break
          }

          case 'contests': {
            presenceData.details = 'Viewing:'
            presenceData.state = 'Contests List'
            break
          }

          case 'certification': {
            presenceData.details = 'Viewing Certification: '
            presenceData.state = document.querySelector('.page-title')?.childNodes[3]?.textContent
            break
          }

          case 'careers': {
            presenceData.details = 'Viewing:'
            presenceData.state = 'Careers Page'
            break
          }

          case 'signup': {
            presenceData.details = 'Creating an account'
            break
          }

          case 'wiki': {
            presenceData.details = 'Viewing Wiki:'
            presenceData.state = document.querySelector('.ns-heading')?.textContent
            break
          }

          case 'users': {
            presenceData.details = 'Viewing Profile:'
            presenceData.state = `${document.title.split('|')[0]} (${
              document.querySelector('header > h2')?.textContent
            })`
            break
          }
        }
      }
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
