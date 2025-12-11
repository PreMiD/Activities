interface PageContext {
  middleware: (ref: Window, ...args: unknown[]) => boolean
  exec: (
    context: Presence,
    data: PresenceData,
    options?: any,
  ) => Promise<PresenceData | null> | PresenceData | null
}
function getQuery() {
  const queryString = location.search.split('?', 2)
  const query = queryString && queryString.length > 0 && queryString[1]
    ? queryString[1].split('&').reduce((l, r) => {
        const entry = r ? r.split('=', 2) : null
        if (entry === null)
          return l
        return Object.assign(l, { [entry[0]!]: entry[1] })
      }, {})
    : {}
  return query
}
const pages: PageContext[] = [
  {
    middleware: ref =>
      !!ref.location.pathname.match(/\/(latest|toplist|hot|random)/gi),
    exec: (
      context,
      presenceData,
      {
        strings,
        query,
      }: {
        strings: { [key: string]: string }
        query: { page: number }
      },
    ) => {
      if (!context)
        return null
      presenceData.state = strings.browsing
      presenceData.details = `${document
        .querySelector<HTMLElement>('header.listing-header>h1')
        ?.textContent
        ?.trim()}, Page ${query?.page || 1}`
      return presenceData
    },
  },
  {
    middleware: ref =>
      ref.location.pathname === '/forums'
      || !!ref.location.pathname.match(/\/forums((\/thread|\/board))/gi),
    exec: (
      context,
      data,
      {
        strings,
      }: {
        strings: { [key: string]: string }
      },
    ) => {
      if (!context)
        return null
      const pageTitle = (
        document.querySelector<HTMLElement>('#forums-title>a')
        || document.querySelector<HTMLElement>(
          '#forums-title .forum-thread-title>a',
        )
      )?.textContent as string
      if (!pageTitle)
        return null
      data.state = strings.reading
      data.details = `${pageTitle}`
      delete data.buttons
      return data
    },
  },
  {
    middleware: ref => !!ref.location.pathname.match(/\/search/gi),
    exec: (
      context,
      data,
      {
        strings,
        query,
      }: {
        strings: { [key: string]: string }
        query: { page: number, q: string }
      },
    ) => {
      if (!context)
        return null
      data.state = strings.searching
      data.details = `${decodeURIComponent(
        document.querySelector<HTMLElement>('span.search-term')
          ?.textContent
          ?? query?.q
          ?? 'Invalid Search Term',
      )}, Page ${query?.page || 1}`

      return data
    },
  },
  {
    middleware: ref => !!ref.location.pathname.match(/\/w\/(\w+)/gi),
    exec: (
      context,
      data,
      {
        showButton,
      }: {
        strings: { [key: string]: string }
        showButton: boolean
      },
    ) => {
      if (!context)
        return null
      const tags = Array.from(
        document.querySelectorAll<HTMLElement>('#tags>.tag-sfw') || [],
      ).map(x => x.textContent)
      data.state = 'Viewing...'
      data.details = tags.length > 0
        ? tags.slice(0, 3).join(', ')
        : 'Wallpaper has no tags'

      if (showButton) {
        data.buttons = [
          {
            label: 'Open Wallpaper URL',
            url: document.URL,
          },
        ]
      }
      else {
        delete data.buttons
      }

      return data
    },
  },
  {
    middleware: ref => !!ref.window,
    exec: (context, data, { strings }: { strings: { browsing: string } }) => {
      if (!context)
        return null
      data.state = strings.browsing
      data.details = ''
      return data
    },
  },
]
const presence = new Presence({
  clientId: '813563332753752112',
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/W/Wallhaven/assets/logo.png',
  }
  if (document.location.hostname === 'wallhaven.cc') {
    const query: { [key: string]: unknown } = getQuery()
    const strings: { [key: string]: string } = await presence.getStrings({
      play: 'general.playing',
      pause: 'general.paused',
      browsing: 'general.browsing',
      searching: 'general.searching',
      reading: 'general.reading',
    })
    const context = pages.find(x => x.middleware(window, [query]))
    if (!context)
      return
    const result = await Promise.resolve(
      context.exec(presence, presenceData, {
        strings,
        query,
        showButtons: await presence
          .getSetting<boolean>('buttons')
          .catch(() => true),
      }),
    )
    if (result && !result?.details) {
      result.details = strings.browsing

      presence.setActivity()
    }
    else if (result) {
      presence.setActivity(result)
    }
    else {
      presence.setActivity()
    }
  }

  if (!presenceData.details)
    presence.setActivity()
  else presence.setActivity(presenceData)
})
