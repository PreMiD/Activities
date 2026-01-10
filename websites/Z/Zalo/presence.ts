import { ActivityType } from 'premid'

const presence = new Presence({
  clientId: '1443279192392208677',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/Z/Zalo/assets/logo.png',
}

presence.on('UpdateData', async () => {
  // Create the base presence data
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    type: ActivityType.Competing,
    startTimestamp: browsingTimestamp,
  }

  // Mặc định để Zalo Web nếu
  // 1. Vừa mở web, chưa chọn chat
  // 2. Đang mở danh bạ
  if (document.querySelector('main') != null) {
    // Custom field 1 hoặc set default
    const enableCustomText = await presence.getSetting<boolean>('btnCustomText')
    const customText = await presence.getSetting<string>('customText')
    presenceData.details = enableCustomText ? customText : `In Chat`

    // Loại tin nhắn (cá nhân/nhóm/nhóm cộng đồng)
    const currChatType = document.querySelector('.chat-info__header__title > span')?.getAttribute('data-translate-inner')
    // STR_CONVERSATION_INFO // Chat cá nhân
    // STR_PROFILE_GROUP // Nhóm thường
    // STR_COMMUNITY_PROFILE_GROUP // Nhóm cộng đồng (Nhóm đã nâng cấp bằng tài khoản Business)
    if (currChatType === 'STR_CONVERSATION_INFO') {
      presenceData.state = `Chat cá nhân`
    }

    else {
      // memberCount có dạng "x thành viên",
      const memberCount = document.querySelector('.chat-info-general__item--title')?.textContent
      if (currChatType === 'STR_PROFILE_GROUP') {
        presenceData.state = `Nhóm có ${memberCount}`
      }
      else {
        presenceData.state = `Cộng đồng có ${memberCount}`
      }
    }
  }

  else {
    presenceData.details = `Zalo Web`
    delete presenceData.state
  }

  // Set the activity
  if (presenceData.details) {
    presence.setActivity(presenceData)
  }

  else {
    presence.clearActivity()
  }
})
