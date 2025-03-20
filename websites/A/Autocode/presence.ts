const presence = new Presence({ clientId: '858292108195921920' })
const startedAt = Date.now()
const supportedLanguages: string[] = [
  'js',
  'md',
  'json',
  'gitignore',
  'txt',
  'html',
  'css',
]

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/A/Autocode/assets/logo.jpg',
  Snippet = 'https://cdn.rcd.gg/PreMiD/websites/A/Autocode/assets/0.png',
  Apps = 'https://cdn.rcd.gg/PreMiD/websites/A/Autocode/assets/1.png',
  Lib = 'https://cdn.rcd.gg/PreMiD/websites/A/Autocode/assets/2.png',
  Autocode = 'https://cdn.rcd.gg/PreMiD/websites/A/Autocode/assets/3.png',
}

const assets = {
  'lang-html': 'https://cdn.rcd.gg/PreMiD/websites/A/Autocode/assets/4.png',
  'lang-css': 'https://cdn.rcd.gg/PreMiD/websites/A/Autocode/assets/5.png',
  'lang-js': 'https://cdn.rcd.gg/PreMiD/websites/A/Autocode/assets/6.png',
  'lang-json': 'https://cdn.rcd.gg/PreMiD/websites/A/Autocode/assets/7.png',
  'lang-txt': 'https://cdn.rcd.gg/PreMiD/websites/A/Autocode/assets/8.png',
  'lang-md': 'https://cdn.rcd.gg/PreMiD/websites/A/Autocode/assets/9.png',
  'lang-gitignore': 'https://cdn.rcd.gg/PreMiD/websites/A/Autocode/assets/10.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: startedAt,
  }
  const { pathname, hostname } = window.location
  const path = pathname.split('/').slice(1)
  const [details, state, timestamp] = await Promise.all([
    presence.getSetting<string>('editingDetails'),
    presence.getSetting<string>('editingState'),
    presence.getSetting<boolean>('timestamp'),
  ])

  if (pathname.includes('/snippet')) {
    if (path.length >= 3) {
      presenceData.details = document
        .querySelector('h1.snippet-title.h3')
        ?.textContent
        ?.trim()
    }
    else {
      presenceData.details = 'Looking for Snippets'
    }
    presenceData.state = `${hostname}/${path[0]}`
    presenceData.smallImageKey = ActivityAssets.Snippet
  }
  else if (pathname.includes('/app')) {
    if (path.length >= 3) {
      presenceData.details = document
        .querySelector('h1.jumbo')
        ?.textContent
        ?.trim()
    }
    else {
      presenceData.details = 'Looking for Apps'
    }
    presenceData.state = `${hostname}/${path[0]}`
    presenceData.smallImageKey = ActivityAssets.Apps
  }
  else if (pathname.includes('/lib')) {
    if (path.length >= 3)
      presenceData.details = `Reading ${path[1]} docs`
    else presenceData.details = 'Looking for Docs'
    presenceData.state = `${hostname}/${path[0]}`
    presenceData.smallImageKey = ActivityAssets.Lib
  }
  else if (pathname.includes('/mp/')) {
    const filename = document
      .querySelector('div.filename > [data-filename]')
      ?.textContent
      ?.split('/')
      ?.pop()

    if (filename) {
      const extension = filename.match(/\.\w+/g)?.[0]?.replace('.', '')
      const [line, column] = document
        .querySelector('div.filename > [data-cursor]')
        ?.textContent
        ?.split(':') ?? []
      const replaceTemplate = (str: string) => {
        if (str !== '{0}') {
          return str
            .replace('%project%', path[2] ?? '')
            .replace('%file%', filename)
            .replace('%line%', line ?? '')
            .replace('%column%', column ?? '')
        }
      }

      presenceData.details = replaceTemplate(details)
      presenceData.state = replaceTemplate(state)
      presenceData.smallImageKey = ActivityAssets.Autocode

      if (extension && supportedLanguages.includes(extension)) {
        presenceData.largeImageKey = assets[`lang-${extension}` as keyof typeof assets]
      }
      else {
        presenceData.largeImageKey = ActivityAssets.Autocode
      }
    }
  }

  if (!timestamp)
    delete presenceData.startTimestamp

  if (presenceData.details || presenceData.state)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
