import { ActivityType, Assets, getTimestamps, timestampFromFormat } from 'premid'

const presence = new Presence({
  clientId: '1077091660443430922',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  HomePage = 'https://cdn.rcd.gg/PreMiD/websites/P/Physics%20Wallah/assets/0.png',
  Scrolling = 'https://cdn.rcd.gg/PreMiD/websites/P/Physics%20Wallah/assets/1.png',
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/P/Physics%20Wallah/assets/logo.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    type: ActivityType.Watching,
  }
  const { pathname, href } = document.location
  const [privacyMode, showButton] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('buttons'),
  ])
  const jsonobj = JSON.parse(sessionStorage.getItem('batches_urls')!)

  if (pathname === '/') {
    presenceData.details = 'Home'
    presenceData.state = 'Browsing...'
    presenceData.smallImageKey = ActivityAssets.HomePage
    presenceData.smallImageText = 'Browsing Home Page'
  }
  else if (pathname.startsWith('/study')) {
    presenceData.details = 'Browsing...'
    presenceData.state = 'In website'
    presenceData.smallImageKey = ActivityAssets.Scrolling
    presenceData.smallImageText = 'Browsing the website'

    if (href.endsWith('study')) {
      presenceData.details = 'Studying...'
      presenceData.state = 'Viewing Dashboard'
      presenceData.smallImageKey = Assets.Reading
      presenceData.smallImageText = 'Viewing Dashboard'
    }

    if (href.endsWith('my-batches')) {
      presenceData.details = 'Studying...'
      presenceData.state = 'My Batches'
      presenceData.smallImageKey = Assets.Reading
      presenceData.smallImageText = 'Studying'
    }
    if (href.includes('batch-overview')) {
      presenceData.details = 'Studying...'
      presenceData.state = `Viewing ${
        JSON.parse(localStorage.getItem('BATCH_DETAILS')!).name
      }`
      presenceData.smallImageKey = Assets.Reading
      presenceData.smallImageText = 'Studying'
      if (showButton) {
        presenceData.buttons = [{ label: 'View Batch', url: href }]
      }
    }
    else if (href.includes('subject-topics')) {
      if (href.includes('chapterId')) {
        const urlsobj = new URL(jsonobj[3].value, 'https://www.pw.live')
        presenceData.details = urlsobj.searchParams.get('subject')
        presenceData.state = urlsobj.searchParams.get('topic')
        presenceData.smallImageKey = Assets.Reading
        presenceData.smallImageText = 'Browsing Resources'
      }
      else if (!href.includes('chapterId')) {
        presenceData.details = new URL(
          jsonobj[2].value,
          'https://www.pw.live',
        ).searchParams.get('subject')
        presenceData.state = 'Browsing Resources...'
        presenceData.smallImageKey = Assets.Reading
        presenceData.smallImageText = 'Browsing Resources'
      }
    }
    else if (href.includes('open-pdf')) {
      const title = JSON.parse(localStorage.getItem('PDF')!).title
      if (title && title.toLowerCase().includes('dpp')) {
        const urlsobj = new URL(jsonobj[3].value, 'https://www.pw.live')
        presenceData.details = `Solving DPP (PDF) | ${urlsobj.searchParams.get(
          'subject',
        )}`
        if (!privacyMode) {
          presenceData.state = urlsobj.searchParams.get('topic')
        }
        else {presenceData.state = 'Improving skills'}

        presenceData.startTimestamp = browsingTimestamp
        presenceData.smallImageKey = Assets.Reading
        presenceData.smallImageText = 'Viewing DPP'
      }
      else {
        const urlsobj = new URL(jsonobj[3].value, 'https://www.pw.live')
        presenceData.details = `Viewing Notes | ${urlsobj.searchParams.get(
          'subject',
        )}`
        presenceData.smallImageKey = Assets.Reading
        if (!privacyMode) {
          presenceData.state = urlsobj.searchParams.get('topic')
        }
        else {presenceData.state = 'Class Notes'}
      }
    }
  }
  else if (pathname.startsWith('/watch')) {
    const deta = JSON.parse(localStorage.getItem('SCHEDULE_DETAILS')!)
    let detal = ''
    if (deta.subject === null)
      detal = ''
    else detal = ` | ${deta.subject.name}`
    if (!privacyMode) {
      presenceData.details = `Watching Lecture${detal}`

      presenceData.state = `${deta.topic}`
      if (showButton) {
        presenceData.buttons = [{ label: 'Watch Lecture', url: href }]
      }
    }
    else {
      presenceData.details = 'Watching a lecture'
      presenceData.state = `Subject: ${deta.subject.name}`
    }
    if (document.querySelectorAll('.vjs-paused').length < 1) {
      presenceData.smallImageKey = Assets.Play
      presenceData.smallImageText = 'Watching a lecture';
      [presenceData.startTimestamp, presenceData.endTimestamp] = updateVideoTimestamps()
    }
    else {
      presenceData.smallImageKey = Assets.Pause
      presenceData.smallImageText = 'Paused'
    }
  }
  else if (pathname.startsWith('/practice')) {
    const urlsobj = new URL(jsonobj[3].value, 'https://www.pw.live')
    presenceData.details = `Solving DPP (MCQ) | ${urlsobj.searchParams.get(
      'subject',
    )}`
    if (!privacyMode)
      presenceData.state = urlsobj.searchParams.get('topic')
    else presenceData.state = 'Improving skills'

    presenceData.startTimestamp = browsingTimestamp
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = 'Viewing DPP'
  }
  presence.setActivity(presenceData)

})
function updateVideoTimestamps() {
  return getTimestamps(
    timestampFromFormat(
      document.querySelector('.vjs-current-time-display')?.textContent ?? '',
    ),
    timestampFromFormat(
      document.querySelector('.vjs-duration-display')?.textContent ?? '',
    ),
  )
}
