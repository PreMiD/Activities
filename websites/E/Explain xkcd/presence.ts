const presence = new Presence({
  clientId: '956341194131116072',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

function getComicNumber() {
  return document
    .querySelector('table td li:nth-of-type(3)')
    ?.textContent
    ?.match(/\d+(?=\s\()/)?.[0]
}

function getComicName() {
  return document.querySelector('table tr:nth-of-type(2)')?.textContent
}

function getTitleText() {
  let text = document
    .querySelector('.image + br + span')
    ?.textContent
    ?.substring(12)
  if (text && text.length > 127)
    text = `${text.substring(0, 124)}...`

  return text
}

presence.on('UpdateData', () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/E/Explain%20xkcd/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const path = window.location.pathname.split('/wiki/index.php/')[1] ?? ''
  if (path === 'Main_Page') {
    presenceData.details = 'Viewing the main page'
    presenceData.state = `Comic #${getComicNumber()}: ${getComicName()}`
    presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/E/Explain%20xkcd/assets/0.png'
    presenceData.smallImageText = getTitleText()
  }
  else if (/^\d+:_\w+$/.test(path)) {
    // comic page
    presenceData.details = 'Viewing a comic explanation'
    presenceData.state = `Comic #${getComicNumber()}: ${getComicName()}`
    presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/E/Explain%20xkcd/assets/0.png'
    presenceData.smallImageText = getTitleText()
  }
  else if (path.startsWith('User:')) {
    // user page
    presenceData.details = 'Viewing a user page'
    presenceData.state = `User: ${path.substring(5)}`
  }
  else if (
    path.startsWith('Special:Contributions/')
    || (path === '' && /^\?.*title=Special%3AContributions/.test(location.search))
  ) {
    // user contributions
    presenceData.details = 'Viewing a user\'s contributions'
    presenceData.state = `User: ${
      document.querySelector('#contentSub > a')?.textContent
    }`
  }
  else if (path.startsWith('User_talk:')) {
    // user talk page
    presenceData.details = 'Viewing a user\'s talk page'
    presenceData.state = `User: ${path.substring(10)}`
  }
  else if (path === '' && /^\?.*action=edit/.test(location.search)) {
    // edit page
    const title = document.querySelector('#firstHeading')?.textContent
    if (title?.startsWith('Editing')) {
      presenceData.details = 'Editing a page'
      presenceData.state = title.substring(8)
    }
    else if (title?.startsWith('Creating')) {
      presenceData.details = 'Creating a page'
      presenceData.state = title.substring(9)
    }
    else {
      // No permission to edit
      presenceData.details = 'Viewing a page\'s source'
      presenceData.state = title?.substring(16)
    }
  }
  else if (path === '' && /^\?.*action=history/.test(location.search)) {
    // history page
    const title = document.querySelector('#firstHeading')?.textContent
    presenceData.details = 'Viewing a page\'s history'
    presenceData.state = title?.substring(21, title.length - 1)
  }
  else if (path.startsWith('Talk:')) {
    // talk page
    presenceData.details = 'Viewing a talk page'
    presenceData.state = document
      .querySelector('#firstHeading')
      ?.textContent
      ?.substring(5)
  }
  else if (path.startsWith('Category:')) {
    // category page
    presenceData.details = 'Viewing a category'
    presenceData.state = document
      .querySelector('#firstHeading')
      ?.textContent
      ?.substring(9)
  }
  else if (path === '' && /^\?.*search=/.test(location.search)) {
    // search page
    presenceData.details = 'Searching Explain xkcd'
    presenceData.state = document.querySelector<HTMLInputElement>(
      '#searchText > input',
    )?.value
  }
  else {
    presenceData.details = 'Viewing a page'
    presenceData.state = document.querySelector('#firstHeading')?.textContent
  }
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
