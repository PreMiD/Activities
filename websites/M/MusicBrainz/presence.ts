const presence = new Presence({
  clientId: '1017504807822561290',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/M/MusicBrainz/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const { pathname, href, search } = window.location
  const pathRegex = /^\/[\w-]+\/.*?\/([\w-]+)\/?$/

  switch (pathname.split('/')[1]) {
    case '': {
      presenceData.details = 'Browsing home page'
      break
    }
    case 'account': {
      presenceData.details = 'Managing account preferences'
      break
    }
    case 'area': {
      const areaName = document.querySelector('bdi')?.textContent
      presenceData.details = 'Viewing area'
      switch ((pathname.match(pathRegex) || [])[1]) {
        case 'aliases':
        case 'events':
        case 'labels':
        case 'users':
        case 'works':
        case 'places':
        case 'artists':
        case 'releases':
        case 'recordings':
        case 'tags':
        case 'details': {
          presenceData.state = `${
            document.querySelector('.sel bdi')?.textContent
          } for '${areaName}'`
          break
        }
        case 'open_edits': {
          presenceData.state = `Open edits for '${areaName}'`
          break
        }
        case 'edits': {
          presenceData.state = `Edit history for '${areaName}'`
          break
        }
        case 'collections': {
          presenceData.state = `Collections for '${areaName}'`
          break
        }
        default: {
          presenceData.state = areaName
          presenceData.buttons = [
            {
              label: 'View Area',
              url: href,
            },
          ]
        }
      }
      break
    }
    case 'artist': {
      if (pathname.startsWith('/artist/create')) {
        presenceData.details = 'Creating new artist'
        presenceData.state = document.querySelector<HTMLInputElement>(
          '#id-edit-artist\\.name',
        )?.value
      }
      else {
        const artistName = document.querySelector('bdi')?.textContent
        presenceData.details = 'Viewing artist'
        switch ((pathname.match(pathRegex) || [])[1]) {
          case 'works':
          case 'recordings':
          case 'events':
          case 'relationships':
          case 'aliases':
          case 'tags':
          case 'ratings':
          case 'details':
          case 'releases': {
            presenceData.state = `${
              document.querySelector('.sel bdi')?.textContent
            } for '${artistName}'`
            break
          }
          case 'edit': {
            presenceData.state = 'Editing artist'
            presenceData.state = artistName
            break
          }
          case 'open_edits': {
            presenceData.state = `Open edits for '${artistName}'`
            break
          }
          case 'edits': {
            presenceData.state = `Edit history for '${artistName}'`
            break
          }
          case 'collections': {
            presenceData.state = `Collections for '${artistName}'`
            break
          }
          case 'subscribers': {
            presenceData.state = `Subscribers for '${artistName}'`
            break
          }
          case 'split': {
            presenceData.details = 'Splitting artist'
            presenceData.state = artistName
            break
          }
          case 'edit_annotation': {
            presenceData.details = 'Editing artist annotation'
            presenceData.state = artistName
            break
          }
          case 'annotations': {
            presenceData.state = `Annotation history for '${artistName}'`
            break
          }
          default: {
            presenceData.state = artistName
            presenceData.buttons = [
              {
                label: 'View Artist',
                url: href,
              },
            ]
          }
        }
      }
      break
    }
    case 'collection': {
      if (pathname.startsWith('/collection/create')) {
        presenceData.details = 'Creating new collection'
        break
      }
      else {
        const collectionName = document.querySelector('bdi')?.textContent
        presenceData.details = 'Viewing collection'
        switch ((pathname.match(pathRegex) || [])[1]) {
          case 'edit': {
            presenceData.details = 'Editing collection'
            presenceData.state = collectionName
            break
          }
          case 'open_edits': {
            presenceData.state = `Open edits for '${collectionName}'`
            break
          }
          case 'edits': {
            presenceData.state = `Edit history for '${collectionName}'`
            break
          }
          case 'subscribers': {
            presenceData.state = `Subscribers for '${collectionName}'`
            break
          }
          default: {
            presenceData.state = collectionName
            if (
              !document
                .querySelector<HTMLParagraphElement>('.subheader')
                ?.textContent
                ?.includes('Private collection')
            ) {
              presenceData.buttons = [
                {
                  label: 'View Collection',
                  url: href,
                },
              ]
            }
          }
        }
        break
      }
    }
    case 'doc': {
      presenceData.details = 'Viewing documentation'
      presenceData.state = document.querySelector<HTMLAnchorElement>(
        '.hierarchy-links > a',
      )?.textContent
      break
    }
    case 'event': {
      if (pathname.startsWith('/event/create')) {
        presenceData.details = 'Creating new event'
        presenceData.state = document.querySelector<HTMLInputElement>(
          '#id-edit-event\\.name',
        )?.value
        break
      }
      else {
        const eventName = document.querySelector('bdi')?.textContent
        presenceData.details = 'Viewing event'
        switch ((pathname.match(pathRegex) || [])[1]) {
          case 'aliases':
          case 'tags':
          case 'ratings':
          case 'details': {
            presenceData.state = `${
              document.querySelector('.sel bdi')?.textContent
            } for '${eventName}'`
            break
          }
          case 'edit': {
            presenceData.details = 'Editing event'
            presenceData.state = eventName
            break
          }
          case 'edit_annotation': {
            presenceData.details = 'Editing event annotation'
            presenceData.state = eventName
            break
          }
          case 'annotations': {
            presenceData.state = `Annotation history for '${eventName}'`
            break
          }
          case 'open_edits': {
            presenceData.state = `Open edits for '${eventName}'`
            break
          }
          case 'edits': {
            presenceData.state = `Edit history for '${eventName}'`
            break
          }
          case 'collections': {
            presenceData.state = `Collections for '${eventName}'`
            break
          }
          default: {
            presenceData.state = eventName
            presenceData.buttons = [
              {
                label: 'View Event',
                url: href,
              },
            ]
          }
        }
        break
      }
    }
    case 'genre': {
      const genreName = document.querySelector('bdi')?.textContent
      presenceData.details = 'Viewing genre'
      switch ((pathname.match(pathRegex) || [])[1]) {
        case 'aliases':
        case 'details': {
          presenceData.state = `${
            document.querySelector('.sel bdi')?.textContent
          } for '${genreName}'`
          break
        }
        case 'open_edits': {
          presenceData.state = `Open edits for '${genreName}'`
          break
        }
        case 'edits': {
          presenceData.state = `Edit history for '${genreName}'`
          break
        }
        default: {
          presenceData.state = genreName
          presenceData.buttons = [
            {
              label: 'View Genre',
              url: href,
            },
          ]
        }
      }
      break
    }
    case 'instrument': {
      const instrumentName = document.querySelector('bdi')?.textContent
      presenceData.details = 'Viewing instrument'
      switch ((pathname.match(pathRegex) || [])[1]) {
        case 'aliases':
        case 'artists':
        case 'releases':
        case 'recordings':
        case 'tags':
        case 'details': {
          presenceData.state = `${
            document.querySelector('.sel bdi')?.textContent
          } for '${instrumentName}'`
          break
        }
        default: {
          presenceData.state = instrumentName
          presenceData.buttons = [
            {
              label: 'View Instrument',
              url: href,
            },
          ]
        }
      }
      break
    }
    case 'label': {
      if (pathname.startsWith('/label/create')) {
        presenceData.details = 'Creating new label'
        presenceData.state = document.querySelector<HTMLInputElement>(
          '#id-edit-label\\.name',
        )?.value
        break
      }
      else {
        const labelName = document.querySelector('bdi')?.textContent
        presenceData.details = 'Viewing label'
        switch ((pathname.match(pathRegex) || [])[1]) {
          case 'aliases':
          case 'tags':
          case 'relationships':
          case 'ratings':
          case 'details': {
            presenceData.state = `${
              document.querySelector('.sel bdi')?.textContent
            } for '${labelName}'`
            break
          }
          case 'edit': {
            presenceData.details = 'Editing label'
            presenceData.state = labelName
            break
          }
          case 'annotations': {
            presenceData.state = `Annotation history for '${labelName}'`
            break
          }
          case 'edit_annotation': {
            presenceData.details = 'Editing label annotation'
            presenceData.state = labelName
            break
          }
          case 'open_edits': {
            presenceData.state = `Open edits for '${labelName}'`
            break
          }
          case 'edits': {
            presenceData.state = `Edit history for '${labelName}'`
            break
          }
          case 'collections': {
            presenceData.state = `Collections for '${labelName}'`
            break
          }
          case 'subscribers': {
            presenceData.state = `Subscribers for '${labelName}'`
            break
          }
          default: {
            presenceData.state = labelName
            presenceData.buttons = [
              {
                label: 'View Label',
                url: href,
              },
            ]
          }
        }
        break
      }
    }
    case 'recording': {
      if (pathname.startsWith('/recording/create')) {
        presenceData.details = 'Creating new recording'
        presenceData.state = document.querySelector<HTMLInputElement>(
          '#id-edit-recording\\.name',
        )?.value
        break
      }
      else {
        const recordingName = document.querySelector('bdi')?.textContent
        presenceData.details = 'Viewing recording'
        presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/M/MusicBrainz/assets/0.png'
        presenceData.smallImageText = `Artist: '${
          document.querySelector('.artist bdi')?.textContent
        }' Length: ${
          document.querySelector<HTMLDivElement>('.length')?.textContent
        }`
        switch ((pathname.match(pathRegex) || [])[1]) {
          case 'fingerprints':
          case 'aliases':
          case 'tags':
          case 'reviews':
          case 'details': {
            presenceData.state = `${
              document.querySelector('.sel bdi')?.textContent
            } for '${recordingName}'`
            break
          }
          case 'edit': {
            presenceData.details = 'Editing release'
            presenceData.state = recordingName
            break
          }
          case 'edit_annotation': {
            presenceData.details = 'Editing recording annotations'
            presenceData.state = recordingName
            break
          }
          case 'annotations': {
            presenceData.state = `Annotation history for '${recordingName}'`
            break
          }
          case 'open_edits': {
            presenceData.state = `Open edits for '${recordingName}'`
            break
          }
          case 'edits': {
            presenceData.state = `Edit history for '${recordingName}'`
            break
          }
          case 'collections': {
            presenceData.state = `Collections for '${recordingName}'`
            break
          }
          default: {
            presenceData.state = recordingName
            presenceData.buttons = [
              {
                label: 'View Recording',
                url: href,
              },
            ]
          }
        }
        break
      }
    }
    case 'release': {
      if (pathname.startsWith('/release/add')) {
        presenceData.details = 'Creating new release'
        presenceData.state = document.querySelector<HTMLInputElement>(
          '.row-form tr td:nth-of-type(2) input',
        )?.value
        break
      }
      else {
        const releaseName = document.querySelector('bdi')?.textContent
        const coverArtImage = document.querySelector<HTMLImageElement>(
          '.cover-art-image > img',
        )
        presenceData.details = 'Viewing release'
        if (coverArtImage)
          presenceData.largeImageKey = coverArtImage.src

        // eslint-disable-next-line regexp/no-super-linear-backtracking
        switch ((pathname.match(/^\/release\/.*?\/(.*?)(\/.*)?$/) || [])[1]) {
          case 'discids': {
            presenceData.state = `Disc IDs for '${releaseName}'`
            break
          }
          case 'cover-art': {
            presenceData.state = `Cover art for '${releaseName}'`
            break
          }
          case 'aliases':
          case 'tags':
          case 'details': {
            presenceData.state = `${
              document.querySelector('.sel bdi')?.textContent
            } for '${releaseName}'`
            break
          }
          case 'add-cover-art':
          case 'edit-cover-art': {
            presenceData.state = `Editing cover art for '${releaseName}'`
            break
          }
          case 'edit': {
            presenceData.details = 'Editing release'
            presenceData.state = releaseName
            break
          }
          case 'edit-relationships': {
            presenceData.details = 'Editing release relationships'
            presenceData.state = releaseName
            break
          }
          default: {
            presenceData.state = releaseName
            presenceData.buttons = [
              {
                label: 'View Release',
                url: href,
              },
            ]
          }
        }
        break
      }
    }
    case 'release-group': {
      if (pathname.startsWith('/release-group/create')) {
        presenceData.details = 'Creating new release group'
        presenceData.state = document.querySelector<HTMLInputElement>(
          '#id-edit-release-group\\.name',
        )?.value
        break
      }
      else {
        const releaseGroupName = document.querySelector('bdi')?.textContent
        const coverArtImage = document.querySelector<HTMLImageElement>(
          '.cover-art-image > img',
        )
        presenceData.details = 'Viewing release group'
        if (coverArtImage)
          presenceData.largeImageKey = coverArtImage.src

        switch ((pathname.match(pathRegex) || [])[1]) {
          case 'aliases':
          case 'tags':
          case 'ratings':
          case 'details': {
            presenceData.state = `${
              document.querySelector('.sel bdi')?.textContent
            } for '${releaseGroupName}'`
            break
          }
          case 'set-cover-art': {
            presenceData.details = 'Setting release group cover art'
            presenceData.state = releaseGroupName
            break
          }
          case 'edit': {
            presenceData.details = 'Editing release group'
            presenceData.state = releaseGroupName
            break
          }
          case 'edit_annotation': {
            presenceData.details = 'Editing release group annotation'
            presenceData.state = releaseGroupName
            break
          }
          case 'annotations': {
            presenceData.state = `Annotation history for '${releaseGroupName}'`
            break
          }
          case 'open_edits': {
            presenceData.state = `Open edits for '${releaseGroupName}'`
            break
          }
          case 'edits': {
            presenceData.state = `Edit history for '${releaseGroupName}'`
            break
          }
          case 'collections': {
            presenceData.state = `Collections for '${releaseGroupName}'`
            break
          }
          default: {
            presenceData.state = releaseGroupName
            presenceData.buttons = [
              {
                label: 'View Release Group',
                url: href,
              },
            ]
          }
        }
        break
      }
    }
    case 'search': {
      presenceData.details = 'Searching'
      presenceData.state = new URLSearchParams(search).get('query')
      break
    }
    case 'series': {
      if (pathname.startsWith('/series/create')) {
        presenceData.details = 'Creating new series'
        presenceData.state = document.querySelector<HTMLInputElement>(
          '#id-edit-series\\.name',
        )?.value
        break
      }
      else {
        const seriesName = document.querySelector('bdi')?.textContent
        presenceData.details = 'Viewing series'
        switch ((pathname.match(pathRegex) || [])[1]) {
          case 'aliases':
          case 'tags':
          case 'details': {
            presenceData.state = `${
              document.querySelector('.sel bdi')?.textContent
            } for '${seriesName}'`
            break
          }
          case 'edit': {
            presenceData.details = 'Editing series'
            presenceData.state = seriesName
            break
          }
          case 'edit_annotation': {
            presenceData.details = 'Editing series annotation'
            presenceData.state = seriesName
            break
          }
          case 'annotations': {
            presenceData.state = `Annotation history for '${seriesName}'`
            break
          }
          case 'open_edits': {
            presenceData.state = `Open edits for '${seriesName}'`
            break
          }
          case 'edits': {
            presenceData.state = `Edit history for '${seriesName}'`
            break
          }
          case 'collections': {
            presenceData.state = `Collections for '${seriesName}'`
            break
          }
          case 'subscribers': {
            presenceData.state = `Subscribers for '${seriesName}'`
            break
          }
          default: {
            presenceData.state = seriesName
            presenceData.buttons = [
              {
                label: 'View Series',
                url: href,
              },
            ]
          }
        }
        break
      }
    }
    case 'tag': {
      const tagName = document.querySelector<HTMLAnchorElement>('h1 > a')?.textContent
      presenceData.details = 'Viewing tag'
      switch ((pathname.match(pathRegex) || [])[1]) {
        case 'artist':
        case 'release-group':
        case 'release':
        case 'recording':
        case 'work':
        case 'label':
        case 'place':
        case 'area':
        case 'instrument':
        case 'series':
        case 'event': {
          presenceData.state = `${
            document.querySelector('.sel bdi')?.textContent
          } for '${tagName}'`
          break
        }
        default: {
          presenceData.state = tagName
          presenceData.buttons = [
            {
              label: 'View Tag',
              url: href,
            },
          ]
        }
      }
      break
    }
    case 'taglookup': {
      presenceData.details = 'Viewing lookup results'
      break
    }
    case 'url': {
      const url = document.querySelector('bdi')?.textContent
      presenceData.details = 'Viewing URL'
      switch ((pathname.match(pathRegex) || [])[1]) {
        case 'edit': {
          presenceData.details = 'Editing URL'
          presenceData.state = url
          break
        }
        case 'open_edits': {
          presenceData.state = `Open edits for '${url}'`
          break
        }
        case 'edits': {
          presenceData.state = `Edit history for '${url}'`
          break
        }
        default: {
          presenceData.state = url
        }
      }
      break
    }
    case 'user': {
      const [, profilePath] = pathname.match(pathRegex) || []
      const username = document.querySelector('bdi')?.textContent
      presenceData.details = 'Viewing user profile'
      switch (profilePath) {
        case 'ratings':
        case 'subscribers':
        case 'collections': {
          presenceData.state = `${username}'s ${profilePath}`
          break
        }
        case 'tags': {
          presenceData.state = document.querySelector('h2')?.textContent
          break
        }
        default: {
          if (profilePath?.startsWith('subscriptions/')) {
            presenceData.state = `${username}'s ${
              profilePath.match(/^subscriptions\/(.*?)\/?$/)?.[1]?.[1]
            } subscriptions`
          }
          else {
            presenceData.state = username
          }
        }
      }
      break
    }
    case 'work': {
      if (pathname.startsWith('/work/create')) {
        presenceData.details = 'Creating new work'
        presenceData.state = document.querySelector<HTMLInputElement>(
          '#id-edit-work\\.name',
        )?.value
        break
      }
      else {
        const workName = document.querySelector('bdi')?.textContent
        presenceData.details = 'Viewing work'
        switch ((pathname.match(pathRegex) || [])[1]) {
          case 'aliases':
          case 'tags':
          case 'details': {
            presenceData.state = `${
              document.querySelector('.sel bdi')?.textContent
            } for '${workName}'`
            break
          }
          case 'edit': {
            presenceData.details = 'Editing work'
            presenceData.state = workName
            break
          }
          case 'edit_annotation': {
            presenceData.details = 'Editing work annotation'
            presenceData.state = workName
            break
          }
          case 'annotations': {
            presenceData.state = `Annotation history for '${workName}'`
            break
          }
          case 'open_edits': {
            presenceData.state = `Open edits for '${workName}'`
            break
          }
          case 'edits': {
            presenceData.state = `Edit history for '${workName}'`
            break
          }
          case 'collections': {
            presenceData.state = `Collections for '${workName}'`
            break
          }
          default: {
            presenceData.state = workName
            presenceData.buttons = [
              {
                label: 'View Work',
                url: href,
              },
            ]
          }
        }
        break
      }
    }
    default: {
      presenceData.details = 'Browsing...'
      presenceData.state = document.title.split(' - MusicBrainz')[0]
    }
  }

  presence.setActivity(presenceData)
})
