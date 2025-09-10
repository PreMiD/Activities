import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1412099108164075663',
})

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/F/Fantasy%20Premier%20League/assets/logo.jpeg',
}

const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    name: 'FPL',
    startTimestamp: browsingTimestamp,
  }
  const urlpath = document.location.pathname.split('/')
  const setting = {
    showButtons: await presence.getSetting<boolean>('showButtons'),
    privacy: await presence.getSetting<boolean>('privacy'),
  }

  if (setting.showButtons && !setting.privacy) {
    presenceData.buttons = [
      {
        label: 'Visit Page',
        url: document.location.href,
      },
    ]
  }

  if (setting.privacy) { // Privacy mode display
    presenceData.details = 'Playing Fantasy Premier League'
    presenceData.smallImageKey = Assets.Question
    presenceData.smallImageText = 'Privacy Mode Enabled'
  }

  else if (!urlpath[1]) {
    presenceData.details = 'Homepage'
    presenceData.state = 'Viewing FPL status'
  }
  else if (urlpath[1] === 'my-team') { // grabs team name and overall points while viewing your own FPL team
    const teamPoints = Array.from(document.querySelectorAll('li')).find(li =>
      li.querySelector('h4')?.textContent?.trim() === 'Overall points',
    )?.querySelector('div')?.textContent
    presenceData.details = 'Viewing my team'
    if (teamPoints) {
      presenceData.state = `Overall points: ${teamPoints}`
    }
    else {
      presenceData.state = 'No overall points'
    }
  }
  else if (urlpath[1] === 'entry' || urlpath[1] === 'team-of-the-week') { // this section grabs the team name and overall points while viewing someone else's FPL team
    const teamPoints = Array.from(document.querySelectorAll('li')).find(li =>
      li.querySelector('h4')?.textContent?.trim() === 'Overall points',
    )?.querySelector('div')?.textContent
    const teamName = Array.from(document.querySelectorAll('div > h2')) // find the team name without relying on computer-generated class names
      .find((h2) => {
        const parent = h2.parentElement
        // Check if the next sibling is a div and contains text, as all team names are next to the manager name
        const nextDiv = h2.nextElementSibling as HTMLElement | null
        return (
          parent
          && parent.children.length === 2
          && nextDiv
          && nextDiv.tagName === 'DIV'
          && !!nextDiv.textContent?.trim()
        )
      })
      ?.textContent
      ?.trim()
    presenceData.details = `Viewing team: ${teamName ?? 'No team name'}`
    if (teamPoints) {
      presenceData.state = `Overall points: ${teamPoints}`
    }
    else {
      presenceData.state = 'No overall points'
    }
    if (setting.showButtons && !setting.privacy) {
      presenceData.buttons = [
        {
          label: 'View Team',
          url: document.location.href,
        },
      ]
    }
  }
  else if (urlpath[1] === 'transfers') {
    presenceData.details = 'Making transfers'
    presenceData.smallImageKey = Assets.Writing
  }
  else if (urlpath[1] === 'fixtures') {
    presenceData.details = 'Viewing fixtures'
    presenceData.smallImageKey = Assets.Reading
  }
  else if (urlpath[1] === 'the-scout') {
    presenceData.details = 'Scouting players'
    presenceData.smallImageKey = Assets.Search
  }
  else if (urlpath[1] === 'statistics') {
    presenceData.details = 'Viewing player stats'
    presenceData.smallImageKey = Assets.Search
  }
  else if (urlpath[1] === 'prizes') {
    presenceData.details = 'Viewing prizes'
    presenceData.smallImageKey = Assets.Reading
  }
  else if (urlpath[1] === 'help') {
    presenceData.details = 'Reading FAQs'
    presenceData.smallImageKey = Assets.Reading
  }
  else if (urlpath[1] === 'leagues') { // grabs league details and displays them while accounting for viewing all leagues in a list
    if (!urlpath[2]) {
      presenceData.details = 'Viewing leagues'
      presenceData.state = 'Viewing league status'
    }
    else {
      const leagueName = document.querySelector('h2#page-title')?.textContent?.trim()
      presenceData.details = 'Viewing league'
      presenceData.state = `${leagueName ?? 'No league name'}`
      if (setting.showButtons && !setting.privacy) {
        presenceData.buttons = [
          {
            label: 'View League',
            url: document.location.href,
          },
        ]
      }
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.clearActivity()
})
