import { Assets } from 'premid'

const presence = new Presence({ clientId: '1014873319419424869' })
const browsingTimestamp = Math.floor(Date.now() / 1000)
const staticsPages: { [name: string]: string } = {
  '': 'Viewing homepage',
  '~rules': 'Reading rules',
  '~tos': 'Reading ToS',
  '~account': 'Managing their account',
}
enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/T/Toyhouse/assets/logo.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const { pathname } = document.location
  const pathArr = pathname.split('/')
  const showButtons = await presence.getSetting<boolean>('buttons')

  switch (pathArr[1]) {
    case '~faq':
    case '~browse': {
      const condition = pathArr[1] === '~faq'
      presenceData.details = condition ? 'Browsing characters' : 'Reading FAQ'
      presenceData.state = `Category: ${pathArr[2]}`
      if (condition)
        presenceData.largeImageKey = Assets.Reading
      break
    }
    default: {
      const pageType = document.querySelector('li.header')?.textContent?.trim()
      if (Object.keys(staticsPages).includes(pathArr[1]!)) {
        presenceData.details = staticsPages[pathArr[1]!]
      }
      else if (pageType === 'User') {
        presenceData.details = 'Viewing an user page'
        presenceData.state = document.querySelector(
          '.display-user-username',
        )?.textContent
        presenceData.buttons = [
          {
            label: 'View User',
            url: document.querySelector<HTMLLinkElement>('span > a')!.href,
          },
        ]
      }
      else if (pageType === 'Character') {
        const characterQuery = document.querySelector<HTMLLinkElement>(
          '.display-character > a',
        )
        presenceData.details = 'Viewing a character'
        presenceData.state = characterQuery?.textContent
        presenceData.buttons = [
          {
            label: 'View Character',
            url: characterQuery!.href,
          },
          {
            label: 'View Possessor',
            url: document.querySelector<HTMLLinkElement>('span > a')!.href,
          },
        ]
      }
    }
  }

  if (!showButtons)
    delete presenceData.buttons

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
