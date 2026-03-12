import { Assets } from 'premid'

const presence = new Presence({
  clientId: '901821070263336971',
})
const pages: Record<string, string> = {
  '/': 'Home',
  '/downloads': 'Downloads',
  '/quickstart': 'Quickstart',
  '/plugins': 'Plugins',
  '/wiki': 'Wiki',
  '/about': 'About',
  '/imprint': 'Imprint',
  '/privacy-policy': 'Privacy Policy',
}
const browsingTimestamp = Math.round(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/B/Blockbench/assets/logo.png',
  Generic = 'https://cdn.rcd.gg/PreMiD/websites/B/Blockbench/assets/0.png',
  BlockItem = 'https://cdn.rcd.gg/PreMiD/websites/B/Blockbench/assets/1.png',
  Bedrock = 'https://cdn.rcd.gg/PreMiD/websites/B/Blockbench/assets/2.png',
  Modded = 'https://cdn.rcd.gg/PreMiD/websites/B/Blockbench/assets/3.png',
  Optifine = 'https://cdn.rcd.gg/PreMiD/websites/B/Blockbench/assets/4.png',
  Skin = 'https://cdn.rcd.gg/PreMiD/websites/B/Blockbench/assets/5.png',
}

presence.on('UpdateData', async () => {
  const page = location.pathname
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const pluginHeader = document.querySelector(
    '#content_wrapper > div > div > h2',
  )?.textContent

  if (location.host.split('.')[0] === 'web') {
    const modelType = document.querySelectorAll<HTMLDivElement>(
      '#page_wrapper #status_bar div[title]:not(.f_left)',
    )[1]?.title

    switch (modelType?.toLowerCase()) {
      case 'generic model':
        presenceData.smallImageKey = ActivityAssets.Generic
        break
      case 'java block/item':
        presenceData.smallImageKey = ActivityAssets.BlockItem
        break
      case 'bedrock model':
        presenceData.smallImageKey = ActivityAssets.Bedrock
        break
      case 'modded entity':
        presenceData.smallImageKey = ActivityAssets.Modded
        break
      case 'optifine entity':
        presenceData.smallImageKey = ActivityAssets.Optifine
        break
      case 'minecraft skin':
        presenceData.smallImageKey = ActivityAssets.Skin
        break
      default:
        break
    }

    presenceData.details = 'Web App'
    switch (
      document
        .querySelector('#main_toolbar #mode_selector li.selected')
        ?.textContent
        ?.toLowerCase()
        || 'Unknown'
    ) {
      case 'Unknown':
        presenceData.state = 'Just started'
        break
      case 'edit':
        presenceData.state = `Editing a ${modelType}`
        break
      case 'paint':
        presenceData.state = `Painting a ${modelType}`
        break
      case 'animate':
        presenceData.state = `Animating a ${modelType}`
        break
      default:
        presenceData.state = 'Unknown activity'
    }
  }
  else if (page.includes('/plugins') && pluginHeader) {
    presenceData.details = 'Looking at a plugin:'
    presenceData.state = pluginHeader
    presenceData.buttons = [{ label: 'View Plugin', url: location.href }]
  }
  else if (page.includes('/wiki')) {
    presenceData.details = 'Blockbench Wiki'
    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = 'Reading'
    presenceData.state = document.querySelector(
      '#wiki_wrapper div.content > div.nuxt-content > h1',
    )?.textContent
    || document.querySelector('#wiki_wrapper div.content > h1')?.textContent
    || 'Unknown Wiki Page'
    presenceData.buttons = [{ label: 'Read Wiki', url: location.href }]
  }
  else if (pages[page]) {
    presenceData.details = `Looking at the ${pages[page]} page`
  }

  presence.setActivity(presenceData)
})
