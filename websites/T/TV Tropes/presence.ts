const presence = new Presence({
  clientId: '864573021762224129',
})
const startTimestamp = Math.floor(Date.now() / 1e3)
const whitespaceRegex = /^\s*|\n/gm

presence.on('UpdateData', () => {
  const [, pathCheck, mainPath, namespace] = window.location.pathname.split('/')
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/T/TV%20Tropes/assets/logo.png',
    startTimestamp,
  }

  function mainWikiPathDetails(namespace: string) {
    if (namespace === 'Main') {
      presenceData.details = 'Viewing a TV Trope'
      presenceData.state = document
        .querySelector('.entry-title')
        ?.textContent
        ?.replace(whitespaceRegex, '')
    }
    else {
      const titleElement = document.querySelector('.entry-title')
      presenceData.details = 'Viewing a page'
      presenceData.state = `${titleElement
        ?.querySelector('strong')
        ?.textContent
        ?.replace(
          / \/ $/,
          '',
        )} / ${titleElement?.childNodes[2]?.textContent?.replace(
        whitespaceRegex,
        '',
      )}`
    }
  }

  if (pathCheck === 'pmwiki') {
    switch (mainPath) {
      case 'pmwiki.php': {
        mainWikiPathDetails(namespace!)
        break
      }
      case 'profile.php': {
        presenceData.details = 'Viewing User Profile'
        break
      }
      case 'topics.php': {
        presenceData.details = 'Browsing the Forum Homepage'
        break
      }
      case 'conversations.php': {
        presenceData.details = 'Browsing Forum Category'
        presenceData.state = document
          .querySelector('.entry-title')
          ?.childNodes[2]
          ?.textContent
          ?.replace(whitespaceRegex, '')
        break
      }
      case 'posts.php': {
        presenceData.details = 'Browsing Forum Post'
        presenceData.state = document
          .querySelector('.entry-title')
          ?.textContent
          ?.replace(whitespaceRegex, '')
        break
      }
      case 'wysiwyg_source_editor.php': {
        const searchParams = new URLSearchParams(window.location.search)
        presenceData.details = 'Editing TV Trope Page'
        presenceData.state = `${searchParams.get(
          'groupname',
        )} / ${searchParams.get('title')}`
        break
      }
      case 'createconversation.php': {
        presenceData.details = 'Creating a Forum Post'
        break
      }
      default: {
        presenceData.details = 'Browsing TV Tropes'
        presenceData.state = document.title
      }
    }
  }
  else if (pathCheck) {
    mainWikiPathDetails(pathCheck)
  }
  else {
    presenceData.details = 'Browsing TV Tropes Homepage'
  }
  if (presenceData.details)
    presence.setActivity(presenceData)
})
