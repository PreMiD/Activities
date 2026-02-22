import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1475099546492076146',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const { pathname } = document.location

  const presenceData: PresenceData = {
    largeImageKey: 'https://s3.us-east-1.amazonaws.com/accredible_temp_credential_images/16002836894132567677717491881160.png',
    details: 'In Workspace',
    startTimestamp: browsingTimestamp,
  }

  if (pathname.includes('/notebooks/')) {
    const notebookName = document.querySelector('.ce-notebook-name-text')?.textContent || document.title.split(' - ')[0] || 'Untitled Notebook'

    presenceData.details = 'Editing Notebook'
    presenceData.state = notebookName
    presenceData.smallImageKey = Assets.Search
  }

  else if (pathname.includes('/sql/')) {
    presenceData.details = 'Running SQL Queries'
    presenceData.state = 'Analyzing Data'
    presenceData.smallImageKey = Assets.Search
  }

  else {
    presenceData.details = 'In Workspace'
    presenceData.state = 'Browsing Files'
    presenceData.smallImageKey = Assets.Search
  }

  if (presenceData.state) {
    presence.setActivity(presenceData)
  }
  else {
    presence.clearActivity()
  }
})
