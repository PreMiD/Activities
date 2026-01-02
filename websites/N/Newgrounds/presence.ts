import { Assets } from 'premid'

const presence = new Presence({
  clientId: '779342189884997633',
})
function getTime(list: string[]): number {
  let ret = 0
  for (let index = list.length - 1; index >= 0; index--)
    ret += Number.parseInt(list[index]!) * 60 ** index

  return ret
}
function getTimestamps(audioTime: string, audioDuration: string): number[] {
  const startTime = Date.now()
  return [
    Math.floor(startTime / 1000),
    Math.floor(startTime / 1000)
    - getTime(audioTime.split(':').reverse())
    + getTime(audioDuration.split(':').reverse()),
  ]
}

let lastGameChange: number | null | undefined = null
let lastGame: string | null | undefined = null

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/N/Newgrounds/assets/logo.jpeg',
  Art = 'https://cdn.rcd.gg/PreMiD/websites/N/Newgrounds/assets/0.png',
  Audio = 'https://cdn.rcd.gg/PreMiD/websites/N/Newgrounds/assets/1.png',
  Movies = 'https://cdn.rcd.gg/PreMiD/websites/N/Newgrounds/assets/2.png',
  Fav = 'https://cdn.rcd.gg/PreMiD/websites/N/Newgrounds/assets/3.png',
  AudioPlay = 'https://cdn.rcd.gg/PreMiD/websites/N/Newgrounds/assets/4.png',
  AudioPause = 'https://cdn.rcd.gg/PreMiD/websites/N/Newgrounds/assets/5.png',
  PM = 'https://cdn.rcd.gg/PreMiD/websites/N/Newgrounds/assets/6.png',
  Forum = 'https://cdn.rcd.gg/PreMiD/websites/N/Newgrounds/assets/7.png',
  Games = 'https://cdn.rcd.gg/PreMiD/websites/N/Newgrounds/assets/8.png',
  MoviesPause = 'https://cdn.rcd.gg/PreMiD/websites/N/Newgrounds/assets/9.png',
  MoviesPlay = 'https://cdn.rcd.gg/PreMiD/websites/N/Newgrounds/assets/10.png',
  GamesPlay = 'https://cdn.rcd.gg/PreMiD/websites/N/Newgrounds/assets/11.png',
  User = 'https://cdn.rcd.gg/PreMiD/websites/N/Newgrounds/assets/12.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
  }
  const itemName = document.querySelector('[itemprop="name"]')
    ? document.querySelector('[itemprop="name"]')?.textContent
    : null
  const buttons = await presence.getSetting<boolean>('buttons')

  if (location.hostname === 'chat.newgrounds.com') {
    presenceData.details = 'in Newgrounds Chat'
    presenceData.smallImageKey = ActivityAssets.Forum
    presenceData.smallImageText = 'Chat'

    presence.setActivity(presenceData)
    return
  }

  if (location.hostname === 'tv.newgrounds.com') {
    presenceData.details = 'Watching NGTV'
    presenceData.smallImageKey = ActivityAssets.MoviesPlay
    presenceData.smallImageText = 'NGTV'
    presence.setActivity(presenceData)
    return
  }

  if (location.hostname === 'www.newgroundsradio.com') {
    presenceData.details = 'Listening to NG Radio'
    presenceData.smallImageKey = ActivityAssets.AudioPlay
    presenceData.smallImageText = 'NG Radio'

    presence.setActivity(presenceData)
    return
  }

  if (location.hostname !== 'www.newgrounds.com') {
    const userName = document.querySelector('.user-link')?.textContent
    presenceData.details = 'Viewing a user\'s profile'
    presenceData.smallImageKey = ActivityAssets.User
    presenceData.smallImageText = 'User Profile'

    if (await presence.getSetting<boolean>('showprofilename')) {
      presenceData.state = userName && userName.length < 2 ? `User: ${userName}` : userName
      if (buttons) {
        presenceData.buttons = [
          {
            label: 'View Profile',
            url: location.origin,
          },
        ]
      }
    }

    if (document.location.pathname.startsWith('/fans'))
      presenceData.details = 'Viewing a user\'s fans'
    else if (document.location.pathname.startsWith('/news'))
      presenceData.details = 'Viewing a user\'s news posts'
    else if (document.location.pathname.startsWith('/movies'))
      presenceData.details = 'Viewing a user\'s movies'
    else if (document.location.pathname.startsWith('/art'))
      presenceData.details = 'Viewing a user\'s art'
    else if (document.location.pathname.startsWith('/games'))
      presenceData.details = 'Viewing a user\'s games'
    else if (document.location.pathname.startsWith('/audio'))
      presenceData.details = 'Viewing a user\'s audio'
    else if (document.location.pathname.startsWith('/favorites'))
      presenceData.details = 'Viewing a user\'s faves'
    else if (document.location.pathname.startsWith('/reviews'))
      presenceData.details = 'Viewing a user\'s reviews'
    else if (document.location.pathname.startsWith('/trophies'))
      presenceData.details = 'Viewing a user\'s trophies'
  }
  else if (document.location.pathname.startsWith('/movies')) {
    presenceData.details = 'Browsing movies'
    presenceData.smallImageKey = ActivityAssets.Movies
    presenceData.smallImageText = 'Movies'
  }
  else if (document.location.pathname.startsWith('/games')) {
    presenceData.details = 'Browsing games'
    presenceData.smallImageKey = ActivityAssets.Games
    presenceData.smallImageText = 'Games'
  }
  else if (document.location.pathname.startsWith('/audio')) {
    presenceData.details = 'Browsing audio'
    presenceData.smallImageKey = ActivityAssets.Audio
    presenceData.smallImageText = 'Audio'
    if (document.location.pathname.startsWith('/audio/listen')) {
      presenceData.details = 'Listening to audio'
      if (await presence.getSetting<boolean>('itemname')) {
        presenceData.state = `${itemName} by ${document
          .querySelector('.item-details-main')
          ?.textContent
          ?.trim()}`
        if (buttons) {
          presenceData.buttons = [
            {
              label: 'Listen',
              url: document.URL,
            },
          ]
        }
      }
      presenceData.smallImageKey = ActivityAssets.AudioPause
      presenceData.smallImageText = 'Audio - Paused'
      if (
        document.querySelector('#audio-listen-play[style="display: none;"]')
      ) {
        if (await presence.getSetting<boolean>('timestamp')) {
          [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(
            document.querySelector('#audio-listen-progress')?.textContent ?? '',
            document.querySelector('#audio-listen-duration')?.textContent ?? '',
          )
        }
        presenceData.smallImageKey = ActivityAssets.AudioPlay
        presenceData.smallImageText = 'Audio - Playing'
      }
    }
  }
  else if (document.location.pathname.startsWith('/art')) {
    presenceData.details = 'Browsing art'
    presenceData.smallImageKey = ActivityAssets.Art
    presenceData.smallImageText = 'Art'
    if (document.location.pathname.startsWith('/art/view')) {
      presenceData.details = 'Viewing art'
      if (await presence.getSetting<boolean>('itemname')) {
        presenceData.state = itemName && itemName.length < 2 ? `Art: ${itemName}` : itemName
        if (buttons) {
          presenceData.buttons = [
            {
              label: 'View',
              url: document.URL,
            },
          ]
        }
      }
    }
  }
  else if (document.location.pathname.startsWith('/portal')) {
    presenceData.details = 'Viewing the portal'
    if (document.location.pathname.startsWith('/portal/view')) {
      switch (
        document
          .querySelector('meta[property="og:type"]')
          ?.getAttribute('content')
      ) {
        case 'movie':
          presenceData.details = 'Watching a movie'
          if (await presence.getSetting<boolean>('itemname')) {
            presenceData.state = itemName && itemName.length < 2 ? `Movie: ${itemName}` : itemName
            if (buttons) {
              presenceData.buttons = [
                {
                  label: 'Watch',
                  url: document.URL,
                },
              ]
            }
          }
          // Some movies might not have the NG player
          if (document.querySelector('.ng-video-player')) {
            presenceData.smallImageKey = ActivityAssets.MoviesPause
            presenceData.smallImageText = 'Movies - Paused'
            if (
              document.querySelector(
                '[data-action="play"][style="display: none;"]',
              )
            ) {
              if (await presence.getSetting<boolean>('timestamp')) {
                [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(
                  document.querySelector('[data-value="current-time"]')
                    ?.textContent ?? '',
                  document.querySelector('[data-value="total-time"]')
                    ?.textContent ?? '',
                )
              }
              presenceData.smallImageKey = ActivityAssets.MoviesPlay
              presenceData.smallImageText = 'Movies - Playing'
            }
          }
          else {
            presenceData.smallImageKey = ActivityAssets.Movies
            presenceData.smallImageText = 'Movies'
          }
          break
        case 'game':
          if (lastGame !== itemName) {
            lastGame = itemName
            lastGameChange = Date.now()
          }
          presenceData.details = 'Playing a game'
          if (await presence.getSetting<boolean>('itemname')) {
            presenceData.state = itemName && itemName.length < 2 ? `Game: ${itemName}` : itemName
            if (buttons) {
              presenceData.buttons = [
                {
                  label: 'Play',
                  url: document.URL,
                },
              ]
            }
          }
          presenceData.smallImageKey = ActivityAssets.GamesPlay
          presenceData.smallImageText = 'Games - Playing'
          if (await presence.getSetting<boolean>('timestamp'))
            presenceData.startTimestamp = lastGameChange
          break
      }
    }
  }
  else if (document.location.pathname.startsWith('/bbs')) {
    presenceData.details = 'Browsing the forums'
    presenceData.smallImageKey = ActivityAssets.Forum
    presenceData.smallImageText = 'Forums'
    if (document.location.pathname.startsWith('/bbs/search/author/')) {
      const [, userName] = document
        .querySelector('.pod-head > .search')
        ?.textContent
        ?.split('"') ?? []
      presenceData.details = 'Viewing a user\'s posts'
      presenceData.smallImageKey = ActivityAssets.User
      presenceData.smallImageText = 'User Profile'
      if (await presence.getSetting<boolean>('showprofilename')) {
        presenceData.state = userName && userName.length < 2 ? `User: ${userName}` : userName
      }
    }
    else if (document.location.pathname.startsWith('/bbs/topic/')) {
      const itemName = document.querySelector('.pod-head h2')?.textContent
      presenceData.details = 'Viewing a forum topic'
      if (await presence.getSetting<boolean>('topicname')) {
        presenceData.state = itemName && itemName.length < 2 ? `Topic: ${itemName}` : itemName
        if (buttons) {
          presenceData.buttons = [
            {
              label: 'View Topic',
              url: document.URL,
            },
          ]
        }
      }
    }
  }
  else if (document.location.pathname.startsWith('/community')) {
    presenceData.details = 'Browsing the community'
  }
  else if (document.location.pathname.startsWith('/collection')) {
    presenceData.details = 'Browsing collections'
    if (document.location.pathname.split('/')[2]) {
      const itemName = document.querySelector(
        '.column.wide .pod-head h2',
      )?.textContent
      presenceData.details = 'Viewing a collection'
      if (await presence.getSetting<boolean>('itemname')) {
        presenceData.state = itemName && itemName.length < 2 ? `Collection: ${itemName}` : itemName
        if (buttons) {
          presenceData.buttons = [
            {
              label: 'View Collection',
              url: document.URL,
            },
          ]
        }
      }
    }
  }
  else if (document.location.pathname.startsWith('/social')) {
    presenceData.details = 'Browsing their feed'
  }
  else if (document.location.pathname.startsWith('/pm')) {
    presenceData.details = 'Browsing Private Messages'
    presenceData.smallImageKey = ActivityAssets.PM
    presenceData.smallImageText = 'Private Messages'
  }
  else if (document.location.pathname.startsWith('/dump')) {
    presenceData.details = 'in Dumping Grounds'
  }
  else if (document.location.pathname.startsWith('/playlists')) {
    presenceData.details = 'Browsing playlists'
    if (document.location.pathname.startsWith('/playlists/view')) {
      const itemName = document.querySelector(
        '.column.wide .pod-head h2',
      )?.textContent
      presenceData.details = 'Viewing a playlist'
      if (await presence.getSetting<boolean>('itemname')) {
        presenceData.state = itemName && itemName.length < 2 ? `Playlist: ${itemName}` : itemName
        if (buttons) {
          presenceData.buttons = [
            {
              label: 'View Playlist',
              url: document.URL,
            },
          ]
        }
      }
    }
  }
  else if (document.location.pathname.startsWith('/chat')) {
    presenceData.details = 'in Newgrounds Chat'
  }
  else if (document.location.pathname.startsWith('/downloads')) {
    presenceData.details = 'in Downloads page'
  }
  else if (document.location.pathname.startsWith('/settings')) {
    presenceData.details = 'in Account Settings'
  }
  else if (document.location.pathname.startsWith('/radio')) {
    presenceData.details = 'Listening to NG Radio'
    presenceData.smallImageKey = ActivityAssets.AudioPlay
    presenceData.smallImageText = 'NG Radio'
  }
  else if (document.location.pathname.startsWith('/confirmation')) {
    presenceData.details = 'in Requests'
  }
  else if (document.location.pathname.startsWith('/calendar')) {
    presenceData.details = 'Viewing the calendar'
  }
  else if (document.location.pathname.startsWith('/rankings')) {
    presenceData.details = 'Viewing the rankings'
  }
  else if (document.location.pathname.startsWith('/wiki')) {
    const [, ...subNameSplit] = document
      .querySelector('.column.wide .pod-head h2')
      ?.textContent
      ?.split(': ') ?? []
    presenceData.details = 'in Newgrounds Wiki'
    presenceData.state = subNameSplit.join(': ')
  }
  else if (document.location.pathname.startsWith('/search')) {
    presenceData.details = `Searching for ${
      document.querySelector('.current')?.textContent
    }`
    presenceData.smallImageKey = Assets.Search
    presenceData.smallImageText = 'Searching'
    if (await presence.getSetting<boolean>('showsearchterm')) {
      const query = new URLSearchParams(document.location.search).get('terms')
      if (query)
        presenceData.state = query.length < 2 ? `Query: ${query}` : query
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
