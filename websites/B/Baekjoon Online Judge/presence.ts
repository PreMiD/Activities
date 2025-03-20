import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1070240473945489418',
})
const path = location.pathname
const browsingTimestamp = Math.floor(Date.now() / 1000)

const tierImage: Record<number, string> = {
  0: 'https://cdn.rcd.gg/PreMiD/websites/B/Baekjoon%20Online%20Judge/assets/0.png',
  1: 'https://cdn.rcd.gg/PreMiD/websites/B/Baekjoon%20Online%20Judge/assets/1.png',
  2: 'https://cdn.rcd.gg/PreMiD/websites/B/Baekjoon%20Online%20Judge/assets/2.png',
  3: 'https://cdn.rcd.gg/PreMiD/websites/B/Baekjoon%20Online%20Judge/assets/3.png',
  4: 'https://cdn.rcd.gg/PreMiD/websites/B/Baekjoon%20Online%20Judge/assets/4.png',
  5: 'https://cdn.rcd.gg/PreMiD/websites/B/Baekjoon%20Online%20Judge/assets/5.png',
  6: 'https://cdn.rcd.gg/PreMiD/websites/B/Baekjoon%20Online%20Judge/assets/6.png',
  7: 'https://cdn.rcd.gg/PreMiD/websites/B/Baekjoon%20Online%20Judge/assets/7.png',
  8: 'https://cdn.rcd.gg/PreMiD/websites/B/Baekjoon%20Online%20Judge/assets/8.png',
  9: 'https://cdn.rcd.gg/PreMiD/websites/B/Baekjoon%20Online%20Judge/assets/9.png',
  10: 'https://cdn.rcd.gg/PreMiD/websites/B/Baekjoon%20Online%20Judge/assets/10.png',
  11: 'https://cdn.rcd.gg/PreMiD/websites/B/Baekjoon%20Online%20Judge/assets/11.png',
  12: 'https://cdn.rcd.gg/PreMiD/websites/B/Baekjoon%20Online%20Judge/assets/12.png',
  13: 'https://cdn.rcd.gg/PreMiD/websites/B/Baekjoon%20Online%20Judge/assets/13.png',
  14: 'https://cdn.rcd.gg/PreMiD/websites/B/Baekjoon%20Online%20Judge/assets/14.png',
  15: 'https://cdn.rcd.gg/PreMiD/websites/B/Baekjoon%20Online%20Judge/assets/15.png',
  16: 'https://cdn.rcd.gg/PreMiD/websites/B/Baekjoon%20Online%20Judge/assets/16.png',
  17: 'https://cdn.rcd.gg/PreMiD/websites/B/Baekjoon%20Online%20Judge/assets/17.png',
  18: 'https://cdn.rcd.gg/PreMiD/websites/B/Baekjoon%20Online%20Judge/assets/18.png',
  19: 'https://cdn.rcd.gg/PreMiD/websites/B/Baekjoon%20Online%20Judge/assets/19.png',
  20: 'https://cdn.rcd.gg/PreMiD/websites/B/Baekjoon%20Online%20Judge/assets/20.png',
  21: 'https://cdn.rcd.gg/PreMiD/websites/B/Baekjoon%20Online%20Judge/assets/21.png',
  22: 'https://cdn.rcd.gg/PreMiD/websites/B/Baekjoon%20Online%20Judge/assets/22.png',
  23: 'https://cdn.rcd.gg/PreMiD/websites/B/Baekjoon%20Online%20Judge/assets/23.png',
  24: 'https://cdn.rcd.gg/PreMiD/websites/B/Baekjoon%20Online%20Judge/assets/24.png',
  25: 'https://cdn.rcd.gg/PreMiD/websites/B/Baekjoon%20Online%20Judge/assets/25.png',
  26: 'https://cdn.rcd.gg/PreMiD/websites/B/Baekjoon%20Online%20Judge/assets/26.png',
  27: 'https://cdn.rcd.gg/PreMiD/websites/B/Baekjoon%20Online%20Judge/assets/27.png',
  28: 'https://cdn.rcd.gg/PreMiD/websites/B/Baekjoon%20Online%20Judge/assets/28.png',
  29: 'https://cdn.rcd.gg/PreMiD/websites/B/Baekjoon%20Online%20Judge/assets/29.png',
  30: 'https://cdn.rcd.gg/PreMiD/websites/B/Baekjoon%20Online%20Judge/assets/30.png',
  31: 'https://cdn.rcd.gg/PreMiD/websites/B/Baekjoon%20Online%20Judge/assets/31.png',
}

function getTierName(tierNumber: number): string {
  return `${
    ['루비', '다이아몬드', '플래티넘', '골드', '실버', '브론즈'][
      6 - Math.ceil(tierNumber / 5)
    ]
  } ${5 - ((tierNumber - 1) % 5)}`
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/B/Baekjoon%20Online%20Judge/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }

  switch (path.split('/')[1]) {
    case 'problemset': {
      if (path.includes('?sort=ranking_asc')) {
        presenceData.details = '페이지 보는 중'
        presenceData.state = '문제 순위'
      }
      else if (path.includes('?sort=no_asc&etc=bm')) {
        presenceData.details = '페이지 보는 중'
        presenceData.state = '북마크'
      }
      else {
        presenceData.details = '페이지 보는 중'
        presenceData.state = '전체 문제'
      }
      break
    }

    case 'category': {
      presenceData.details = '페이지 보는 중'
      presenceData.state = '문제 출처'
      break
    }

    case 'step': {
      presenceData.details = '페이지 보는 중'
      presenceData.state = '단계별로 풀어보기'
      break
    }

    case 'workbook': {
      if (path.includes('view')) {
        presenceData.details = '문제집 보는 중'
        presenceData.state = `${
          document.querySelector(
            'body > div.wrapper > div.container.content > div.row > div:nth-child(2) > div > h1 > span:nth-child(1)',
          )!.textContent
        } - ${
          document.querySelector(
            'body > div.wrapper > div.container.content > div.row > div:nth-child(2) > div > blockquote > a',
          )!.textContent
        }`
      }
      else {
        presenceData.details = '페이지 보는 중'
        presenceData.state = '문제집'
      }
      break
    }

    case 'contest': {
      if (path.includes('view')) {
        presenceData.details = '대회 보는 중'
        presenceData.state = document.querySelector(
          'body > div.wrapper > div.container.content > div > div.col-md-12 > div > h1',
        )!.textContent
      }
      else if (path.includes('board')) {
        presenceData.details = '스코어보드 보는 중'
        presenceData.state = document.querySelector(
          '#page-wrapper > div.row.border-bottom.white-bg > nav > div.navbar-header > a',
        )!.textContent
      }
      else {
        presenceData.details = '페이지 보는 중'
        presenceData.state = '대회'
      }
      break
    }

    case 'status': {
      presenceData.details = '페이지 보는 중'
      presenceData.state = '채점 현황'
      break
    }

    case 'problem': {
      if (path.includes('tags')) {
        presenceData.details = '페이지 보는 중'
        presenceData.state = '알고리즘 분류'
      }
      else if (path.includes('added')) {
        presenceData.details = '페이지 보는 중'
        presenceData.state = '추가된 문제'
      }
      else if (path.includes('status')) {
        presenceData.details = '페이지 보는 중'
        presenceData.state = '맞힌 사람'
      }
      else {
        presenceData.details = '문제 푸는 중'
        presenceData.state = `${
          document.querySelector(
            'body > div.wrapper > div.container.content > div.row > div:nth-child(3) > ul > li.active',
          )!.textContent
        } - ${document.querySelector('#problem_title')!.textContent}`

        const isTier = document.querySelector<HTMLImageElement>(
          'body > div.wrapper > div.container.content > div.row > div:nth-child(3) > ul > li.active > a > img',
        )
        if (isTier) {
          const tier = Number(isTier.src.split('/').pop()!.replace('.svg', ''))
          presenceData.smallImageKey = tierImage[tier]
          presenceData.smallImageText
            = tier !== 0 ? getTierName(tier) : 'Unrated'
        }
        else {
          presenceData.smallImageKey = Assets.Reading
          presenceData.smallImageText = '(티어 숨김)'
        }
      }
      break
    }

    case 'submit': {
      presenceData.details = '코드 제출 중'
      break
    }

    case 'user': {
      presenceData.details = '유저 보는 중'
      presenceData.state = document.querySelector(
        'body > div.wrapper > div.container.content > div.row > div:nth-child(1) > div > h1',
      )!.textContent
      break
    }

    case 'setting': {
      presenceData.details = '페이지 보는 중'
      presenceData.state = '설정'
      break
    }

    default: {
      presenceData.details = '페이지 보는 중'
      break
    }
  }

  presence.setActivity(presenceData)
})
