import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1481368310590210119',
})

enum ActivityAssets {
  Logo = 'https://cdn.imgchest.com/files/768ba0ac0c7a.png',
}

function formatSlug(raw: string): string {
  return decodeURIComponent(raw)
    .split('?')[0]!
    .replace(/-\d+$/, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function getNameFromTitle(slugName: string): string {
  if (!document.title.includes(' - Watch Online')) {
    return ''
  }
  const titleName = document.title.split(' - Watch Online')[0]?.trim() || ''
  const a = titleName.toLowerCase().replace(/[^a-z0-9]/g, '')
  const b = slugName.toLowerCase().replace(/[^a-z0-9]/g, '')
  return a && b && a.includes(b.slice(0, 8)) ? titleName : ''
}

let browsingTimestamp = Math.floor(Date.now() / 1000)
let lastPath = ''

presence.on('UpdateData', async () => {
  const { pathname, href } = document.location
  const showButtons = await presence.getSetting<boolean>('showButtons')

  if (pathname !== lastPath) {
    browsingTimestamp = Math.floor(Date.now() / 1000)
    lastPath = pathname
  }

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    type: ActivityType.Watching,
    smallImageKey: Assets.Reading,
    smallImageText: 'Voxani',
  }

  if (pathname.startsWith('/watch/')) {
    const video = document.querySelector('video') as HTMLVideoElement | null
    delete presenceData.smallImageKey
    delete presenceData.smallImageText

    const slugName = formatSlug(pathname.split('/')[2] || '')
    const animeName
      = getNameFromTitle(slugName)
      || document.querySelector('div.flex-1.min-w-0.text-right > span.font-medium')?.textContent?.trim()
      || slugName
      || 'Anime'

    const poster = document.querySelector('[data-poster]')?.getAttribute('data-poster')
    if (poster) {
      presenceData.largeImageKey = poster
    }

    presenceData.name = animeName

    const epText = document.querySelector('h1.font-display')?.textContent?.trim() || ''
    const epMatch = epText.match(/Episode\s+(\d+)/i)
    const epNum = epMatch ? epMatch[1] || '1' : '1'
    const epTitle = document.querySelector('.text-muted-foreground.text-sm.mt-1.line-clamp-1')?.textContent?.trim()

    const epBtns = document.getElementById('episode-list-container')?.querySelectorAll('button')
    if (epBtns && epBtns.length === 1) {
      presenceData.details = animeName
      presenceData.state = 'Watching Movie'
    } else {
      presenceData.details = animeName
      if (epTitle) {
        presenceData.state = epTitle
      }
      const sMatch = animeName.match(/Season\s+(\d+)/i)
      presenceData.largeImageText = `Season ${sMatch ? sMatch[1] || '1' : '1'}, Episode ${epNum}`
    }

    if (video && video.readyState > 0) {
      if (!video.paused) {
        presenceData.smallImageKey = Assets.Play
        presenceData.smallImageText = 'Playing'
          ;[presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(
            Math.floor(video.currentTime),
            Math.floor(video.duration),
          )
      } else {
        presenceData.smallImageKey = Assets.Pause
        presenceData.smallImageText = 'Paused'
      }
    } else {
      presenceData.startTimestamp = browsingTimestamp
    }

    if (showButtons) {
      presenceData.buttons = [{ label: 'Watch Episode', url: href }]
    }
  } else if (pathname.startsWith('/anime/')) {
    const slugName = formatSlug(pathname.split('/')[2] || '')
    const title
      = getNameFromTitle(slugName)
      || document.querySelector('h1.font-display')?.textContent?.trim()
      || slugName
      || 'Anime'

    const poster = document.querySelector('[data-poster]')?.getAttribute('data-poster')
    if (poster) {
      presenceData.largeImageKey = poster
    }

    presenceData.details = 'Looking'
    presenceData.state = title
    presenceData.startTimestamp = browsingTimestamp

    if (showButtons) {
      presenceData.buttons = [{ label: 'View Anime', url: href }]
    }
  } else {
    presenceData.details = 'Browsing Voxani'
    presenceData.state = 'Exploring'
    presenceData.startTimestamp = browsingTimestamp
  }

  if (presenceData.details) {
    presence.setActivity(presenceData)
  } else {
    presence.clearActivity()
  }
})