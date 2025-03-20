const presence = new Presence({
  clientId: '1122404044829380739',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/G/galaxy/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const { href, pathname } = document.location
  const path = pathname.slice(1).split('/')
  const [showTimestamp, showButtons] = await Promise.all([
    presence.getSetting<boolean>('timestamp'),
    presence.getSetting<boolean>('buttons'),
  ])

  switch (path[0]) {
    case '': {
      presenceData.details = 'Viewing the front page'
      break
    }
    // Game pages
    case 'play': {
      if (path[1]) {
        const gameName = document.querySelector<HTMLHeadingElement>(
          '#game-title',
        )?.textContent
        const currentLevel = document.querySelector<HTMLSpanElement>(
          '#progress > .level > span',
        )?.textContent
        // "N / D"
        const xpRatio = document.querySelector<HTMLSpanElement>(
          '#progress > .xp > span',
        )?.textContent

        presenceData.details = gameName
          ? `Playing ${gameName}`
          : 'Playing a game'
        if (currentLevel && xpRatio) {
          const [currentXP, neededXP] = xpRatio.split('/').map(n => n.trim())

          presenceData.state = `Level ${currentLevel} | ${currentXP}/${neededXP} XP`
        }
        presenceData.buttons = [
          {
            label: 'Play Game',
            url: href,
          },
        ]
      }
      break
    }
    case 'edit': {
      if (path[1]) {
        const gameName = document.querySelector<HTMLAnchorElement>(
          '#container > h1 > a',
        )?.textContent

        presenceData.details = gameName
          ? `Editing ${gameName}`
          : 'Editing a game'
        presenceData.buttons = [
          {
            label: 'Play Game',
            url: href,
          },
        ]
      }
      break
    }
    case 'publish': {
      const gameName = document.querySelector<HTMLInputElement>(
        'div[data-label="game name"] > input',
      )?.value

      presenceData.details = 'Publishing a new game'
      if (gameName)
        presenceData.state = `"${gameName}"`
      break
    }
    case 'manage': {
      presenceData.details = 'Managing their games'
      break
    }
    case 'comments': {
      if (path[1]) {
        presenceData.details = 'Reading game comments'
        presenceData.buttons = [
          {
            label: 'Read Comments',
            url: href,
          },
        ]
      }
      break
    }
    case 'updates': {
      if (path[1]) {
        presenceData.details = 'Reading game updates'
        presenceData.buttons = [
          {
            label: 'Read Updates',
            url: href,
          },
        ]
      }
      break
    }
    // User pages
    case 'user': {
      if (path[1]) {
        const username = document.querySelector<HTMLParagraphElement>(
          '#big-username',
        )?.textContent

        presenceData.details = username
          ? `Viewing ${username}'s profile`
          : 'Viewing a profile'
        presenceData.buttons = [
          {
            label: 'View Profile',
            url: href,
          },
        ]
      }
      break
    }
    case 'you': {
      presenceData.details = 'Editing their profile'
      break
    }
    case 'themes': {
      const lightTheme = document.querySelector<HTMLDivElement>(
        '#t-light > button[disabled=""]',
      )?.textContent
      const darkTheme = document.querySelector<HTMLDivElement>(
        '#t-dark > button[disabled=""]',
      )?.textContent

      presenceData.details = 'Choosing themes'
      if (lightTheme && darkTheme)
        presenceData.state = `☀️ ${lightTheme} 🌙 ${darkTheme}`
      break
    }
    case 'theme-preview': {
      presenceData.details = 'Previewing a theme'
      break
    }
    case 'filters': {
      presenceData.details = 'Choosing site-wide filters'
      break
    }
    case 'level': {
      // NOTE: The level and XP counters are animated to rise to their actual values once the page is opened.
      //       which doesn't look good when shown in the presence.

      presenceData.details = 'Viewing their level progression'
      break
    }
    case 'playtime': {
      presenceData.details = 'Viewing their total playtime'
      break
    }
    case 'favorites': {
      presenceData.details = 'Viewing their favorite games'
      break
    }
    case 'inbox': {
      const unreadMessageCount = document.querySelectorAll<HTMLDivElement>('#sidebar > .unread').length

      presenceData.details = 'Checking their inbox'
      presenceData.state = `${unreadMessageCount} unread message${
        unreadMessageCount === 1 ? '' : 's'
      }`
      break
    }
    // Chat & forums
    case 'chat': {
      const channel = path[1]

      if (channel) {
        const onlineAnonsElem = document.querySelector<HTMLButtonElement>('#anon-count')

        presenceData.details = `Chatting in #${channel}`
        presenceData.state = `${
          // Online user count
          document.querySelectorAll<HTMLDivElement>('#rightbar > div > a')
            .length
          // Online anon count
            + (onlineAnonsElem
              ? Number.parseInt(onlineAnonsElem.textContent?.split(' ')[0]?.trim() ?? '0')
              : 0)
        } online`
        presenceData.buttons = [
          {
            label: 'Join Chat',
            url: href,
          },
        ]
      }
      else {
        presenceData.details = 'Finding a channel to chat in'
      }
      break
    }
    case 'forum': {
      presenceData.details = 'Browsing the forums'

      switch (path[1]) {
        case 'category': {
          const categorySlug = path[2]
          if (categorySlug) {
            presenceData.details = `Browsing #${categorySlug}`
            presenceData.buttons = [
              {
                label: 'View Category',
                url: href,
              },
            ]
          }
          break
        }
        case 'thread': {
          if (path[2]) {
            const threadName = document.querySelector<HTMLHeadingElement>('.thread-title')?.textContent
            const currentlyReplying = document.querySelector<HTMLTextAreaElement>('.add-post textarea')!.textLength > 0
            const currentlyEditing = document.querySelectorAll<HTMLDivElement>('.post-info > .post-composer').length > 0

            presenceData.details = threadName
              ? `Reading a thread: "${threadName}"`
              : 'Reading a thread'
            if (currentlyReplying)
              presenceData.state = 'Writing a reply'
            else if (currentlyEditing)
              presenceData.state = 'Editing their post'
            presenceData.buttons = [
              {
                label: 'Read Thread',
                url: href,
              },
            ]
          }
          break
        }
        case 'compose': {
          const categorySlug = path[2]
          if (categorySlug) {
            const threadName = document.querySelector<HTMLInputElement>('#input-title')?.value

            presenceData.details = `Making a thread in #${categorySlug}`
            if (threadName)
              presenceData.state = `"${threadName}"`
            presenceData.buttons = [
              {
                label: 'View Category',
                url: href,
              },
            ]
          }
          break
        }
      }
      break
    }
    // Search & explore
    case 'search': {
      const query = document.querySelector<HTMLInputElement>(
        '#container input[type="search"]',
      )?.value

      presenceData.details = 'Searching for games'
      if (query)
        presenceData.state = `"${query}"`
      presenceData.buttons = [
        {
          label: 'Search Games',
          url: href,
        },
      ]
      break
    }
    case 'explore': {
      const categories: Record<string, string> = {
        top: 'Browsing the top-rated games',
        faves: 'Browsing the most favorited games',
        recent: 'Browsing the most recently updated games',
        playtime: 'Browsing the most grinded games',
        new: 'Browsing the newest games',
        random: 'Browsing random games',
      }
      presenceData.details = categories[path[1]!] || 'Browsing for games'
      presenceData.buttons = [
        {
          label: 'Explore Games',
          url: href,
        },
      ]
      break
    }
    // Other pages
    case 'signup': {
      presenceData.details = 'Signing up'
      break
    }
    case 'request': {
      const gameName = document.querySelector<HTMLInputElement>(
        'div[data-label="game name"] > input',
      )?.value

      presenceData.details = 'Requesting a game'
      if (gameName)
        presenceData.state = `"${gameName}"`
      presenceData.buttons = [
        {
          label: 'Request Game',
          url: href,
        },
      ]
      break
    }
    case 'stats': {
      presenceData.details = 'Viewing site statistics'
      presenceData.buttons = [
        {
          label: 'View Stats',
          url: href,
        },
      ]
      break
    }
    case 'cluster': {
      presenceData.details = 'Trying out galaxy cluster'
      presenceData.buttons = [
        {
          label: 'Galaxy Cluster',
          url: href,
        },
      ]
      break
    }
    case 'dev': {
      presenceData.details = 'Becoming a developer'
      presenceData.buttons = [
        {
          label: 'View Page',
          url: href,
        },
      ]
      break
    }
    case 'docs': {
      presenceData.details = 'Reading the documentation'
      presenceData.buttons = [
        {
          label: 'Read Docs',
          url: href,
        },
      ]
      break
    }
    case 'about': {
      presenceData.details = 'Reading about galaxy'
      presenceData.buttons = [
        {
          label: 'View Page',
          url: href,
        },
      ]
      break
    }
    case 'rules': {
      presenceData.details = 'Reviewing the site rules'
      presenceData.buttons = [
        {
          label: 'View Page',
          url: href,
        },
      ]
      break
    }
    case 'terms': {
      presenceData.details = 'Reading the terms of service'
      presenceData.buttons = [
        {
          label: 'View Page',
          url: href,
        },
      ]
      break
    }
    case 'privacy': {
      presenceData.details = 'Reading the privacy policy'
      presenceData.buttons = [
        {
          label: 'View Page',
          url: href,
        },
      ]
      break
    }
    case 'cookies': {
      presenceData.details = 'Reading the cookie policy'
      presenceData.buttons = [
        {
          label: 'View Page',
          url: href,
        },
      ]
      break
    }
    case 'banned': {
      presenceData.details = 'Banned'
      break
    }
  }

  if (!showTimestamp) {
    delete presenceData.startTimestamp
    delete presenceData.endTimestamp
  }

  if (!showButtons)
    delete presenceData.buttons

  presence.setActivity(presenceData)
})
