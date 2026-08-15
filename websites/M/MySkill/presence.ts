const presence = new Presence({
  clientId: '1538130215195381790',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const courseElement = document.querySelector('h1.chakra-heading')
  const courseTitle = courseElement?.textContent

  if (courseTitle) {
    const presenceData: PresenceData = {
      largeImageKey: 'https://i.imgur.com/oFcPqIk.png',
      startTimestamp: browsingTimestamp,
      details: `Belajar: ${courseTitle}`,
      state: 'MySkill E-Learning',
    }
    presence.setActivity(presenceData)
  }
  else {
    presence.clearActivity()
  }
})
