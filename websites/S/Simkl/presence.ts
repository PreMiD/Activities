const presence = new Presence({
  clientId: '1290874564582051855',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/S/Simkl/assets/logo.png',
}

function textContent(tags: string) {
  return document.querySelector(tags)?.textContent?.trim()
}

function getImage(tags: string) {
  return document.querySelector<HTMLImageElement>(tags)?.src ?? ActivityAssets.Logo
}

presence.on('UpdateData', async () => {
  const { pathname, search } = document.location
  const path = pathname.split('/')
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  switch (path[1]) {
    case 'tv': {
      presenceData.details = 'Exploring TV Shows'
      if (path[2]) {
        switch (path[2]) {
          case 'calendar': {
            presenceData.details = 'Viewing TV Shows Calendar'
            break
          }
          case 'discover': {
            presenceData.details = 'Discovering TV Shows'
            break
          }
          case 'today': {
            presenceData.details = 'Viewing Today\'s TV Shows Calendar'
            break
          }
          case 'movies': {
            presenceData.details = 'Viewing Animes Movies'
            break
          }
          case 'best-shows': {
            presenceData.details = 'Viewing Best TV Shows'
            break
          }
          case 'premieres': {
            presenceData.details = 'Viewing Premieres TV Shows'
            break
          }
        }
        if (path[3]) {
          presenceData.details = textContent('h1.headDetail')
          presenceData.largeImageKey = getImage('#detailPosterImg')
          if (path[4] && path[4].startsWith('countdown')) {
            presenceData.details = textContent('.heading')?.replace(
              'Countdown',
              '',
            )
            presenceData.state = textContent('.simkltvcountdownsubtitle')
            presenceData.largeImageKey = getImage(
              '.simkltvcountdowninfoleftiage',
            )
          }
          else if (path[4] && path[4].startsWith('review')) {
            presenceData.details = `Reading a ${textContent(
              '#global_div > div.SimklHeaderBgShaddow > div > div > div.SimklTVReviewHeaderBottom > table > tbody > tr > td > table > tbody > tr > td:nth-child(2) > table > tbody > tr:nth-child(1) > td',
            )}`
            presenceData.state = textContent(
              '#global_div > div.SimklHeaderBgShaddow > div > div > div.SimklTVReviewHeaderBottom > table > tbody > tr > td > table > tbody > tr > td:nth-child(2) > table > tbody > tr:nth-child(2) > td',
            )
            presenceData.largeImageKey = getImage('.SimklTVReviewPoster')
          }
          else if (path[4]) {
            presenceData.state = `on ${textContent(
              '.SimklTVAboutTabsActive',
            )} tab`
          }
          else if (path[5] && path[5].startsWith('episode-')) {
            presenceData.details = textContent(
              'td.SimklTVDetailEpisodeDescTitle > h1',
            )?.replace('Watch', '')?.replace('Online', '')
            presenceData.largeImageKey = getImage('.SimklTVDetailEpisodeImage')
            delete presenceData.state
          }
        }
      }
      break
    }
    case 'anime': {
      presenceData.details = 'Exploring Animes'
      if (path[2]) {
        switch (path[2]) {
          case 'calendar': {
            presenceData.details = 'Viewing Animes Calendar'
            break
          }
          case 'discover': {
            presenceData.details = 'Discovering Animes'
            break
          }
          case 'today': {
            presenceData.details = 'Viewing Today\'s Animes Calendar'
            break
          }
          case 'movies': {
            presenceData.details = 'Viewing Animes Movies'
            break
          }
          case 'best-anime': {
            presenceData.details = 'Viewing Best Animes'
            break
          }
          case 'premieres': {
            presenceData.details = 'Viewing Premieres Animes'
            break
          }
        }
        if (path[3]) {
          presenceData.details = textContent('h1.headDetail')
          presenceData.largeImageKey = getImage('#detailPosterImg')
          presenceData.state = `on ${textContent(
            '.SimklTVAboutTabsActive',
          )} tab`
          if (path[4] && path[4].startsWith('episode-')) {
            presenceData.details = textContent(
              'td.SimklTVDetailEpisodeDescTitle > h1',
            )
              ?.replace('Watch', '')
              ?.replace('Online', '')
            presenceData.largeImageKey = getImage('.SimklTVDetailEpisodeImage')
            delete presenceData.state
          }
          else if (path[4] && path[4].startsWith('review')) {
            presenceData.details = `Reading a ${textContent(
              '#global_div > div.SimklHeaderBgShaddow > div > div > div.SimklTVReviewHeaderBottom > table > tbody > tr > td > table > tbody > tr > td:nth-child(2) > table > tbody > tr:nth-child(1) > td',
            )}`
            presenceData.state = textContent(
              '#global_div > div.SimklHeaderBgShaddow > div > div > div.SimklTVReviewHeaderBottom > table > tbody > tr > td > table > tbody > tr > td:nth-child(2) > table > tbody > tr:nth-child(2) > td',
            )
            presenceData.largeImageKey = getImage('.SimklTVReviewPoster')
          }
          else if (path[4] && path[4].startsWith('countdown')) {
            presenceData.details = textContent('.heading')?.replace(
              'Countdown',
              '',
            )
            presenceData.state = textContent('.simkltvcountdownsubtitle')
            presenceData.largeImageKey = getImage(
              '.simkltvcountdowninfoleftiage',
            )
          }
        }
      }
      break
    }
    case 'movies': {
      presenceData.details = 'Exploring Movies'
      if (path[2]) {
        switch (path[2]) {
          case 'theaters': {
            presenceData.details = 'Viewing Movies In Theathers'
            break
          }
          case 'discover': {
            presenceData.details = 'Discovering Movies'
            break
          }
          case 'new': {
            presenceData.details = 'Viewing New Movies'
            break
          }
          case 'dvd-releases': {
            presenceData.details = 'Viewing Movies DVDs Releases'
            break
          }
          case 'best-movies': {
            presenceData.details = 'Viewing Best Movies'
            break
          }
        }
        if (path[3] && path[2] !== 'new') {
          presenceData.details = textContent('h1.headDetail')
          presenceData.largeImageKey = getImage('#detailPosterImg')
          presenceData.state = `on ${textContent(
            '.SimklTVAboutTabsActive',
          )} tab`
          if (path[4] && path[4].startsWith('review')) {
            presenceData.details = `Reading a ${textContent(
              '#global_div > div.SimklHeaderBgShaddow > div > div > div.SimklTVReviewHeaderBottom > table > tbody > tr > td > table > tbody > tr > td:nth-child(2) > table > tbody > tr:nth-child(1) > td',
            )}`
            presenceData.state = textContent(
              '#global_div > div.SimklHeaderBgShaddow > div > div > div.SimklTVReviewHeaderBottom > table > tbody > tr > td > table > tbody > tr > td:nth-child(2) > table > tbody > tr:nth-child(2) > td',
            )
            presenceData.largeImageKey = getImage('.SimklTVReviewPoster')
          }
        }
      }
      break
    }
    case 'lists': {
      presenceData.details = 'Discovering Lists'
      switch (path[2]) {
        case 'random': {
          presenceData.details = 'Viewing Random Lists'
          break
        }
        case 'official': {
          presenceData.details = 'Viewing Official Lists'
          break
        }
        case 'discover': {
          presenceData.details = 'Discovering new Lists'
          break
        }
        case 'tags': {
          presenceData.details = 'Viewing tags of Lists'
          break
        }
        case 'most-followed': {
          presenceData.details = 'Viewing Most Followed Lists'
          break
        }
        case 'most-liked': {
          presenceData.details = 'Viewing Most Liked Lists'
          break
        }
      }
      break
    }
    case 'apps': {
      presenceData.details = 'On Apps Page'
      break
    }
    case 'vip': {
      presenceData.details = 'On VIP\'s Page'
      break
    }
    case 'search': {
      presenceData.details = 'Searching for'
      presenceData.state = decodeURIComponent(search?.split('=')[2] ?? '')
      break
    }
    case 'settings': {
      presenceData.details = 'Managing profile settings'
      break
    }
    default: {
      if (path[2]) {
        switch (path[2]) {
          case 'dashboard': {
            presenceData.details = `On ${textContent(
              '.simklprofileheadcontentnametext',
            )}'s profile`
            presenceData.largeImageKey = getImage(
              '.simklprofileheadcontentavatarimg',
            )
            break
          }
          case 'tv': {
            presenceData.details = 'Viewing TV Shows List'
            presenceData.state = `On ${textContent(
              '.simklprofileheadcontentnametext',
            )}'s profile`
            presenceData.largeImageKey = getImage(
              '.simklprofileheadcontentavatarimg',
            )
            break
          }
          case 'anime': {
            presenceData.details = 'Viewing Animes List'
            presenceData.state = `On ${textContent(
              '.simklprofileheadcontentnametext',
            )}'s profile`
            presenceData.largeImageKey = getImage(
              '.simklprofileheadcontentavatarimg',
            )
            break
          }
          case 'movies': {
            presenceData.details = 'Viewing Movies List'
            presenceData.state = `On ${textContent(
              '.simklprofileheadcontentnametext',
            )}'s profile`
            presenceData.largeImageKey = getImage(
              '.simklprofileheadcontentavatarimg',
            )
            break
          }
          case 'recommendations': {
            presenceData.details = 'Viewing recommendations page'
            presenceData.state = `On ${textContent(
              '.simklprofileheadcontentnametext',
            )}'s profile`
            presenceData.largeImageKey = getImage(
              '.simklprofileheadcontentavatarimg',
            )
            break
          }
          case 'lists': {
            presenceData.details = 'Viewing lists page'
            presenceData.state = `On ${textContent(
              '.simklprofileheadcontentnametext',
            )}'s profile`
            presenceData.largeImageKey = getImage(
              '.simklprofileheadcontentavatarimg',
            )
            break
          }
          case 'tags': {
            presenceData.details = 'Viewing tags page'
            presenceData.state = `On ${textContent(
              '.simklprofileheadcontentnametext',
            )}'s profile`
            presenceData.largeImageKey = getImage(
              '.simklprofileheadcontentavatarimg',
            )
            break
          }
          case 'reviews': {
            presenceData.details = 'Viewing reviews page'
            presenceData.state = `On ${textContent(
              '.simklprofileheadcontentnametext',
            )}'s profile`
            presenceData.largeImageKey = getImage(
              '.simklprofileheadcontentavatarimg',
            )
            break
          }
          case 'stats': {
            presenceData.details = 'Viewing stats page'
            presenceData.state = `On ${textContent(
              '.simklprofileheadcontentnametext',
            )}'s profile`
            presenceData.largeImageKey = getImage(
              '.simklprofileheadcontentavatarimg',
            )
            break
          }
          case 'following': {
            presenceData.details = 'Viewing following'
            presenceData.state = `Of ${textContent(
              '.simklprofileheadcontentnametext',
            )}'s profile`
            presenceData.largeImageKey = getImage(
              '.simklprofileheadcontentavatarimg',
            )
            break
          }
          case 'followers': {
            presenceData.details = 'Viewing followers'
            presenceData.state = `Of ${textContent(
              '.simklprofileheadcontentnametext',
            )}'s profile`
            presenceData.largeImageKey = getImage(
              '.simklprofileheadcontentavatarimg',
            )
            break
          }
          case 'friends': {
            presenceData.details = 'On Friends Page'
            break
          }
          case 'list': {
            presenceData.details = 'On List:'
            presenceData.state = textContent(
              '#global_div > list-wrap > list > list-bottom > list-bottom-left > list-bottom-left-content > list-bottom-left-content-left > list-bottom-left-content-left-title > h1',
            )
            break
          }
        }
      }
      else {
        presenceData.details = 'Exploring the website'
      }
      break
    }
  }

  presence.setActivity(presenceData)
})
