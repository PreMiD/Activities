const presence = new Presence({
  clientId: '1357670002727325809',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/D/Dreamhack/assets/logo.png',
}

const lvlImages: Record<string, string> = {
  1: 'https://cdn.rcd.gg/PreMiD/websites/D/Dreamhack/assets/0.png',
  2: 'https://cdn.rcd.gg/PreMiD/websites/D/Dreamhack/assets/1.png',
  3: 'https://cdn.rcd.gg/PreMiD/websites/D/Dreamhack/assets/2.png',
  4: 'https://cdn.rcd.gg/PreMiD/websites/D/Dreamhack/assets/3.png',
  5: 'https://cdn.rcd.gg/PreMiD/websites/D/Dreamhack/assets/4.png',
  6: 'https://cdn.rcd.gg/PreMiD/websites/D/Dreamhack/assets/5.png',
  7: 'https://cdn.rcd.gg/PreMiD/websites/D/Dreamhack/assets/6.png',
  8: 'https://cdn.rcd.gg/PreMiD/websites/D/Dreamhack/assets/7.png',
  9: 'https://cdn.rcd.gg/PreMiD/websites/D/Dreamhack/assets/8.png',
  10: 'https://cdn.rcd.gg/PreMiD/websites/D/Dreamhack/assets/9.png',
  Unranked: 'https://cdn.rcd.gg/PreMiD/websites/D/Dreamhack/assets/10.png',
  Beginner: 'https://cdn.rcd.gg/PreMiD/websites/D/Dreamhack/assets/11.png',
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
        if (await presence.getSetting('hideWargame')) {
          presence.clearActivity()
        }
        else if (rawpath.includes('challenges')) {
          if (rawpath.includes('new')) {
            presenceData.details = '워게임 문제 출제 중'
          }
          else {
            const tag = document
              .querySelector('div.tags')!
              .textContent!.split(' ')[6]
            presenceData.details = `${tag} 분야의 워게임 푸는 중`
            presenceData.state = document.querySelector(
              '#challenge-info > h1',
            )!.textContent
            presenceData.buttons = [
              {
                label: '해당 워게임 풀기',
                url: `https://dreamhack.io${rawpath}`,
              },
            ]
            const level = document.querySelector('.level')!.textContent
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
        if (await presence.getSetting('hideLecture')) {
          presence.clearActivity()
        }
        if (path.length < 3) {
          presenceData.details = '학습 목록 보는 중'
        }
        else if (path[2] === 'paths') {
          presenceData.details = 'Path 보는 중'
          presenceData.state = document.querySelector(
            'div.path-detail-basic > div.path-title',
          )!.textContent
        }
        else if (path[2] === 'units') {
          presenceData.details = 'Unit 보는 중'
          presenceData.state = document.querySelector(
            'div.unit-information > div.title',
          )!.textContent
        }
        break
      case 'ctf':
        if (await presence.getSetting('hideCTF')) {
          presence.clearActivity()
        }
        else {
          presenceData.details = 'CTF 문제 풀이 중'
          try {
            presenceData.state = document.querySelector(
              'div.ctf-title > div.title',
            )!.textContent
          }
          catch {
            presenceData.state = document.querySelector('div.ctf-title')!.textContent
          }
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
        presenceData.state = document.querySelector(
          'div.main-section > div > h3',
        )!.textContent
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
        break
    }
  }
  presence.setActivity(presenceData)
})
