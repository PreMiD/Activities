enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/V/v0/assets/logo.png',
}
const presence = new Presence({ clientId: '1160993221854380132' })
const presenceData: PresenceData = {
  largeImageKey: ActivityAssets.Logo,
  startTimestamp: Math.floor(Date.now() / 1000),
}

presence.on('UpdateData', async () => {
  switch (
    document.location.pathname.endsWith('/')
    && document.location.pathname.length > 1
      ? document.location.pathname.slice(
          0,
          document.location.pathname.length - 1,
        )
      : document.location.pathname
  ) {
    case '/':
      presenceData.details = 'Viewing homepage'
      presenceData.largeImageKey = ActivityAssets.Logo
      delete presenceData.smallImageKey
      break
    case `/r/${document.location.pathname.split('/')[2]}`:
      presenceData.details = 'Prompting a template'
      presenceData.state = `User prompt: "${document
        .querySelector('span.text-sm.line-clamp-1.text-ellipsis.text-left')
        ?.textContent
        ?.slice(0, 50)}"`
      delete presenceData.buttons
      break
    case `/t/${document.location.pathname.split('/')[2]}`:
      presenceData.details = `Viewing a template by @${
        document
          .querySelector<HTMLAnchorElement>('a.flex-none')
          ?.href
          .split('/')[3]
      }`
      presenceData.state = `"${document
        .querySelector(
          'h1.md\\:max-w-xs.lg\\:max-w-sm.text-sm.line-clamp-1.text-ellipsis.animate-in.fade-in-5.text-gray-1000',
        )
        ?.textContent
        ?.slice(0, 50)}"`
      presenceData.buttons = [
        {
          label: 'View template',
          url: document.location.href,
        },
      ]
      break
    case `/${document.location.pathname.split('/')[1]}`:
      presenceData.details = `Viewing @${
        document.location.pathname.split('/')[1]
      } profile`
      presenceData.largeImageKey = document.querySelector<HTMLImageElement>(
        'img.rounded-full.h-12.w-12',
      )?.src
      presenceData.smallImageKey = ActivityAssets.Logo
      presenceData.buttons = [
        {
          label: 'View profile',
          url: document.location.href,
        },
      ]
      break
  }
  presence.setActivity(presenceData)
})
