import { Assets } from 'premid'

const presence = new Presence({
  clientId: '639107568672702484',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

async function getStrings() {
  return presence.getStrings(
    {
      play: 'general.playing',
      pause: 'general.paused',
      browse: 'general.browsing',
      listen: 'general.buttonListenAlong',
      viewPage: 'general.viewPage',
      btnViewPage: 'general.buttonViewPage',
      readArticle: 'general.readingArticle',
      btnReadArticle: 'general.buttonReadArticle',
      viewProfile: 'general.viewProfile',
      btnViewProfile: 'general.buttonViewProfile',
    },

  )
}

let strings: Awaited<ReturnType<typeof getStrings>>
let oldLang: string | null = null

presence.on('UpdateData', async () => {
  let presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/T/TruckStopRadio/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }

  const [newLang, details, state, browse, timestamp, buttons, cover] = await Promise.all([
    presence.getSetting<string>('lang').catch(() => 'en'),
    presence.getSetting<string>('details'),
    presence.getSetting<string>('state'),
    presence.getSetting<boolean>('browse'),
    presence.getSetting<boolean>('timestamp'),
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('cover'),
  ])
  const playing = document
    .querySelector('.play-btn')
    ?.textContent
    ?.toLowerCase()
    .includes('pause')

  if (oldLang !== newLang || !strings) {
    oldLang = newLang
    strings = await getStrings()
  }

  if (!browse || playing) {
    if (details !== '{0}')
      presenceData.details = replacePlaceholders(details)
    if (state !== '{0}')
      presenceData.state = replacePlaceholders(state)

    presenceData.smallImageKey = playing ? Assets.Play : Assets.Pause
    presenceData.smallImageText = playing ? strings.play : strings.pause

    if (cover) {
      presenceData.largeImageKey = document
        .querySelector<HTMLDivElement>('.now-playing-img')
        ?.style
        .backgroundImage
        .match(/url\("(.*)"\)/)?.[1]
    }

    presenceData.buttons = [
      {
        label: strings.listen,
        url: 'https://truckstopradio.co.uk/',
      },
    ]
  }
  else {
    for (const [k, v] of Object.entries(
      ((): {
        [name: string]: PresenceData
      } => ({
        '/': {
          details: strings.browse,
        },
        '/timetable': {
          details: strings.viewPage,
          state: 'Timetable',
          buttons: [
            {
              label: strings.btnViewPage,
              url: location.href,
            },
          ],
        },
        '/team': {
          details: strings.viewPage,
          state: 'Team',
          buttons: [
            {
              label: strings.btnViewPage,
              url: location.href,
            },
          ],
        },
        '/applications': {
          details: strings.viewPage,
          state: 'Applications',
          buttons: [
            {
              label: strings.btnViewPage,
              url: location.href,
            },
          ],
        },
        '/contact': {
          details: strings.viewPage,
          state: 'Contact',
          buttons: [
            {
              label: strings.btnViewPage,
              url: location.href,
            },
          ],
        },
        '/news': {
          details: strings.viewPage,
          state: 'News',
          buttons: [
            {
              label: strings.btnViewPage,
              url: location.href,
            },
          ],
        },
        '/article': {
          details: strings.readArticle,
          state: document.querySelector('.post-header > h1')?.textContent,
          smallImageKey: Assets.Reading,
          buttons: [
            {
              label: strings.btnReadArticle,
              url: location.href,
            },
          ],
        },
        '/presenter': {
          details: strings.viewProfile,
          state: document.querySelector('.presenter-name')?.textContent,
          buttons: [
            {
              label: strings.btnViewProfile,
              url: location.href,
            },
          ],
        },
      }))(),
    )) {
      if (
        location.href
          .replace(/\/?$/, '/')
          .replace(`https://${document.location.hostname}`, '')
          .replace('?', '/')
          .replace('=', '/')
          .match(k)
      ) {
        presenceData.smallImageKey = Assets.Reading
        presenceData.smallImageText = strings.browse
        presenceData = { ...presenceData, ...v } as PresenceData
      }
    }
  }

  if (!timestamp)
    delete presenceData.startTimestamp
  if (!buttons)
    delete presenceData.buttons

  presence.setActivity(presenceData)
})

function replacePlaceholders(string: string): string {
  for (const [k, v] of Object.entries({
    '%artist%': '.now-playing-artist',
    '%title%': '.now-playing-title',
    '%presenter%': '.live-presenter',
    '%description%': '.live-description',
  }))
    string = string.replace(k, document.querySelector(v)?.textContent ?? '')

  return string
}
