import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1403887239460814959',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/N/NixOS/assets/logo.png',
  LogoRainbow = 'https://cdn.rcd.gg/PreMiD/websites/N/NixOS/assets/0.png',
  LogoRb = 'https://cdn.rcd.gg/PreMiD/websites/N/NixOS/assets/1.png',
}

const manualNames: { [manualName: string]: string } = {
  nixpkgs: 'Nixpkgs',
  nixos: 'NixOS',
}

const searchCategoryNames: { [categoryName: string]: string } = {
  packages: 'packages',
  options: 'options',
  flakes: 'packages and options of public flakes',
}

const guideIsWhat: { [guideSlug: string]: string } = {
  'how-nix-works': 'about how Nix works',
  'nix-pills': 'the Nix Pills',
}

presence.on('UpdateData', async () => {
  const { pathname, hostname } = document.location
  const pathArray = pathname.split('/')
  const firstPath = pathArray[1]
  const privacy = await presence.getSetting<boolean>('privacy')
  let presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  const topLevelData: {
    [hostname: string]: PresenceData
  } = {
    'reproducible.nixos.org': {
      largeImageKey: ActivityAssets.LogoRb,
      smallImageKey: Assets.Reading,
      details: 'Reading about reproducible builds',
    },
    'status.nixos.org': {
      details: 'Looking at the status of NixOS channels',
    },
  }

  const advancedData: {
    [hostname: string]: {
      [path: string]: PresenceData
    }
  } = {
    'hydra.nixos.org': {
      '': {
        details: 'Browsing Hydra',
      },
      'status': {
        details: 'Browsing running Hydra builds',
      },
      'machines': {
        details: 'Browsing registered Hydra machines',
      },
      'evals': {
        details: 'Browsing the latest Hydra evaluations',
      },
      'all': {
        details: 'Browsing the latest Hydra builds',
      },
      'steps': {
        details: 'Browsing the latest Hydra job steps',
      },
      'queue_runner_status': {
        smallImageKey: Assets.Viewing,
        details: 'Looking at the Hydra queue runner status',
      },
      'queue-summary': {
        smallImageKey: Assets.Viewing,
        details: 'Looking at the Hydra queue summary',
      },
      'project': {
        smallImageKey: Assets.Viewing,
        details: 'Looking at an Hydra project',
        state: privacy ? undefined : pathArray[2],
      },
      'jobset': {
        smallImageKey: Assets.Viewing,
        details: 'Looking at an Hydra jobset',
        state: privacy ? undefined : pathArray.slice(2).join(':'),
      },
      'job': {
        smallImageKey: Assets.Viewing,
        details: 'Looking at an Hydra job',
        state: privacy ? undefined : pathArray.slice(2).join(':'),
      },
      'build': {
        smallImageKey: Assets.Viewing,
        smallImageText: privacy
          ? undefined
          : `Job: ${document.querySelectorAll('.page-header').item(0)?.textContent?.split(' ').at(-1)}`,
        details: 'Looking at an Hydra build',
        state: privacy ? undefined : `Build ${pathArray[2]}`,
      },
      'eval': {
        smallImageKey: Assets.Viewing,
        smallImageText: privacy
          ? undefined
          : `Jobset: ${document.querySelectorAll('.page-header').item(0)?.textContent?.split(' ').at(-1)}`,
        details: 'Looking at an Hydra evaluation',
        state: privacy ? undefined : `Evaluation ${pathArray[2]}`,
      },
    },
  }

  const homeData: { [pathname: string]: PresenceData } = {
    '': {
      largeImageKey: ActivityAssets.LogoRainbow,
      details: 'Browsing the home page',
    },
    'manual': {
      largeImageKey: ActivityAssets.Logo,
      smallImageKey: Assets.Reading,
      smallImageText: `Version: ${pathArray[3]}`,
      details: `Reading the ${manualNames[pathArray[2]!]} manual`,
    },
    'guides': {
      largeImageKey: ActivityAssets.LogoRainbow,
      smallImageKey: Assets.Reading,
      details: `Reading ${guideIsWhat[pathArray[2]!]}`,
      state: pathArray[2] === 'nix-pills'
        ? document.querySelector('main > h1')!.textContent
        : undefined,
    },
  }

  if (hostname in topLevelData) {
    const hostData: PresenceData = topLevelData[hostname]!

    presenceData = { ...presenceData, ...hostData }
    presence.setActivity(presenceData)
    return
  }

  if (hostname in advancedData) {
    const hostData = advancedData[hostname]!
    if (pathArray[1]! in hostData) {
      const pathData: PresenceData = hostData[pathArray[1]!]!
      presenceData = { ...presenceData, ...pathData }
      presence.setActivity(presenceData)
      return
    }
  }

  switch (hostname) {
    case 'nixos.org':
      if (pathArray[1]! in homeData) {
        presenceData = { ...presenceData, ...homeData[pathArray[1]!] }
      }
      else {
        presenceData.largeImageKey = ActivityAssets.LogoRainbow
        presenceData.details = `Browsing the ${pathArray[1]} page`
        presenceData.state = document
          .querySelector('h1')!
          .innerHTML
          .replaceAll('&amp;', '&')
      }
      break
    case 'search.nixos.org':
      if (pathArray.length === 0) {
        presence.error('Path is empty')
        presence.clearActivity()
        return
      }

      presenceData.smallImageKey = Assets.Search
      presenceData.details = `Searching ${searchCategoryNames[pathArray[1]!]}`

      if (document.querySelector<HTMLInputElement>('input#search-query-input')?.value.length !== 0) {
        const results = document.querySelector('.search-results h2 > strong')

        if (results !== null) {
          presenceData.state = privacy
            ? results.textContent
            : `"${document.querySelector<HTMLInputElement>('input#search-query-input')?.value}" | ${results.textContent}`
        }
        else if (!privacy) {
          presenceData.state = `"${document.querySelector<HTMLInputElement>('input#search-query-input')?.value}"`
        }
      }

      if (pathArray[1] !== 'flakes') {
        presenceData.smallImageText = `Channel: ${document
          .querySelector<HTMLButtonElement>('button.active')!
          .textContent}`
      }
      break
    case 'wiki.nixos.org':
      switch (firstPath) {
        case 'wiki':
          presenceData.smallImageKey = Assets.Reading
          presenceData.details = 'Viewing a page of the NixOS Wiki'
          if (!privacy) {
            presenceData.state = document
              .querySelector('h1#firstHeading')!
              .textContent
          }
          break
        default:
          presenceData.details = 'Browsing the NixOS Wiki'
          break
      }
      break
    default:
      presence.clearActivity()
      return
  }

  presence.setActivity(presenceData)
})
