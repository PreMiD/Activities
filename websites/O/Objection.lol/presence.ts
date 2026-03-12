const presence = new Presence({
  clientId: '957670687278002206',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/O/Objection.lol/assets/logo.jpg',
    startTimestamp: browsingTimestamp,
  }
  const { pathname, href } = document.location

  if (pathname === '/') {
    const simpleObjectionText = document.querySelector('textarea')?.value
    if (simpleObjectionText !== '') {
      presenceData.details = 'Creating a Simple Objection'
      presenceData.smallImageKey = document.querySelector<HTMLImageElement>('.selected')?.src
      if (simpleObjectionText && simpleObjectionText.length > 127) {
        presenceData.smallImageText = `${simpleObjectionText.substring(
          0,
          124,
        )}...`
      }
      else {
        presenceData.smallImageText = simpleObjectionText
      }
    }
    else {
      presenceData.details = 'Viewing the homepage'
    }
  }
  else if (pathname === '/maker') {
    presenceData.details = 'Creating an Objection'
  }
  else if (pathname.startsWith('/objection/')) {
    presenceData.details = 'Viewing an Objection'
    presenceData.buttons = [
      {
        label: 'View Objection',
        url: href,
      },
    ]
  }
  else if (pathname.startsWith('/case/')) {
    presenceData.details = 'Viewing a Case'
    if (document.title !== 'Play Case') {
      // Case has a title
      presenceData.state = document.title
    }
    presenceData.buttons = [
      {
        label: 'View Case',
        url: href,
      },
    ]
  }
  else if (pathname.startsWith('/courtroom/')) {
    const [participants, spectators] = Array.from(
      document.querySelectorAll('header > div > div > button'),
    ).map(button => button.textContent)
    if (document.querySelectorAll('.v-btn__content')[2]?.textContent === '')
      presenceData.details = 'Participating in a Courtroom'
    else presenceData.details = 'Spectating a Courtroom'
    presenceData.state = `${
      document.querySelector('.v-toolbar__title')?.textContent || 'Joining...'
    } | Participants: ${participants} | Spectators: ${spectators ?? 0}`
    presenceData.buttons = [
      {
        label: 'Join Courtroom',
        url: href,
      },
    ]
  }

  presence.setActivity(presenceData)
})
