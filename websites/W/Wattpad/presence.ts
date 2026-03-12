const presence = new Presence({
  clientId: '808753360152559716',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/W/Wattpad/assets/logo.png',
  }

  let story
  const path = document.location.pathname
  if (path === '/home' || path === '/') {
    presenceData.details = 'Viewing Homepage'
    presenceData.startTimestamp = browsingTimestamp
  }
  else if (path.includes('/stories') || path.includes('/featured')) {
    presenceData.details = 'Browsing Stories'
    presenceData.startTimestamp = browsingTimestamp
  }
  else if (path.startsWith('/user')) {
    presenceData.details = 'Viewing User Profile'
    presenceData.state = document.querySelector('#alias')?.textContent
    presenceData.startTimestamp = browsingTimestamp
  }
  else if (path.includes('/myworks')) {
    if (path.endsWith('/myworks')) {
      presenceData.details = 'Viewing their Stories'
      presenceData.startTimestamp = browsingTimestamp
    }
    else if (path.includes('/write')) {
      story = document.querySelector('p.group-title')?.textContent
      presenceData.details = 'Writing a Story'
      presenceData.state = story
      presenceData.startTimestamp = browsingTimestamp
    }
    else if (path.includes('/analytics')) {
      story = document.querySelector('.text-left h2')?.textContent
      presenceData.details = 'Viewing Analytics'
      presenceData.state = story
      presenceData.startTimestamp = browsingTimestamp
    }
    else if (path.includes('/new')) {
      presenceData.details = 'Setting-up a new Story'
      presenceData.startTimestamp = browsingTimestamp
    }
    else {
      story = document.querySelector(
        'div.works-item-metadata span.h4',
      )?.textContent
      presenceData.details = 'Viewing their Story'
      presenceData.state = story
      presenceData.startTimestamp = browsingTimestamp
    }
  }
  else if (path.includes('/story')) {
    if (path.endsWith('/rankings')) {
      story = document.querySelector('#story-ranking h2')?.textContent
      presenceData.details = 'Viewing Rankings'
      presenceData.state = story
      presenceData.startTimestamp = browsingTimestamp
    }
    else {
      story = document.querySelector('head > title')?.textContent
      presenceData.details = 'Viewing a Story'
      presenceData.state = story
      presenceData.startTimestamp = browsingTimestamp
    }
  }
  else if (document.location.pathname.split('/')[1]?.match(/^\d/)) {
    story = document.querySelector(
      '#funbar-part-details > span > span.info > h2',
    )?.textContent
    presenceData.details = `Reading ${story}`
    presenceData.state = document.querySelector(
      '#funbar-story > div > ul > li.active > a > div',
    )?.textContent
    presenceData.startTimestamp = browsingTimestamp
  }
  else if (path.includes('/settings')) {
    presenceData.details = 'Viewing Settings'
    presenceData.startTimestamp = browsingTimestamp
  }
  else if (path.includes('/inbox')) {
    presenceData.details = 'Viewing Inbox'
    presenceData.startTimestamp = browsingTimestamp
  }
  else if (path.includes('/notifications')) {
    presenceData.details = 'Viewing Notifications'
    presenceData.startTimestamp = browsingTimestamp
  }
  else if (path.includes('/newsfeed')) {
    presenceData.details = 'Viewing Newsfeed'
    presenceData.startTimestamp = browsingTimestamp
  }
  else if (path.includes('/library')) {
    presenceData.details = 'Viewing Library'
    presenceData.startTimestamp = browsingTimestamp
  }
  else if (path.includes('/archive')) {
    presenceData.details = 'Viewing Archive'
    presenceData.startTimestamp = browsingTimestamp
  }
  else if (path.includes('/list')) {
    presenceData.details = 'Viewing Reading Lists'
    presenceData.startTimestamp = browsingTimestamp
  }
  else if (path.includes('/invite-friends')) {
    presenceData.details = 'Inviting Friends'
    presenceData.startTimestamp = browsingTimestamp
  }
  else if (path.includes('/writers')) {
    presenceData.details = 'Viewing Writers Resources'
    presenceData.startTimestamp = browsingTimestamp
  }
  else if (path.includes('contests')) {
    presenceData.details = 'Viewing Writing Contests'
    presenceData.startTimestamp = browsingTimestamp
  }
  else if (path.includes('premium')) {
    presenceData.details = 'Viewing Premium'
    presenceData.startTimestamp = browsingTimestamp
  }
  else {
    presenceData.details = 'Somewhere on the site'
    presenceData.startTimestamp = browsingTimestamp
  }

  presence.setActivity(presenceData)
})
