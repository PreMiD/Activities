import { Assets } from 'premid'

const presence = new Presence({
  clientId: '833689728774832168',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://i.imgur.com/8mDOxoI.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    name: '디시인사이드',
  }
  if (await presence.getSetting('fullactivity')) {
    if (document.location.hostname.split('.')[0] === 'gall') {
      const path = document.location.pathname.split('/')
      if (['board', 'mgallery', 'mini', 'person'].includes(path[1]!)) {
        if (await presence.getSetting('showgallery')) {
          const name = document.querySelector('div.fl.clear a')?.textContent ?? '(로딩 중)'
          const suffixes = ['마이너', '미니', '인물']
          for (const suffix of suffixes) {
            if (name.endsWith(suffix)) {
              presenceData.name = name.slice(0, -suffix.length)
              break
            }
          }

          if (presenceData.name === '디시인사이드')
            presenceData.name = name
        }

        if (await presence.getSetting('showstatus')) {
          if (path.includes('lists')) {
            presenceData.state = '글 목록 탐색 중'
            presenceData.smallImageKey = Assets.Search
          }

          else if (path.includes('view')) {
            presenceData.state = await presence.getSetting('showtitle') ? `\"${document.querySelector('span.title_subject')?.textContent}\" 읽는 중` : '게시글 읽는 중'
            presenceData.smallImageKey = Assets.Reading
          }

          else if (await presence.getSetting('showwriting') && path.includes('write')) {
            presenceData.state = '글 작성 중'
            presenceData.smallImageKey = Assets.Writing
          }
        }
      }

      else if (path[1] === 'm') {
        presenceData.details = '마이너 갤러리 목록'
      }
      else if (!path[1]) {
        presenceData.details = '갤러리 목록'
      }
      else if (path[1] === 'n') {
        presenceData.details = '미니 갤러리 목록'
      }
      else if (path[1] === 'p') {
        presenceData.details = '인물 갤러리 목록'
      }
    }

    else if (['www.dcinside.com', 'dcinside.com'].includes(document.location.hostname)) {
      presenceData.details = '홈 페이지'
    }

    else if (document.location.hostname === 'search.dcinside.com') {
      if (await presence.getSetting('showsearch')) {
        presenceData.state = `\"${decodeURI(document.location.pathname.split('/').at(-1)!.replaceAll('.', '%'))}\" 검색 중`
      }
      else {
        presenceData.state = '검색 중'
      }
      presenceData.smallImageKey = Assets.Search
    }

    else if (document.location.hostname === 'mall.dcinside.com') {
      presenceData.details = '디시콘샵 탐색 중'
      presenceData.smallImageKey = Assets.Search
    }

    else if (document.location.hostname === 'gallog.dcinside.com') {
      presenceData.details = await presence.getSetting('shownickname') ? `${document.querySelector('strong.nick_name')?.textContent}의 갤로그 보는 중` : '누군가의 갤로그 보는 중'
      presenceData.smallImageKey = Assets.Viewing
    }

    presence.setActivity(presenceData)
  }
})
