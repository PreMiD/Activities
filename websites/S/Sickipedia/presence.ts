const presence = new Presence({
  clientId: '824726477936656424',
})
const data: {
  presenceData?: PresenceData
  privacyMode?: boolean
} = {}

presence.on('UpdateData', async () => {
  data.privacyMode = await presence.getSetting<boolean>('privacy')
  data.presenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/S/Sickipedia/assets/logo.jpg',
  }

  if (matchPage('/'))
    updateData('Viewing page:', 'Homepage', false)
  else if (matchPage('/pics'))
    updateData('Viewing page:', 'Memes and Pictures')
  else if (matchPage('/LeaderBoard'))
    updateData('Viewing page:', 'Leaderboard')
  else if (matchPage('/Upload/joke'))
    updateData('Viewing page:', 'Upload (Joke)')
  else if (matchPage('/upload/picture'))
    updateData('Viewing page:', 'Upload (Picture)')
  else if (matchPage('/message'))
    updateData('Viewing page:', 'Messages')
  else if (matchPage('/notification'))
    updateData('Viewing page:', 'Notifications')
  else if (matchPage('/Rules'))
    updateData('Viewing page:', 'Rules')
  else if (matchPage('/Announcement'))
    updateData('Viewing page:', 'Announcements')
  else if (matchPage('/account/register'))
    updateData('Viewing page:', 'Register')
  else if (matchPage('/account/login'))
    updateData('Viewing page:', 'Login')
  else if (matchPage('/account/ChangePassword'))
    updateData('Viewing page:', 'Change Password')
  else if (matchPage('/account/MergeAccount'))
    updateData('Viewing page:', 'Merge Account')
  else if (matchPage('/account/BlockedUser'))
    updateData('Viewing page:', 'Blocked users')
  else if (matchPage('/manage/ReportPost'))
    updateData('Viewing page:', 'Reported posts')
  else if (matchPage('/manage/profile'))
    updateData('Viewing page:', 'Manage Profile')
  else if (matchPage('/Faq'))
    updateData('Viewing page:', 'FAQ')
  else if (matchPage('/Terms'))
    updateData('Viewing page:', 'Terms and conditions')
  else if (matchPage('/Privacy'))
    updateData('Viewing page:', 'Privacy policy')
  else if (matchPage('/team'))
    updateData('Viewing page:', 'Sickipedia team')
  else if (matchPage('/ContactUs'))
    updateData('Viewing page:', 'Contact Us')

  if (matchPage(null, '/user/')) {
    updateData('Viewing profile:', window.location.pathname.split('/')[2])
  }
  else if (matchPage(null, '/joke/tag/')) {
    updateData(
      'Viewing a tag (Jokes):',
      window.location.pathname.split('/')[3],
    )
  }
  else if (matchPage(null, '/pics/tag/')) {
    updateData(
      'Viewing a tag (Images):',
      window.location.pathname.split('/')[3],
    )
  }
  else if (matchPage(null, '/joke/category/')) {
    updateData(
      'Viewing a category:',
      `ID: ${window.location.pathname.split('/')[3]}`,
    )
  }
  else if (matchPage(null, '/joke/subcategory/')) {
    updateData(
      'Viewing a subcategory:',
      `ID: ${window.location.pathname.split('/')[3]}`,
    )
  }
  else if (matchPage(null, '/joke/')) {
    updateData(
      'Viewing a joke:',
      `ID: ${window.location.pathname.split('/')[2]}`,
    )
  }
  else if (matchPage(null, '/pics/')) {
    updateData(
      'Viewing a picture:',
      `ID: ${window.location.pathname.split('/')[2]}`,
    )
  }
  presence.setActivity(data.presenceData)
})

function matchPage(href: string | null, option?: string) {
  if (
    window.location.pathname === href
    || (option
      && window.location.pathname.startsWith(option)
      && window.location.pathname.split('/')[2])
  ) {
    return true
  }
  else {
    return false
  }
}

function updateData(details?: string, state?: string, buttons = true) {
  if (buttons && !data.privacyMode && data.presenceData) {
    data.presenceData.buttons = [
      { label: 'View Page', url: window.location.href },
    ]
  }
  if (details && !data.privacyMode && data.presenceData)
    data.presenceData.details = details
  if (state && !data.privacyMode && data.presenceData)
    data.presenceData.state = state
  if (data.privacyMode) {
    data.presenceData = {
      ...data.presenceData,
      details: 'Privacy mode enabled',
      state: 'Content hidden',
    }
  }
}
