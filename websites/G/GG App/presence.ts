import { Assets } from 'premid'

const presence = new Presence({
  clientId: '928868301105426463',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/G/GG%20App/assets/logo.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const path = document.location.pathname
  const [timestamps, cover, buttons] = await Promise.all([
    presence.getSetting<boolean>('timestamps'),
    presence.getSetting<boolean>('cover'),
    presence.getSetting<boolean>('buttons'),
  ])
  // Apparently "/games" is a user page so .pathname can't be used to detect a game but instead the header
  if (
    document.querySelector<HTMLHeadingElement>(
      '#root > div > div.css-1dbjc4n > div > div > div > div > div:nth-child(1) > h1',
    )
    && path.startsWith('/games')
  ) {
    presenceData.details = 'Viewing Game:'
    presenceData.state = document.querySelector<HTMLHeadingElement>(
      '#root > div > div.css-1dbjc4n > div > div > div > div > div:nth-child(1) > h1',
    )?.textContent
    if (cover) {
      presenceData.largeImageKey = document.querySelector<HTMLImageElement>(
        '#root > div > div.css-1dbjc4n > div > div > div > div.css-1dbjc4n > img',
      )?.src
      presenceData.smallImageKey = ActivityAssets.Logo
    }
    presenceData.buttons = [{ label: 'View Game', url: document.URL }]
  }
  else if (
    document.querySelector<HTMLHeadingElement>(
      '#root > div > div.css-1dbjc4n > div > div:nth-child(3) > div.w-full > div > div > div:nth-child(2) > h2',
    )
    || document.querySelector<HTMLAnchorElement>(
      '#root > div > div.css-1dbjc4n > div > div > div > div > div > div > p.text-white.md\\:mt-2 > a',
    )
  ) {
    const listname = document.querySelector<HTMLSpanElement>(
      '#root > div > div.css-1dbjc4n > div > div.w-full.xl\\:max-w-max.mx-auto.pt-8 > div > div.flex.flex-column.p-3 > div > div.flex.flex-column.md\\:flex-row.items-start.md\\:items-center > p:nth-child(1) > span',
    )
    const profilePicture = document.querySelector<HTMLImageElement>(
      '#root > div > div.css-1dbjc4n > div > div:nth-child(3) > div.w-full > div > div > a > img',
    )
    presenceData.details = `Viewing ${
      document.querySelector(':is(div > a > h1, p > span + a)')?.textContent
    }'s profile`
    presenceData.buttons = [{ label: 'View Profile', url: document.URL }]
    if (listname) {
      presenceData.state = listname.textContent
      presenceData.buttons = [{ label: 'View List', url: document.URL }]
    }
    if (cover && profilePicture) {
      presenceData.largeImageKey = document.querySelector<HTMLImageElement>(
        '#root > div > div.css-1dbjc4n > div > div:nth-child(3) > div.w-full > div > div > a > img',
      )?.src
      presenceData.smallImageKey = ActivityAssets.Logo
    }
  }
  else if (path.includes('/games/')) {
    if (path.endsWith('/reviews')) {
      presenceData.details = 'Reading reviews of:'
      presenceData.state = document
        .querySelector<HTMLDivElement>(
          '#root > div > div.css-1dbjc4n > div > div > div > div.css-1dbjc4n > div.css-901oao',
        )
        ?.textContent
        ?.slice(11)
    }
    else if (path.includes('edit')) {
      presenceData.details = 'Editing Game:'
      presenceData.state = document.querySelector<HTMLAnchorElement>(
        '#root > div > div.css-1dbjc4n > div > div > h1 > a',
      )?.textContent
      presenceData.smallImageKey = Assets.Writing
    }
    else if (path.endsWith('/lists')) {
      presenceData.details = 'Browsing lists containing:'
      presenceData.state = document
        .querySelector<HTMLHeadingElement>(
          '#root > div > div.css-1dbjc4n > div > div > div > h1',
        )
        ?.textContent
        ?.slice(17)
    }
  }
  else if (path.includes('/reviews/')) {
    presenceData.details = `Reading ${
      document.querySelector<HTMLHeadingElement>(
        '#root > div > div.css-1dbjc4n > div > div > div > div > div > div:nth-child(1) > div > a > h2',
      )?.textContent
    }'s review`
    presenceData.state = `of ${
      document.querySelector(
        '#root > div > div.css-1dbjc4n > div > div > div > div > div > div:nth-child(1) > a > h1',
      )?.textContent
    }`
    if (cover) {
      presenceData.largeImageKey = document.querySelector<HTMLImageElement>(
        '#root > div > div.css-1dbjc4n > div > div > div > div > a > img',
      )?.src
      presenceData.smallImageKey = ActivityAssets.Logo
    }
    presenceData.buttons = [{ label: 'Read Review', url: document.URL }]
  }
  else if (path.startsWith('/home')) {
    presenceData.details = 'At Home page'
  }
  else if (path.startsWith('/search/')) {
    presenceData.details = 'Searching for:'
    presenceData.state = document.querySelector<HTMLSpanElement>(
      '#root > div > div.css-1dbjc4n > div > div.w-full.xl\\:max-w-max.mx-auto > div > div:nth-child(1) > p > span.text-2xl.font-bold.pl-2',
    )?.textContent
    presenceData.smallImageKey = Assets.Search
  }
  else if (path.endsWith('/lists')) {
    presenceData.details = `Viewing ${document.title.match(/(.*) -/)?.[1]}`
    if (cover) {
      presenceData.largeImageKey = document.querySelector<HTMLImageElement>(
        '#root > div > div.css-1dbjc4n > div > div > div.w-full > div > div > a > img',
      )?.src
      presenceData.smallImageKey = ActivityAssets.Logo
    }
    presenceData.buttons = [{ label: 'View Lists', url: document.URL }]
  }
  else if (path.includes('/lists/')) {
    presenceData.details = 'Viewing List:'
    presenceData.state = document.querySelector<HTMLHeadingElement>(
      '#root > div > div.css-1dbjc4n > div > div.flex.flex-col.flex-1.w-full.z-10.px-2.sm\\:px-4 > div > div:nth-child(1) > div.flex.flex-col.flex-grow > div.flex.flex-col > h1',
    )?.textContent
    presenceData.buttons = [{ label: 'View List', url: document.URL }]
  }
  if (!buttons)
    delete presenceData.buttons
  if (!timestamps)
    delete presenceData.startTimestamp
  presence.setActivity(presenceData)
})
