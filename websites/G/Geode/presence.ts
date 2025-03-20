const presence = new Presence({
  clientId: '939892980054110238',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/G/Geode/assets/logo.png',
}

presence.on('UpdateData', async () => {
  const [buttons, time] = await Promise.all([
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('time'),
  ])
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const { pathname, href, hostname } = document.location

  if (hostname.split('.')[0] === 'geode-sdk') {
    switch (pathname.split('/')[1]) {
      case '': {
        presenceData.details = 'Viewing homepage'
        break
      }
      case 'mods': {
        if (!pathname.split('/')[2]) {
          presenceData.details = 'Browsing mods'
        }
        else {
          presenceData.details = `${
            document.querySelector('h1.font-head')?.textContent
          } ${document.querySelector('h3.font-head em')?.textContent}`
          presenceData.state = document
            .querySelector('h3.font-head')
            ?.textContent
            ?.replace(
              document.querySelector('h3.font-head em')?.textContent ?? '',
              '',
            )
          presenceData.largeImageKey = document.querySelector<HTMLImageElement>('img')
          presenceData.buttons = [
            {
              label: 'View Page',
              url: href,
            },
          ]
        }
        break
      }
    }
  }
  else if (hostname.split('.')[0] === 'docs') {
    presenceData.details = 'Viewing documentation'
    presenceData.state = document.querySelector('h1')
  }

  if (!buttons)
    delete presenceData.buttons
  if (!time) {
    delete presenceData.startTimestamp
    delete presenceData.endTimestamp
  }

  presence.setActivity(presenceData)
})
