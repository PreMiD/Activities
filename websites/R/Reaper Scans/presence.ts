import { Assets } from 'premid'

const presence = new Presence({
  clientId: '900717839713959967',
})
const elapsed = Math.floor(Date.now() / 1e3)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/R/Reaper%20Scans/assets/logo.png',
}

function capitalize(str: string) {
  return `${str.charAt(0).toUpperCase()}${str.slice(1)}`
}

presence.on('UpdateData', () => {
  const { pathname, href } = window.location
  const presenceData: PresenceData = {
    startTimestamp: elapsed,
    largeImageKey: ActivityAssets.Logo,
  }
  const pathSplit = pathname.split('/').slice(1)

  switch (pathSplit[0] ?? '') {
    case '': {
      const searchInput = document.querySelector<HTMLInputElement>('#search')
      if (searchInput === document.activeElement) {
        presenceData.details = 'Searching'
        presenceData.state = searchInput?.value
        presenceData.smallImageKey = Assets.Search
      }
      else {
        presenceData.details = 'Viewing Home Page'
      }
      break
    }
    case 'comics':
    case 'novels': {
      const captitalizedPath = capitalize(pathSplit[0]!).slice(
        0,
        pathSplit[0]!.length - 1,
      )
      if (pathSplit[1]) {
        if (pathSplit[2] === 'chapters') {
          let progress = (document.documentElement.scrollTop
            / ((document.querySelector(
              pathSplit[0] === 'comics' ? 'main' : 'article',
            )?.scrollHeight ?? 0)
            - window.innerHeight))
          * 100
          progress = Math.ceil(progress) > 100 ? 100 : Math.ceil(progress)

          presenceData.details = `Reading ${document
            .querySelector<HTMLParagraphElement>('main p')
            ?.textContent
            ?.trim()}`
          presenceData.state = `${document
            .querySelector<HTMLDivElement>('main nav > div:nth-child(2)')
            ?.textContent
            ?.trim()} - ${progress}%`
          presenceData.smallImageKey = Assets.Reading
          presenceData.buttons = [
            {
              label: `View ${captitalizedPath} Page`,
              url: document.querySelector<HTMLAnchorElement>(
                'main nav > div:last-child > a',
              )?.href ?? '',
            },
            {
              label: 'View Chapter',
              url: href,
            },
          ]
        }
        else {
          presenceData.details = `Viewing ${captitalizedPath} Page`
          presenceData.state = document.querySelector('h1')?.textContent
          presenceData.smallImageKey = Assets.Viewing
          presenceData.buttons = [
            {
              label: `View ${captitalizedPath} Page`,
              url: href,
            },
          ]
        }
      }
      else {
        presenceData.details = `Viewing ${captitalizedPath} List`
        presenceData.state = `${
          document.querySelectorAll<HTMLLIElement>('h2 + div li').length
        } ${pathSplit[0]}s found`
      }
      break
    }
    case 'latest': {
      presenceData.details = `Browsing Latest ${capitalize(pathSplit[1]!)}`
      break
    }
    case 'account': {
      presenceData.details = 'Managing Account Settings'
      break
    }
    case 'blog': {
      presenceData.details = 'Reading a Blog Post'
      presenceData.state = document.querySelector('h1')?.textContent?.trim()
      break
    }
    default: {
      presenceData.details = 'Browsing Reaper Scans'
      presenceData.state = document.title
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
