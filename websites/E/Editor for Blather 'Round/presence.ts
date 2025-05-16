import { Assets } from 'premid'

const presence = new Presence({
  clientId: '503557087041683458',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://i.imgur.com/rFZupTH.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    name: 'Editor for Blather \'Round',
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const { pathname, href } = document.location
  const pathList = pathname.split('/').filter(Boolean)

  switch (pathList[0] ?? '/') {
    case '/': {
      presenceData.details = 'Browsing Home Page'
      break
    }
    case 'profile': {
      presenceData.details = 'Browsing a User\'s Projects'
      presenceData.state = document.querySelector('h1 > span')
      presenceData.buttons = [{ label: 'View Profile', url: href }]
      break
    }
    case 'project': {
      if (pathList[1] === 'create') {
        presenceData.details = 'Creating a Project'
        presenceData.state = document.querySelector<HTMLInputElement>('[name=name]')?.value || 'Untitled Project'
      }
      else {
        if (pathList[2] === 'edit') {
          presenceData.details = 'Editing a Project'
          const name = document.querySelector('[data-id="button-edit-settings-toggle"] span:first-child')?.textContent ?? ''
          const activeMainTab = document.querySelector('menu li.underline')?.textContent ?? ''
          presenceData.state = `${name} - ${activeMainTab}`
          switch (activeMainTab.toLocaleLowerCase()) {
            case 'prompts': {
              if (document.querySelector('[data-id="prompt-modal-container"]')) {
                presenceData.state = `${name} - Editing a Prompt`
                presenceData.smallImageKey = Assets.Writing
                presenceData.smallImageText = document.querySelector<HTMLInputElement>('#modal-list-password')?.value
              }
              else {
                presenceData.smallImageKey = Assets.Question
                presenceData.smallImageText = `${document.querySelector<HTMLHeadingElement>('[data-id="prompt-count"]')?.dataset.value} prompts`
              }
              break
            }
            case 'word lists': {
              const wordListName = document.querySelector<HTMLInputElement>('#modal-list-name')
              if (wordListName) {
                presenceData.state = `${name} - Editing a Word List`
                presenceData.smallImageKey = Assets.Writing
                presenceData.smallImageText = wordListName.value
              }
              else {
                presenceData.smallImageKey = Assets.Question
                presenceData.smallImageText = `${document.querySelector('h3')?.childNodes[1]?.textContent} lists`
              }
              break
            }
          }
        }
        else {
          presenceData.details = 'Viewing a Project'
          presenceData.state = document.querySelector('[data-id="project-name"]')
          if (document.querySelector('[data-public="true"]')) {
            presenceData.buttons = [{ label: 'View Project', url: href }]
          }
        }
      }
      break
    }
    case 'projects': {
      presenceData.details = 'Browsing Projects'
      break
    }
    default: {
      presenceData.details = 'Browsing...'
    }
  }

  presence.setActivity(presenceData)
})
