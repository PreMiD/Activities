import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '1071912828027535462',
})

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/Z/Zerion/assets/logo.png',
}

async function getStrings() {
  return presence.getStrings(
    {
      viewHome: 'general.viewHome',
      view: 'general.view',
      search: 'general.search',
      viewGenre: 'general.viewGenre',
      play: 'general.watchingVid',
      pause: 'general.paused',
      searchSomething: 'general.searchSomething',
      buttonViewSeries: 'general.buttonViewSeries',
      viewSeries: 'general.viewSeries',
      watchingSeries: 'general.watchingSeries',
      viewPage: 'general.viewPage',
    },
    await presence.getSetting<string>('lang').catch(() => 'pl'),
  )
}

let video = {
  duration: 0,
  currentTime: 0,
  paused: true,
}
let strings: Awaited<ReturnType<typeof getStrings>>
let oldLang: string | null = null

function textContent(tags: string) {
  return document.querySelector(tags)?.textContent?.trim()
}

presence.on(
  'iFrameData',
  (data: unknown) => {
    video = data as typeof video
  },
)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
  } as PresenceData
  const [newLang, privacy, logo, time, buttons] = await Promise.all([
    presence.getSetting<string>('lang').catch(() => 'pl'),
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('logo'),
    presence.getSetting<boolean>('time'),
    presence.getSetting<boolean>('buttons'),
  ])
  const { pathname, href } = document.location
  const path = pathname.split('/')
  const genres = Array.from(document.querySelectorAll('.genres li[active]'))
    .map(genre => genre.textContent)
    .join(', ')

  if (oldLang !== newLang || !strings) {
    oldLang = newLang
    strings = await getStrings()
  }

  switch (path[1]) {
    case '':
      presenceData.details = strings.viewHome
      break

    case 'seriale':
    case 'szukaj':
      presenceData.details = strings.searchSomething
      if (genres && !privacy) {
        presenceData.details = strings.viewGenre
        presenceData.state = genres
      }
      presenceData.smallImageKey = Assets.Search
      presenceData.smallImageText = strings.search
      break

    case 'serial':
      presenceData.details = strings.viewPage
      presenceData.state = textContent('#series-page .info .title-original')
        || textContent('#series-page .info .title')
      presenceData.largeImageKey = document.querySelector<HTMLImageElement>('.poster img')?.src
      presenceData.smallImageKey = Assets.Viewing
      presenceData.smallImageText = strings.view

      if (path[3]) {
        presenceData.details = strings.viewPage
        presenceData.state = textContent('.info .title')
        presenceData.smallImageKey = Assets.Viewing
        presenceData.smallImageText = strings.view

        if (video.currentTime > 0) {
          if (!privacy) {
            presenceData.details = `${strings.viewSeries} ${textContent(
              '.info .title',
            )}`
            presenceData.state = textContent('.info .episode-title')
              ?.substring(textContent('.info .episode-title')!.indexOf(' '))
              .trim()
            presenceData.smallImageKey = video.paused
              ? Assets.Pause
              : Assets.Play
            presenceData.smallImageText = video.paused
              ? strings.pause
              : strings.play
            presenceData.buttons = [
              {
                label: strings.buttonViewSeries,
                url: href,
              },
            ]

            if (video.paused || !time) {
              delete presenceData.startTimestamp
              delete presenceData.endTimestamp
            }
            else {
              [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(video.currentTime, video.duration)
            }
          }
          else {
            presenceData.details = strings.watchingSeries
          }
        }
      }
      break
  }

  if (presenceData.endTimestamp && presenceData.startTimestamp)
    presenceData.type = ActivityType.Watching
  if (!logo || privacy)
    presenceData.largeImageKey = ActivityAssets.Logo
  if (!buttons || privacy)
    delete presenceData.buttons
  if (!time)
    delete presenceData.startTimestamp
  if (privacy)
    delete presenceData.state
  presence.setActivity(presenceData)
})
