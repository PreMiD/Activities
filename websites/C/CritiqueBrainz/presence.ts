const presence = new Presence({
  clientId: '1017821399705985097',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/C/CritiqueBrainz/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const { pathname, href } = window.location
  const pathSplit = pathname.split('/').slice(1)
  switch (pathSplit[0]) {
    case '': {
      presenceData.details = 'Browsing home page'
      break
    }
    case 'profile': {
      if (pathSplit[1] === 'applications') {
        switch (pathSplit[2]) {
          case '': {
            presenceData.details = 'Managing applications'
            break
          }
          case 'create': {
            presenceData.details = 'Creating a new application'
            break
          }
          default: {
            if (/\/edit\/?$/.test(pathname)) {
              presenceData.details = 'Editing an application'
              presenceData.state = document.querySelector<HTMLInputElement>(
                'form fieldset input',
              )?.value
            }
          }
        }
      }
      else if (pathSplit[1] === 'edit') {
        presenceData.details = 'Editing profile'
      }

      break
    }
    case 'user': {
      if (pathSplit[1] === 'edit') {
        presenceData.details = 'Editing profile'
        presenceData.state = document
          .querySelector('.nav a')
          ?.textContent
          ?.replace(/^\s+|\s+$/g, '')
      }
      else {
        presenceData.details = 'Viewing a profile'
        const username = document.querySelector('h2')?.textContent
        switch (pathSplit[2] || '') {
          case '': {
            presenceData.state = username
            break
          }
          case 'info': {
            presenceData.state = `Statistics for '${username}'`
            break
          }
        }
      }
      break
    }
    case 'statistics': {
      presenceData.details = 'Viewing the top 10 contributors'
      break
    }
    case 'review': {
      presenceData.details = 'Browsing reviews'
      switch (pathSplit[1]) {
        case '': {
          presenceData.state = 'Home page'
          break
        }
        case 'write': {
          presenceData.details = 'Writing a review'
          presenceData.state = document.querySelector<HTMLAnchorElement>('dd a')?.textContent
          break
        }
        default: {
          if (/^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/.test(pathSplit[1] ?? '')) {
            presenceData.largeImageKey = document.querySelector<HTMLImageElement>('.cover-art')?.src
              ?? presenceData.largeImageKey
            switch (pathSplit[2] || '') {
              case '': {
                presenceData.details = 'Reading a review'
                presenceData.state = `${
                  document.querySelector<HTMLAnchorElement>('h3 > a')
                    ?.textContent
                }'s review of ${
                  document.querySelector<HTMLAnchorElement>('h2 > a')
                    ?.textContent
                }`
                if (!document.querySelector('.alert-warning')) {
                  presenceData.buttons = [
                    {
                      label: 'Read Review',
                      url: href,
                    },
                  ]
                }
                break
              }
              case 'edit': {
                presenceData.details = 'Editing review'
                presenceData.state = document.querySelector<HTMLAnchorElement>('dd a')?.textContent
                break
              }
              case 'revisions': {
                if (!pathSplit[3]) {
                  presenceData.details = 'Viewing review revision history'
                }
                else {
                  presenceData.details = 'Viewing review revision'
                  presenceData.state = document.querySelector<HTMLAnchorElement>('h2 a')?.textContent
                }
                break
              }
              case 'delete': {
                presenceData.details = 'Deleting review'
                presenceData.state = document
                  .querySelector<HTMLParagraphElement>('.lead')
                  ?.textContent
                  ?.match(/"(.*?)"/)?.[1]
                break
              }
            }
          }
        }
      }
      break
    }
    case 'search': {
      presenceData.details = 'Searching'
      presenceData.state = document.querySelector<HTMLInputElement>('#input-query')?.value
      break
    }
    default: {
      presenceData.details = 'Browsing...'
      presenceData.state = document.title?.match(
        /(.*?)( - CritiqueBrainz$|$)/,
      )?.[1]
    }
  }
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
