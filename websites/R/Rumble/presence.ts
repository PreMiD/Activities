import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1090817608154108046',
})

enum ActivityAssets {
  Rumble = 'https://cdn.rcd.gg/PreMiD/websites/R/Rumble/assets/logo.png',
}

presence.on('UpdateData', async () => {
  const [privacy, buttons, channelPic] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('channelPic'),
  ])
  const { pathname } = document.location
  const standardPathname = document.querySelector<HTMLMetaElement>(
    'meta[property=\'og:url\']',
  )
    ? document
      .querySelector<HTMLMetaElement>('meta[property=\'og:url\']')
      ?.content
      .slice(18)
    : null
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Rumble,
  }

  if (
    standardPathname
    && standardPathname.startsWith('/v')
    && !pathname.startsWith('/videos')
  ) {
    if (document.querySelector('.chat--header')) {
      presenceData.smallImageKey = Assets.Live
      presenceData.smallImageText = 'Live'
    }

    if (privacy) {
      if (presenceData.smallImageKey)
        presenceData.details = 'Watching a livestream'
      else presenceData.details = 'Watching a video'

      presence.setActivity(presenceData)
      return
    }

    if (buttons) {
      presenceData.buttons = [
        {
          label: 'Watch',
          url: `https://rumble.com${standardPathname}`,
        },
      ]
      if (presenceData.smallImageKey)
        presenceData.buttons[0].label += ' Live'
      else presenceData.buttons[0].label += ' Video'
    }

    if (
      channelPic
      && window.getComputedStyle(document.querySelector('i')!).backgroundImage
      !== 'none'
    ) {
      presenceData.largeImageKey = window
        .getComputedStyle(document.querySelector('i')!)
        .backgroundImage
        .slice(
          5,
          window.getComputedStyle(document.querySelector('i')!).backgroundImage.length - 2,
        )
    }

    presenceData.details = document.querySelector<HTMLVideoElement>('.h1')?.textContent
    presenceData.state = document.querySelector<HTMLVideoElement>(
      '.media-heading-name',
    )?.textContent
  }
  else if (standardPathname && standardPathname.startsWith('/c/')) {
    presenceData.details = 'Viewing channel'

    if (privacy) {
      presence.setActivity(presenceData)
      return
    }

    presenceData.state = document.querySelector('h1')?.textContent

    if (buttons) {
      presenceData.buttons = [
        {
          label: 'View Channel',
          url: `https://rumble.com${standardPathname}`,
        },
      ]
    }
    if (channelPic && document.querySelector('.channel-header--thumb')) {
      presenceData.largeImageKey = document.querySelector<HTMLImageElement>(
        '.channel-header--thumb',
      )?.currentSrc
    }
  }
  else if (standardPathname && standardPathname.startsWith('/user/')) {
    presenceData.details = 'Viewing user'

    if (privacy) {
      presence.setActivity(presenceData)
      return
    }

    presenceData.state = document.querySelector('h1')?.textContent

    if (buttons) {
      presenceData.buttons = [
        {
          label: 'View User',
          url: `https://rumble.com${standardPathname}`,
        },
      ]
    }
    if (channelPic)
      presenceData.largeImageKey = document.querySelector('img')?.src
  }
  else if (pathname === '/') {
    presenceData.details = 'Browsing'
    presenceData.state = 'Home'
  }
  else if (
    pathname.startsWith('/editor-picks')
    || pathname.startsWith('/subscriptions')
    || pathname.startsWith('/videos')
    || pathname.startsWith('/watch-history')
    || pathname.startsWith('/category/')
  ) {
    presenceData.details = 'Browsing'
    presenceData.state = document.querySelector('h1')?.textContent
  }
  else if (pathname.startsWith('/upload')) {
    presenceData.details = 'Uploading a video'
  }
  else if (pathname.startsWith('/account')) {
    presenceData.details = 'Managing their account'
  }
  else if (pathname.startsWith('/browse')) {
    presenceData.details = 'Browsing'
    presenceData.state = document.querySelector(
      '.links__title--active',
    )?.textContent
  }

  presence.setActivity(presenceData)
})
