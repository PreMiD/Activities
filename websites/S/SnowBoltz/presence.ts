import { Assets } from 'premid'

const presence = new Presence({
  clientId: '666246771785334784',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)
const path = document.location.search

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/S/SnowBoltz/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }

  if (
    document.location.hostname.includes('shop.')
    || document.location.hostname === 'snowboltz.net'
  ) {
    if (path.includes('home')) {
      presenceData.details = 'กำลังดูที่หน้าหลัก..'
    }
    else if (path.includes('admin')) {
      presenceData.details = 'อยู่ที่หน้าเเอดมิน'
      presenceData.state = 'หน้าหลัก'
      if (path.includes('queue_group')) {
        presenceData.details = 'การเติมเเบบโอน'
        presenceData.state = 'หน้าหลัก'
        if (path.includes('id')) {
          presenceData.details = 'การเติมเเบบโอน'
          presenceData.state = document
            .querySelector(
              'body > main > div > section > div.container.shape-container.py-md-md > div > div.col-12.col-md-9.pl-md-0 > div > div.card-body > p:nth-child(6) > b',
            )
            ?.textContent
            ?.replace('สมาชิกหมายเลข', 'ของหมายเลข ')
            ?? 'ไม่ทราบสมาชิก'
          presenceData.smallImageKey = Assets.Reading
        }
      }
      else if (path.includes('queue_idpass')) {
        presenceData.details = 'การเติมเเบบหรัส'
        presenceData.state = 'หน้าหลัก'
        if (path.includes('&id=')) {
          presenceData.details = 'การเติมเเบบหรัส'
          presenceData.state = document
            .querySelector(
              'body > main > div > section > div.container.shape-container.py-md-md > div > div.col-12.col-md-9.pl-md-0 > div > div.card-body > p:nth-child(7) > b',
            )
            ?.textContent
            ?.replace('สมาชิกหมายเลข', 'ของหมายเลข ')
            ?? 'ไม่ทราบสมาชิก'
          presenceData.smallImageKey = Assets.Reading
        }
      }
      else if (path.includes('queue_wallet')) {
        presenceData.details = 'ตรวจสอบการโอนเงิน'
        presenceData.state = 'หน้าหลัก'
        if (path.includes('id')) {
          presenceData.details = 'ตรวจสอบการโอนเงิน'
          presenceData.state = document
            .querySelector(
              'body > main > div > section > div.container.shape-container.py-md-md > div > div.col-12.col-md-9.pl-md-0 > div > div.card-body > p:nth-child(3) > b',
            )
            ?.textContent
            ?.replace('สมาชิกหมายเลข', 'ของหมายเลข ')
            ?? 'ไม่ทราบสมาชิก'
          presenceData.smallImageKey = Assets.Reading
        }
      }
      else if (path.includes('man_user')) {
        presenceData.details = 'จัดการสมาชิก'
        presenceData.state = 'หน้าหลัก'
        if (path.includes('id')) {
          presenceData.details = 'จัดการสมาชิก'
          presenceData.state = document
            .querySelector(
              'body > main > div > section > div.container.shape-container.py-md-md > div > div.col-12.col-md-9.pl-md-0 > div > div.card-body > div > h4',
            )
            ?.textContent
            ?.replace('สมาชิกหมายเลข', 'ของหมายเลข ')
            ?? 'ไม่ทราบสมาชิก'
          presenceData.smallImageKey = Assets.Reading
        }
      }
      else if (path.includes('man_random')) {
        presenceData.details = 'จัดการวงล้อ'
        presenceData.state = 'หน้าหลัก'
      }
      else if (path.includes('man_coupon')) {
        presenceData.details = 'จัดการคูปอง'
        presenceData.state = 'หน้าหลัก'
      }
      else if (path.includes('cfg_topup')) {
        presenceData.details = 'จัดการการเติมเงิน'
        presenceData.state = 'หน้าหลัก'
      }
      else if (path.includes('cfg_group')) {
        presenceData.details = 'จัดการการเติมเเบบกลุ่ม'
        presenceData.state = 'หน้าหลัก'
      }
      else if (path.includes('cfg_idpass')) {
        presenceData.details = 'จัดการการเติมเเบบหรัส'
        presenceData.state = 'หน้าหลัก'
      }
      else if (path.includes('history')) {
        presenceData.details = 'ประวัติการเงิน'
        presenceData.state = 'หน้าหลัก'
        presenceData.smallImageKey = Assets.Reading
      }
    }
    else if (path.includes('robux_group')) {
      presenceData.details = 'กำลังซื้อสินค้า'
      presenceData.state = `เเบบกลุ่ม - ${
        document.querySelector(
          'body > main > div > section > div.container.shape-container.d-flex.align-items-center.py-lg > div > div > div:nth-child(1) > div > div > div > b:nth-child(1) > span',
        )?.textContent ?? '0'
      } R$`
    }
    else if (path.includes('robux_idpass')) {
      presenceData.details = 'กำลังซื้อสินค้า'
      presenceData.state = 'เเบบหรัส'
    }
    else if (path.includes('luckybox')) {
      presenceData.details = 'กำลังสุ่มวงล้อ..'
    }
    else if (path.includes('coupon')) {
      presenceData.details = 'กำลังรอใส่คูปอง..'
    }
    else if (path.includes('topup')) {
      presenceData.details = 'กำลังเติมเงิน'
      presenceData.state = 'กำลังเลือกช่องทาง'
      if (path.includes('topup_tmn')) {
        presenceData.details = 'กำลังเติมเงิน'
        presenceData.state = 'ผ่านบัตรเงินสด'
      }
      else if (path.includes('topup_wallet')) {
        presenceData.details = 'กำลังเติมเงิน'
        presenceData.state = 'ผ่านวอเลท'
      }
    }
    else if (path.includes('queue')) {
      presenceData.details = 'ตรวจสอบคิว'
      presenceData.smallImageKey = Assets.Reading
    }
    else if (path.includes('history')) {
      presenceData.details = 'ตรวจสอบการใช้จ่าย'
      presenceData.smallImageKey = Assets.Reading
    }
    else if (path.includes('profile')) {
      presenceData.details = 'หน้าโปรไฟล์'
      presenceData.smallImageKey = Assets.Reading
    }
    else if (path.includes('login')) {
      presenceData.details = 'กำลังล็อกอิน..'
    }
    else if (path.includes('register')) {
      presenceData.details = 'กำลังสมัครใช้งาน..'
    }
    else {
      presenceData.details = 'SnowBoltz - ร้านเติมโรบัค'
      presenceData.state = 'ซื้อโรบัคราคาถูกเรทสูงง่ายๆ'
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
