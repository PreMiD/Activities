const presence = new Presence({
  clientId: '938732156346314795',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/L/Letterboxd/assets/logo.png',
}

function getLoggedInUser(): string | undefined {
  return document.cookie
    .split(';')
    .find(val => val.trim().startsWith('letterboxd'))
    ?.split('=')[1]
}

// Fixed type signature to accept string | Node | null
function generateButtonText(text?: string | Node | null): [ButtonData] {
  if (!text)
    return [{ label: '', url: document.location.href }]
  const str = typeof text === 'string' ? text : text.textContent ?? ''
  return [
    {
      label: str.replace(/^Viewing\s+/i, 'View '),
      url: document.location.href,
    },
  ]
}

function clarifyString(str: string): string {
  return str
    .replaceAll(String.fromCharCode(160), ' ')
    .replaceAll(String.fromCharCode(8217), '\'')
    .trim()
}

function getImageURLByAlt(alt: string): string | undefined {
  if (!alt)
    return undefined
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

interface FilmSchema {
  name?: string
  year?: string
  director?: string
  rating?: number
  poster?: string
}

function getFilmSchema(): FilmSchema {
  const movieJsonScript = filterIterable(
    document.querySelectorAll<HTMLScriptElement>('script[type="application/ld+json"]'),
    val => val?.textContent?.includes('"@type":"Movie"') ?? false,
  )

  if (!movieJsonScript?.textContent)
    return {}

  try {
    const movieJson = JSON.parse(
      movieJsonScript.textContent
        .replace('/* <![CDATA[ */', '')
        .replace('/* ]]> */', '')
        .trim(),
    )

    return {
      name: movieJson.name,
      year: movieJson.dateCreated?.slice(0, 4),
      director: movieJson.director?.[0]?.name,
      rating: movieJson.aggregateRating?.ratingValue,
      poster: movieJson.image,
    }
  }
  catch {
    return {}
  }
}

presence.on('UpdateData', async () => {
  const path = document.location.pathname.slice(1).split('/')
  if (path[path.length - 1] === '')
    path.pop()

  const user = getLoggedInUser()

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
        presenceData.details = `Searching for ${path[1]?.replaceAll('+', ' ') ?? 'films'}`
        break

      case 'settings':
        presenceData.details = 'Changing their settings'
        presenceData.smallImageKey = getImageURLByAlt(user ?? '')
        break

      case 'list':
        presenceData.details = 'Creating a list'
        presenceData.smallImageKey = getImageURLByAlt(user ?? '')
        break

      case 'invitations':
        presenceData.details = 'Viewing their invitations'
        presenceData.smallImageKey = getImageURLByAlt(user ?? '')
        break

      case 'actor':
      case 'director': {
        const name = document
          .querySelectorAll('.title-1.prettify')[0]
          ?.textContent
          ?.replace(
            path[0] === 'director' ? /Films directed by\n?/i : /Films starring\n?/i,
            '',
          )
          ?.trim()
        const pfp = (
          document.querySelectorAll('.avatar.person-image.image-loaded')[0]
            ?.firstElementChild as HTMLImageElement
        )?.src

        presenceData.details = `Viewing ${path[0] === 'director' ? 'director' : 'actor'}: ${name}`
        if (pfp)
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
              presenceData.details = `Viewing ${path[2]} films`
              break
            case 'decade':
              presenceData.details = `Viewing films from the ${path[2]}`
              break
          }
        }
        else {
          presenceData.details = 'Viewing films'
        }

        if (!presenceData.details)
          presenceData.details = 'Viewing films'

        presenceData.buttons = generateButtonText(presenceData.details)
        break
      }

      case 'film': {
        if (path[1]) {
          const film = getFilmSchema()
          const title = clarifyString(film.name ?? path[1].replace(/-/g, ' '))
          const year = film.year ?? 'Unknown year'

          if (path[2]) {
            if (path[2] === 'trailer') {
              presenceData.details = 'Viewing the trailer of...'
              presenceData.state = `${title}, ${year}`
              presenceData.largeImageKey = film.poster ?? getImageURLByAlt(title) ?? ActivityAssets.Logo
              presenceData.smallImageKey = ActivityAssets.Logo
              delete presenceData.startTimestamp
              presenceData.buttons = [
                {
                  label: 'Watch trailer',
                  url: document.location.href,
                },
              ]
            }
            else {
              switch (path[2]) {
                case 'members':
                  presenceData.details = `Viewing people who have seen ${title}, ${year}`
                  break
                case 'fans':
                  presenceData.details = `Viewing fans of ${title}, ${year}`
                  break
                case 'likes':
                  presenceData.details = `Viewing people who have liked ${title}, ${year}`
                  break
                case 'ratings':
                  presenceData.details = `Viewing ratings of ${title}, ${year}`
                  break
                case 'reviews':
                  presenceData.details = `Viewing reviews of ${title}, ${year}`
                  break
                case 'lists':
                  presenceData.details = `Viewing lists that include ${title}, ${year}`
                  break
              }

              presenceData.buttons = generateButtonText(presenceData.details)
              presenceData.largeImageKey = film.poster ?? getImageURLByAlt(title) ?? ActivityAssets.Logo
              presenceData.smallImageKey = ActivityAssets.Logo
            }
          }
          else {
            presenceData.details = `${title}, ${year}`
            presenceData.state = `By ${film?.director ?? 'Unknown'}`
            presenceData.buttons = [
              {
                label: `View ${title}`,
                url: document.location.href,
              },
            ]
            presenceData.largeImageKey = film.poster ?? getImageURLByAlt(title) ?? ActivityAssets.Logo
            presenceData.smallImageKey = ActivityAssets.Logo
          }
        }
        break
      }

      default: {
        if (path[1]) {
          switch (path[1]) {
            case 'diary':
              presenceData.details = 'Viewing their diary'
              presenceData.buttons = generateButtonText(presenceData.details)
              break
            case 'reviews':
              presenceData.details = 'Viewing their reviewed films'
              presenceData.buttons = generateButtonText(presenceData.details)
              break
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
              if (path[2])
                presenceData.details = 'Viewing who they\'ve followed\'s activity'
              else
                presenceData.details = 'Viewing their activity'
              break
            }

            case 'films': {
              if (path[2]) {
                switch (path[2]) {
                  case 'reviews':
                    presenceData.details = 'Viewing their reviews'
                    presenceData.buttons = generateButtonText(presenceData.details)
                    break
                  case 'ratings':
                    presenceData.details = 'Viewing their ratings'
                    presenceData.buttons = generateButtonText(presenceData.details)
                    break
                  case 'diary':
                    presenceData.details = 'Viewing their diary'
                    presenceData.buttons = generateButtonText(presenceData.details)
                    break
                }
              }
              else {
                presenceData.details = 'Viewing their films'
                presenceData.buttons = generateButtonText(presenceData.details)
              }
              break
            }

            case 'tags': {
              if (path[2]) {
                switch (path[2]) {
                  case 'diary':
                    presenceData.details = 'Viewing their diary tags'
                    presenceData.buttons = generateButtonText(presenceData.details)
                    break
                  case 'reviews':
                    presenceData.details = 'Viewing their tagged reviews'
                    presenceData.buttons = generateButtonText(presenceData.details)
                    break
                  case 'lists':
                    presenceData.details = 'Viewing their tagged lists'
                    presenceData.buttons = generateButtonText(presenceData.details)
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
              const name = document.querySelectorAll('.yir-member-subtitle')[0]?.lastElementChild
              presenceData.details = `Viewing ${name?.textContent ?? path[0]}'s statistics`
              presenceData.largeImageKey = (name?.previousElementSibling?.firstElementChild as HTMLImageElement)?.src ?? ActivityAssets.Logo
              presenceData.smallImageKey = ActivityAssets.Logo
              presenceData.buttons = [
                {
                  label: `View ${name?.textContent ?? path[0]}'s stats`,
                  url: document.location.href,
                },
              ]
              break
            }

            case 'list': {
              const title = (document.querySelectorAll('.title-1.prettify')[0] as HTMLHeadingElement)?.textContent
              const name = (document.querySelectorAll('.name')[0]?.firstElementChild as HTMLSpanElement)?.textContent
              presenceData.details = `Viewing the list ${title}`
              presenceData.buttons = generateButtonText(presenceData.details)
              presenceData.state = `By ${name ?? path[0]}`
              presenceData.smallImageKey = getImageURLByAlt(name ?? '')
              presenceData.smallImageText = name
              break
            }

            case 'friends': {
              const title = document.querySelectorAll('.contextual-title')[0]?.firstElementChild?.firstElementChild?.nextElementSibling
              const year = (title?.nextElementSibling?.firstElementChild as HTMLAnchorElement)?.textContent

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
              presenceData.largeImageKey = getImageURLByAlt(clarifyString(title?.textContent ?? '')) ?? ActivityAssets.Logo
              presenceData.smallImageKey = ActivityAssets.Logo
              break
            }

            case 'film': {
              const reviewJsonScript = filterIterable(
                document.querySelectorAll<HTMLScriptElement>('script[type="application/ld+json"]'),
                val => val?.textContent?.includes('"@type":"Review"') ?? false,
              )

              let title = ''
              let rater: string | undefined
              let ratingValue: number | undefined
              let poster: string | undefined

              if (reviewJsonScript?.textContent) {
                try {
                  const reviewJson = JSON.parse(
                    reviewJsonScript.textContent
                      .replace('/* <![CDATA[ */', '')
                      .replace('/* ]]> */', '')
                      .trim(),
                  )

                  title = clarifyString(reviewJson.itemReviewed?.name ?? '')
                  rater = reviewJson.author?.[0]?.name
                  ratingValue = reviewJson.reviewRating?.ratingValue
                  poster = reviewJson.itemReviewed?.image
                }
                catch {}
              }

              const rating = ratingValue === undefined
                ? 'Not rated'
                : '★'.repeat(Math.floor(ratingValue)) + (ratingValue % 1 !== 0 ? '½' : '')

              presenceData.details = `Review of ${title}`
              presenceData.state = `By ${rater ?? path[0]} (${rating})`
              presenceData.buttons = [
                {
                  label: 'View review',
                  url: document.location.href,
                },
              ]
              presenceData.largeImageKey = poster ?? getImageURLByAlt(title) ?? ActivityAssets.Logo
              presenceData.smallImageKey = getImageURLByAlt(rater ?? path[0])
              presenceData.smallImageText = rater ?? path[0]
              break
            }
          }

          if (
            [
              'diary',
              'reviews',
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
            const name = (document.querySelectorAll('.title-3')[0]?.firstElementChild as HTMLAnchorElement)?.textContent
            if (user && path[0] !== user && path[0] !== user.toLowerCase()) {
              if (presenceData.details) {
                const strDetails = typeof presenceData.details === 'string'
                  ? presenceData.details
                  : presenceData.details?.textContent ?? ''

                presenceData.details = strDetails
                  .replace('their', `${name ?? path[0]}'s`)
                  .replace('they\'ve', `${name ?? path[0]} has`)
              }
            }

            presenceData.smallImageKey = getImageURLByAlt(name ?? '')
            presenceData.smallImageText = name
          }
        }
        else {
          const name = (document.querySelectorAll('.title-1')[0] as HTMLHeadingElement)?.textContent
          presenceData.details = `Viewing ${path[0] === user ? 'their own' : `${name ?? path[0]}'s`} profile`
          presenceData.state = `(${path[0] === user ? `${name}/${path[0]}` : path[0]})`
          presenceData.largeImageKey = (
            document.querySelector('#avatar-zoom')?.previousElementSibling as HTMLImageElement
          )?.src ?? ActivityAssets.Logo
          presenceData.smallImageKey = ActivityAssets.Logo
          presenceData.buttons = [
            {
              label: `View ${name ?? path[0]}`,
              url: document.location.href,
            },
          ]
        }
        break
      }
    }
  }
  else {
    presenceData.details = 'At home'
  }

  // Handle Privacy Mode & Show Buttons settings
  if (await presence.getSetting<boolean>('privacy_mode')) {
    presenceData.details = 'Browsing'
    delete presenceData.state
    delete presenceData.buttons
    presenceData.largeImageKey = ActivityAssets.Logo
    delete presenceData.smallImageKey
    delete presenceData.smallImageText
  }
  else if (!(await presence.getSetting<boolean>('show_buttons'))) {
    delete presenceData.buttons
  }

  presence.setActivity(presenceData)
})
