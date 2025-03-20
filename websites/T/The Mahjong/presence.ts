const presence = new Presence({
  clientId: '1229013953414299700',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/T/The%20Mahjong/assets/logo.png',
}

const SITE_LANGS = [
  'ar',
  'de',
  'es',
  'pt',
  'da',
  'fr',
  'ru',
  'id',
  'it',
  'nl',
  'pl',
  'sv',
  'tr',
  'vi',
  'zh',
  'hi',
  'ko',
  'ja',
]

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const { pathname, href } = document.location
  let pathArr = pathname.split('/')

  if (SITE_LANGS.find(lang => lang === pathname.split('/')[1])) {
    pathArr = ['', ...pathArr.slice(2)]
    if (pathArr.length === 1)
      pathArr = ['', '']
  }

  if (pathArr[1] === '' || pathArr[1] === 'mahjong') {
    if (pathArr[1] === 'mahjong' && pathArr[2] === '') {
      presenceData.details = 'Browing layouts'
    }
    else {
      const displays = document.querySelectorAll(
        '[class*=\'displaysStyles_counter\']',
      )
      presenceData.details = `Layout: ${
        document.querySelector('header > span[class*=\'styles_layoutName\']')
          ?.textContent
      }`

      presenceData.state = `Tiles: ${displays[1]?.textContent ?? '0'} Moves: ${
        displays[2]?.textContent ?? '0'
      }`
      if (
        document
          .querySelectorAll(
            '[class*=\'styles_listItem\'][style*=\'translate3d(0%, 0px, 0px)\']',
          )[1]
          ?.querySelector<HTMLDivElement>('[class*=\'styles_preview\']')
          ?.style
          .backgroundImage
      ) {
        presenceData.smallImageKey = `https://themahjong.com${document
          .querySelectorAll(
            '[class*=\'styles_listItem\'][style*=\'translate3d(0%, 0px, 0px)\']',
          )[1]
          ?.querySelector<HTMLDivElement>('[class*=\'styles_preview\']')
          ?.style
          .backgroundImage
          .slice(5, -2)}`
        presenceData.smallImageText = `${
          document
            .querySelectorAll(
              '[class*=\'styles_listItem\'][style*=\'translate3d(0%, 0px, 0px)\']',
            )[1]
            ?.querySelector('[class*=\'styles_tilesetDescription\'] > span')
            ?.textContent
        } tileset`
      }
      if (pathArr[1] === 'mahjong') {
        presenceData.buttons = [
          {
            label: 'View Layout',
            url: href,
          },
        ]
      }
    }
  }
  else {
    switch (pathArr[1]) {
      case 'blog': {
        if (pathArr[2] === '') {
          presenceData.details = 'Viewing blog'
        }
        else {
          presenceData.details = 'Viewing blog post'
          presenceData.state = document.querySelector('h1[class*=\'title\']')?.textContent
          presenceData.buttons = [
            {
              label: 'View page',
              url: href,
            },
          ]
        }
        break
      }
      case 'faq': {
        presenceData.details = 'Viewing FAQ'
        break
      }
      case 'how-to-play': {
        presenceData.details = 'Viewing game rules'
        break
      }
      case 'cookie-policy': {
        presenceData.details = 'Viewing cookie policy'
        break
      }
      case 'privacy': {
        presenceData.details = 'Viewing privacy policy'
        break
      }
    }
  }
  presence.setActivity(presenceData)
})
