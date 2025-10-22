const presence = new Presence({
  clientId: '925643552208355378',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

async function getStrings() {
  return presence.getStrings({
    browsingEmails: 'outlook.browsingEmails',
    browsingFiles: 'outlook.browsingFiles',
    composingAnEmail: 'outlook.composingAnEmail',
    readingAnEmail: 'outlook.readingAnEmail',
    viewingArchive: 'outlook.viewingArchive',
    viewingCalendar: 'outlook.viewingCalendar',
    viewingContactList: 'outlook.viewingContactList',
    viewingConversationHistory: 'outlook.viewingConversationHistory',
    viewingDrafts: 'outlook.viewingDrafts',
    viewingInbox: 'outlook.viewingInbox',
    viewingJunkEmails: 'outlook.viewingJunkEmails',
    viewingSentEmails: 'outlook.viewingSentEmails',
  })
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://i.imgur.com/sxBqCDv.png',
    startTimestamp: browsingTimestamp,
  }
  const path = document.location.pathname
  const strings = await getStrings()
  if (path.startsWith('/mail')) {
    if (
      document.querySelector<HTMLDivElement>(
        '#ReadingPaneContainerId > div > div > div > div:nth-child(1) > div._3Ot6xv41uIO58lh-I36wdt > div:nth-child(1) > div > div._1LtJxmUY1w2weHRM-NvCf9 > div',
      )
      || path.includes('compose')
    ) {
      presenceData.details = strings.composingAnEmail
    }
    else if (path.includes('id')) {
      presenceData.details = strings.readingAnEmail
      if (await presence.getSetting<boolean>('title')) {
        presenceData.state = document.querySelector<HTMLSpanElement>(
          '#ReadingPaneContainerId div._2bnn4NUZa-NanNIO4GItP0.allowTextSelection._3FNHkYLZYD6Y3-QNc7ZBo2 > span',
        )?.textContent
      }
    }
    else if (path.includes('inbox')) {
      presenceData.details = strings.viewingInbox
    }
    else if (path.includes('archive')) {
      presenceData.details = strings.viewingArchive
    }
    else if (path.includes('junkemail')) {
      presenceData.details = strings.viewingJunkEmails
    }
    else if (path.includes('drafts')) {
      presenceData.details = strings.viewingDrafts
    }
    else if (path.includes('sentitems')) {
      presenceData.details = strings.viewingSentEmails
    }
    else if (path.includes('conversationhistory')) {
      presenceData.details = strings.viewingConversationHistory
    }
    else {
      presenceData.details = strings.browsingEmails
    }
  }
  else if (path.startsWith('/calendar')) {
    presenceData.details = strings.viewingCalendar
  }
  else if (path.startsWith('/files')) {
    presenceData.details = strings.browsingFiles
  }
  else if (path.startsWith('/people')) {
    presenceData.details = strings.viewingContactList
  }
  presence.setActivity(presenceData)
})
