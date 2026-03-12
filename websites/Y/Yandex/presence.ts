import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1035433850593095740',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)
const homepageInput = document.querySelector<HTMLInputElement>('input[name="text"]')
const { host, pathname } = document.location

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/Y/Yandex/assets/logo.png',
}

async function getStrings() {
  return presence.getStrings(
    {
      search: 'general.search',
      view: 'general.viewing',
      viewHome: 'general.viewHome',
      searchFor: 'general.searchFor',
      searchSomething: 'general.searchSomething',
      watching: 'general.watching',
    },
    await presence.getSetting<string>('lang').catch(() => 'ru'),
  )
}

let strings: Awaited<ReturnType<typeof getStrings>>
let oldLang: string | null = null

function textContent(tags: string) {
  return document.querySelector(tags)?.textContent
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const [newLang, privacy, logo, time] = await Promise.all([
    presence.getSetting<string>('lang').catch(() => 'ru'),
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('logo'),
    presence.getSetting<boolean>('time'),
  ])

  if (oldLang !== newLang || !strings) {
    oldLang = newLang
    strings = await getStrings()
  }

  switch (host) {
    case 'ya.ru':
      presenceData.details = strings.viewHome
      if (homepageInput?.value) {
        presenceData.state = `${strings.searchFor} ${homepageInput?.value}`
        presenceData.smallImageKey = Assets.Search
        presenceData.smallImageText = strings.search
      }
      break

    case 'yandex.ru':
      presenceData.smallImageKey = Assets.Search
      presenceData.smallImageText = strings.search
      switch (pathname.split('/')[1]) {
        case 'search':
          presenceData.details = !privacy
            ? `${strings.searchFor} ${homepageInput?.value}`
            : strings.searchSomething
          presenceData.state = textContent('.serp-adv__found')
          break

        case 'images':
          presenceData.details = 'Yandex Images'
          presenceData.state = `${strings.searchFor} ${homepageInput?.value}`
          if (document.querySelector('.CbirPreview-Preview')) {
            presenceData.state = `${strings.search} ${
              oldLang === 'ru' ? 'по картинке' : 'by images'
            }`
            if (logo && !privacy) {
              presenceData.largeImageKey = document.querySelector<HTMLImageElement>(
                'img.CbirPreview-Image',
              )?.src
            }
          }
          break

        case 'video':
          presenceData.details = 'Yandex Video'
          presenceData.state = `${strings.searchFor} ${homepageInput?.value}`
          break

        case 'maps':
          presenceData.details = 'Yandex Maps'
          presenceData.state = `${strings.searchFor} ${
            document.querySelector<HTMLInputElement>('input')?.value
          }`
          break

        case 'products':
          presenceData.details = 'Yandex Market'
          presenceData.state = `${strings.searchFor} ${homepageInput?.value}`
          break

        case 'blogs':
          presenceData.details = 'Yandex Blogs'
          presenceData.state = `${strings.searchFor} ${homepageInput?.value}`
          break

        case 'pogoda':
          presenceData.details = `${strings.watching} ${
            oldLang === 'ru' ? 'погоду' : 'weather'
          }`
          presenceData.state = document
            .querySelector<HTMLTitleElement>('title')
            ?.textContent
            ?.replace(' — Яндекс.Погода', '')
          presenceData.smallImageKey = Assets.Viewing
          presenceData.smallImageText = strings.view
          break

        case 'collections':
          presenceData.details = `${strings.watching} ${
            oldLang === 'ru' ? 'избранное' : 'favourites'
          }`
          presenceData.state = document.querySelector(
            '.cl-cards-type-filter__button_active',
          )?.firstChild?.textContent
          if (document.querySelector('.cl-board-header-title__name')) {
            presenceData.details = `${strings.watching} ${
              oldLang === 'ru' ? 'папку в избранном' : 'folder in favourites'
            }`
            presenceData.state = document.querySelector(
              '.cl-board-header-title__name',
            )?.textContent
          }
          break
      }
      break
  }

  if (!time)
    delete presenceData.startTimestamp
  if (privacy)
    delete presenceData.state
  presence.setActivity(presenceData)
})
