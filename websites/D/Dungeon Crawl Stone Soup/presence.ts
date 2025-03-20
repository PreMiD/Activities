const presence = new Presence({
  clientId: '994723983415062548',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/D/Dungeon%20Crawl%20Stone%20Soup/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }

  if (window.location.hash === '#lobby') {
    presenceData.details = 'Browsing lobby'
  }
  else if (window.location.hash.startsWith('#watch')) {
    presenceData.details = `Spectating: ${
      document.querySelector<HTMLSpanElement>('#stats_titleline')?.textContent
    }`
    presenceData.state = `XL: ${
      document.querySelector<HTMLSpanElement>('#stats_xl')?.textContent
    } | Location: ${
      document.querySelector<HTMLSpanElement>('#stats_place')?.textContent
    }`
    presenceData.buttons = [
      {
        label: 'Spectate',
        url: document.location.href,
      },
    ]
  }
  else if (window.location.hash.startsWith('#play-')) {
    presenceData.details = `Playing as: ${
      document.querySelector<HTMLSpanElement>('#stats_titleline')?.textContent
    }`
    presenceData.state = `XL: ${
      document.querySelector<HTMLSpanElement>('#stats_xl')?.textContent
    } | Location: ${
      document.querySelector<HTMLSpanElement>('#stats_place')?.textContent
    }`
    presenceData.buttons = [
      {
        label: 'Spectate',
        url: `${document.location.origin}/#watch-${document
          .querySelector<HTMLSpanElement>('#stats_titleline')
          ?.textContent
          ?.split('the')[0]
          ?.trim()}`,
      },
    ]
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
