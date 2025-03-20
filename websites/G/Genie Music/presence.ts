import { Assets } from 'premid'

const presence = new Presence({
  clientId: '857504938443407360',
})

function getQuery() {
  return JSON.parse(
    `{"${decodeURI(decodeURIComponent(location.search.substring(1)))
      .replaceAll('"', '\\"')
      .replaceAll('&', '","')
      .replaceAll('=', '":"')}"}`,
  )
}

function getGenre(code: string) {
  const firstCode = code.substr(0, 1)
  const endCode = code.substr(1)
  if (firstCode === 'E')
    return 'EDM'
  else if (firstCode === 'L' && endCode === '0107')
    return '트롯'
  else if (endCode.startsWith('01'))
    return '가요'
  else if (endCode.startsWith('02') && endCode !== '0207' && endCode !== '0208')
    return 'POP'
  else if (endCode.startsWith('03'))
    return 'OST'
  else if (endCode.startsWith('04'))
    return 'JPOP'
  else if (endCode.startsWith('05'))
    return 'JAZZ'
  else if (endCode.startsWith('06'))
    return '클래식'
  else if (endCode.startsWith('08'))
    return 'CCM'
  else return '그 외 장르'
}

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/G/Genie%20Music/assets/logo.png',
  TV = 'https://cdn.rcd.gg/PreMiD/websites/G/Genie%20Music/assets/0.png',
  Mnet = 'https://cdn.rcd.gg/PreMiD/websites/G/Genie%20Music/assets/1.png',
  Chart = 'https://cdn.rcd.gg/PreMiD/websites/G/Genie%20Music/assets/2.png',
  Music = 'https://cdn.rcd.gg/PreMiD/websites/G/Genie%20Music/assets/3.png',
  Playlist = 'https://cdn.rcd.gg/PreMiD/websites/G/Genie%20Music/assets/4.png',
  Profile = 'https://cdn.rcd.gg/PreMiD/websites/G/Genie%20Music/assets/5.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
  }
  const { location } = document
  // If player
  switch (location.pathname) {
    case '/player/fPlayer': {
      const playBar = document.querySelector('div.fp-ui')!
      const playButton = playBar.querySelector('a.fp-playbtn')?.textContent;
      [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(
        presence.timestampFromFormat(
          playBar.querySelector('span.fp-elapsed')!.textContent!,
        ),
        presence.timestampFromFormat(
          playBar.querySelector('span.fp-duration')!.textContent!,
        ),
      )
      presenceData.details = `${
        document.querySelector('strong#SongTitleArea')?.textContent
      } - ${
        document
          .querySelector<HTMLDivElement>('div.track-info')
          ?.querySelector('span#ArtistNameArea')
          ?.textContent
      }`
      if (playButton === '재생') {
        presenceData.smallImageKey = Assets.Pause
        presenceData.smallImageText = '일시 정지'
      }
      else if (playButton === '일시정지') {
        presenceData.smallImageKey = Assets.Play
        presenceData.smallImageText = '재생'
      }

      break
    }
    case '/detail/mediaInfo': {
      const video = document
        .querySelector('div.fp-player')!
        .querySelector<HTMLVideoElement>('video.fp-engine')!;

      [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(video.currentTime, video.duration)
      presenceData.details = `${
        document.querySelector('h2.videoTitle')?.textContent
      }`
      if (video.paused) {
        presenceData.smallImageKey = Assets.Pause
        presenceData.smallImageText = '일시 정지'
      }
      else if (video.ended) {
        presenceData.smallImageKey = Assets.Stop
        presenceData.smallImageText = '정지'
      }
      else {
        presenceData.smallImageKey = Assets.Play
        presenceData.smallImageText = '재생'
      }

      break
    }
    case '/': {
      presenceData.details = '메인'
      break
    }
    default:
      if (location.pathname.indexOf('/search') === 0) {
        presenceData.smallImageKey = Assets.Search
        presenceData.details = '검색'
        presenceData.state = getQuery().query
        switch (location.pathname) {
          case '/search/searchMain': {
            presenceData.details += '(통합검색)'
            break
          }
          case '/search/searchArtist': {
            presenceData.details += '(아티스트)'
            break
          }
          case '/search/searchSong': {
            presenceData.details += '(곡)'
            break
          }
          case '/search/searchAlbum': {
            presenceData.details += '(앨범)'
            break
          }
          case '/search/searchPlaylist': {
            presenceData.details += '(플레이리스트)'
            break
          }
          case '/search/searchMv': {
            presenceData.details += '(동영상)'
            break
          }
          case '/search/searchMagazine': {
            presenceData.details += '(매거진)'
            break
          }
          case '/search/searchLyrics': {
            presenceData.details += '(가사)'
            break
          }
        }
      }
      else if (location.pathname.startsWith('/chart')) {
        presenceData.smallImageKey = ActivityAssets.Chart
        presenceData.details = '지니차트'
        switch (location.pathname) {
          case '/chart/top200': {
            presenceData.details += '(TOP 200)'
            break
          }
          case '/chart/genre': {
            presenceData.details += '(장르별 차트)'
            break
          }
          case '/chart/musicHistory': {
            presenceData.details += '(시대별 차트)'
            break
          }
          case '/chart/musicVideo': {
            presenceData.details += '(뮤직 비디오)'
            break
          }
        }
      }
      else if (location.pathname.startsWith('/newest')) {
        presenceData.smallImageKey = ActivityAssets.Music
        presenceData.details = '최신음악'
        if (location.pathname === '/newest/song')
          presenceData.details += '(곡)'
        else if (location.pathname === '/newest/album')
          presenceData.details += '(앨범)'
      }
      else if (location.pathname.startsWith('/genre')) {
        presenceData.smallImageKey = ActivityAssets.Music
        presenceData.details = '장르음악'
        presenceData.details += `(${getGenre(
          location.pathname.replace('/genre/', ''),
        )})`
      }
      else if (location.pathname.startsWith('/genietv')) {
        presenceData.smallImageKey = ActivityAssets.TV
        presenceData.details = '지니TV'
        switch (location.pathname) {
          case '/genietv/broadcast': {
            presenceData.details += '(Mnet 방송)'
            presenceData.smallImageKey = ActivityAssets.Mnet

            break
          }
          case '/genietv/newMV': {
            presenceData.details += '(뮤직비디오)'
            break
          }
          case '/genietv/musicianSpecial': {
            presenceData.details += '(뮤지션)'
            break
          }
          default:
            if (location.pathname.startsWith('/genietv/noveltyMovie'))
              presenceData.details += '(이색영상)'
        }
      }
      else if (location.pathname.startsWith('/playlist')) {
        presenceData.smallImageKey = ActivityAssets.Playlist
        presenceData.details = '추천'
        switch (location.pathname) {
          case '/playlist/popular': {
            presenceData.details += '(인기)'
            break
          }
          case '/playlist/tags': {
            presenceData.details += '(태그)'
            break
          }
          case '/playlist/history': {
            presenceData.details += '(히스토리)'
            break
          }
        }
      }
      else if (location.pathname.startsWith('/magazine')) {
        presenceData.smallImageKey = ActivityAssets.Playlist
        presenceData.details = '매거진'
      }
      else if (location.pathname.startsWith('/edm')) {
        presenceData.smallImageKey = ActivityAssets.Music
        presenceData.details = 'EDM'
        if (location.pathname === '/edm/album')
          presenceData.details += '(최신)'
        else if (location.pathname === '/edm/chart')
          presenceData.details += '(차트)'
      }
      else if (location.pathname.startsWith('/buy')) {
        presenceData.details = '이용권 구매'
      }
      else if (location.pathname.startsWith('/event')) {
        presenceData.details = '이벤트'
      }
      else if (location.pathname.startsWith('/guide')) {
        presenceData.details = '이용 안내'
      }
      else if (location.pathname.startsWith('/member/product')) {
        presenceData.details = '이용권 내역'
      }
      else if (location.pathname.startsWith('/support/service')) {
        presenceData.details = '고객센터'
        switch (location.pathname) {
          case '/support/service/helpList': {
            presenceData.details += '(도움말)'
            break
          }
          case '/support/service/notice': {
            presenceData.details += '(공지사항)'
            break
          }
          case '/support/service/pds': {
            presenceData.details += '(자료실)'
            break
          }
          case '/support/service/errorRegist': {
            presenceData.details += '(음원 관련 문의)'
            break
          }
          case '/support/service/contact': {
            presenceData.details += '(서비스 문의)'
            break
          }
          case '/support/service/myContactList': {
            presenceData.details += '(문의 내역)'
            break
          }
        }
      }
      else if (location.pathname.startsWith('/myMusic')) {
        presenceData.smallImageKey = ActivityAssets.Profile
        presenceData.details = '마이 뮤직'
        if (location.pathname.startsWith('/myMusic/profile')) {
          presenceData.details += '(프로필)'
        }
        else if (
          location.pathname.startsWith('/myMusic/purchase')
          || location.pathname === '/myMusic/oneClickDownload'
        ) {
          presenceData.details += '(보관함)'
        }
        else if (
          location.pathname.startsWith('/myMusic/gift')
          || location.pathname === '/myMusic/coupleList'
        ) {
          presenceData.details += '(선물함)'
        }
        else if (location.pathname === '/myMusic/shareList') {
          presenceData.details += '(음악 나누기)'
        }
        else if (location.pathname.startsWith('/myMusic/like')) {
          presenceData.details += '(좋아요)'
        }
        else {
          switch (location.pathname) {
            case '/myMusic/myStreamVideoList': {
              presenceData.details += '(최근 감상 영상)'
              break
            }
            case '/myMusic/myMusicPlayList': {
              presenceData.details += '(플레이리스트)'
              break
            }
            case '/myMusic/syncPlaylist': {
              presenceData.details += '(동기화 재생목록)'
              break
            }
            case '/myMusic/myPlaylist': {
              const { category } = getQuery()
              switch (category) {
                case 'A': {
                  presenceData.details += '(많이 들은 아티스트)'
                  break
                }
                case 'M': {
                  presenceData.details += '(많이 들은 곡)'
                  break
                }
                case 'R': {
                  presenceData.details += '(최근 감상 곡)'
                  break
                }
              }
              break
            }
          }
        }
      }
  }
  presence.setActivity(presenceData)
})
