const presence = new Presence({
  clientId: '1494011757717487626',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const { hostname } = document.location

  if (hostname !== 'mail.proton.me') {
    presence.setActivity()
    return
  }

  const presenceData: PresenceData = {
    largeImageKey: 'https://i.imgur.com/rm69OQ1.png',
    startTimestamp: browsingTimestamp,
  }

  const path = document.location.href
  const [, time] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('time'),
  ])

  if (!time)
    delete presenceData.startTimestamp

  const isComposing
    = !!document.querySelector('[data-testid=\'composer\']')
      || !!document.querySelector('.composer-container')
      || !!document.querySelector('.proton-mail-composer')
      || !!document.querySelector('.composer--container')

  if (isComposing) {
    presenceData.details = 'Composing an email'
  }
  else if (path.startsWith('https://mail.proton.me/u/2/all-drafts')) {
    presenceData.details = 'Viewing drafts'
  }
  else if (path.startsWith('https://mail.proton.me/u/2/all-sent')) {
    presenceData.details = 'Viewing sent emails'
  }
  else if (path.startsWith('https://mail.proton.me/u/2/starred')) {
    presenceData.details = 'Viewing starred emails'
  }
  else if (path.startsWith('https://mail.proton.me/u/2/archive')) {
    presenceData.details = 'Viewing archived emails'
  }
  else if (path.startsWith('https://mail.proton.me/u/2/spam')) {
    presenceData.details = 'Viewing spam emails'
  }
  else if (path.startsWith('https://mail.proton.me/u/2/trash')) {
    presenceData.details = 'Viewing trash'
  }
  else if (path.startsWith('https://mail.proton.me/u/2/almost-all-mail')) {
    presenceData.details = 'Viewing all emails'
  }
  else if (path.startsWith('https://mail.proton.me/u/2/all-mail')) {
    presenceData.details = 'Viewing all emails'
  }
  else if (path.startsWith('https://mail.proton.me/u/2/views/newsletters')) {
    presenceData.details = 'Viewing newsletters'
  }
  else if (
    path.startsWith('https://mail.proton.me/u/2/inbox/')
    && path.split('/').length > 6
  ) {
    presenceData.details = 'Viewing an email'
  }
  else if (
    path.startsWith('https://mail.proton.me/u/2/inbox')
    && !path.split('/').pop()?.includes('L')
  ) {
    presenceData.details = 'Viewing inbox'
  }
  else if (path.includes('/u/2/inbox')) {
    presenceData.details = 'Viewing inbox'
  }
  else {
    presenceData.details = 'Viewing inbox'
  }

  if (presenceData.details) {
    presence.setActivity(presenceData)
  }
  else {
    presence.setActivity()
  }
})
