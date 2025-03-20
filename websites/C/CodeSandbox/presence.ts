const presence = new Presence({
  clientId: '961652082027421746',
})
const browsingTimestamp = Math.floor(Date.now())
const formats = [
  'js',
  'jsx',
  'ts',
  'tsx',
  'json',
  'py',
  'cpp',
  'cs',
  'c',
  'py',
  'swift',
  'java',
  'html',
  'css',
  'php',
  'kt',
  'sql',
  'lua',
  'ru',
  'bash',
  'sh',
  'bat',
  'cr',
  'go',
  'rs',
]

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/C/CodeSandbox/assets/logo.png',
  Square = 'https://cdn.rcd.gg/PreMiD/websites/C/CodeSandbox/assets/0.png',
  Create = 'https://cdn.rcd.gg/PreMiD/websites/C/CodeSandbox/assets/1.png',
  Dashboard = 'https://cdn.rcd.gg/PreMiD/websites/C/CodeSandbox/assets/2.png',
  Discover = 'https://cdn.rcd.gg/PreMiD/websites/C/CodeSandbox/assets/3.png',
  Drafts = 'https://cdn.rcd.gg/PreMiD/websites/C/CodeSandbox/assets/4.png',
  All = 'https://cdn.rcd.gg/PreMiD/websites/C/CodeSandbox/assets/5.png',
  Templates = 'https://cdn.rcd.gg/PreMiD/websites/C/CodeSandbox/assets/6.png',
  Repositories = 'https://cdn.rcd.gg/PreMiD/websites/C/CodeSandbox/assets/7.png',
  Recent = 'https://cdn.rcd.gg/PreMiD/websites/C/CodeSandbox/assets/8.png',
  Deleted = 'https://cdn.rcd.gg/PreMiD/websites/C/CodeSandbox/assets/9.png',
  Shared = 'https://cdn.rcd.gg/PreMiD/websites/C/CodeSandbox/assets/10.png',
  Liked = 'https://cdn.rcd.gg/PreMiD/websites/C/CodeSandbox/assets/11.png',
  Profile = 'https://cdn.rcd.gg/PreMiD/websites/C/CodeSandbox/assets/12.png',
  Txt = 'https://cdn.rcd.gg/PreMiD/websites/C/CodeSandbox/assets/13.png',
  UserSandbox = 'https://cdn.rcd.gg/PreMiD/websites/C/CodeSandbox/assets/14.png',
  Unknown = 'https://cdn.rcd.gg/PreMiD/websites/C/CodeSandbox/assets/15.png',
}

const assets = {
  py: 'https://cdn.rcd.gg/PreMiD/websites/C/CodeSandbox/assets/16.png',
  js: 'https://cdn.rcd.gg/PreMiD/websites/C/CodeSandbox/assets/17.png',
  ts: 'https://cdn.rcd.gg/PreMiD/websites/C/CodeSandbox/assets/18.png',
  css: 'https://cdn.rcd.gg/PreMiD/websites/C/CodeSandbox/assets/19.png',
  swift: 'https://cdn.rcd.gg/PreMiD/websites/C/CodeSandbox/assets/20.png',
  html: 'https://cdn.rcd.gg/PreMiD/websites/C/CodeSandbox/assets/21.png',
  java: 'https://cdn.rcd.gg/PreMiD/websites/C/CodeSandbox/assets/22.png',
  cpp: 'https://cdn.rcd.gg/PreMiD/websites/C/CodeSandbox/assets/23.png',
  json: 'https://cdn.rcd.gg/PreMiD/websites/C/CodeSandbox/assets/24.png',
  cs: 'https://cdn.rcd.gg/PreMiD/websites/C/CodeSandbox/assets/25.png',
  c: 'https://cdn.rcd.gg/PreMiD/websites/C/CodeSandbox/assets/26.png',
  txt: 'https://cdn.rcd.gg/PreMiD/websites/C/CodeSandbox/assets/13.png',
  tsx: 'https://cdn.rcd.gg/PreMiD/websites/C/CodeSandbox/assets/27.png',
  jsx: 'https://cdn.rcd.gg/PreMiD/websites/C/CodeSandbox/assets/28.png',
  cr: 'https://cdn.rcd.gg/PreMiD/websites/C/CodeSandbox/assets/29.png',
  go: 'https://cdn.rcd.gg/PreMiD/websites/C/CodeSandbox/assets/30.png',
  sh: 'https://cdn.rcd.gg/PreMiD/websites/C/CodeSandbox/assets/31.png',
  bash: 'https://cdn.rcd.gg/PreMiD/websites/C/CodeSandbox/assets/32.png',
  sql: 'https://cdn.rcd.gg/PreMiD/websites/C/CodeSandbox/assets/33.png',
  ru: 'https://cdn.rcd.gg/PreMiD/websites/C/CodeSandbox/assets/34.png',
  lua: 'https://cdn.rcd.gg/PreMiD/websites/C/CodeSandbox/assets/35.png',
  php: 'https://cdn.rcd.gg/PreMiD/websites/C/CodeSandbox/assets/36.png',
  kt: 'https://cdn.rcd.gg/PreMiD/websites/C/CodeSandbox/assets/37.png',
  bat: 'https://cdn.rcd.gg/PreMiD/websites/C/CodeSandbox/assets/38.png',
  rs: 'https://cdn.rcd.gg/PreMiD/websites/C/CodeSandbox/assets/39.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    smallImageKey: ActivityAssets.Square,
    smallImageText: 'CodeSandbox',
    details: 'Loading',
    startTimestamp: browsingTimestamp,
  }
  const { pathname, search } = window.location
  if (pathname.startsWith('/')) {
    if (document.querySelector<HTMLDivElement>('[class="ReactModalPortal"]')) {
      presenceData.details = 'Creating a new sandbox!'
      presenceData.largeImageKey = ActivityAssets.Create
    }
    else if (pathname.includes('/dashboard/home')) {
      presenceData.details = 'Looking at their dashboard'
      presenceData.state = 'Page: Home'
      presenceData.largeImageKey = ActivityAssets.Dashboard
    }
    else if (pathname.includes('/dashboard/discover')) {
      presenceData.details = 'Discovering other sandboxes'
      presenceData.state = 'Page: Discover'
      presenceData.largeImageKey = ActivityAssets.Discover
    }
    else if (pathname.includes('/dashboard/drafts')) {
      presenceData.details = 'Looking at their drafts'
      presenceData.state = 'Page: Drafts'
      presenceData.largeImageKey = ActivityAssets.Drafts
    }
    else if (pathname.includes('/dashboard/all')) {
      presenceData.details = 'Looking through their sandboxes'
      presenceData.state = 'Page: All Sandboxes'
      presenceData.largeImageKey = ActivityAssets.All
    }
    else if (pathname.includes('/dashboard/templates')) {
      presenceData.details = 'Looking through their templates'
      presenceData.state = 'Page: Templates'
      presenceData.largeImageKey = ActivityAssets.Templates
    }
    else if (pathname.includes('/dashboard/repositories')) {
      presenceData.details = 'Looking through their repositories'
      presenceData.state = 'Page: Repositories'
      presenceData.largeImageKey = ActivityAssets.Repositories
    }
    else if (pathname.includes('/dashboard/recent')) {
      presenceData.details = 'Looking through their recent sandboxes'
      presenceData.state = 'Page: Recently Modified'
      presenceData.largeImageKey = ActivityAssets.Recent
    }
    else if (pathname.includes('/dashboard/deleted')) {
      presenceData.details = 'Looking through their trashed sandboxes'
      presenceData.state = 'Page: Recently Deleted'
      presenceData.largeImageKey = ActivityAssets.Deleted
    }
    else if (pathname.includes('/dashboard/shared')) {
      presenceData.details = 'Looking at shared sandboxes'
      presenceData.state = 'Page: Shared With Me'
      presenceData.largeImageKey = ActivityAssets.Shared
    }
    else if (pathname.includes('/dashboard/liked')) {
      presenceData.details = 'Looking at liked sandboxes'
      presenceData.state = 'Page: Liked Sandboxes'
      presenceData.largeImageKey = ActivityAssets.Liked
    }
    else if (pathname.includes('/u/')) {
      presenceData.details = 'Looking at a user\'s profile:'
      presenceData.state = `${
        document.querySelector<HTMLSpanElement>(
          '[class="sc-bdnylx sc-gtssRu gDXMLZ hHsTZp"]',
        )?.textContent
      } (@${
        document.querySelector<HTMLSpanElement>(
          '[class="sc-bdnylx sc-gtssRu gDXMLZ itZLEx"]',
        )?.textContent
      })`
      presenceData.largeImageKey = ActivityAssets.Profile
      presenceData.buttons = [
        {
          label: 'View Profile',
          url: location.href.toString(),
        },
      ]
    }
    else if (pathname.includes('/s/')) {
      if (
        document.querySelector<HTMLButtonElement>('[aria-label="Explorer"]')
      ) {
        const cfile = search.split('/').filter(elm => elm !== '')
        const formatImg = search.split('.').filter(elm => elm !== '')
        presenceData.details = `Editing ${
          search
            ? ` ${cfile[cfile.length - 1]?.replace(
              /(:)|\d|(-)/g,
              '',
            )} (${document
              .querySelector<HTMLAnchorElement>('[title="Go to Line"]')
              ?.textContent
              ?.replace(/\(|(\d*) selected\)/g, '')})`
            : 'a sandbox'
        }`
        presenceData.state = `Workspace: ${document.title.split('-')[0]}`
        if (
          formats.includes(
            formatImg[formatImg.length - 1]!
            /* .toLowerCase() */
              .replace(/(:)|\d|(-)/g, ''),
          )
        ) {
          presenceData.largeImageKey = assets[
            `${formatImg[formatImg.length - 1]
              ?.toLowerCase()
              .replace(/(:)|\d|(-)/g, '')}` as keyof typeof assets
          ]
        }
        else {
          presenceData.largeImageKey = ActivityAssets.Txt
        }
      }
      else {
        presenceData.details = `Looking at ${
          document.querySelector<HTMLSpanElement>(
            '[class="sc-bdnylx sc-gtssRu gDXMLZ kEgnIE"]',
          )?.textContent
        }'s sandbox`
        presenceData.state = `Workspace: ${
          document.querySelector<HTMLButtonElement>(
            '[class="sc-bdnylx sc-gtssRu gDXMLZ efjlMo"]',
          )?.textContent
        }`
        presenceData.largeImageKey = ActivityAssets.UserSandbox
        presenceData.buttons = [
          {
            label: 'View Sandbox',
            url: location.href.toString(),
          },
        ]
      }
    }
    else {
      presenceData.details = 'Viewing an unsupported CodeSandbox page'
      presenceData.largeImageKey = ActivityAssets.Unknown
    }
  }
  presence.setActivity(presenceData)
})
