const presence = new Presence({
  clientId: '1357670002727325809',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://i.imgur.com/4MHJBOf.png',
}

const lvlImage: Record<number, string> = {
  0: 'https://i.imgur.com/mk9w9gX.png',
  1: 'https://i.imgur.com/DFpk9GA.png',
  2: 'https://i.imgur.com/o4pn0KG.png',
  3: 'https://i.imgur.com/K6El8nA.png',
  4: 'https://i.imgur.com/5uHNYBL.png',
  5: 'https://i.imgur.com/d4Q50LJ.png',
  6: 'https://i.imgur.com/QwGWiyd.png',
  7: 'https://i.imgur.com/qsAw7DV.png',
  8: 'https://i.imgur.com/FWYAWuz.png',
  9: 'https://i.imgur.com/SPgQtta.png',
  10: 'https://i.imgur.com/MHc5zkH.png',
  11: 'https://i.imgur.com/xdtTdVP.png',
}

presence.on('UpdateData', async () => {
  const rawpath = location.pathname
  const path = rawpath.split('/')
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  switch (path[1]) {
    case 'wargame':
      if (rawpath.includes('challenges')) {
        if (rawpath.includes('new')) {
          presenceData.details = '워게임 문제 출제 중'
        }
        else {
          const tag = document.querySelector(
            'div.tags',
          )!.textContent!.split(' ')[6]
          presenceData.details = `${tag} 분야의 워게임 푸는 중`
          presenceData.state = document.querySelector(
            '#challenge-info > h1',
          )!.textContent
          const level = document.querySelector(
            '#challenge-info > div.challenge-level > span',
          )!.textContent
          if (level?.includes('LEVEL')) {
            const levelNum = Number.parseInt(level.split(' ')[1] ?? '0')
            presenceData.smallImageKey = lvlImage[levelNum + 1]
            presenceData.smallImageText = `레벨 ${levelNum + 1}`
          }
          else {
            if (level === 'Unranked') {
              presenceData.smallImageKey = lvlImage[0]
              presenceData.smallImageText = 'Unranked'
            }
            else if (level === 'Beginner') {
              presenceData.smallImageKey = lvlImage[1]
              presenceData.smallImageText = 'Beginner'
            }
          }
        }
      }
      else {
        presenceData.details = '워게임 목록 보는 중'
      }
      break
    case 'lecture':
      if (path[2] === 'roadmaps') {
        if (path[3] === 'all') {
          presenceData.details = '로드맵 목록 보는 중'
        }
        else {
          presenceData.details = '로드맵 보는 중'
          presenceData.state = document.querySelector(
            '#roadmap-title > div.content > div.title',
          )!.textContent
        }
      }
      else if (path[2] === 'courses') {
        presenceData.details = '강의 정보 보는 중'
        presenceData.state = document.querySelector(
          '#course-title > div.content > div.course-title',
        )!.textContent
      }
      break
    case 'ctf':
      presenceData.details = 'CTF 문제 풀이 중'
      try {
        presenceData.state = document.querySelector(
          'div.ctf-title > div.title',
        )!.textContent
      }
      catch {
        presenceData.state = document.querySelector(
          'div.ctf-title',
        )!.textContent
      }
      break
    case 'users':
      presenceData.details = '유저 보는 중'
      presenceData.state = document.querySelector(
        'div.profile-user > div.profile-user-profile > a > span',
      )!.textContent
      break
    case 'board':
      presenceData.details = '공지사항 보는 중'
      break
    case 'forum':
      presenceData.details = '커뮤니티 보는 중'
      if (rawpath.includes('posts') || rawpath.includes('qna')) {
        presenceData.state = document.querySelector(
          '#__layout > div > main > div > div:nth-child(1) > div > div.header > div > div.left > div.title-wrapper > span',
        )!.textContent
      }
      break
    case 'ranking':
      presenceData.details = '랭킹 보는 중'
      break
    case 'mypage':
      presenceData.details = '마이페이지 보는 중'
      break
    case 'myaccount':
      presenceData.details = '계정 설정 보는 중'
      break
    case 'career':
      presenceData.details = '커리어 정보 보는 중'
      break
    case 'enterprise':
      presenceData.details = '기업 서비스 보는 중'
      break
    case '':
      presenceData.details = '홈페이지 보는 중'
      break
    default:
      presenceData.details = '그 외 페이지 보는 중'
      break
  }
  presence.setActivity(presenceData)
})
