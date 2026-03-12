import { Assets } from 'premid'

const presence = new Presence({
  clientId: '503557087041683458',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/D/Dumpert/assets/logo.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    name: 'Dumpert',
  }
  const { href, pathname } = window.location
  const [privacy, buttons, covers] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('covers'),
  ])
  const search = document.querySelector<HTMLInputElement>('.searchfield')
  const sortElement = document
    .querySelector('[class*="dropdown--"] > div')
    ?.textContent
    ?.toLowerCase()
  if (pathname.includes('/zoek/')) {
    presenceData.details = privacy
      ? 'Bekijkt zoekresultaten'
      : `Bekijkt zoekresultaten voor: ${
        document
          .querySelector('[class*="list_title_holder list_bar_left"] > h1')
          ?.textContent
          ?.split('\'')[1]
      }`
    presenceData.state = sortElement ? `Gesorteerd op: ${sortElement}` : ''
    presence.setActivity(presenceData)
    return
  }
  else if (search?.value) {
    presenceData.details = privacy ? 'Is aan het zoeken' : 'Zoekt naar:'
    presenceData.state = search.value
    presenceData.smallImageKey = Assets.Search
    presenceData.smallImageText = 'Aan het zoeken'
    presence.setActivity(presenceData)
    return
  }
  switch (true) {
    case href.includes('selectedId='):
    case pathname.includes('/item/'): {
      const video = document.querySelector<HTMLMediaElement>('[class="vjs-tech"]')
      if (video) {
        delete presenceData.startTimestamp
        presenceData.largeImageKey = document.querySelector<HTMLMetaElement>('[property="og:image" ]')
          ?.content ?? ActivityAssets.Logo
        presenceData.smallImageKey = video?.paused ? Assets.Pause : Assets.Play
        if (!video.paused) {
          [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestampsfromMedia(video)
        }
        presenceData.buttons = [
          {
            label: 'Bekijk Video',
            url: href,
          },
        ]
      }
      else {
        presenceData.largeImageKey = document.querySelectorAll('img')[1]?.getAttribute('src')
          ?? ActivityAssets.Logo
        presenceData.buttons = [
          {
            label: 'Bekijk Foto',
            url: href,
          },
        ]
      }

      presenceData.details = document.querySelector<HTMLMetaElement>('meta[property~="og:title"]')
        ?.content ?? 'Onbekende titel'
      break
    }
    case pathname.includes('toppers'): {
      presenceData.details = privacy ? 'Bekijkt content' : 'Bekijkt de toppers'

      presenceData.buttons = [
        {
          label: 'Bekijk Content',
          url: href,
        },
      ]
      break
    }
    case pathname.includes('latest'): {
      presenceData.details = privacy
        ? 'Bekijkt content'
        : 'Bekijkt de nieuwste content'
      presenceData.buttons = [
        {
          label: 'Bekijk Content',
          url: href,
        },
      ]
      break
    }
    case pathname.includes('/tag/'): {
      const active = document
        .querySelector('[class*="activeitem--"]')
        ?.textContent
        ?.toLowerCase()
      presenceData.details = privacy
        ? 'Bekijkt resultaten voor een tag'
        : active
          ? `Bekijkt resultaten voor tag: ${active}`
          : `Bekijkt resultaten voor tag: ${
            document
              .querySelector('[class*="list_title_holder list_bar_left"] > h1')
              ?.textContent
              ?.split('\'')[1]
          }`
      presenceData.state = sortElement ? `Gesorteerd op: ${sortElement}` : ''
      presenceData.buttons = [
        {
          label: 'Bekijk Content',
          url: href,
        },
      ]
      break
    }
  }

  if (privacy && presenceData.state)
    delete presenceData.state
  if ((!buttons || privacy) && presenceData.buttons)
    delete presenceData.buttons
  if (!covers && presenceData.largeImageKey !== ActivityAssets.Logo)
    presenceData.largeImageKey = ActivityAssets.Logo

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
