const presence = new Presence({
  clientId: '1458217703742378044',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/M/mistwarp/assets/logo.png',
}

function handleEditor(presenceData: PresenceData) {
  const projectTitleInput = document.querySelector<HTMLInputElement>('[class*="title-field"]')
  const projectTitle = projectTitleInput?.value?.trim()

  if (projectTitle) {
    presenceData.details = `currently editing: ${projectTitle}`
  }
}

function handleProject(presenceData: PresenceData) {
  const projectTitle = document.querySelector<HTMLHeadingElement>('[class^="author-info_project-title_"]')?.textContent

  if (projectTitle) {
    presenceData.details = `currently playing: ${projectTitle}`
  }
  // add a button
  presenceData.buttons = [
    {
      label: 'View Project',
      url: window.location.href,
    },
  ]
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  const location = new URL(window.location.href)

  if (location.pathname.includes('/editor')) {
    handleEditor(presenceData)
  }
  else if (location.hash.startsWith('#')) {
    handleProject(presenceData)
  }

  presence.setActivity(presenceData)
})
