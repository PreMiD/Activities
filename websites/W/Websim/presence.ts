const presence = new Presence({
  clientId: '1315383978878046411',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum Assets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/W/Websim/assets/logo.png',
}

const presenceData: PresenceData = {
  largeImageKey: Assets.Logo,
  startTimestamp: browsingTimestamp,
  details: 'Playing on Websim',
  smallImageText: 'Websim',
}

const defaultPaths = [
  '/',
  '/play',
  '/dashboard/creator',
  '/plan',
]

presence.on('iFrameData', (data) => {
  const currentPath = document.location.pathname
  const pathArray = currentPath.split('/')
  if (defaultPaths.includes(currentPath) || pathArray.length === 1)
    return
  if (data.favicon) {
    presenceData.largeImageKey = data.favicon
    presenceData.smallImageKey = Assets.Logo
  }
  presenceData.details = (document.title.toLocaleLowerCase().includes('profile')) ? `Viewing ${document.title}` : `Playing ${document.title}`
  presenceData.state = (data.isOwner) ? `This is their creation` : `By ${data.creator.username}`
})

presence.on('UpdateData', async () => {
  const [showButtons, btnPrivacy] = await Promise.all([
    presence.getSetting('showButtons'),
    presence.getSetting('btnPrivacy'),
  ])
  const currentPath = document.location.pathname
  const pathArray = currentPath.split('/')
  if (defaultPaths.includes(currentPath)) {
    presenceData.largeImageKey = Assets.Logo
    delete presenceData.smallImageKey
  }

  if (currentPath === '/') {
    presenceData.details = 'Browsing the Homepage'
    delete presenceData.state
  }
  else if (currentPath === '/play') {
    presenceData.details = 'Playing Websims'
    delete presenceData.state
  }
  else if (currentPath === '/dashboard/creator') {
    presenceData.details = 'Viewing their dashboard'
    delete presenceData.state
  }
  else if (currentPath === '/plan') {
    presenceData.details = 'Browsing Pricing'
    delete presenceData.state
  }

  if (showButtons && pathArray.length >= 2 && !defaultPaths.includes(currentPath)) {
    presenceData.buttons = [
      {
        label: 'View Project',
        url: `https://websim.ai${pathArray[3] ? currentPath.substring(0, currentPath.lastIndexOf('/')) : currentPath}`,
      },
    ]
    if (!btnPrivacy && pathArray[3]) {
      const revNum = pathArray[3]
      presenceData.buttons[1] = {
        label: `View Revision (#${revNum})`,
        url: `https://websim.ai${currentPath}`,
      }
    }
  }
  else {
    delete presenceData.buttons
  }
  presence.setActivity({
    ...presenceData,
    buttons: presenceData.buttons,
  })
})
