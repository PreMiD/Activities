const presence = new Presence({
  clientId: '869131200948756500',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/W/WordProject/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const { pathname, href } = location
  const buttons = await presence.getSetting<boolean>('buttons')

  if (pathname.startsWith('/index')) {
    const sample = document.querySelector('li.noMargin')
    presenceData.details = 'At homepage'
    if (sample && sample.classList.contains('sm2_playing')) {
      const current = document.querySelector<HTMLSpanElement>('.sm2_position')
      const total = document.querySelector<HTMLSpanElement>('.sm2_total')
      presenceData.state = 'Listening to audio sample'
      if (current && total) {
        const [currTS, durTS] = [current, total].map(e =>
          presence.timestampFromFormat(e.textContent!),
        );

        [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(currTS!, durTS!)
      }
    }
  }
  else if (
    pathname === '/bibles/index.htm'
    || pathname === '/bibles/resources/links/index.htm'
  ) {
    presenceData.details = 'Choosing Language'
  }
  else if (pathname === '/bibles/audio/index.htm') {
    presenceData.details = 'Looking for Audio Bibles'
  }
  else if (/\/bibles\/audio\/.+\/index\.htm/.test(pathname)) {
    const title = document.querySelector<HTMLHeadingElement>('h1.audi')
    const sub = document.querySelector<HTMLSpanElement>('span.dimmed')

    if (title)
      presenceData.details = title.textContent
    if (sub)
      presenceData.state = sub.textContent
  }
  else if (/\/bibles\/verses\/.*index\.htm/.test(pathname)) {
    const title = document.querySelector<HTMLHeadingElement>('h1.vers')
      || document.querySelector<HTMLHeadingElement>('h1.idx')
    if (title)
      presenceData.details = title.textContent
  }
  else if (
    pathname.startsWith('/bibles/audio')
    || pathname.startsWith('/bibles/verses')
  ) {
    const chapter = document.querySelector<HTMLLIElement>(
      'div.sm2-playlist > div > ul > li',
    )
    const player = document.querySelector<HTMLDivElement>('.sm2-bar-ui')
    if (chapter) {
      presenceData.details = 'Listening to'
      presenceData.state = chapter.textContent

      if (player && player.classList.contains('playing')) {
        const time = document.querySelector<HTMLDivElement>('.sm2-inline-time')
        const duration = document.querySelector<HTMLDivElement>(
          '.sm2-inline-duration',
        )

        if (time && duration) {
          const [timeTS, durTS] = [time, duration].map(e =>
            presence.timestampFromFormat(e.textContent!),
          );
          [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(timeTS!, durTS!)
        }
      }
      if (buttons) {
        presenceData.buttons = [
          {
            label: 'Listen',
            url: href,
          },
        ]
      }
    }
  }
  else if (pathname.startsWith('/bibles/parallel')) {
    presenceData.details = 'Looking at multiple Bibles parallely'
  }
  else if (/\/bibles\/\w+\/index\.htm/.test(pathname)) {
    const title = document.querySelector<HTMLHeadingElement>('h1.idx')
    const sub = document.querySelector<HTMLSpanElement>('span.faded4')

    if (title) {
      presenceData.details = title.textContent
      if (sub)
        presenceData.state = sub.textContent
    }
    else {
      presenceData.details = document.title
    }
  }
  else if (/\/bibles\/\w+\/\d+\/\d+\.htm/.test(pathname)) {
    const player = document.querySelector<HTMLDivElement>('.sm2-bar-ui')

    presenceData.details = 'Listening to'
    presenceData.state = `${
      document.querySelector<HTMLDivElement>('.sm2-bar-ui')?.textContent
    }: ${document.querySelector<HTMLHeadingElement>('h3')?.textContent}`
    if (player && player.classList.contains('playing')) {
      const time = document.querySelector<HTMLDivElement>('.sm2-inline-time')
      const duration = document.querySelector<HTMLDivElement>(
        '.sm2-inline-duration',
      )

      if (time && duration) {
        const [timeTS, durTS] = [time, duration].map(e =>
          presence.timestampFromFormat(e.textContent!),
        );
        [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(timeTS!, durTS!)
      }
    }
    if (buttons) {
      presenceData.buttons = [
        {
          label: 'Listen',
          url: href,
        },
      ]
    }
  }
  else {
    presenceData.details = document.title
  } // for resources in languages other than English

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
