import { Assets } from 'premid'

const presence = new Presence({ clientId: '1409048810646405152' })
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/D/Dicoding/assets/logo.jpeg',
}

function textFrom(sel: string): string | null {
  const el = document.querySelector(sel)
  return el?.textContent?.trim() || null
}

function meta(prop: string): string | null {
  return (
    document.querySelector<HTMLMetaElement>(`meta[property="${prop}"]`)
      ?.content
      ?.trim() || null
  )
}

function getHeadTitle(opts?: {
  preferOG?: boolean
  strip?: (string | RegExp)[]
}): string | null {
  const preferOG = opts?.preferOG ?? true
  const strip
    = opts?.strip ?? [/ - Dicoding( Indonesia)?$/i, / \| Dicoding( Indonesia)?$/i]

  const og = meta('og:title')
  const tw = (document.querySelector(
    'meta[name=\'twitter:title\']',
  ) as HTMLMetaElement)?.content?.trim()
  const tag
    = document.title?.trim()
      || document.querySelector('head > title')?.textContent?.trim()
      || ''

  let t = preferOG ? og || tw || tag : tag || og || tw
  if (!t)
    return null

  for (const s of strip) t = t.replace(s as any, '')
  return t.trim() || null
}

presence.on('UpdateData', async () => {
  const { host, pathname } = document.location
  if (!host.endsWith('dicoding.com')) {
    await presence.clearActivity()
    return
  }

  const route = pathname.split('/')
  const title = (getHeadTitle() || 'Untitled Page').slice(0, 128)

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  switch (route[1]) {
    case '':
      Object.assign(presenceData, {
        details: 'Browsing home',
      })
      break

    case 'courses':
    case 'academies':
      if (route[3] === 'corridor') {
        presenceData.details = textFrom('h3') || 'Dicoding Corridor'
        presenceData.state = 'Corridor'
        presenceData.smallImageKey = Assets.Viewing
      }
      else if (route[3] === 'tutorials') {
        presenceData.details = title
        presenceData.smallImageKey = Assets.Reading
      }
      else if (route[2] === 'subscriptions') {
        presenceData.details = 'Viewing my subscriptions'
      }
      else if (route[2] === 'my') {
        presenceData.details = 'Viewing my courses'
      }
      else {
        presenceData.details = `Browsing courses: ${title}`
        presenceData.state = 'Courses catalog'
      }
      break

    case 'blog':
      presenceData.state = 'Dicoding Blog'
      presenceData.details
        = route[2] && route.length >= 3
          ? `Reading article: ${title}`
          : `Browsing blog: ${title}`
      break

    case 'events':
      Object.assign(presenceData, {
        details:
          route[2] && route.length >= 3
            ? `Viewing event: ${title}`
            : `Browsing events: ${title}`,
        state: route[2] ? 'Event page' : 'Events list',
      })
      break

    case 'dashboard':
      presenceData.details = 'Working in dashboard'
      presenceData.state = 'My Account'
      break

    default:
      presenceData.details = `Browsing${title === 'Dicoding Indonesia' ? '...' : `: ${title}`}`
      break
  }

  if (presenceData.details) {
    await presence.setActivity(presenceData)
  }
  else {
    await presence.clearActivity()
  }
})
