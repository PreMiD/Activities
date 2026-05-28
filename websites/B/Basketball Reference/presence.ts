const presence = new Presence({
  clientId: '1509365921674952724',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)
presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://i.imgur.com/7OIaOVU.png',
    startTimestamp: browsingTimestamp,
  }
  const { pathname } = document.location
  if (/^\/players\/[a-z]\/\w+\.html/.test(pathname)) {
    const playerName
      = (document.querySelector('h1[itemprop=\'name\']')?.textContent || '').trim()
        || (document.title.split(' Stats')[0] || '').trim()
    presenceData.details = 'Viewing player stats'
    presenceData.state = playerName
  }
  else if (/^\/teams\/[A-Z]+\/\d+\.html/.test(pathname)) {
    const teamName
      = (document.querySelector('h1')?.textContent || '').trim()
        || (document.title.split(' Roster')[0] || '').trim()
    presenceData.details = 'Viewing
