const presence = new Presence({
  clientId: '1494011757717487626',
})

presence.on('UpdateData', async () => {
  const path = document.location.href

  const browsingTimestamp = Math.floor(Date.now() / 1000)

  const presenceData: PresenceData = {
    largeImageKey: 'https://i.imgur.com/rm69OQ1.png',
    startTimestamp: browsingTimestamp,
  }

  const [_privacy, time] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('time'),
  ])

  if (!time)
    delete presenceData.startTimestamp

  const isComposing
    = !!document.querySelector('[data-testid="composer"]')
      || !!document.querySelector('.composer-container')
      || !!document.querySelector('.proton-mail-composer')
      || !!document.querySelector('.composer--container')

  if (isComposing) {
    presenceData.details = 'Composing an email'
  }
  else if (path.includes('/u/') && path.includes('/all-drafts')) {
    presenceData.details = 'Viewing drafts'
  }
  else if (path.includes('/u/') && path.includes('/all-sent')) {
    presenceData.details = 'Viewing sent emails'
  }
  else if (path.includes('/u/') && path.includes('/starred')) {
    presenceData.details = 'Viewing starred emails'
  }
  else if (path.includes('/u/') && path.includes('/archive')) {
    presenceData.details = 'Viewing archived emails'
  }
  else if (path.includes('/u/') && path.includes('/spam')) {
    presenceData.details = 'Viewing spam emails'
  }
  else if (path.includes('/u/') && path.includes('/trash')) {
    presenceData.details = 'Viewing trash'
  }
  else if (
    (path.includes('/u/') && path.includes('/almost-all-mail'))
    || (path.includes('/u/') && path.includes('/all-mail'))
  ) {
    presenceData.details = 'Viewing all emails'
  }
  else if (path.includes('/u/') && path.includes('/views/newsletters')) {
    presenceData.details = 'Viewing newsletters'
  }
  else if (
    path.includes('/u/')
    && path.includes('/inbox/')
    && path.split('/').length > 7
  ) {
    presenceData.details = 'Viewing an email'
  }
  else if (path.includes('/u/') && path.includes('/inbox')) {
    presenceData.details = 'Viewing inbox'
  }
  else {
    presenceData.details = 'Viewing inbox'
  }

  if (presenceData.details) {
    presence.setActivity(presenceData)
  }
  else {
    presence.clearActivity()
  }
})
