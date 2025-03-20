import { Assets } from 'premid'

const presence = new Presence({
  clientId: '926386695354609684',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)
const shortenedURLs: Record<string, string> = {}

async function shortenURL(url: string, fallback: string): Promise<string> {
  if (!url || url.length < 256)
    return url
  if (shortenedURLs[url])
    return shortenedURLs[url]
  try {
    return (shortenedURLs[url] = await (
      await fetch(`https://pd.premid.app/create/${url}`)
    ).text())
  }
  catch (err) {
    presence.error(err as string)
    return fallback
  }
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/N/Notion/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const path = document.location.pathname
  const [title, showPageIcon] = await Promise.all([
    presence.getSetting<boolean>('title'),
    presence.getSetting<boolean>('icon'),
  ])
  const overlayTitle = document.querySelector<HTMLDivElement>(
    'div.notion-overlay-container.notion-default-overlay-container div[class=\'notranslate\'][contenteditable=\'true\']',
  )
  const pageIcon = document.querySelector<HTMLImageElement>(
    ':is(.notion-frame, .notion-overlay-container.notion-default-overlay-container) .notion-record-icon div > div > img:not(.notion-emoji)',
  )
  if (path.startsWith('/product')) {
    if (path === '/product')
      presenceData.details = 'Viewing Home page'
    else presenceData.details = 'Viewing Products page'
  }
  else if (path.startsWith('/templates')) {
    presenceData.details = 'Browsing templates'
  }
  else if (path.startsWith('/customers')) {
    presenceData.details = 'Viewing customers'
  }
  else if (
    path.startsWith('/desktop')
    || path.startsWith('/mobile')
    || path.startsWith('/web-clipper')
  ) {
    presenceData.details = 'Viewing Downloads page'
  }
  else if (path.startsWith('/blog')) {
    presenceData.details = 'Reading blogs'
  }
  else if (path.startsWith('/guides')) {
    presenceData.details = 'Reading Guides & Tutorials'
  }
  // Clearly not the best solution but it works(?)
  else if (
    overlayTitle
    || document.querySelector<HTMLDivElement>(
      'div.notion-cursor-listener div.notion-frame > div:nth-child(2) > div > div',
    )
  ) {
    presenceData.details = 'Editing a page'
    if (title) {
      if (!overlayTitle) {
        presenceData.state = document.title
      }
      else {
        presenceData.state = overlayTitle.textContent || overlayTitle.getAttribute('placeholder')
      }
    }

    if (title && showPageIcon) {
      presenceData.smallImageKey = pageIcon
        ? pageIcon.alt
          ? `https://twemoji.maxcdn.com/v/latest/72x72/${pageIcon.alt
            .codePointAt(0)
            ?.toString(16)}.png`
          : await shortenURL(pageIcon.src, 'edit')
        : 'edit'
    }
    else {
      presenceData.smallImageKey = Assets.Writing
    }
    presenceData.smallImageText = 'Editing'
  }
  else if (
    document.querySelector<HTMLDivElement>(
      'div.notion-topbar div.notion-focusable > div[class=\'notranslate\']',
    )
  ) {
    presenceData.details = 'Reading a page'
    if (title)
      presenceData.state = document.title
    if (title && showPageIcon) {
      presenceData.smallImageKey = pageIcon
        ? pageIcon.alt
          ? `https://twemoji.maxcdn.com/v/latest/72x72/${pageIcon.alt
            .codePointAt(0)
            ?.toString(16)}.png`
          : await shortenURL(pageIcon.src, 'read')
        : 'read'
    }
    else {
      presenceData.smallImageKey = Assets.Reading
    }
    presenceData.smallImageText = 'Reading'
  }
  presence.setActivity(presenceData)
})
