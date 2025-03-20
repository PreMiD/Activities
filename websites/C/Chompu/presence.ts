import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '1219713910165209169',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/C/Chompu/assets/logo.png',
}

enum Pages {
  Home = '/',
  Dashboard = '/dashboard',
  Status = '/status',
  Contact = '/contact',
}

const presenceData: PresenceData = {
  type: ActivityType.Listening,
  largeImageKey: ActivityAssets.Logo,
}

presence.on('UpdateData', async () => {
  const base = document.location.pathname

  if (/\/dashboard\/guild\/[^\d\n\r_\u2028\u2029]*[\d_].*\/music-room/i.test(base)) {
    if (
      document.querySelector<HTMLElement>('div.hidden.-player-status')
      && document.querySelector<HTMLElement>('div.hidden.-player-status')
        ?.textContent === 'true'
    ) {
      const author = document.querySelector<HTMLAnchorElement>(
        'p.text-small.mt-1.text-foreground\\/80.-player-author',
      )
      const playing = document.querySelector<HTMLAnchorElement>(
        'svg.-player-playing',
      )
      const timeEndPlayer = document.querySelector<HTMLElement>(
        'p.text-small.text-foreground\\/50.-player-position-end',
      )?.textContent
      const [startPlayer, durationPlayer] = [
        presence.timestampFromFormat(
          document.querySelector<HTMLElement>(
            'p.text-small.-player-position-start',
          )?.textContent ?? '',
        ),
        presence.timestampFromFormat(timeEndPlayer ?? ''),
      ]
      const [startTimestamp, endTimestamp] = presence.getTimestamps(
        startPlayer,
        durationPlayer,
      );

      [presenceData.startTimestamp, presenceData.endTimestamp] = [
        startTimestamp,
        endTimestamp,
      ]

      presenceData.details = document.querySelector<HTMLAnchorElement>(
        'h1.text-large.font-medium.-player-title',
      )
      presenceData.state = author
      presenceData.largeImageKey = document.querySelector<HTMLImageElement>(
        '[data-label=\'guild-logo\']',
      )?.src
      presenceData.smallImageKey = playing ? Assets.Play : Assets.Pause
      presenceData.smallImageText = playing ? 'Playing' : 'Pause'
      presenceData.startTimestamp = startTimestamp
      presenceData.endTimestamp = endTimestamp
      presenceData.buttons = [
        {
          label: `Join Player ${
            document.querySelector<HTMLAnchorElement>(
              '[data-label=\'player-requester\']',
            )?.textContent
          }`,
          url: document.location.href,
        },
      ]

      if (!playing)
        delete presenceData.startTimestamp
    }
    else {
      presenceData.details = 'No song queue found'
      presenceData.state = 'In the server...'
      presenceData.largeImageKey = document.querySelector<HTMLImageElement>(
        '[data-label=\'guild-logo\']',
      )
        ? document.querySelector<HTMLImageElement>('[data-label=\'guild-logo\']')
          ?.src
        : ActivityAssets.Logo
      presenceData.smallImageText = 'Zzz'
      presenceData.startTimestamp = browsingTimestamp
      presenceData.buttons = [
        {
          label: 'Join Player',
          url: document.location.href,
        },
      ]
      if (presenceData.endTimestamp)
        delete presenceData.endTimestamp
    }
  }
  else {
    presenceData.details = 'Idk'
    presenceData.state = 'Browsing...'
    presenceData.largeImageKey = ActivityAssets.Logo
    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = 'Zzz'
    presenceData.startTimestamp = browsingTimestamp
    if (presenceData.buttons)
      delete presenceData.buttons
    if (presenceData.endTimestamp)
      delete presenceData.endTimestamp

    switch (base) {
      case Pages.Home:
        presenceData.details = 'Home'
        break
      case Pages.Dashboard:
        presenceData.details = 'Dashboard'
        break
      case Pages.Status:
        presenceData.details = 'Status'
        break
      case Pages.Contact:
        presenceData.details = 'Contact'
        break
    }
  }

  presence.setActivity(presenceData)
})
