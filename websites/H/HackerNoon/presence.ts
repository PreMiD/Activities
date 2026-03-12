const presence = new Presence({
  clientId: '651671730905153539',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const page = document.location.pathname
  const tagged = document.querySelector(
    '#root > div.more > div.divider-title > h1',
  )
  const user = document.querySelector(
    '#root > div.profile-author > div.name > strong',
  )
  const posttitle = document.querySelector(
    '#root > div.story.story-container > h1',
  )
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/H/HackerNoon/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }

  if (page.includes('/tagged') && tagged && tagged.textContent !== '') {
    presenceData.details = 'Viewing Tag:'
    presenceData.state = `${tagged.textContent}`
  }
  else if (posttitle && posttitle.textContent !== '') {
    presenceData.details = 'Reads a Post:'
    presenceData.state = posttitle.textContent
  }
  else if (page.includes('/search')) {
    presenceData.details = 'Searching:'
    presenceData.state = document.querySelector<HTMLInputElement>(
      '#searchbox > div > form > input',
    )?.value
    presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/H/HackerNoon/assets/logo.png'
  }
  else if (user && user.textContent !== '') {
    presenceData.details = 'Viewing User Profile:'
    presenceData.state = user.textContent
  }
  else {
    presenceData.details = 'Viewing Page:'
    presenceData.state = 'Homepage'
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
