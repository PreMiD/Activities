const presence = new Presence({
  clientId: '547436289960574977',
})
const timestamp = Math.floor(Date.now() / 1000)

let cached: {
  href: string
  video: HTMLVideoElement
  user: string
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/I/Instagram/assets/logo.png',
  }
  const [privacySetting, elapsedTimeSetting, postImageSetting] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('elapsedTime'),
    presence.getSetting<boolean>('postImage'),
  ])
  const { href, pathname } = document.location
  const path = pathname.split('/')
  const [, profileName] = document.title.split('(')

  if (elapsedTimeSetting)
    presenceData.startTimestamp = timestamp

  switch (true) {
    case !!document.querySelector('div.QY4Ed.P0xOK input.focus-visible'): {
      presenceData.details = privacySetting ? 'Searching' : 'Searching for:'
      presenceData.state = document.querySelector<HTMLInputElement>(
        'div.QY4Ed.P0xOK input.focus-visible',
      )?.value
      break
    }
    case !path[1]: {
      presenceData.details = 'Viewing the Homepage'
      break
    }
    case pathname.startsWith('/stories'): {
      const time = document.querySelector('time.BPyeS.Nzb55')
      const video = document.querySelector('video')

      presenceData.details = privacySetting
        ? 'Viewing a Story'
        : `Viewing ${path[2]}'s Story`

      if (time && time.getAttribute('datetime')) {
        presenceData.state = getDateString(
          new Date(time.getAttribute('datetime')!),
        )
      }

      if (!privacySetting && video && video.duration) {
        [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestampsfromMedia(video)
      }

      presenceData.buttons = [
        {
          label: 'View Story',
          url: `https://www.instagram.com/stories/${path[2]}/${path[3]}`,
        },
      ]
      break
    }
    case pathname.includes('/accounts'): {
      presenceData.details = 'Settings'
      presenceData.state = 'Changing their Settings'
      break
    }
    case pathname.includes('/reel/'): {
      // One reel (Only from profile)
      const profilename = document.querySelector('[class="_ap3a _aaco _aacw _aacx _aad7 _aade"]')
        ?.textContent
        ?? document.querySelector(
          '[class*=\'_acan _acao _acat _acaw _aj1- _ap30 _a6hd\']',
        )?.textContent
      presenceData.details = 'Watching a reel'
      presenceData.state = profilename
      presenceData.buttons = [
        { label: 'Watch Reel', url: href },
        {
          label: 'View Creator\'s Profile',
          url: `https://www.instagram.com/${profilename}`,
        },
      ]
      break
    }
    case pathname.includes('/reels/'): {
      // Multiple reels (From anywhere)

      if (!cached?.href || !cached?.video || cached?.href !== href) {
        const video = Array.from(document.querySelectorAll('video')).find(
          video => !video.paused,
        ) ?? document.querySelector('video')
        if (video && !video.paused) {
          cached = {
            video,
            href,
            user: video
              ?.closest('div[class*="x6ikm8r"]')
              ?.querySelector('[class*="x1943h6x"]')
              ?.textContent
              ?.toLowerCase() ?? '',
          }
          return
        }
      }

      const user = cached?.user
      presenceData.details = 'Watching a reel'
      presenceData.state = user ?? 'unknown creator'
      presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/I/Instagram/assets/0.png'
      presenceData.buttons = [
        { label: 'Watch Reel', url: href },
        {
          label: 'View Creator\'s Profile',
          url: user ? `https://www.instagram.com/${user}` : '',
        },
      ]
      break
    }
    case pathname.startsWith('/p'): {
      const time = document.querySelector('time._1o9PC.Nzb55')
      const profileName = document.querySelector(
        'a.sqdOP.yWX7d._8A5w5.ZIAjV',
      )?.textContent
      const image = document.querySelector<HTMLImageElement>(
        'div.eLAPa.RzuR0 div.KL4Bh img',
      )

      presenceData.details = privacySetting || !profileName
        ? 'Viewing a Post'
        : `Viewing ${profileName}'s Post`

      if (time && time.getAttribute('datetime')) {
        presenceData.state = getDateString(
          new Date(time.getAttribute('datetime')!),
        )
      }

      if (!privacySetting && postImageSetting && image && image.src)
        presenceData.largeImageKey = await getShortURL(image.src)

      presenceData.buttons = [
        {
          label: 'View Post',
          url: `https://www.instagram.com/${path[1]}/${path[2]}`,
        },
      ]
      break
    }
    case pathname.startsWith('/explore'): {
      presenceData.details = 'Exploring...'
      break
    }
    case pathname.startsWith('/nametag'): {
      presenceData.details = 'Viewing nametag'
      break
    }
    case pathname.startsWith('/direct/inbox'):
    case pathname.startsWith('/direct/t'): {
      presenceData.details = 'Direct Messages'
      break
    }
    case profileName?.split(')')[0]?.replace('@', '') === path[1]: {
      const profilePicture = document.querySelector<HTMLImageElement>('img._6q-tv')

      presenceData.details = `Viewing a Profile${privacySetting ? '' : ':'}`
      presenceData.state = `${
        document
          .querySelector('head > title')
          ?.textContent
          ?.split('(')[0]
          ?.trim() ?? 'Unknown'
      } (${profileName?.split(')')[0]})`

      if (profilePicture)
        presenceData.smallImageKey = await getShortURL(profilePicture.src)

      presenceData.buttons = [
        {
          label: 'View Profile',
          url: `https://www.instagram.com/${path[1]}`,
        },
      ]
      break
    }
  }

  if (privacySetting) {
    if (presenceData.state)
      delete presenceData.state
    if (presenceData.endTimestamp)
      delete presenceData.endTimestamp
    if (presenceData.buttons)
      delete presenceData.buttons
    if (presenceData.smallImageKey)
      delete presenceData.smallImageKey
  }

  presence.setActivity(presenceData)
})

function getDateString(date: Date) {
  const seconds = Math.abs(Date.now() - date.getTime()) / 1000
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  switch (true) {
    case seconds < 60:
      return `${Math.floor(seconds)} second${seconds === 1 ? '' : 's'} ago`
    case seconds < 3600:
      return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
    case seconds < 86400:
      return `${hours} hour${hours === 1 ? '' : 's'} ago`
    case seconds < 604800:
      return `${days} day${days === 1 ? '' : 's'} ago`
    case seconds < 2419200:
      return `${days / 7} week${days === 7 ? '' : 's'} ago`
    case seconds < 29030400:
      return `${days / 30} month${days === 30 ? '' : 's'} ago`
    default:
      return `${days / 365} year${days === 365 ? '' : 's'} ago`
  }
}

const shortenedURLs: Record<string, string> = {}
async function getShortURL(url: string) {
  if (!url || url.length < 256)
    return url
  if (shortenedURLs[url])
    return shortenedURLs[url]
  try {
    const pdURL = await (
      await fetch(`https://pd.premid.app/create/${url}`)
    ).text()
    shortenedURLs[url] = pdURL
    return pdURL
  }
  catch (err) {
    presence.error(err as string)
    return url
  }
}
