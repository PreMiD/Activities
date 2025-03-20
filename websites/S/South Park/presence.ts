import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '819942708604174376',
})
const startTime = Math.floor(Date.now() / 1000)

let SouthParkData: Data

presence.on('UpdateData', async () => {
  const video = document.querySelector('video')
  const path = document.location.pathname
  const showButtons = await presence.getSetting<boolean>('buttons')

  SouthParkData ??= await presence.getPageletiable<Data>('__DATA__')
  const data = SouthParkData.children[0]!.handleTVEAuthRedirection

  let presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/S/South%20Park/assets/logo.jpg',
    details: 'Browsing...',
    smallImageKey: Assets.Reading,
    startTimestamp: startTime,
    type: ActivityType.Watching,
  }

  if (path.includes('/episodes/') || path.includes('/episodios/')) {
    const { title } = data.videoDetail
    const { subTitle } = data.videoDetail

    if (video) {
      presenceData.details = title
      presenceData.state = subTitle

      presenceData.smallImageKey = video.paused || Number.isNaN(video.duration) ? Assets.Pause : Assets.Play
      presenceData.smallImageText = video.paused || Number.isNaN(video.duration) ? 'Paused' : 'Playing';

      [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestampsfromMedia(video)

      presenceData.buttons = [
        {
          label: 'Watch Episode',
          url: `${
            path.includes('/episodios/')
              ? 'https://www.southpark.lat/episodios'
              : 'https://www.southparkstudios.com/episodes'
          }/${document.location.pathname.split('/')[2]}`,
        },
      ]

      if (video.paused || Number.isNaN(video.duration)) {
        delete presenceData.startTimestamp
        delete presenceData.endTimestamp
      }
    }
    else {
      presenceData.details = 'Viewing an episode:'
      presenceData.state = `${subTitle}: ${title}`
    }
  }
  else if (path.includes('/seasons/')) {
    presenceData.details = 'Viewing Episodes of:'
    presenceData.state = `Season ${document.URL.match(
      /(season-[1-9]?\d)/,
    )?.[0].replace('season-', '')}`
  }
  else if (path.includes('/collections/')) {
    if (video) {
      presenceData.details = data.videoDetail.playlist.title
      presenceData.state = data.videoDetail.title

      presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
      presenceData.smallImageText = video.paused ? 'Paused' : 'Playing';

      [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestampsfromMedia(video)

      presenceData.buttons = [
        {
          label: 'Watch Clip',
          url: `https://www.southparkstudios.com/collections/${
            document.location.pathname.split('/')[2]
          }`,
        },
      ]

      if (video.paused) {
        delete presenceData.startTimestamp
        delete presenceData.endTimestamp
      }
    }
    else {
      presenceData.details = 'Viewing a collection:'
      presenceData.state = data.videoDetail.playlist.title
    }
  }

  const pages: {
    [key: string]: PresenceData
  } = {
    '/create-account/step-1': {
      details: 'Creating an account',
      state: 'Step 1 of 2',
      smallImageKey: Assets.Writing,
    },
    '/create-account/step-2': {
      details: 'Creating an account',
      state: 'Step 2 of 2',
      smallImageKey: Assets.Writing,
    },
    '/settings': {
      details: 'Viewing their:',
      state: 'Account details',
    },
    '/email-verification': {
      details: 'Viewing page:',
      state: 'Email verification',
    },
    '/news': {
      details: 'Viewing page:',
      state: 'The news page',
    },
    '/news/': {
      details: 'Reading article:',
      state: document.querySelector('h1')?.textContent,
      buttons: [
        {
          label: 'Read article',
          url: `https://www.southparkstudios.com/news/${
            document.location.pathname.split('/')[2]
          }`,
        },
      ],
    },
    '/avatar': {
      details: 'Viewing page:',
      state: 'Avatar creator',
    },
    '/forum/v': {
      details: 'Reading forum:',
      state: document.querySelector('h2')?.textContent,
    },
    '/wiki': {
      details: 'Viewing page:',
      state: 'Wiki',
    },
  }

  for (const [key, value] of Object.entries(pages)) {
    if (path.match(key))
      presenceData = { ...presenceData, ...value } as PresenceData
  }

  if (!showButtons)
    delete presenceData.buttons

  presence.setActivity(presenceData)
})

interface Data {
  children: {
    handleTVEAuthRedirection: {
      videoDetail: {
        title: string
        subTitle: string
        playlist: {
          title: string
        }
      }
    }
  }[]
}
