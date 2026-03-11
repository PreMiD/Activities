const presence = new Presence({
  clientId: '754549450772316160',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/X/XKCD/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }

  if (
    !document.body.textContent?.includes('404 Not Found\nnginx')
    && !Number.isNaN(Number(location.pathname.replace(/\//g, '')))
  ) {
    const comicNumber = document
      .querySelector('[property="og:url"]')
      ?.getAttribute('content')
      ?.split('xkcd.com/')[1]
      ?.split('/')[0]
    let text = document.querySelector('#comic > img')?.getAttribute('title')
    if (text && text.length > 127)
      text = `${text.substring(0, 124)}...`

    presenceData.smallImageText = text
    presenceData.details = `Reading #${comicNumber}`
    presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/X/XKCD/assets/0.png'
    presenceData.buttons = [
      {
        url: `https://xkcd.com/${comicNumber}`,
        label: 'View Comic',
      },
    ]
    presenceData.state = document.querySelector('#ctitle')?.textContent
  }
  else {
    presenceData.details = 'Browsing XKCD'
  }

  presence.setActivity(presenceData)
})
