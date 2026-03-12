const presence = new Presence({
  clientId: '1001436152873623683',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const [privacyMode, showActiveChatAvatar] = await Promise.all([
    presence.getSetting<boolean>('privacyMode'),
    presence.getSetting<boolean>('showActiveChatAvatar'),
  ])
  const presenceData: PresenceData = {
    details: 'Other',
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/S/Snapchat/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const activeChat = document.querySelector<HTMLDivElement>(
    '.deg2K div.O4POs.qFDXZ',
  )
  const activeChatUsername = activeChat?.querySelector<HTMLSpanElement>(
    'span.mYSR9 > span.FiLwP',
  )?.textContent

  if (activeChatUsername) {
    const avatar = activeChat?.querySelector<HTMLImageElement>('img.Dozhe')?.src
    const snapStreak = activeChat?.querySelectorAll('div.ovUsZ > span')[4]?.textContent

    presenceData.details = 'Chatting with'
    presenceData.state = !privacyMode ? activeChatUsername : 'somebody'

    if (!privacyMode && snapStreak)
      presenceData.state += ` | ${snapStreak}`

    if (showActiveChatAvatar && avatar) {
      presenceData.largeImageKey = avatar
      presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/S/Snapchat/assets/logo.png'
    }
  }

  if (presenceData.details && window.location.pathname.split('/')[1])
    presence.setActivity(presenceData)
  else presence.setActivity()
})
