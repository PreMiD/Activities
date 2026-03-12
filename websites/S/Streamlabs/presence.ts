import { Assets } from 'premid'

const presence = new Presence({
  clientId: '711871296346128395',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)
const userType = [
  'Viewing the ',
  'Viewing their ',
  'Modifying their ',
  'Creating their ',
]

let strings
let clipTitle
let rewardString
let titleSiteCreator
let titleDashboard = 'Dashboard'

presence.on('UpdateData', async () => {
  strings = await presence.getStrings({
    play: 'general.playing',
    pause: 'general.paused',
  })
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/S/Streamlabs/assets/logo.png',
  }

  switch (window.location.hostname) {
    case 'howto.streamlabs.com':
      presenceData.startTimestamp = browsingTimestamp
      presenceData.details = `${userType[0]}Forums`
      break
    case 'support.streamlabs.com':
      presenceData.startTimestamp = browsingTimestamp
      presenceData.details = `${userType[0]}Support Pages`
      break
    case 'dev.streamlabs.com':
      presenceData.startTimestamp = browsingTimestamp
      presenceData.details = `${userType[0]}API Documentation`
      break
    case 'ideas.streamlabs.com':
      presenceData.startTimestamp = browsingTimestamp
      presenceData.details = `${userType[0]}Feature Suggestions`
      break
  }

  if (window.location.hostname === 'streamlabs.com') {
    switch (document.location.pathname) {
      case '/':
        presenceData.startTimestamp = browsingTimestamp
        presenceData.details = 'Home Page'
        break
      case '/login':
        presenceData.startTimestamp = browsingTimestamp
        presenceData.details = 'Logging in'
        break
      case '/clips':
        presenceData.startTimestamp = browsingTimestamp
        presenceData.details = `${userType[1]}Clips`
        break
      case '/best-donation-clips':
        presenceData.startTimestamp = browsingTimestamp
        presenceData.details = `${userType[0]}Best Clips`
        break
    }

    if (document.location.pathname.includes('/clips/watch')) {
      const video = document.querySelector<HTMLVideoElement>('.video-js > video')
      clipTitle = document
        .querySelector('.clip__action-info > div:nth-child(1)')
        ?.textContent
        ?.split(' ')
      if (video && !video.paused) {
        presenceData.smallImageKey = Assets.Play
        presenceData.smallImageText = strings.play;
        [presenceData.startTimestamp, presenceData.endTimestamp]
          = presence.getTimestampsfromMedia(video)
      }
      else {
        presenceData.smallImageKey = Assets.Pause
        presenceData.smallImageText = strings.pause
        delete presenceData.endTimestamp
      }
      presenceData.details = `Watching ${clipTitle?.[0]} to`
      presenceData.state = clipTitle?.[2]
    }
    else if (document.location.pathname.includes('/dashboard')) {
      switch (document.location.hash) {
        case '#/widgets':
          titleDashboard = `${userType[1]}Widgets`
          break
        case '#/cloudbot/mod-tools':
          titleDashboard = `${userType[1]}Cloudbot`
          break
        case '#/stats':
          titleDashboard = `${userType[1]}Dashboard`
          break
        case '#/alertbox':
          titleDashboard = `${userType[1]}Alert Boxes`
          break
        case '#/merchadmin':
          titleDashboard = `${userType[2]}Merch Store`
          break
        case '#/charity':
          titleDashboard = `${userType[0]}Charity Campaigns`
          break
        case '#/university':
          titleDashboard = `${userType[0]}University Lessons`
          break
        case '#/streamlabs-rewards':
          titleDashboard = `${userType[1]}Rewards`
          rewardString = document.querySelector(
            '#sl__dashboard > div > div.content > div.dashboard-content > div.dashboard-body > div > div > div:nth-child(1) > div:nth-child(1) > span',
          )?.textContent
          presenceData.state = `${rewardString?.charAt(0).toUpperCase()}${rewardString?.slice(1)}`
          // Streamlabs rewards does not captilise first string of the teir.
          break
      }
      presenceData.startTimestamp = browsingTimestamp
      presenceData.details = titleDashboard
    }
    else if (document.location.pathname.includes('/editor')) {
      titleSiteCreator = `${userType[3]}Site`
      presenceData.startTimestamp = browsingTimestamp
      presenceData.details = titleSiteCreator
    }
  }

  if (document.location.pathname.includes('/clips/watch')) {
    const video = document.querySelector<HTMLVideoElement>('.video-js > video')
    clipTitle = document
      .querySelector('.clip__action-info > div:nth-child(1)')
      ?.textContent
      ?.split(' ')
    if (video && !video.paused) {
      presenceData.smallImageKey = Assets.Play
      presenceData.smallImageText = strings.play;
      [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestampsfromMedia(video)
    }
    else {
      presenceData.smallImageKey = Assets.Pause
      presenceData.smallImageText = strings.pause;
      [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestampsfromMedia(video!)
    }
    presenceData.details = `Watching ${clipTitle?.[0]} to`
    presenceData.state = clipTitle?.[2]
  }
  else if (document.location.pathname.includes('/dashboard')) {
    switch (document.location.hash) {
      case '#/widgets':
        titleDashboard = `${userType[1]}Widgets`
        break
      case '#/cloudbot/mod-tools':
        titleDashboard = `${userType[1]}Cloudbot`
        break
      case '#/stats':
        titleDashboard = `${userType[1]}Dashboard`
        break
      case '#/alertbox':
        titleDashboard = `${userType[1]}Alert Boxes`
        break
      case '#/merchadmin':
        titleDashboard = `${userType[2]}Merch Store`
        break
      case '#/charity':
        titleDashboard = `${userType[0]}Charity Campaigns`
        break
      case '#/university':
        titleDashboard = `${userType[0]}University Lessons`
        break
      case '#/streamlabs-rewards':
        titleDashboard = `${userType[1]}Rewards`
        rewardString = document.querySelector(
          '#sl__dashboard > div > div.content > div.dashboard-content > div.dashboard-body > div > div > div:nth-child(1) > div:nth-child(1) > span',
        )?.textContent
        presenceData.state = `${rewardString?.charAt(0).toUpperCase()}${rewardString?.slice(1)}`
        // Streamlabs rewards does not captilise first string of the teir.
        break
    }
    presenceData.startTimestamp = browsingTimestamp
    presenceData.details = titleDashboard
  }
  else if (document.location.pathname.includes('/editor')) {
    titleSiteCreator = `${userType[3]}Site`
    presenceData.startTimestamp = browsingTimestamp
    presenceData.details = titleSiteCreator
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
