import { Assets } from 'premid'

const presence = new Presence({
  clientId: '709526684428271687',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

let owner, title, presenceprivate
presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/G/GitLab/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const lock = await presence.getSetting<boolean>('lock')
  presenceprivate = document.querySelector(
    'div.d-inline-flex.align-items-baseline > h1 > span',
  )
  if (window.location.hostname === 'gitlab.com') {
    if (
      document.location.pathname === '/'
      || document.location.pathname.includes('/dashboard/projects')
    ) {
      if (document.location.pathname === '/dashboard/projects/starred')
        presenceData.details = 'Viewing Starred'
      else presenceData.details = 'Viewing Dashboard'
    }
    else if (document.location.pathname === '/projects/new/') {
      presenceData.details = 'Creating a project'
    }
    else if (document.location.pathname === '/groups/new') {
      presenceData.details = 'Creating a group'
    }
    else if (document.location.pathname.includes('/explore')) {
      if (document.location.pathname === '/explore/snippets')
        presenceData.details = 'Exploring Snippets'
      else presenceData.details = 'Exploring projects'
    }
    else {
      switch (document.location.pathname) {
        case '/dashboard/groups': {
          presenceData.details = 'Viewing Groups'
          break
        }
        case '/dashboard/activity': {
          presenceData.details = 'Viewing Activity'
          break
        }
        case '/dashboard/milestones': {
          presenceData.details = 'Viewing Milestones'
          break
        }
        case '/dashboard/snippets': {
          presenceData.details = 'Viewing Snippets'
          break
        }
        case '/-/operations/environments': {
          presenceData.details = 'Viewing Environments'
          break
        }
        case '/-/operations': {
          presenceData.details = 'Viewing Operations'
          break
        }
        case '/-/security': {
          presenceData.details = 'Viewing Security'
          break
        }
        case '/dashboard/issues': {
          presenceData.details = 'Viewing Issuses'
          break
        }
        case '/dashboard/merge_requests': {
          presenceData.details = 'Viewing Merge Requests'
          break
        }
        case '/dashboard/todos': {
          presenceData.details = 'Viewing TODOS'
          break
        }
        case '/help': {
          presenceData.details = 'Viewing Help'
          break
        }
        case '/users/sign_in': {
          presenceData.details = 'Signning in or Registering'
          break
        }
        case '/search': {
          title = document.querySelector(
            '#dashboard_search',
          ) as HTMLTextAreaElement
          presenceData.details = 'Searching'
          presenceData.state = title.textContent
          presenceData.smallImageKey = Assets.Search
          presenceData.smallImageText = 'Searching'

          break
        }
        default: {
          title = document.querySelector(
            'body > div.layout-page.page-with-contextual-sidebar > div.content-wrapper > div.alert-wrapper > nav > div > div > ul > li:nth-child(2) > a > span',
          ) as HTMLTextAreaElement
          owner = document.querySelector(
            'body > div.layout-page.page-with-contextual-sidebar > div.content-wrapper > div.alert-wrapper > nav > div > div > ul > li:nth-child(1) > a',
          ) as HTMLTextAreaElement
          if (
            (presenceprivate as HTMLTextAreaElement).title.startsWith(
              'Private -',
            )
            && lock
          ) {
            presenceData.details = 'Viewing a Private Presence'
            presenceData.state = 'or Private Group'
          }
          else if (title && owner) {
            presenceData.details = title.textContent
            presenceData.state = owner.textContent
          }
          else if (title === null && owner) {
            presenceData.details = owner.textContent
            presenceData.state = 'My Respository'
          }
          else if (title === null && owner === null) {
            owner = document.querySelector(
              '#content-body > div.user-profile > div.cover-block.user-cover-block > div.profile-header > div.user-info > p > span:nth-child(1)',
            ) as HTMLTextAreaElement
            presenceData.details = 'Viewing:'
            presenceData.state = owner.textContent
          }
          else {
            presenceData.details = 'Viewing Unknown'
          }
        }
      }
    }
  }
  else if (window.location.hostname === 'about.gitlab.com') {
    switch (document.location.pathname) {
      case '/': {
        presenceData.details = 'Viewing Home Page'
        break
      }
      case '/stages-devops-lifecycle/': {
        presenceData.details = 'Viewing DevOps Lifecycle'
        break
      }
      case '/services/': {
        presenceData.details = 'Viewing Profesional Services'
        break
      }
    }
    title = document.querySelector(
      'body > div.wrapper.gitlab-ee-page > div.image-title > div > div > h1',
    )
    if (title) {
      presenceData.details = `Viewing ${title.textContent}`
    }
    else if (title === null) {
      title = document.querySelector('body > div.blank-header > div > h1')
      if (title) {
        presenceData.details = `Viewing ${title.textContent}`
      }
      else if (title === null) {
        title = document.querySelector('body > div.wrapper > div > h1')
        if (title) {
          presenceData.details = `Viewing ${title.textContent}`
        }
        else if (title === null) {
          title = document.querySelector(
            'body > div.wrapper.blog-landing > div.blog-landing-content > div.blog-hero > div > a > h2',
          )
          if (title) {
            presenceData.details = `Viewing ${title.textContent}`
          }
          else if (title === null) {
            title = document.querySelector(
              'body > div.blog.article > div.cover > div > div > h1',
            )
            if (title) {
              presenceData.details = `Viewing ${title.textContent}`
            }
            else {
              title = document.querySelector(
                'body > div.reseller-hero.text-center > div > h1',
              )
              if (title)
                presenceData.details = `Viewing ${title.textContent}`
            }
          }
        }
      }
      else {
        presenceData.details = 'Viewing Solutions'
      }
    }
    else if (document.location.pathname === '/services/implementation/') {
      title = document.querySelector('body > div.wrapper > div > h1')
      presenceData.details = `Viewing ${title?.textContent}`
    }
    else {
      presenceData.details = 'Viewing Unknown'
    }
  }
  else {
    presenceData.details = 'Viewing Unknown'
  }
  if (!presenceData.details) {
    // This will fire if you do not set presence details

    presence.setActivity()
  }
  else {
    // This will fire if you set presence details
    presence.setActivity(presenceData)
  }
})
