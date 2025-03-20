import { Assets } from 'premid'

const presence = new Presence({
  clientId: '726570008037163100',
})

function pathStarts(string: string): boolean {
  return document.location.pathname.startsWith(string)
}
function isHome(string: string): boolean {
  if (string === '/' && document.location.pathname === '/')
    return true

  return false
}
function pathIncludes(string: string): boolean {
  return document.location.pathname.includes(string)
}
function pathEnds(string: string): boolean {
  return document.location.pathname.endsWith(string)
}
function getGuildTitle(): string {
  return document.querySelector(
    'body > section > aside.community-sidebar > div.content.community-sidebar-container > section.sidebar-card.community-info.sidebar-section.user-canopy.user-loggedin.compose-enabled > h1 > a',
  )!.textContent!
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/A/AminoApps/assets/logo.png',
    startTimestamp: Date.now(),
  }
  if (document.location.hostname === 'aminoapps.com') {
    switch (true) {
      case isHome('/'):
        presenceData.details = 'Home'
        break
      case pathStarts('/u'): {
        presenceData.details = 'Viewing a User...'
        presenceData.state = document.querySelector(
          '#app > div > div.container > div > div.profileHeader > div.content > h1 > span.NvNickname',
        )?.textContent
        break
      }
      case pathIncludes('blog'): {
        presenceData.details = 'Viewing a Post...'
        presenceData.state = document.querySelector(
          'body > section > section > section > div > article.post.main-post.hide-blocker > header > h1',
        )?.textContent
        presenceData.smallImageKey = Assets.Reading
        presenceData.smallImageText = 'Reading'
        break
      }
      case pathEnds('/recent/'):
        presenceData.details = `Viewing ${getGuildTitle()}...`
        presenceData.state = 'Recents'
        break
      case pathIncludes('item-category'): {
        presenceData.details = 'Viewing Wiki...'
        presenceData.state = document.querySelector(
          'body > section > section > section > div > section > section > div > a:nth-child(2)',
        )?.textContent
        presenceData.smallImageKey = Assets.Reading
        presenceData.smallImageText = 'Reading'
        break
      }
      case pathEnds('/polls/'):
        presenceData.details = `Viewing ${getGuildTitle()}...`
        presenceData.state = 'Polls'
        break
      case pathEnds('/quizzes/'):
        presenceData.details = `Viewing ${getGuildTitle()}...`
        presenceData.state = 'Quizzes'
        break
      case pathEnds('/shared-folder/'):
        presenceData.details = `Viewing ${getGuildTitle()}...`
        presenceData.state = 'Shared Folder'
        break
      case pathEnds('/info/'):
        presenceData.details = `Viewing ${getGuildTitle()}...`
        presenceData.state = 'About'
        break
      case pathStarts('/explore'):
        presenceData.details = 'Explore'
        break
      case pathStarts('/search'): {
        presenceData.details = 'Searching...'
        presenceData.state = document
          .querySelector('#app > div > div.container > header > h1')
          ?.textContent
          ?.replace('Search results for: ', '')
        break
      }
      case pathStarts('/contact'):
        presenceData.details = 'Contact'
        break
      case pathStarts('/c'):
        presenceData.details = 'Viewing a Community...'
        presenceData.state = getGuildTitle()
        break
    }
  }
  presence.setActivity(presenceData)
})
