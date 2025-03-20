const presence = new Presence({
  clientId: '1208682131392565320',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets { // Other default assets can be found at index.d.ts
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/M/ModDB/assets/logo.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const { pathname, href } = document.location
  const locations = pathname.split('/')
  const showButtons = await presence.getSetting<boolean>('buttons')
  locations.shift()
  switch (true) {
    case pathname.startsWith('/members/register'):
      presenceData.details = 'Registering'
      break
    case /\/members\/[\w\-.]*\/[a-z]*/.test(pathname):
      presenceData.details = `Viewing ${locations[1]}'s ${locations[2]}`
      break
    case pathname.startsWith('/members/'): {
      const name = document.querySelector(
        '.headercorner .title h2 a',
      )?.textContent
      presenceData.details = 'Viewing member information'
      if (name)
        presenceData.state = name
      break
    }
    case /\/(?:games|mods|addons|downloads|engines|company|groups)\/(?:top|latest)/.test(
      pathname,
    ):
      showLinkButton()
      presenceData.details = `Viewing ${locations[1]} ${locations[0]}`
      break
    case /\/(?:games|mods|addons|downloads|articles|engines|company|groups)\/add/.test(
      pathname,
    ): {
      const type = locations[0]?.split('')
      if (type?.at(-1) === 's')
        type?.pop()
      const typeJoined = type?.join('')
      presenceData.details = `Adding a${
        typeJoined?.startsWith('a') ? 'n' : ''
      } ${typeJoined}`
      break
    }
    case /\/(?:games|mods)\/[A-Za-z0-9|-]+\/(?:news|articles|tutorials|reviews|downloads|addons|mods|videos|images)(?:\/[A-Za-z0-9|-]+)?/.test(
      pathname,
    ): {
      const gameName = document.querySelector(
        '.title h2[itemprop=\'name\']',
      )?.textContent
      showLinkButton()
      const type = locations[0]?.split('')
      if (type?.at(-1) === 's')
        type?.pop()
      const typeJoined = type?.join('')
      presenceData.details = `Viewing ${
        gameName
          ? `${gameName} ${typeJoined}`
          : `${typeJoined?.startsWith('a') ? 'an' : 'a'} ${typeJoined}`
      }'s ${locations[2]}`
      const heading = document.querySelector('.normalcorner .title .heading')
      if (heading?.textContent && !heading.textContent.startsWith('Reviews'))
        presenceData.state = heading.textContent
      break
    }
    case /\/(?:games|mods)\/[A-Za-z0-9|-]+/.test(pathname): {
      const gameName = document.querySelector(
        '.title h2[itemprop=\'name\']',
      )?.textContent
      showLinkButton()
      const type = locations[0]?.split('')
      if (type?.at(-1) === 's')
        type?.pop()
      const typeJoined = type?.join('')
      presenceData.details = `Viewing ${
        gameName
          ? `${gameName} ${typeJoined}`
          : `${typeJoined?.startsWith('a') ? 'an' : 'a'} ${typeJoined}`
      }`
      break
    }
    case /\/mods\/[A-Za-z0-9|-]+/.test(pathname): {
      const modName = document.querySelector('.title h2 a')?.textContent
      showLinkButton()
      presenceData.details = `Viewing ${modName ? `${modName} mod` : 'a mod'}`
      break
    }
    case /\/rtx\/?[a-z]?/.test(pathname):
      showLinkButton()
      presenceData.details = `Viewing ${
        document
          .querySelector('.normalcorner .title .heading')
          ?.textContent
          ?.split('  ')[0]
      }`
      break
    case pathname.startsWith('/jobs/add'):
      showLinkButton()
      presenceData.details = 'Posting a job'
      break
    case /\/games|mods|addons|downloads|videos|articles|engines|company|groups|jobs/.test(
      pathname,
    ): {
      showLinkButton()
      let location = locations[0]
      if (location === 'company')
        location = 'developers'
      presenceData.details = `Viewing ${location}`
      break
    }
    case pathname.startsWith('/about'):
      showLinkButton()
      presenceData.details = 'Viewing about page'
      break
    case pathname === '/':
      showLinkButton()
      presenceData.details = 'Viewing home page'
      break
    case pathname.startsWith('/today'):
      showLinkButton()
      presenceData.details = 'Viewing files uploaded today'
      break
    case /\/(?:week|month|year)/.test(pathname):
      showLinkButton()
      presenceData.details = `Viewing files uploaded this ${locations[0]}`
      break
    case /reviews|headline|blogs|images|audio/.test(pathname):
      presenceData.details = `Viewing ${locations[0]}`
      break
    case pathname.startsWith('/forum'): {
      showLinkButton()
      presenceData.details = 'Viewing forums'
      const heading = document.querySelector(
        'tr.category td .heading',
      )?.textContent
      if (heading && heading !== 'Your Favorites')
        presenceData.state = heading
      else presenceData.state = 'Site Forums'
      break
    }
  }
  function showLinkButton() {
    if (!showButtons)
      return
    presenceData.buttons = [
      {
        label: 'View',
        url: href,
      },
    ]
  }
  presenceData.details = presenceData.details?.toString()
  if (locations.includes('downloads'))
    presenceData.details = presenceData.details?.replace('downloads', 'files')
  if (locations.includes('top'))
    presenceData.details = presenceData.details?.replace('top', 'popular')
  presence.setActivity(presenceData)
})
