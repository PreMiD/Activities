import { Assets } from 'premid'

const presence = new Presence({
  clientId: '867795822711013387',
})
const strings = presence.getStrings({
  play: 'general.playing',
  pause: 'general.paused',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/%23/%EB%8C%80%EC%84%B1%EB%A7%88%EC%9D%B4%EB%A7%A5/assets/logo.png',
  }
  const { pathname } = document.location

  if (pathname.includes('/common/aquaplayer/')) {
    presenceData.details = document.querySelector('.lec_title')?.textContent
    presenceData.state = document.querySelector('#sel_lec option[selected]')?.textContent

    const video = document.querySelector<HTMLVideoElement>('#video-nplayer-1')

    if (video && !video.paused) {
      [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestampsfromMedia(video)
      presenceData.smallImageKey = Assets.Play
      presenceData.smallImageText = (await strings).play
    }
    else {
      delete presenceData.endTimestamp
      presenceData.smallImageKey = Assets.Pause
      presenceData.smallImageText = (await strings).pause
    }
  }
  else {
    presenceData.startTimestamp = browsingTimestamp

    if (pathname === '/main/main.ds' || pathname === '/') {
      presenceData.details = '홈 화면'
    }
    else if (pathname.includes('/myzone/mypage/index.ds')) {
      presenceData.details = '마이페이지'
    }
    else if (pathname.includes('/myzone/shoppingCartList.ds')) {
      presenceData.details = '장바구니'
    }
    else if (pathname.includes('/myzone/orderDeliveryList.ds')) {
      presenceData.details = '주문/배송조회'
    }
    else if (pathname.includes('/myzone/mypage/mylctr/myLctrList.ds')) {
      presenceData.details = '수강중인 강좌'
    }
    else if (pathname.includes('/myzone/mypage/mylctr/detail/myStudyingCourseDetail.ds')) {
      presenceData.details = document.querySelector('.teacher_home strong')?.textContent
      presenceData.state = document.querySelector('#prodNameDt')?.textContent
    }
    else if (pathname.includes('/myzone/mypage/mylctr/passPacLctrList.ds')) {
      presenceData.details = '강좌 신청하기'
    }
    else if (pathname.includes('/myzone/mypage/mylctr/bookPassList.ds')) {
      presenceData.details = '교재 신청하기'
    }
    else if (pathname.includes('/tcher/home/tcherHomeMain.ds')) {
      presenceData.details = '마이맥선생님'
    }
    else if (pathname.includes('/tcher/eachTcherMain.ds')) {
      const temp = document.querySelector('.tcher_modal')!.textContent!.split('\n') as [string, string]
      [presenceData.details, presenceData.state] = [
        temp[0].replace('영역', ' 영역'),
        temp[1].replace('선생님', ' 선생님'),
      ]
    }
    else if (pathname.includes('/myzone/mypage/myInfo/msgList.ds')) {
      presenceData.details = '쪽지'
    }
    else if (pathname.includes('/myzone/interestList.ds')) {
      presenceData.details = '관심리스트'
    }
    else if (pathname.includes('/myzone/learningMng/learningPlan.ds')) {
      presenceData.details = '학습 계획'
    }
    else if (pathname.includes('/myzone/learningMng/learningReport.ds')) {
      presenceData.details = '학습 리포트'
    }
    else if (pathname.includes('/myzone/mypage/mylctr/detail/bookMarkList.ds')) {
      presenceData.details = '북마크'
    }
    else if (pathname.includes('/myzone/mypage/correct/useCorrectList.ds')) {
      presenceData.details = '논술 첨삭 응시 및 첨삭조회'
    }
    else if (pathname.includes('/myzone/bbs/studyQnaList.ds')) {
      presenceData.details = '학습 Q&A'
    }
    else if (pathname.includes('/myzone/bbs/myQnaList.ds')) {
      presenceData.details = '고객센터 Q&A'
    }
    else if (pathname.includes('/event/eventIngList.ds')) {
      presenceData.details = '진행중인 이벤트'
    }
    else if (pathname.includes('/event/eventEndList.ds')) {
      presenceData.details = '종료된 이벤트'
    }
    else if (pathname.includes('/event/eventPrzwnList.ds')) {
      presenceData.details = '당첨자 발표'
    }
    else if (pathname.includes('/mockExmn/mockExmnMain.ds')) {
      presenceData.details = '모의고사'
    }
    else if (pathname.includes('/entexm/info/entexmMain.ds')) {
      presenceData.details = '입시정보'
    }
    else if (pathname.includes('/cust/custMain.ds')) {
      presenceData.details = '고객센터'
    }
    else if (pathname.includes('/cust/faqList.ds')) {
      presenceData.details = '대성마이맥 FAQ'
    }
    else if (pathname.includes('/cust/notiList.ds')) {
      presenceData.details = '고객센터 공지사항'
    }
    else if (pathname.includes('/main/getMainNoticeList.ds')) {
      presenceData.details = '대성마이맥 공지사항'
    }
    else if (pathname.includes('/cust/otoQna.ds')) {
      presenceData.details = '1:1 질문하기'
    }
    else if (pathname.includes('/cust/myQnaList.ds')) {
      presenceData.details = '나의 질문과 답변'
    }
    else if (pathname.includes('/guhae/guhaeMain.ds')) {
      presenceData.details = '구해'
    }
    else {
      presenceData.details = '진짜 공부는 지금부터'
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
