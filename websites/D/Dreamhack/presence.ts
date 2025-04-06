const presence = new Presence({
  clientId: '1357670002727325809',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://i.imgur.com/4MHJBOf.png',
}

const lvlImages: Record<string, string> = {
  1: 'https://i.imgur.com/TjnuwDc.png',
  2: 'https://i.imgur.com/xiirapz.png',
  3: 'https://i.imgur.com/R4z9ePH.png',
  4: 'https://i.imgur.com/AdJNjRt.png',
  5: 'https://i.imgur.com/KnUq4x0.png',
  6: 'https://i.imgur.com/iHY3vtb.png',
  7: 'https://i.imgur.com/LKbiyIr.png',
  8: 'https://i.imgur.com/r1RKlw5.png',
  9: 'https://i.imgur.com/0i82Y3N.png',
  10: 'https://i.imgur.com/POpSfD1.png',
  Unranked: 'https://i.imgur.com/OmW5Nj3.png',
  Beginner: 'https://i.imgur.com/LnW9Oiw.png',
}

presence.on('UpdateData', async () => {
  const rawpath = location.pathname
  const path = rawpath.split('/')
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  if (location.hostname === 'learn.dreamhack.io') {
    if (path[1] === 'quiz') {
      presenceData.details = '퀴즈 푸는 중'
      presenceData.state = document.querySelector(
        'div.quiz-title-wrapper',
      )!.textContent
    }
    else {
      presenceData.details = '학습 페이지 보는 중'
      presenceData.state = document.querySelector(
        'div.course-title-wrapper',
      )!.textContent
    }
  }
  else {
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
              '.level',
            )!.textContent
            if (level?.includes('LEVEL')) {
              const levelNum = Number.parseInt(level.split(' ')[1] ?? '0')
              presenceData.smallImageKey = lvlImages[levelNum]
              presenceData.smallImageText = `레벨 ${levelNum}`
            }
            else if (level === 'Unranked') {
              presenceData.smallImageKey = lvlImages.Unranked
              presenceData.smallImageText = 'Unranked'
            }
            else if (level === 'Beginner') {
              presenceData.smallImageKey = lvlImages.Beginner
              presenceData.smallImageText = 'Beginner'
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
  }
  presence.setActivity(presenceData)
})
