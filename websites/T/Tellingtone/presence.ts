import { Assets } from 'premid'

const presence = new Presence({ clientId: '1006201873985961984' })
const browsingTimestamp = Math.floor(Date.now() / 1000)

async function getStrings() {
  return presence.getStrings(
    {
      viewHome: 'general.viewHome',
      paused: 'general.paused',
      playing: 'general.playing',
      episode: 'general.episode',
      viewPage: 'general.viewPage',
      buttonViewSeries: 'general.buttonViewSeries',
      listeningTo: 'general.listeningTo',
    },

  )
}

let strings: Awaited<ReturnType<typeof getStrings>>
let oldLang: string | null = null

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/T/Tellingtone/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const { pathname, href } = document.location
  const pathSplit = pathname.split('/')
  const [newLang, time, showCover] = await Promise.all([
    presence.getSetting<string>('lang').catch(() => 'en'),
    presence.getSetting<boolean>('time'),
    presence.getSetting<boolean>('cover'),
  ])

  if (oldLang !== newLang || !strings) {
    oldLang = newLang
    strings = await getStrings()
  }

  switch (pathSplit[1]) {
    case '':
      presenceData.details = strings.viewHome
      break
    case 'shop':
    case 'blog':
      presenceData.details = `Viewing ${pathSplit[1]}`
      break
    case 'series':
      presenceData.details = strings.viewPage
      presenceData.state = document.querySelector<HTMLHeadingElement>('div.head > h1')?.textContent
      presenceData.largeImageKey = document.querySelector<HTMLImageElement>('div.head > img')?.src

      presenceData.buttons = [{ label: strings.buttonViewSeries, url: href }]
  }
  if (document.querySelector('div#Player')) {
    presenceData.details = strings.listeningTo
      .replace('{0}', ' ')
      .replace(
        '{1}',
        document.querySelector<HTMLDivElement>(
          '.reading-media > .media-infos > .media-title',
        )?.textContent ?? '',
      )
    presenceData.state = document.querySelector<HTMLDivElement>('div.media-episode')?.textContent
    presenceData.largeImageKey = document
      .querySelector<HTMLImageElement>('div.media-image > svg > image')
      ?.getAttribute('xlink:href')

    const timers: string[] = []
    for (const element of document.querySelectorAll('div.desktop > div.timer'))
      timers.push(element.textContent!);
    [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(
      presence.timestampFromFormat(timers[0]!),
      presence.timestampFromFormat(timers[1]!),
    )
    delete presenceData.buttons

    if (document.querySelector('.icon-pause')) {
      presenceData.smallImageKey = Assets.Play
      presenceData.smallImageText = strings.playing
    }
    else {
      presenceData.smallImageKey = Assets.Pause
      presenceData.smallImageText = strings.paused
      delete presenceData.endTimestamp
      delete presenceData.startTimestamp
    }
  }

  if (!time) {
    delete presenceData.startTimestamp
    delete presenceData.endTimestamp
  }
  if (!showCover) {
    presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/T/Tellingtone/assets/logo.png'
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
