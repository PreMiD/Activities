import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1357670002727325809',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets { // Other default assets can be found at index.d.ts
  Logo = 'https://i.imgur.com/rn6TkM4.png',
}

presence.on('UpdateData', async () => {
  var rawpath = location.pathname
  var path = rawpath.split('/')
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  switch (path[1]) {
    case 'wargame':
      if(rawpath.includes("challenges")) {
        presenceData.details = '워게임 푸는 중'
        presenceData.state = document.querySelector(
            '#challenge-info > h1'
        )!.textContent
      }
      else{
        presenceData.details = '워게임 목록 보는 중'
      }
      break
    case 'lecture':
      if(path[2] === 'roadmaps') {
        if(path[3] === 'all'){
          presenceData.details = '로드맵 목록 보는 중'
        }
        else{
          presenceData.details = '로드맵 보는 중'
          presenceData.state = document.querySelector(
              "#roadmap-title > div.content > div.title"
          )!.textContent
        }
      }
      else if(path[2] === 'cources') {
        presenceData.details = '강의 정보 보는 중'
        presenceData.state = document.querySelector(
            "#course-title > div.content > div.course-title"
        )!.textContent
      }
      break
    case 'ctf':
      presenceData.details = "CTF 문제 풀이 중"
      presenceData.state = document.querySelector(
          "#ctf-title > div"
      )!.textContent
      break
    case 'users':
      presenceData.details = '유저 보는 중'
      presenceData.state = document.querySelector(
          "#mypage-profile > section > div.profile-user > div.profile-user-profile > a > span"
      )!.textContent
      break
    case 'board':
      presenceData.details = '페이지 보는 중'
      presenceData.state = '공지사항'
      break
    case 'forum':
      presenceData.details = '커뮤니티 보는 중'
      if(rawpath.includes("posts")){
        presenceData.state = document.querySelector(
          "#__layout > div > main > div > div:nth-child(1) > div > div.header > div > div.left > div.title-wrapper > span"
        )!.textContent
      }
      else{
        presenceData.state = '목록'
      }
      break
    case 'ranking':
      presenceData.details = '랭킹 보는 중'
      break
    case 'mypage':
      presenceData.details = '마이페이지 보는 중'
      break
    default:
      presenceData.details = '페이지 보는 중'
      break
  }
  presence.setActivity(presenceData)
})
