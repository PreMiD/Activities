const presence = new Presence({
  clientId: '1519707327761088683',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

// extract chapter title from page title
// truncate to 128 chars max
function getChapterTitle(): string {
  // match everything before " | Witch Cult Translations" suffix
  const titleMatch = document.title.match(/^(.*?)\s\|\sWitch Cult Translations$/)
  const title = titleMatch?.[1] ?? document.title

  // truncate long titles and add ellipsis on it
  return title.length > 128 ? `${title.substring(0, 125)}...` : title
}

presence.on('UpdateData', async () => {
  const { pathname } = document.location

  const i18n = await presence.getStrings({
    browsing: 'general.browsing',
    reading: 'general.reading',
  })

  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/W/Witch%20Cult%20Translations/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }

  if (pathname === '/' || pathname === '') {
    presenceData.details = i18n.browsing
    presenceData.state = 'Homepage'
  }
  else if (pathname === '/table-of-content/' || pathname === '/table-of-content') {
    presenceData.details = i18n.browsing
    presenceData.state = 'Table of Contents'
  }
  else if (/^\/arc-\d+\/?$/.test(pathname)) {
    const arcNumber = pathname.match(/\d+/)?.[0]
    presenceData.details = i18n.browsing
    presenceData.state = arcNumber ? `Arc ${arcNumber}` : 'Browsing an arc'
  }
  else if (/^\/\d{4}\/\d{2}\/\d{2}\/[^/]+\/?$/.test(pathname)) {
    presenceData.details = i18n.reading
    presenceData.state = getChapterTitle()
  }
  else {
    presence.clearActivity()
    return
  }

  presence.setActivity(presenceData)
})
