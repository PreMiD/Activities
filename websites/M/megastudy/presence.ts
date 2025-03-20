import { Assets } from 'premid'

const presence = new Presence({
  clientId: '865625724911616050',
})
const strings = presence.getStrings({
  play: 'general.playing',
  pause: 'general.paused',
})
let video = {
  isPlayerPlaying: false,
  currentTime: 0,
  duration: 0,
}
const browsingTimestamp = Math.floor(Date.now() / 1000)

let isTitleChecked = false
let title: string | null | undefined

presence.on(
  'iFrameData',
  (data: unknown) => {
    video = data as typeof video
  },
)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/M/megastudy/assets/logo.png',
  }

  if (document.location.pathname.includes('Player')) {
    presenceData.details = document.querySelector('.txt')?.textContent

    if (!isTitleChecked) {
      try {
        title = document.querySelector('tr.on td')?.textContent
        isTitleChecked = true
      }
      catch {
        title = '[수강정보]를 클릭하여 주세요'
      }
    }

    presenceData.state = title

    if (video.isPlayerPlaying) {
      [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(video.currentTime, video.duration)
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

    if (
      document.location.pathname === '/megastudy.asp'
      || document.location.pathname === '/'
    ) {
      presenceData.details = '홈 화면'
    }
    else if (document.location.pathname.includes('my_std_room/main.asp')) {
      presenceData.details = '내 강의실'
    }
    else if (document.location.pathname.includes('my_std_room/detail.asp')) {
      presenceData.details = document.querySelector('.name')?.textContent
      presenceData.state = document.querySelector('h4')?.textContent
    }
    else if (
      document.location.pathname.includes('/teacher_v2/teacher_main.asp')
    ) {
      presenceData.details = '메가선생님'
    }
    else if (document.location.pathname.includes('/teacher_v2/main.asp')) {
      [presenceData.details, presenceData.state] = document.querySelector('.lnb_tit')
        ?.textContent
        ?.split('\n') ?? []
    }
    else if (
      document.location.pathname.includes('/Mypage/mp_2017/main/main.asp')
    ) {
      presenceData.details = '마이페이지'
    }
    else if (
      document.location.pathname.includes('/mypage/mp_2017/notice/list.asp')
    ) {
      presenceData.details = '알림'
    }
    else if (
      document.location.pathname.includes(
        '/Mypage/mp_2017/apply/chr_new/main.asp',
      )
    ) {
      presenceData.details = '수강신청'
    }
    else if (
      document.location.pathname.includes(
        '/mypage/mp_2017/pay/cart/cart_list.asp',
      )
    ) {
      presenceData.details = '장바구니'
    }
    else if (
      document.location.pathname.includes(
        '/mypage/mp_2017/order/order_list.asp',
      )
    ) {
      presenceData.details = '주문/배송조회'
    }
    else {
      presenceData.details = '합격 불변의 법칙'
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
