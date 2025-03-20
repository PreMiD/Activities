const presence = new Presence({
  clientId: '1050466196220289104',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/A/AnkiWeb/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const { pathname, hostname, href } = document.location
  const pathList = pathname.split('/').filter(x => x)

  switch (hostname) {
    case 'ankiweb.net': {
      switch (pathList[0]) {
        case 'account': {
          switch (pathList[1]) {
            case 'login':
            case 'register': {
              presenceData.details = 'Logging in'
              break
            }
            case 'terms': {
              presenceData.details = 'Reading the terms of service'
              break
            }
            case 'privacy': {
              presenceData.details = 'Reading the privacy policy'
              break
            }
            default: {
              presenceData.details = 'Managing account settings'
            }
          }
          break
        }
        case 'decks': {
          switch (pathList[1] ?? '') {
            case '': {
              presenceData.details = 'Browsing decks'
              const [newItems, dueItems] = [
                ...document.querySelectorAll('.deckDueNumber'),
              ].reduce(
                (current, item, index) => {
                  if (index % 2)
                    current[0] += +item.textContent!
                  else current[1] += +item.textContent!
                  return current
                },
                [0, 0],
              )
              presenceData.state = `${dueItems} due, ${newItems} new`
              break
            }
            case 'share': {
              presenceData.details = 'Sharing a deck'
              break
            }
          }
          break
        }
        case 'search': {
          presenceData.details = 'Searching for cards'
          presenceData.state = document.querySelector('small')?.textContent
          break
        }
        case 'shared': {
          switch (pathList[1]) {
            case 'decks': {
              if (pathList[2]) {
                presenceData.details = 'Viewing shared decks by term'
                presenceData.state = document.querySelector('h1')?.textContent
              }
              break
            }
            case 'info': {
              presenceData.details = 'Viewing a shared deck'
              presenceData.state = document.querySelector('h1')?.textContent
              presenceData.buttons = [{ label: 'View Deck', url: href }]
              break
            }
            case 'mine': {
              presenceData.details = 'Viewing their shared decks'
              break
            }
          }
          break
        }
      }
      break
    }
    case 'ankiuser.net': {
      switch (pathList[0]) {
        case 'study': {
          switch (pathList[1] ?? '') {
            case '': {
              presenceData.details = 'Studying'
              presenceData.state = `${document
                .querySelector<HTMLSpanElement>('#rightStudyMenu')
                ?.textContent
                ?.match(/\d+/g)
                ?.reduce(
                  (current, item) => current + +item,
                  0,
                ) ?? 0} cards remaining`
              break
            }
            case 'finished': {
              presenceData.details = 'Finished studying'
              break
            }
            case 'options': {
              presenceData.details = 'Changing study options'
              break
            }
          }
          break
        }
        case 'edit': {
          if (pathList[1])
            presenceData.details = 'Editing a card'
          else presenceData.details = 'Creating a card'
          break
        }
      }
      break
    }
    case 'apps.ankiweb.net': {
      presenceData.details = 'Downloading Anki'
      break
    }
    case 'changes.ankiweb.net': {
      presenceData.details = 'Browsing the changelog'
      presenceData.state = document.querySelector('h1')?.textContent
      break
    }
    case 'docs.ankiweb.net': {
      presenceData.details = 'Reading the docs'
      presenceData.state = document.querySelector<HTMLAnchorElement>('.header')?.textContent
      break
    }
    case 'faqs.ankiweb.net': {
      presenceData.details = 'Reading the FAQs'
      presenceData.state = document.querySelector('h1')?.textContent
      break
    }
    case 'forums.ankiweb.net': {
      switch (pathList[0] ?? '') {
        case 'badges': {
          presenceData.details = 'Browsing badges'
          break
        }
        case 'c': {
          presenceData.details = 'Browsing a category'
          presenceData.state = document.querySelector<HTMLSpanElement>('.category-name')?.textContent
          break
        }
        case 'cakeday': {
          presenceData.details = `Browsing ${
            document.querySelector<HTMLHeadingElement>('.cakeday-header')
              ?.textContent
          }`
          break
        }
        case 'g': {
          if (pathList[1]) {
            presenceData.details = 'Viewing a group'
            presenceData.state = document.querySelector<HTMLSpanElement>(
              '.group-info-name',
            )?.textContent
          }
          else {
            presenceData.details = 'Browsing groups'
          }
          break
        }
        case '':
        case 'latest':
        case 'new': {
          presenceData.details = 'Browsing the latest posts'
          break
        }
        case 'unread': {
          presenceData.details = 'Browsing unread posts'
          break
        }
        case 't': {
          presenceData.details = 'Browsing a topic'
          presenceData.state = document
            .querySelector<HTMLSpanElement>('.fancy-title')
            ?.textContent
            ?.trim()
          presenceData.buttons = [{ label: 'View Topic', url: href }]
          break
        }
        case 'top': {
          presenceData.details = 'Browsing top posts'
          break
        }
        case 'u': {
          if (pathList[1]) {
            presenceData.details = 'Viewing a user\'s profile'
            presenceData.state = document.querySelector<HTMLSpanElement>(
              '.user-profile-names > .username',
            )?.textContent
            presenceData.smallImageKey = document.querySelector<HTMLImageElement>(
              '.user-profile-avatar > img',
            )?.src
          }
          else {
            presenceData.details = 'Browsing users'
          }
          break
        }
        default: {
          presenceData.details = 'Browsing the forums'
        }
      }
      break
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
