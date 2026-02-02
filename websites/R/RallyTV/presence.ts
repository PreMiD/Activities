(async () => {
  const presence = new Presence('1464394386170446077')
  let lastTitle = ''

  const updatePresence = () => {
    const liveContainer = document.querySelector('.live')
    const titleElement = liveContainer?.querySelector('p span')

    let fullTitle = titleElement ? titleElement.textContent.trim() : 'Browsing Events'
    fullTitle = fullTitle.replace(/^['"]+|['"]+$/g, '')

    if (fullTitle !== lastTitle) {
      const parts = fullTitle.split('|').map(p => p.trim())
      let detailsText = parts[1]
      let stateText = parts[0] || ''

      if (parts.length === 1) {
        detailsText = fullTitle
        stateText = ''
      }

      const presenceData = {
        type: 3,
        details: detailsText,
        state: stateText,
        largeImageKey: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRJT4dg-pIfsTDJ-ZeDHGhr63cJ9BcJFYOpFw&s',
      }

      presence.setActivity(presenceData)
      lastTitle = fullTitle
    }
  }

  updatePresence()
  setInterval(updatePresence, 10000)
})()
