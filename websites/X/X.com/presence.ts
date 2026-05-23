enum PresenceClients {
  X = '802958757909889054',
  Twitter = '1172850898624581652',
}

let presence = new Presence({
  clientId: PresenceClients.X,
})
let twitterCheck: boolean

const presences: { [key in PresenceClients]?: Presence } = {
  [PresenceClients.X]: presence,
}
function capitalize(text: string): string {
  return text
    .replace(/[[{(_)}\]]/g, ' ')
    .split(' ')
    .map((str) => {
      return str.charAt(0).toUpperCase() + str.slice(1)
    })
    .join(' ')
}

function setClient(clientId: PresenceClients) {
  presence.clearActivity()
  if (presences[clientId]) {
    presence = presences[clientId]
    presence.setActivity()
  }
  else {
    presence = new Presence({ clientId })
    presences[clientId] = presence
  }
  presence.info('Switched presence client!')
}

function stripText(element: HTMLElement, id = 'None', log = true): string | null {
  if (element && element.firstChild) {
    return element.firstChild.textContent
  }
  else {
    if (log) {
      presence.error(
        `An error occurred while stripping data off the page. Please contact Bas950 on the PreMiD Discord server, and send him a screenshot of this error. ID: ${id}`,
      )
    }
    return null
  }
}

presence.info(
  'When using the X presence for PreMiD, make sure you have the latest UI update. Twitter classic and any legacy versions before it will not work with this presence.',
)

let oldUrl: string, elapsed: number

async function getStrings() {
  return presence.getStrings(
    {
      readPost: 'x.com.readPost',
      viewDms: 'x.com.viewDms',
      viewPosts: 'x.com.viewPosts',
      viewPostsWithReplies: 'x.com.viewPostsWithReplies',
      viewMedia: 'x.com.viewMedia',
      viewLiked: 'x.com.viewLiked',
      viewList: 'x.com.viewList',
      bookmarks: 'x.com.bookmarks',
      notifs: 'x.com.notifs',
      explore: 'x.com.explore',
      settings: 'x.com.settings',
      terms: 'general.terms',
      privacy: 'general.privacy',
      browsing: 'general.browsing',
      search: 'general.searchFor',
      searchSomething: 'general.searchSomething',
      view: 'general.view',
      profile: 'general.viewProfile',
    },

  )
}

let strings: Awaited<ReturnType<typeof getStrings>>
let oldLang: string | null = null

presence.on('UpdateData', async () => {
  //* Update strings if user selected another language.
  const [newLang, privacy, time, twitter] = await Promise.all([
    presence.getSetting<string>('lang').catch(() => 'en'),
    presence.getSetting<number>('privacy'),
    presence.getSetting<boolean>('time'),
    presence.getSetting<boolean>('twitter'),
  ])

  if (!twitter && twitterCheck !== twitter) {
    twitterCheck = twitter
    setClient(PresenceClients.X)
  }
  else if (twitterCheck !== twitter) {
    twitterCheck = twitter
    setClient(PresenceClients.Twitter)
  }

  if (oldLang !== newLang || !strings) {
    oldLang = newLang
    strings = await getStrings()
  }

  let title: string
  let info: string | undefined | null = null

  const { pathname, href } = document.location

  if (oldUrl !== href) {
    oldUrl = href
    elapsed = Math.floor(Date.now() / 1000)
  }

  title = strings.browsing
  info = capitalize(pathname.split('/')[1]!)

  if (pathname.match('/i/')) {
    info = capitalize(pathname.split('/')[2]!)
    if (info === 'Bookmarks')
      info = strings.bookmarks
  }

  if (pathname.match('/notifications'))
    info = strings.notifs

  if (pathname.match('/explore'))
    info = strings.explore

  if (pathname.match('/tos'))
    info = strings.terms

  if (pathname.match('/privacy'))
    info = strings.privacy

  if (pathname.match('/settings/'))
    info = strings.settings

  if (pathname.match('/search')) {
    title = strings.search
    info = document.querySelector('input')?.textContent || null
  }

  const objHeader = document.querySelector(
    `a[href='/${pathname.split('/')[1]}/header_photo']`,
  )?.parentElement?.children[1]?.children[1] as HTMLElement

  if (objHeader) {
    title = strings.viewPosts
    info = `${
      stripText(objHeader, 'Object Header')?.split('@')[0]
    } // ${capitalize(pathname.split('/')[1]!)}`

    if (pathname.match('/with_replies'))
      title = strings.viewPostsWithReplies

    if (pathname.match('/media'))
      title = strings.viewMedia

    if (pathname.match('/likes'))
      title = strings.viewLiked
  }

  if (!objHeader && pathname.match('/status/')) {
    title = strings.readPost;
    [info] = stripText(
      document.querySelectorAll<HTMLAnchorElement>(
        `a[href='/${pathname.split('/')[1]}']`,
      )[1]!,
      'Post',
    )?.split('@') ?? []
  }

  if (pathname.match('/messages') && objHeader) {
    title = strings.viewDms
    info = stripText(objHeader, 'Object Header')
  }

  const etcHeader = Array.from(
    document.querySelectorAll('h2'),
  ).find(c => c.parentElement?.children[1]?.textContent?.includes('@'))

  if (pathname.match('/moments') && etcHeader) {
    title = 'Browsing Moments...'
    info = capitalize(pathname.split('/')[1]!)
  }

  if (pathname.match('/lists') && etcHeader) {
    title = strings.viewList
    info = capitalize(pathname.split('/')[1]!)
  }

  const presenceData: PresenceData = {
    details: title,
    state: info,
    largeImageKey: !twitter
      ? 'https://cdn.rcd.gg/PreMiD/websites/X/X.com/assets/0.png'
      : 'https://cdn.rcd.gg/PreMiD/websites/X/X.com/assets/1.png',
  }
  if (privacy === 1) {
    delete presenceData.state
    presenceData.details = strings.browsing
    presence.setActivity(presenceData)
    return
  }
  if (time)
    presenceData.startTimestamp = elapsed

  presence.setActivity(presenceData)
})
