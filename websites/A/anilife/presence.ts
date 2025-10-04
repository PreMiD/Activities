import { ActivityType, Assets, getTimestampsFromMedia } from 'premid'

const presence = new Presence({
  clientId: '833689728774832168',
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: await presence.getSetting('hide') ? null : 'https://cdn.rcd.gg/PreMiD/websites/A/anilife/assets/logo.png',
    type: ActivityType.Watching,
    name: 'Anilife',
  }
  if (document.location.hostname === 'anilife.app') {
    if (document.location.pathname === '/watch') {
      const videoData = document.querySelector('video')
      presenceData.name = document.querySelector('h2.inline-block')?.textContent ?? '(로딩 중)'
      presenceData.details = document.querySelector('span.line-clamp-3')?.textContent ?? '(로딩 중)';
      [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestampsFromMedia(videoData!)
      presenceData.state = videoData?.paused ? '일시 정지됨' : '재생 중'
      presenceData.smallImageKey = videoData?.paused ? Assets.Pause : Assets.Play
      presenceData.smallImageText = videoData?.paused ? '일시 정지됨' : '재생 중'
    }
    else if (!await presence.getSetting('onlyvid')) {
      if (document.location.pathname === '/' || document.location.pathname === '/home') {
        presenceData.details = '홈페이지'
        presenceData.state = '탐색 중'
      }
      else if (document.location.pathname.split('/')[1] === 'content') {
        presenceData.details = `${document.querySelector('h1.mb-1')?.textContent ?? '(로딩 중)'} 에피소드 목록`
        presenceData.state = Array.from(document.querySelectorAll('div.mb-2 a span')).map(a => a.textContent).join(', ')
      }
      else if (document.location.pathname === '/results') {
        presenceData.details = `'${document.querySelector('h1')?.textContent?.split('\'')[1]}' 검색 결과`
        presenceData.state = '탐색 중'
        presenceData.smallImageKey = Assets.Search
      }
      else if (['daily', 'complete', 'top', 'random'].includes(document.location.pathname.split('/')[1] ?? '')) {
        presenceData.details = document.querySelector('h1')?.textContent ?? '(로딩 중)'
        presenceData.state = '탐색 중'
      }
      else if (document.location.pathname.split('/')[1] === 'staff') {
        presenceData.details = document.querySelector('h1')?.textContent ?? '(로딩 중)'
        presenceData.state = '성우 정보'
      }
      else if (document.location.pathname.split('/')[1] === 'season') {
        presenceData.details = `${document.querySelector('h1')?.textContent?.replace('작품 목록', '') ?? '(로딩 중)'} 목록`
        presenceData.state = '탐색 중'
      }
      else if (document.location.pathname.split('/')[1] === 'archive') {
        presenceData.details = '보관함'
        presenceData.state = '탐색 중'
      }
      else if (document.location.pathname === '/explore') {
        presenceData.details = '필터 검색 중'
        presenceData.state = Array.from(document.querySelectorAll('div.inline-flex span.flex-1')).map(a => a.textContent).join(', ')
      }
      else if (document.location.pathname.startsWith('/notices')) {
        presenceData.details = '공지사항'
        presenceData.state = '탐색 중'
      }
    }
  }
  else { // anilife.live
    if (document.location.pathname.split('/')[1] === 'h') {
      const videoData = document.querySelector('video')
      presenceData.name = document.querySelector('h2')?.textContent ?? '(로딩 중)'
      presenceData.details = document.querySelector('.entry-title')?.textContent?.replace(`${document.querySelector('h2')?.textContent} : `, ''); // get episode title
      [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestampsFromMedia(videoData!)
      presenceData.state = videoData?.paused ? '일시 정지됨' : '재생 중'
      presenceData.smallImageKey = videoData?.paused ? Assets.Pause : Assets.Play
      presenceData.smallImageText = videoData?.paused ? '일시 정지됨' : '재생 중'
    }
    else if (!await presence.getSetting('onlyvid')) {
      if (document.location.pathname === '/') {
        presenceData.details = '홈페이지'
        presenceData.state = '탐색 중'
      }
      else if (document.location.pathname === '/search') {
        presenceData.details = document.querySelector('.releases span')?.textContent ?? '(로딩 중)'
        presenceData.state = '탐색 중'
        presenceData.smallImageKey = Assets.Search
      }
      else if (['g', 'ani'].includes(document.location.pathname.split('/')[1] ?? ' ')) {
        presenceData.details = `${document.querySelector('.entry-title')?.textContent ?? '(로딩 중)'} 에피소드 목록`
        presenceData.state = '탐색 중'
      }
      else if (['/vodtype', '/quarter', '/genre', '/tag', '/studio'].includes(document.location.pathname ?? ' ')) {
        presenceData.details = document.querySelector('.releases span')?.textContent
        presenceData.state = '탐색 중'
      }
      else if (document.location.pathname.split('/')[2] === 'categorize') {
        presenceData.details = document.querySelector('.releases span')?.textContent?.split('|')[0] ?? '(로딩 중)'
        presenceData.state = '탐색 중'
      }
      else if (document.location.pathname === '/top') {
        presenceData.details = `${document.querySelector('.releases span')?.textContent ?? '(로딩 중)'} 목록`
        presenceData.state = '탐색 중'
      }
      else if (document.location.pathname === '/notice') {
        presenceData.details = '공지사항'
        presenceData.state = '탐색 중'
      }
    }
  }
  if (await presence.getSetting('hide')) { // hide using anilife
    if (!['play', 'h', 'search', 'results'].includes(document.location.pathname.split('/')[1] ?? ' '))
      presenceData.largeImageKey = Assets.Play
    if (['anilife', 'Anilife'].includes(presenceData.name ?? ' '))
      presenceData.name = '애니메이션'
  }
  presence.setActivity(presenceData)
})
