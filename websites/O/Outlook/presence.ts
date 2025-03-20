const presence = new Presence({
  clientId: '925643552208355378',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/O/Outlook/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const path = document.location.pathname
  if (path.startsWith('/mail')) {
    if (
      document.querySelector<HTMLDivElement>(
        '#ReadingPaneContainerId > div > div > div > div:nth-child(1) > div._3Ot6xv41uIO58lh-I36wdt > div:nth-child(1) > div > div._1LtJxmUY1w2weHRM-NvCf9 > div',
      )
      || path.includes('compose')
    ) {
      presenceData.details = 'Composing an email'
    }
    else if (path.includes('id')) {
      presenceData.details = 'Reading an email'
      if (await presence.getSetting<boolean>('title')) {
        presenceData.state = document.querySelector<HTMLSpanElement>(
          '#ReadingPaneContainerId div._2bnn4NUZa-NanNIO4GItP0.allowTextSelection._3FNHkYLZYD6Y3-QNc7ZBo2 > span',
        )?.textContent
      }
    }
    else if (path.includes('inbox')) {
      presenceData.details = 'Viewing inbox'
    }
    else if (path.includes('archive')) {
      presenceData.details = 'Viewing archive'
    }
    else if (path.includes('junkemail')) {
      presenceData.details = 'Viewing junk emails'
    }
    else if (path.includes('drafts')) {
      presenceData.details = 'Viewing drafts'
    }
    else if (path.includes('sentitems')) {
      presenceData.details = 'Viewing sent emails'
    }
    else if (path.includes('conversationhistory')) {
      presenceData.details = 'Viewing conversation history'
    }
    else {
      presenceData.details = 'Browsing emails'
    }
  }
  else if (path.startsWith('/calendar')) {
    presenceData.details = 'Viewing calendar'
  }
  else if (path.startsWith('/files')) {
    presenceData.details = 'Browsing files'
  }
  else if (path.startsWith('/people')) {
    presenceData.details = 'Viewing contact list'
  }
  presence.setActivity(presenceData)
})
