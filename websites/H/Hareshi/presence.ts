import { Assets } from 'premid'

const presence = new Presence({
  clientId: '944271713997324339',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

let page: string

presence.on('UpdateData', async () => {
  const [timestamps, privacy, buttons] = await Promise.all([
    presence.getSetting<boolean>('timestamps'),
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('buttons'),
  ])
  const pathArray = document.location.toString().split('/')
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/H/Hareshi/assets/logo.jpg',
    details: 'หน้าแรก',
    startTimestamp: browsingTimestamp,
  }
  const { hostname, href, search } = document.location
  if (hostname === 'forum.hareshi.net') {
    switch (pathArray[3]) {
      case 'forums':
        page = 'ฟอรั่ม'
        if (privacy) {
          presenceData.details = 'กำลังอ่านฟอรั่ม'
        }
        else {
          presenceData.details = document.querySelector(
            '#top > div.p-body > div > div:nth-child(2) > div > ul',
          )?.textContent ?? 'ไม่พบข้อมูล'
          presenceData.state = document.querySelector(
            '#top > div.p-body-header > div > div > div.p-title > h1',
          )?.textContent ?? 'ไม่พบข้อมูล'
        }
        break
      case 'threads':
        page = 'เธรด'
        presenceData.details = 'เธรด'
        if (!privacy) {
          presenceData.state = document.querySelector(
            '#top > div.p-body-header > div > div > div.p-title > h1',
          )?.textContent ?? 'ไม่พบข้อมูล'
        }
        break
      case 'whats-new':
        presenceData.details = 'มีอะไรใหม่ ?'
        presenceData.smallImageKey = Assets.Question
        if (!privacy && pathArray[4]) {
          presenceData.smallImageKey = Assets.Reading
          switch (pathArray[4]) {
            case 'posts':
              presenceData.smallImageText = 'ดูโพสต์ใหม่'
              break
            case 'profile-posts':
              presenceData.smallImageText = 'สเตตัสส่วนตัวใหม่'
              break
            case 'news-feed':
              presenceData.smallImageText = 'ฟีดข่าวของคุณ'
              break
            case 'latest-activity':
              presenceData.smallImageText = 'เคลื่อนไหวล่าสุด'
              break
          }
        }
        break
      case 'members':
        presenceData.details = 'สมาชิก'
        if (!privacy && pathArray[5]) {
          presenceData.smallImageKey = Assets.Reading
          switch (pathArray[5]) {
            case '#latest-activity':
              presenceData.smallImageText = 'เคลื่อนไหวล่าสุด'
              break
            case '#recent-content':
              presenceData.smallImageText = 'โพสต์ทั้งหมด'
              break
            case '#about':
              presenceData.smallImageText = 'เกี่ยวกับ'
              break
            default:
              presenceData.smallImageText = 'ข้อความเยี่ยมชม'
              break
          }
        }
        break
      case 'search':
        if (privacy) {
          presenceData.details = 'ค้นหาอะไรบางอย่าง...'
        }
        else {
          presenceData.details = 'ค้นหา'
          presenceData.state = document.querySelector(
            '#top > div.p-body-header > div > div > div > h1 > a > em',
          )?.textContent ?? 'ไม่พบข้อมูล'
        }
        presenceData.smallImageKey = Assets.Search
        break
      default:
        presenceData.details = 'ฟอรั่ม'
        break
    }
    if (!privacy && pathArray[4] === 'find-source') {
      presenceData.smallImageKey = Assets.Reading
      switch (search) {
        case '?order=reply_count':
          presenceData.smallImageText = 'ยอดนิยม'
          break
        case '?order=post_date':
          presenceData.smallImageText = 'ใหม่สุด'
          break
        case '?unanswered=1':
          presenceData.smallImageText = 'ยังไม่มีคำตอบ'
          break
        case '?your_questions=1':
          presenceData.smallImageText = 'คำถามของคุณ'
          break
        case '?unsolved=1':
          presenceData.smallImageText = 'ยังไม่ถูกแก้'
          break
        case '?your_answers=1':
          presenceData.smallImageText = 'คำตอบของคุณ'
          break
        default:
          presenceData.smallImageText = 'อัปเดตล่าสุด'
          break
      }
    }
    if (buttons && page) {
      presenceData.buttons = [
        {
          label: `ดู${page}`,
          url: href.replace(/#\d+/, ''),
        },
      ]
    }
  }
  else {
    switch (pathArray[3]) {
      case 'browse':
        presenceData.details = 'เรียกดู'
        if (pathArray[4] === 'anime') {
          presenceData.state = document.querySelector('#anipop')?.textContent ?? 'ไม่พบข้อมูล'
        }
        else {
          presenceData.state = document.querySelector(
            '#__layout > div > div > div > div.container > h1',
          )?.textContent ?? 'ไม่พบข้อมูล'
        }
        break
      case 'calendar':
        presenceData.details = 'ตารางออกอากาศ'
        break
    }
  }
  if (!timestamps) {
    delete presenceData.startTimestamp
    delete presenceData.endTimestamp
  }
  if (privacy) {
    delete presenceData.state
    delete presenceData.buttons
  }
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
