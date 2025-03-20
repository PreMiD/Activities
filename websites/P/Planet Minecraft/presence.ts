const presence = new Presence({
  clientId: '1193411747898458132',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)
const stateless = 'stateless'

async function getStrings() {
  return presence.getStrings({
    viewHome: 'general.viewHome',
    viewMember: 'general.viewMember',
    viewChannel: 'general.viewChannel',
    readingThread: 'general.readingThread',
    browsing: 'general.browsing',
    reading: 'general.reading',
  })
}

let strings: Awaited<ReturnType<typeof getStrings>>

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    details: 'Viewing page:',
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/P/Planet%20Minecraft/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }

  if (!strings)
    strings = await getStrings()

  const pathname = document.location.pathname.replaceAll(/\/$/g, '')

  if (pathname === '') {
    presenceData.state = strings.viewHome
    delete presenceData.details
  }
  else {
    const url = `${document.location.protocol}//${document.location.host}${document.location.pathname}`
    if (pathname.startsWith('/member')) {
      memberActivity(presenceData, pathname, url)
    }
    else if (
      pathname.startsWith('/account/manage')
      && pathname.endsWith('/new')
    ) {
      presenceData.details = 'Managing Submissions'
      presenceData.state = document.querySelector('#manage_header')?.textContent
    }
    else {
      switch (pathname) {
        case '/projects': {
          genericFeed(presenceData, 'Maps', url)
          break
        }
        case '/texture-packs': {
          genericFeed(presenceData, 'Resource Packs', url)
          break
        }
        case '/skins': {
          genericFeed(presenceData, 'Skins', url)
          break
        }
        case '/mob-skins': {
          genericFeed(presenceData, 'Mob Skins', url)
          break
        }
        case '/data-packs': {
          genericFeed(presenceData, 'Data Packs', url)
          break
        }
        case '/mods': {
          genericFeed(presenceData, 'Mods', url)
          break
        }
        case '/blogs': {
          genericFeed(presenceData, 'Blogs', url)
          break
        }
        case '/servers': {
          genericFeed(presenceData, 'Servers', url)
          break
        }
        case '/bedrock-servers': {
          genericFeed(presenceData, 'Bedrock Servers', url)
          break
        }
        case '/collections': {
          genericFeed(presenceData, 'Collections', url)
          break
        }
        default: {
          if (pathname.startsWith('/mod')) {
            presenceData.details = 'Viewing mod:'
            genericSubmission(presenceData, 'Mod', url)
          }
          else if (pathname.startsWith('/blog')) {
            presenceData.details = `${strings.reading} a blog:`
            genericSubmission(presenceData, 'Blog', url)
          }
          else if (pathname.startsWith('/project')) {
            presenceData.details = 'Viewing map:'
            genericSubmission(presenceData, 'Map', url)
          }
          else if (pathname.startsWith('/texture-pack')) {
            presenceData.details = 'Viewing a resource pack:'
            genericSubmission(presenceData, 'Resource Pack', url)
          }
          else if (pathname.startsWith('/skin')) {
            presenceData.details = 'Viewing skin:'
            genericSubmission(presenceData, 'Skin', url)
          }
          else if (pathname.startsWith('/mob-skin')) {
            presenceData.details = 'Viewing mob skin:'
            genericSubmission(presenceData, 'Mob Skin', url)
          }
          else if (pathname.startsWith('/data-pack')) {
            presenceData.details = 'Viewing data pack:'
            genericSubmission(presenceData, 'Data Pack', url)
          }
          else if (pathname.startsWith('/server')) {
            presenceData.details = 'Viewing server:'
            genericSubmission(presenceData, 'Server', url)
          }
          else if (pathname.startsWith('/bedrock-server')) {
            presenceData.details = 'Viewing bedrock server:'
            genericSubmission(presenceData, 'Server', url)
          }
          else if (/\/tickets\/\d+/.test(pathname)) {
            presenceData.details = `${strings.reading} ticket:`
            presenceData.state = document.querySelector('#ticket_view > h1')?.textContent
            genericButton(presenceData, 'Ticket', url)
          }
          else if (pathname.startsWith('/rules')) {
            presenceData.details = `${strings.reading} the rules.`
            presenceData.buttons = [
              {
                label: 'Read Rules',
                url,
              },
            ]
          }
          else if (pathname.startsWith('/chat')) {
            presenceData.details = strings.viewChannel
            presenceData.state = document.querySelector('span.channel_name')?.textContent
            presenceData.buttons = [
              {
                label: 'Open Chat',
                url,
              },
            ]
          }
          else if (pathname.startsWith('/forums')) {
            if (pathname.endsWith('/new')) {
              presenceData.details = 'Writing a thread...'
              presenceData.state = stateless
            }
            else {
              const parentElement = document.querySelector(
                '#content_graphic_header > *:first-child',
              )!
              const { length } = parentElement.children

              if (parentElement.lastChild?.nodeType === Node.TEXT_NODE) {
                presenceData.state = parentElement.lastChild?.textContent
                genericFeed(presenceData, 'Forums', url)
              }
              else if (
                (parentElement.lastChild as HTMLElement).getAttribute(
                  'href',
                ) === '#current'
              ) {
                let text
                if (length < 1) {
                  text = parentElement.textContent
                }
                else {
                  text = ''
                  for (let i = 0; i < length; i++) {
                    const childElement = parentElement.children[i]
                    if (childElement?.tagName.toLowerCase() !== 'i') {
                      const { childNodes } = childElement!
                      for (const childNode of childNodes) {
                        if (childNode.nodeType === Node.TEXT_NODE)
                          text += (i > 0 ? ' > ' : '') + childNode.textContent
                      }
                    }
                  }
                }

                presenceData.state = text
                genericFeed(presenceData, 'Forums', url)
              }
              else {
                presenceData.details = strings.readingThread
                presenceData.state = document.querySelector('head > title')
                genericButton(presenceData, 'Thread', url)
              }
            }
          }
        }
      }
    }
  }

  if (!presenceData.state)
    presenceData.state = document.querySelector('head > title')?.textContent
  else if (presenceData.state === stateless)
    delete presenceData.state

  presence.setActivity(presenceData)
})

function memberActivity(
  presenceData: PresenceData,
  pathname: string,
  url: string,
) {
  let profileUrl = (pathname.match(/\/member\/\w+/) || [pathname])[0]
  const remainingPathname = pathname
    .substring(profileUrl.length)
    .replaceAll(/\/$/g, '')
  profileUrl = `${document.location.protocol}//${document.location.host}${profileUrl}`

  presenceData.buttons = [
    {
      label: 'View Profile',
      url: profileUrl,
    },
  ]

  if (remainingPathname) {
    presenceData.largeImageKey = document
      .querySelector('#avatar > img')
      ?.getAttribute('src')
    presenceData.state = document
      .querySelector('#member-title-primary > a')
      ?.getAttribute('title')
  }

  switch (remainingPathname) {
    case '/submissions': {
      presenceData.details = 'Viewing submissions by:'
      genericButton(presenceData, 'Submissions', url)

      break
    }
    case '/guestbook': {
      presenceData.details = `${strings.reading} guest book of:`
      genericButton(presenceData, 'Guest Book', url)

      break
    }
    case '/jams': {
      presenceData.details = 'Viewing jam activity of:'
      genericButton(presenceData, 'Jams', url)

      break
    }
    case '/forum': {
      presenceData.details = 'Viewing threads by:'
      genericButton(presenceData, 'Threads', url)

      break
    }
    case '/subscribers': {
      presenceData.details = 'Viewing subscribers of:'
      genericButton(presenceData, 'Subscribers', url)

      break
    }
    case '/subscriptions': {
      presenceData.details = 'Viewing subscriptions of:'
      genericButton(presenceData, 'Subscriptions', url)

      break
    }
    case '/awards': {
      presenceData.details = 'Viewing trophies of:'
      genericButton(presenceData, 'Trophies', url)

      break
    }
    case '/upvoted': {
      presenceData.details = 'Viewing diamonds of:'
      genericButton(presenceData, 'Diamonds', url)

      break
    }
    case '/favorites': {
      presenceData.details = 'Viewing favorites of:'
      genericButton(presenceData, 'Favorites', url)

      break
    }
    case '/feed': {
      presenceData.details = 'Viewing feed of:'
      genericButton(presenceData, 'Feed', url)

      break
    }
    case '/activity': {
      presenceData.details = 'Viewing activity of:'
      genericButton(presenceData, 'Activity', url)

      break
    }
    default: {
      if (remainingPathname.startsWith('/post')) {
        presenceData.details = `${strings.reading} custom post:`
        presenceData.state = document
          .querySelector('meta[name="description"]')
          ?.getAttribute('content')
        genericButton(presenceData, 'Post', url)
      }
      else if (remainingPathname.startsWith('/wall')) {
        if (/\/post\/\d+/.test(remainingPathname)) {
          presenceData.details = `${strings.reading} wall post by:`
          genericButton(presenceData, 'Post', url)
        }
        else {
          presenceData.details = `${strings.reading} wall posts by:`
          genericButton(presenceData, 'Wall', url)
        }
      }
      else {
        presenceData.details = strings.viewMember
        presenceData.state = document
          .querySelector('meta[name="og:profile:username"]')
          ?.getAttribute('content')
        presenceData.largeImageKey = document
          .querySelector('meta[name="og:image:secure_url"]')
          ?.getAttribute('content')
      }
    }
  }
}
function genericFeed(presenceData: PresenceData, type: string, url: string) {
  presenceData.details = strings.browsing
  if (!presenceData.state)
    presenceData.state = type
  genericButton(presenceData, type, url)
}

function genericSubmission(
  presenceData: PresenceData,
  type: string,
  url: string,
) {
  presenceData.state = document.querySelector(
    '#resource-title-text > h1',
  )?.textContent
  presenceData.largeImageKey = document
    .querySelector('link[rel="image_src"]')
    ?.getAttribute('href')
  genericButton(presenceData, type, url)
}

function genericButton(presenceData: PresenceData, type: string, url: string) {
  const button = {
    label: `View ${type}`,
    url,
  }

  if (presenceData.buttons)
    presenceData.buttons.unshift(button)
  else presenceData.buttons = [button]
}
