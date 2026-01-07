import { Assets } from 'premid'

const browsingTimestamp = Math.floor(Date.now() / 1000)

function updatePresence() {
  const location = document.location
  const pathname = location?.pathname ?? ''
  const search = location?.search ?? ''

  let pageName = 'Homepage'
  let detailsText = 'Browsing Psychonaut Wiki'

  if (pathname === '/wiki/Main_Page') {
    pageName = 'Main Page'
    detailsText = 'Browsing Main Page'
  } else if (pathname.startsWith('/wiki/User:')) {
    const parts = pathname.split('/')
    const username =
      parts.length >= 3 && parts[2]
        ? decodeURIComponent(parts[2].replace(/_/g, ' '))
        : 'Unknown User'
    pageName = username
    detailsText = `Viewing user "${username}"'s page`
  } else if (pathname.startsWith('/w/index.php') && search.includes('action=history')) {
    const params = new URLSearchParams(search)
    const titleParam = params.get('title')
    const title = titleParam
      ? decodeURIComponent(titleParam.replace(/_/g, ' '))
      : 'Unknown Page'
    pageName = title
    detailsText = `Viewing revision history of "${title}"`
  } else if (pathname.startsWith('/wiki/')) {
    const parts = pathname.split('/')
    const article =
      parts.length >= 3 && parts[2]
        ? decodeURIComponent(parts[2].replace(/_/g, ' '))
        : 'Unknown Article'
    pageName = article
    detailsText = 'Reading article'
  }

  const presenceData = {
    largeImageKey: 'https://i.imgur.com/8BOtvbS.jpeg',
    details: detailsText,
    state: pageName,
    startTimestamp: browsingTimestamp,
  }

  const pmid = (window as any)?.PMID
  if (pmid && typeof pmid.setActivity === 'function') {
    pmid.setActivity(presenceData)
  }
}

updatePresence()
window.addEventListener('popstate', updatePresence)
window.addEventListener('pushstate', updatePresence)
