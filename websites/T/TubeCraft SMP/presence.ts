import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1515387567720239270',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.tubecraftsmp.com/assets/Tubecraft-Logo-Small.png',
}

function titleCase(value: string): string {
  return value
    .replace(/-/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase())
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    smallImageKey: Assets.Search,
  }

  const path = window.location.pathname.toLowerCase()
  const params = new URLSearchParams(window.location.search)

  if (path.includes('/admin/inactivity_alerts')) {
    presenceData.details = 'Reviewing Creator Activity'
    presenceData.state = 'Inactivity Alerts'
  }
  else if (path.includes('/admin/creators')) {
    presenceData.details = 'Managing Creators'
    presenceData.state = 'Creator Management'
  }
  else if (path.includes('/admin/videos')) {
    presenceData.details = 'Managing Videos'
    presenceData.state = 'Video Library'
  }
  else if (path.includes('/admin/seasons')) {
    presenceData.details = 'Managing Seasons'
    presenceData.state = 'Season Management'
  }
  else if (path.includes('/admin/gallery')) {
    presenceData.details = 'Managing Gallery'
    presenceData.state = 'Media Library'
  }
  else if (path.includes('/admin/changelogs')) {
    presenceData.details = 'Publishing Updates'
    presenceData.state = 'Changelog Manager'
  }
  else if (path.includes('/admin/faq')) {
    presenceData.details = 'Managing Help Content'
    presenceData.state = 'FAQ Manager'
  }
  else if (path.includes('/admin/logs')) {
    presenceData.details = 'Reviewing Site Activity'
    presenceData.state = 'Admin Logs'
  }
  else if (path.includes('/admin/admins')) {
    presenceData.details = 'Managing Admin Accounts'
    presenceData.state = 'Access Control'
  }
  else if (path.includes('/admin/visitors')) {
    presenceData.details = 'Viewing Statistics'
    presenceData.state = 'Visitor Analytics'
  }
  else if (path.includes('/admin/settings')) {
    presenceData.details = 'Managing Website'
    presenceData.state = 'Site Settings'
  }
  else if (path.includes('/admin')) {
    presenceData.details = 'Managing TubeCraft SMP'
    presenceData.state = 'Admin Dashboard'
  }
  else if (path.startsWith('/creator/')) {
    const creatorSlug = path.split('/creator/')[1]?.split('/')[0] || 'unknown'

    const creatorName = document.querySelector('h1')?.textContent?.trim()
      || titleCase(creatorSlug)

    const tab = params.get('tab')

    presenceData.details = `Viewing ${creatorName}`

    switch (tab) {
      case 'videos':
        presenceData.state = 'Creator Videos'
        break
      case 'gallery':
      case 'images':
        presenceData.state = 'Creator Images'
        break
      case 'collabs':
        presenceData.state = 'Creator Collaborations'
        break
      case 'about':
        presenceData.state = 'Creator Information'
        break
      default:
        presenceData.state = 'Creator Profile'
        break
    }
  }
  else if (path === '/' || path === '/index.php') {
    presenceData.details = 'Viewing TubeCraft SMP'
    presenceData.state = 'Homepage'
  }
  else if (path.includes('/creators')) {
    presenceData.details = 'Browsing Creators'
    presenceData.state = 'TubeCraft SMP Community'
  }
  else if (path.includes('/videos')) {
    presenceData.details = 'Browsing Community Videos'
    presenceData.state = 'TubeCraft SMP Video Library'
  }
  else if (path.includes('/seasons')) {
    presenceData.details = 'Exploring Seasons'
    presenceData.state = 'TubeCraft SMP History'
  }
  else if (path.includes('/gallery')) {
    presenceData.details = 'Viewing Gallery'
    presenceData.state = 'Community Media'
  }
  else if (path.includes('/faq')) {
    presenceData.details = 'Reading Help Information'
    presenceData.state = 'Frequently Asked Questions'
    presenceData.smallImageKey = Assets.Reading
  }
  else if (path.includes('/rules')) {
    presenceData.details = 'Reading Community Rules'
    presenceData.state = 'TubeCraft SMP Guidelines'
    presenceData.smallImageKey = Assets.Reading
  }
  else if (path.includes('/apply')) {
    presenceData.details = 'Joining TubeCraft SMP'
    presenceData.state = 'Creator Application'
    presenceData.smallImageKey = Assets.Reading
  }
  else if (path.includes('/changelogs')) {
    presenceData.details = 'Reading Website Updates'
    presenceData.state = 'TubeCraft SMP Changelogs'
    presenceData.smallImageKey = Assets.Reading
  }
  else {
    presenceData.details = 'Browsing TubeCraft SMP'
    presenceData.state = document.title || 'TubeCraft SMP'
  }

  presence.setActivity(presenceData)
})
