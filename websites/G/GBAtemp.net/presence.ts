const presence = new Presence({
  clientId: '632110854543769601',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/G/GBAtemp.net/assets/logo.jpg',
    startTimestamp: browsingTimestamp,
  }
  if (document.location.pathname.startsWith('/threads')) {
    const threadName = document.querySelector('a#threadTitle')
    const authorName = document.querySelector(
      'span.postedBy > span.posted.iconKey > a.username',
    )
    const newsAuthor = document.querySelector('div.news-author > a.username > b')
    if (!authorName) {
      presenceData.details = `Reading a news post by ${newsAuthor?.textContent}`
      presenceData.state = threadName?.textContent
    }
    else {
      presenceData.details = `Reading a thread by ${authorName.textContent}`
      presenceData.state = threadName?.textContent
    }
  }
  else if (document.location.pathname.startsWith('/game')) {
    const gName = document.querySelector('h1.dynamicTitle')
    if (gName?.textContent === 'GBAtemp Game Center Home') {
      presenceData.details = 'Browsing...'
    }
    else {
      presenceData.details = 'Reading about a game'
      presenceData.state = gName?.textContent
    }
  }
  else if (document.location.pathname.startsWith('/platform')) {
    const pName = document.querySelector('h1.dynamicTitle')
    if (
      pName?.textContent === 'Game Center Platform List'
      || pName?.textContent === 'List of video game companies'
      || pName?.textContent === 'Game Database'
    ) {
      presenceData.details = 'Browsing...'
    }
    else {
      presenceData.details = 'Reading about a platform'
      presenceData.state = pName?.textContent
    }
  }
  else if (document.location.pathname.startsWith('/company')) {
    const cName = document.querySelector('h1.dynamicTitle')
    presenceData.details = 'Reading about a company'
    presenceData.state = cName?.textContent
  }
  else if (document.location.pathname.startsWith('/questions')) {
    presenceData.details = 'Reading a question'
    presenceData.state = document.querySelector('h1.blueHeader')?.textContent
  }
  else if (document.location.pathname.startsWith('/members')) {
    const profileName = document.querySelector(
      'div.mainText.secondaryContent > h1.username',
    )
    if (!profileName)
      presenceData.details = 'Browsing...'
    else
      presenceData.details = `Looking at ${profileName.textContent}'s profile`
  }
  else if (document.location.pathname.startsWith('/chat')) {
    presenceData.details = 'Chatting in IRC'
  }
  else if (document.location.pathname.startsWith('/shoutbox')) {
    presenceData.details = 'Chatting in the Shoutbox'
  }
  else if (document.location.pathname.startsWith('/search')) {
    presenceData.details = 'Searching...'
  }
  else if (document.location.pathname.startsWith('/review')) {
    presenceData.details = `Reading a review by ${
      document.querySelector('h1#review_title > a')?.textContent
    }`
    presenceData.state = document.querySelector(
      'span.review_author > a.username',
    )?.textContent
  }
  else if (document.location.pathname.startsWith('/entry')) {
    presenceData.details = `Reading a blog post by ${
      document.querySelector('span.postedBy > span.posted.iconKey > a.username')
        ?.textContent
    }`
    presenceData.state = document.querySelector('a.newsTitle')?.textContent
  }
  presence.setActivity(presenceData)
})
