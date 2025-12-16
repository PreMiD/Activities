const presence = new Presence({
  clientId: '1191450515670843533',
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    details: 'Где-то на сайте',
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/H/HDrezka/assets/logo.png',
  }
  const contentType = document
    .querySelector('meta[property=\'og:url\']')
    ?.getAttribute('content')
    ?.split('/')[3]
  const currentType = contentType === 'films'
    ? 'фильм'
    : contentType === 'series'
      ? 'сериал'
      : contentType === 'cartoons'
        ? 'мультфильм'
        : contentType === 'animation'
          ? 'аниме'
          : 'чего-то'

  if (document.location.pathname === '/')
    presenceData.details = 'На главной странице'

  if (
    document.location.pathname === '/films'
    || document.location.pathname === '/series'
    || document.location.pathname === '/cartoons'
    || document.location.pathname === '/animation'
    || document.location.pathname.match(/\/(films|series|cartoons|animation)\//)
  ) {
    if (document.location.pathname.match(/\/(?:films|series|cartoons|animation)\/.+/)) {
      presenceData.details = `Смотрит ${currentType}`
      presenceData.state = `${
        document.querySelector('.b-post__title h1')?.textContent
      }`
      presenceData.largeImageKey = document.querySelector<HTMLImageElement>('.b-sidecover a img')?.src
      presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/H/HDrezka/assets/logo.png'
      presenceData.buttons = [
        {
          label: 'Открыть страницу',
          url: document
            .querySelector('meta[property=\'og:url\']')
            ?.getAttribute('content') ?? '',
        },
      ]
    }
    else {
      presenceData.details = `Ищет ${currentType}`
      presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/H/HDrezka/assets/0.png'
    }
  }
  presence.setActivity(presenceData)
})
