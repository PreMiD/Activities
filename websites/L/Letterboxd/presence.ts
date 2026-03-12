const presence = new Presence({
  clientId: '938732156346314795',
})
const user = document.cookie
  .split(';')
  .find(val => val.trim().startsWith('letterboxd'))
  ?.split('=')[1]
const browsingTimestamp = Math.floor(Date.now() / 1000)

function generateButtonText(text: string): [ButtonData] {
  return [
    {
      label: text.replace('Viewing', 'View'),
      url: window.location.href,
    },
  ]
}

function clarifyString(str: string) {
  return str
    .replaceAll(String.fromCharCode(160), ' ')
    .replaceAll(String.fromCharCode(8217), '\'')
}

function getImageURLByAlt(alt: string) {
  return Array.from(document.querySelectorAll('img')).find(
    img => img.alt === alt,
  )?.src
}

function filterIterable<T extends Element>(
  itr: NodeListOf<T>,
  fnc: (val: T, ind?: number) => boolean,
) {
  return Array.from(itr).find((element, ind) => fnc(element, ind))
}

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/L/Letterboxd/assets/logo.png',
}

presence.on('UpdateData', async () => {
  const path = document.location.pathname.slice(1).split('/')
  path.pop()

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  if (path[0]) {
    switch (path[0]) {
      case 'lists':
        presenceData.details = 'Viewing all lists'
        presenceData.buttons = generateButtonText(presenceData.details)
        break
      case 'members':
        presenceData.details = 'Viewing all members'
        presenceData.buttons = generateButtonText(presenceData.details)
        break
      case 'journal':
        presenceData.details = 'Viewing the journal'
        presenceData.buttons = generateButtonText(presenceData.details)
        break
      case 'search':
        presenceData.details = `Searching for ${path[1]?.replaceAll('+', ' ')}`
        break

      case 'settings': {
        presenceData.details = 'Changing their settings'
        presenceData.smallImageKey = getImageURLByAlt(user ?? '')

        break
      }

      case 'list': {
        presenceData.details = 'Creating a list'
        presenceData.smallImageKey = getImageURLByAlt(user ?? '')

        break
      }

      case 'invitations': {
        presenceData.details = 'Viewing their invitations'
        presenceData.smallImageKey = getImageURLByAlt(user ?? '')

        break
      }

      case 'actor':
      case 'director': {
        const name = (
          document.querySelectorAll(
            '.title-1.prettify',
          )[0] as HTMLHeadingElement
        ).textContent?.replace(
          path[0] === 'director' ? 'FILMS DIRECTED BY\n' : 'FILMS STARRING\n',
          '',
        )
        const pfp = (
          (
            document.querySelectorAll(
              '.avatar.person-image.image-loaded',
            )[0] as HTMLDivElement
          ).firstElementChild as HTMLImageElement
        ).src

        presenceData.details = `Viewing ${
          path[0] === 'director' ? 'director' : 'actor'
        }: ${name}`
        presenceData.largeImageKey = pfp
        presenceData.smallImageKey = ActivityAssets.Logo
        presenceData.buttons = generateButtonText(presenceData.details)

        break
      }

      case 'activity': {
        const name = (
          document.querySelectorAll('.title-3')[0]
            ?.firstElementChild as HTMLAnchorElement
        )?.textContent
        presenceData.smallImageKey = getImageURLByAlt(name ?? '')
        presenceData.smallImageText = name

        if (path[1]) {
          switch (path[1]) {
            case 'you':
              presenceData.details = 'Viewing personal activity'
              break
            case 'incoming':
              presenceData.details = 'Viewing incoming activity'
              break
          }
        }
        else {
          presenceData.details = 'Viewing all activity'
        }

        break
      }

      case 'films': {
        if (path[1]) {
          switch (path[1]) {
            case 'upcoming':
              presenceData.details = 'Viewing upcoming films'
              break
            case 'popular':
              presenceData.details = 'Viewing popular films'
              break
            case 'genre':
              presenceData.details = `Viewing ${path[2] ?? 'unknown'} films`
              break
            case 'decade':
              presenceData.details = `Viewing films from the ${
                path[2] ?? 'unknown'
              }`
          }
        }
        else {
          presenceData.details = 'Viewing films'
        }

        if (!presenceData.details)
          presenceData.details = 'Viewing films'
        presenceData.buttons = generateButtonText(
          presenceData.details as string,
        )

        break
      }

      case 'film': {
        if (path[1]) {
          switch (path[1]) {
            default: {
              if (path[2]) {
                if (path[2] === 'trailer') {
                  const header = document.querySelector(
                    '#featured-film-header',
                  )
                  const title = clarifyString(
                    header?.firstElementChild?.textContent ?? '',
                  )

                  presenceData.details = 'Viewing the trailer of...'
                  presenceData.state = `${title}, ${
                    header?.lastElementChild?.firstElementChild
                      ?.firstElementChild
                      ?.textContent
                  }`
                  presenceData.largeImageKey = getImageURLByAlt(title)
                  presenceData.smallImageKey = ActivityAssets.Logo
                  delete presenceData.startTimestamp
                  presenceData.buttons = [
                    { label: 'Watch trailer', url: window.location.href },
                  ]
                }
                else {
                  const title = document.querySelectorAll(
                    '.contextual-title',
                  )[0]?.firstElementChild?.firstElementChild
                    ?.nextElementSibling
                  const year = title?.nextElementSibling
                    ?.firstElementChild
                    ?.textContent

                  switch (path[2]) {
                    case 'members':
                      presenceData.details = `Viewing people who have seen ${title?.textContent}, ${year}`
                      break
                    case 'fans':
                      presenceData.details = `Viewing fans of ${title?.textContent}, ${year}`
                      break
                    case 'likes':
                      presenceData.details = `Viewing people who have liked ${title?.textContent}, ${year}`
                      break
                    case 'ratings':
                      presenceData.details = `Viewing ratings of ${title?.textContent}, ${year}`
                      break
                    case 'reviews':
                      presenceData.details = `Viewing reviews of ${title?.textContent}, ${year}`
                      break
                    case 'lists':
                      presenceData.details = `Viewing lists that include ${title?.textContent}, ${year}`
                      break
                  }

                  presenceData.buttons = generateButtonText(
                    presenceData.details as string,
                  )
                  presenceData.largeImageKey = getImageURLByAlt(
                    clarifyString(title?.textContent ?? ''),
                  )
                  presenceData.smallImageKey = ActivityAssets.Logo
                }
              }
              else {
                const header = document.querySelector('#featured-film-header')
                const title = clarifyString(
                  header?.firstElementChild?.textContent ?? '',
                )

                presenceData.details = `${title}, ${
                  header?.lastElementChild?.firstElementChild
                    ?.firstElementChild
                    ?.textContent
                }`
                presenceData.state = `By ${
                  header?.lastElementChild?.lastElementChild
                    ?.firstElementChild
                    ?.textContent
                }`
                presenceData.buttons = [
                  { label: `View ${title}`, url: window.location.href },
                ]
                presenceData.largeImageKey = getImageURLByAlt(title)
                presenceData.smallImageKey = ActivityAssets.Logo
                break
              }
            }
          }
        }
        break
      }

      default:
        if (path[1]) {
          switch (path[1]) {
            case 'watchlist':
              presenceData.details = 'Viewing their watchlist'
              presenceData.buttons = generateButtonText(presenceData.details)
              break
            case 'lists':
              presenceData.details = 'Viewing their lists'
              presenceData.buttons = generateButtonText(presenceData.details)
              break
            case 'likes':
              presenceData.details = 'Viewing their liked films'
              presenceData.buttons = generateButtonText(presenceData.details)
              break
            case 'following':
              presenceData.details = 'Viewing who they\'ve followed'
              presenceData.buttons = generateButtonText(presenceData.details)
              break
            case 'followers':
              presenceData.details = 'Viewing their followers'
              break
            case 'blocked':
              presenceData.details = 'Viewing who they\'ve blocked'
              break

            case 'activity': {
              if (path[2]) {
                presenceData.details = 'Viewing who they\'ve followed\'s activity'
              }
              else {
                presenceData.details = 'Viewing their activity'
              }

              break
            }

            case 'films': {
              if (path[2]) {
                switch (path[2]) {
                  case 'reviews':
                    presenceData.details = 'Viewing their reviews'
                    presenceData.buttons = generateButtonText(
                      presenceData.details,
                    )
                    break
                  case 'ratings':
                    presenceData.details = 'Viewing their ratings'
                    presenceData.buttons = generateButtonText(
                      presenceData.details,
                    )
                    break
                  case 'diary':
                    presenceData.details = 'Viewing their diary'
                    presenceData.buttons = generateButtonText(
                      presenceData.details,
                    )
                    break
                }
              }
              else {
                presenceData.details = 'Viewing their films'
                presenceData.buttons = generateButtonText(
                  presenceData.details,
                )
              }
              break
            }

            case 'tags': {
              if (path[2]) {
                switch (path[2]) {
                  case 'diary':
                    presenceData.details = 'Viewing their diary tags'
                    presenceData.buttons = generateButtonText(
                      presenceData.details,
                    )
                    break
                  case 'reviews':
                    presenceData.details = 'Viewing their tagged reviews'
                    presenceData.buttons = generateButtonText(
                      presenceData.details,
                    )
                    break
                  case 'lists':
                    presenceData.details = 'Viewing their tagged lists'
                    presenceData.buttons = generateButtonText(
                      presenceData.details,
                    )
                    break
                }
              }
              else {
                presenceData.details = 'Viewing their tagged films'
                presenceData.buttons = generateButtonText(presenceData.details)
              }

              break
            }

            case 'stats': {
              const name = document.querySelectorAll('.yir-member-subtitle')[0]
                ?.lastElementChild
              presenceData.details = `Viewing ${name?.textContent}'s statistics`
              presenceData.largeImageKey = (
                name?.previousElementSibling
                  ?.firstElementChild as HTMLImageElement
              )?.src
              presenceData.smallImageKey = ActivityAssets.Logo
              presenceData.buttons = [
                {
                  label: `View ${name?.textContent}'s stats`,
                  url: window.location.href,
                },
              ]

              break
            }

            case 'list': {
              const title = (
                document.querySelectorAll(
                  '.title-1.prettify',
                )[0] as HTMLHeadingElement
              ).textContent
              const name = (
                document.querySelectorAll('.name')[0]
                  ?.firstElementChild as HTMLSpanElement
              )?.textContent
              presenceData.details = `Viewing the list ${title}`
              presenceData.buttons = generateButtonText(presenceData.details)
              presenceData.state = `By ${name}`
              presenceData.smallImageKey = getImageURLByAlt(name ?? '')
              presenceData.smallImageText = name

              break
            }

            case 'friends': {
              const title = document.querySelectorAll('.contextual-title')[0]
                ?.firstElementChild
                ?.firstElementChild
                ?.nextElementSibling
              const year = (
                title?.nextElementSibling
                  ?.firstElementChild as HTMLAnchorElement
              )?.textContent

              if (path[4]) {
                switch (path[4]) {
                  case 'ratings':
                    presenceData.details = 'Viewing friends\' ratings of...'
                    break
                  case 'reviews':
                    presenceData.details = 'Viewing friends\' reviews of...'
                    break
                  case 'lists':
                    presenceData.details = 'Viewing friends\' lists that include...'
                    break
                  case 'fans':
                    presenceData.details = 'Viewing friends who are fans of...'
                    break
                  case 'likes':
                    presenceData.details = 'Viewing friends who have liked...'
                    break
                }
              }
              else {
                presenceData.details = 'Viewing friends who have seen...'
              }

              presenceData.state = `${title?.textContent}, ${year}`
              presenceData.largeImageKey = getImageURLByAlt(
                clarifyString(title?.textContent ?? ''),
              )
              presenceData.smallImageKey = ActivityAssets.Logo

              break
            }

            case 'film': {
              const title = clarifyString(
                (
                  document.querySelectorAll('.film-title-wrapper')[0]
                    ?.firstElementChild as HTMLAnchorElement
                )?.textContent ?? '',
              )
              const rater = filterIterable(
                document.querySelectorAll('span'),
                (val) => {
                  if (val?.getAttribute('itemprop') === 'name')
                    return true
                  return false
                },
              )?.textContent
              const rating = filterIterable(
                document.querySelectorAll('span'),
                (val) => {
                  if (val?.className?.startsWith('rating rating-large'))
                    return true
                  return false
                },
              )?.textContent

              presenceData.details = `Review of ${title}`
              presenceData.state = `By ${rater} (${rating})`
              presenceData.buttons = [
                { label: 'View review', url: window.location.href },
              ]
              presenceData.largeImageKey = getImageURLByAlt(title)
              presenceData.smallImageKey = getImageURLByAlt(rater ?? '')
              presenceData.smallImageText = rater

              break
            }
          }

          if (
            [
              'watchlist',
              'films',
              'activity',
              'blocked',
              'followers',
              'following',
              'tags',
              'likes',
              'lists',
            ].includes(path[1])
          ) {
            const name = (
              document.querySelectorAll('.title-3')[0]
                ?.firstElementChild as HTMLAnchorElement
            )?.textContent
            if (user && path[0] !== user && path[0] !== user.toLowerCase()) {
              presenceData.details = (presenceData.details as string)
                .replace('their', `${name}'s`)
                .replace('they\'ve', `${name} has`)
            }

            presenceData.smallImageKey = getImageURLByAlt(name ?? '')
            presenceData.smallImageText = name
          }
        }
        else {
          const name = (
            document.querySelectorAll('.title-1')[0] as HTMLHeadingElement
          ).textContent
          // I could use the get image func but ID is available so its fine (smaller loop (I think))
          presenceData.details = `Viewing ${
            path[0] === user ? 'their own' : `${name}'s`
          } profile`
          presenceData.state = `(${
            path[0] === user ? `${name}/${path[0]}` : path[0]
          })`
          presenceData.largeImageKey = (
            document.querySelector('#avatar-zoom')
              ?.previousElementSibling as HTMLImageElement
          )?.src
          presenceData.smallImageKey = ActivityAssets.Logo
          presenceData.buttons = [
            { label: `View ${name}`, url: window.location.href },
          ]

          break
        }
    }
  }
  else {
    presenceData.details = 'At home'
  }

  if (!(await presence.getSetting('show_buttons')))
    delete presenceData.buttons

  presence.setActivity(presenceData)
})
