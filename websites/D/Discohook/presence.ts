import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1036322932932218880',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/D/Discohook/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const { pathname } = document.location
  const pathList = pathname.split('/').filter(Boolean)

  if (pathname.startsWith('/donate')) {
    presenceData.details = 'In donation page'
  }
  if (pathname.startsWith('/guide')) {
    presenceData.details = 'Reading guide'
    presenceData.smallImageKey = Assets.Reading
  }
  else if (pathname.startsWith('/me')) {
    switch (pathList[1] ?? '') {
      case '':
        presenceData.details = 'Viewing profile'
        break
      case 'servers':
        presenceData.details = 'Viewing discord server list'
        break
      case 'backups':
        presenceData.details = 'Viewing backups'
        break
      case 'share-links':
        presenceData.details = 'Viewing link shared'
        break
      case 'link-embeds':
        presenceData.details = 'Viewing link embeds'
        break
    }
  }
  else {
    const webhookCount = document.querySelectorAll('.ci-Edit_Pencil_01').length
    const messageCount = document.querySelectorAll('.group\\/message').length
    const embedCount = document.querySelectorAll('.group\\/embed').length

    presenceData.smallImageKey = Assets.Writing
    presenceData.smallImageText = 'Editing...'
    presenceData.details = webhookCount > 1 ? `Editing ${webhookCount} webhooks` : 'Editing a webhook'
    presenceData.state = `${messageCount} message${
      messageCount > 1 ? 's' : ''
    } - ${embedCount} embed${embedCount > 1 || embedCount === 0 ? 's' : ''}`
  }

  presence.setActivity(presenceData)
})
