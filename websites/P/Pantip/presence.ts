import { Assets } from 'premid'

const presence = new Presence({
  clientId: '714416728448434218',
})
// Const thing
const browsingTimestamp = Math.floor(Date.now() / 1000)
const tag1 = document.querySelector(
  '#__next > div > div > div:nth-child(4) > div > div > nav > div > a:nth-child(2)',
)?.textContent ?? 'เเท็กที่ไม่ทราบ'
const forum1 = document.querySelector(
  '#__next > div > div > div:nth-child(4) > div > div > nav > div > a',
)?.textContent ?? 'ห้องที่ไม่ทราบ'
const topic1 = document.querySelector('head > title')?.textContent ?? 'หัวข้อที่ไม่ทราบ'
const message1 = document.querySelector(
  '#main-body-content > div.content > div.container-outer.container-liquid > div.display-post-wrapper.main-post.main-post-msg > div > div:nth-child(1) > h2',
)?.textContent ?? 'ไม่ทราบข้อความ'
const club1 = document.querySelector(
  '#main-body-content > div.content > div.container-wrap.bottombdr.bottomspc > div > div > ul > li',
)?.textContent ?? 'คลับที่ไม่ทราบ'
const path = document.location

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/P/Pantip/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }

  // Presence
  if (
    path.hostname === 'pantip.com'
    || path.hostname.includes('([a-z0-9-]+[.])*')
  ) {
    if (document.location.pathname === '/') {
      presenceData.details = 'หน้าหลัก'
    }
    else if (path.pathname.includes('index.php')) {
      presenceData.details = 'หน้าหลัก'
    }
    else if (path.pathname.includes('tags')) {
      presenceData.details = 'เเท็ก '
      if (path.pathname.includes('#myfollowing'))
        presenceData.details = 'ที่ติดตาม'
      else if (path.pathname.includes('#tags'))
        presenceData.details = 'ทั้งหมด'
    }
    else if (path.pathname.includes('tag')) {
      presenceData.details = 'เเท็ก '
      presenceData.state = tag1
    }
    else if (path.pathname.includes('notifications')) {
      presenceData.details = 'การเเจ้งเตือน '
    }
    else if (path.pathname.includes('new_topic')) {
      presenceData.details = 'กำลังตั้งกระทู้ใหม่ '
    }
    else if (path.pathname.includes('forum')) {
      presenceData.details = 'ห้อง '
      presenceData.state = forum1
    }
    else if (path.pathname.includes('search')) {
      presenceData.details = 'กำลังค้นหา '
      presenceData.state = document.querySelector('#search-text')?.getAttribute('value')
        ?? 'ไม่ทราบการค้นหา'
      presenceData.smallImageKey = Assets.Search
    }
    else if (path.pathname.includes('topic')) {
      presenceData.details = 'กำลังอ่าน '
      presenceData.state = topic1
      presenceData.smallImageKey = Assets.Reading
    }
    else if (path.pathname.includes('tos')) {
      presenceData.details = 'กำลังอ่าน '
      presenceData.state = 'กฎ กติกา และมารยาท'
      presenceData.smallImageKey = Assets.Reading
    }
    else if (path.pathname.includes('defamation')) {
      presenceData.details = 'กำลังอ่าน '
      presenceData.state = 'การโพสต์ความคิดเห็นที่เข้าข่าย หมิ่นประมาท'
      presenceData.smallImageKey = Assets.Reading
    }
    else if (path.pathname.includes('privacy')) {
      presenceData.details = 'กำลังอ่าน '
      presenceData.state = 'นโยบายเกี่ยวกับข้อมูลส่วนบุคคล'
      presenceData.smallImageKey = Assets.Reading
    }
    else if (path.pathname.includes('contect')) {
      presenceData.details = 'กำลังอ่าน '
      presenceData.state = 'ติดต่อทีมงานพันทิป'
      presenceData.smallImageKey = Assets.Reading
    }
    else if (path.pathname.includes('login')) {
      presenceData.details = 'กำลังเข้าสู่ระบบ '
    }
    else if (path.pathname.includes('register_member')) {
      presenceData.details = 'กำลังสมัครใช้งาน '
    }
    else if (path.pathname.includes('activities')) {
      presenceData.details = 'กิจกรรม '
    }
    else if (path.href.includes('profile')) {
      presenceData.details = 'กำลังดูโปรไฟล์'
      if (path.href.includes('#topics')) {
        presenceData.details = 'กำลังดูโปรไฟล์'
        presenceData.state = 'กระทู้ที่สร้าง'
      }
      else if (path.href.includes('#comments')) {
        presenceData.details = 'กำลังดูโปรไฟล์'
        presenceData.state = 'กระทู้ที่ตอบ'
      }
      else if (path.href.includes('#bookmarks')) {
        presenceData.details = 'กำลังดูโปรไฟล์'
        presenceData.state = 'กระทู้ที่ชอบ'
      }
      else if (path.href.includes('#history')) {
        presenceData.details = 'กำลังดูโปรไฟล์'
        presenceData.state = 'กระทู้ที่เคยอ่าน'
      }
      else if (path.href.includes('#pantip_point')) {
        presenceData.details = 'กำลังดูโปรไฟล์'
        presenceData.state = 'คะเเนนพันทิป'
      }
      else if (path.href.includes('#my_following')) {
        presenceData.details = 'กำลังดูโปรไฟล์'
        presenceData.state = 'เเท็กที่ติดตาม'
      }
      else if (path.href.includes('#blogs')) {
        presenceData.details = 'กำลังดูโปรไฟล์'
        presenceData.state = 'บล็อกเเก้ง'
      }
      else if (path.pathname.includes('settings')) {
        presenceData.details = 'จัดการข้อมูลส่วนตัว '
      }
    }
    else if (path.pathname.includes('message')) {
      presenceData.details = 'กล่องข้อความ '
      if (path.href.includes('#outbox')) {
        presenceData.details = 'ข้อความที่ส่งเเล้ว '
      }
      else if (path.href.includes('#unblock')) {
        presenceData.details = 'สมาชิกที่ถูกบล็อค '
      }
      else if (path.href.includes('#inbox')) {
        presenceData.details = 'กล่องข้อความ '
      }
      else if (path.href) {
        presenceData.details = 'อยู่ในสนทนา '
        presenceData.state = message1
      }
    }
    else if (path.pathname.includes('club')) {
      presenceData.details = 'รายชื่อ Club'
      if (path.pathname.includes('new_topic')) {
        presenceData.details = 'กำลังตั้งกระทู้ใหม่ใน Club'
        presenceData.state = club1
      }
      else if (path.href) {
        presenceData.details = 'กำลังดูใน Club'
        presenceData.state = club1
      }
    }
    else if (path.href) {
      presenceData.details = 'หน้าที่ไม่ทราบ'
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
