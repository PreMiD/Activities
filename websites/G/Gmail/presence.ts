const presence = new Presence({
  clientId: '808667100319186964',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

async function getStrings() {
  return presence.getStrings(
    {
      categoryPrimary: 'gmail.categoryPrimary',
      categorySocial: 'gmail.categorySocial',
      categoryUpdates: 'gmail.categoryUpdates',
      categoryPromotions: 'gmail.categoryPromotions',
      categoryForum: 'gmail.categoryForum',
      inLabel: 'gmail.inLabel',
      generalSettings: 'gmail.generalSettings',
      labelSettings: 'gmail.labelSettings',
      inboxSettings: 'gmail.inboxSettings',
      accountSetting: 'gmail.accountSetting',
      filterSettings: 'gmail.filterSettings',
      fwdAndPOPSettings: 'gmail.fwdAndPOPSettings',
      addonsSettings: 'gmail.addonsSettings',
      chatSettings: 'gmail.chatSettings',
      advancedSettings: 'gmail.advancedSettings',
      offlineSettings: 'gmail.offlineSettings',
      themesSettings: 'gmail.themesSettings',
      lookingForEmail: 'gmail.lookingForEmail',
      viewingEmail: 'gmail.viewingEmail',
      viewingStarredEmails: 'gmail.viewingStarredEmails',
      viewingSentEmails: 'gmail.viewingSentEmails',
      viewingSnoozedEmails: 'gmail.viewingSnoozedEmails',
      viewingDrafts: 'gmail.viewingDrafts',
      viewingImportantEmails: 'gmail.viewingImportantEmails',
      viewingTrash: 'gmail.viewingTrash',
      viewingChats: 'gmail.viewingChats',
      viewingScheduled: 'gmail.viewingScheduled',
      viewingSpam: 'gmail.viewingSpam',
      viewingAllEmails: 'gmail.viewingAllEmails',
      composingEmail: 'gmail.composingEmail',
    },

  )
}

let strings: Awaited<ReturnType<typeof getStrings>>
let oldLang: string | null = null

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/G/Gmail/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const path = window.location.href
  const [newLang, privacy, time] = await Promise.all([
    presence.getSetting<string>('lang').catch(() => 'en'),
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('time'),
  ])

  if (!time)
    delete presenceData.startTimestamp
  if (oldLang !== newLang || !strings) {
    oldLang = newLang
    strings = await getStrings()
  }

  const pages: Record<string, string> = {
    'category/primary': strings.categoryPrimary,
    'category/social': strings.categorySocial,
    'category/updates': strings.categoryUpdates,
    'category/promotions': strings.categoryPromotions,
    'category/forum': strings.categoryForum,
    'settings/general': strings.generalSettings,
    'settings': strings.generalSettings,
    'settings/labels': strings.labelSettings,
    'settings/inbox': strings.inboxSettings,
    'settings/accounts': strings.accountSetting,
    'settings/filters': strings.filterSettings,
    'settings/fwdandpop': strings.fwdAndPOPSettings,
    'settings/addons': strings.addonsSettings,
    'settings/chat': strings.chatSettings,
    'settings/advanced': strings.advancedSettings,
    'settings/offline': strings.offlineSettings,
    'settings/oldthemes': strings.themesSettings,
    'inbox': strings.categoryPrimary,
    'starred': strings.viewingStarredEmails,
    'snoozed': strings.viewingSnoozedEmails,
    'sent': strings.viewingSentEmails,
    'drafts': strings.viewingDrafts,
    'imp': strings.viewingImportantEmails,
    'chats': strings.viewingChats,
    'scheduled': strings.viewingScheduled,
    'all': strings.viewingAllEmails,
    'spam': strings.viewingSpam,
    'trash': strings.viewingTrash,
  }
  const currentPage = path.split('#')[1]

  if (currentPage && pages[currentPage]) {
    presenceData.details = pages[currentPage]
  }
  else if (path.includes('compose=')) {
    presenceData.details = strings.composingEmail
  }
  else if (path.match('#search')) {
    presenceData.details = strings.lookingForEmail
  }
  else if (path.match('#label')) {
    presenceData.details = strings.inLabel
    if (!privacy) {
      presenceData.state = document
        .querySelector<HTMLDivElement>('div.aim.ain > div')
        ?.getAttribute('data-tooltip')
    }
  }
  else {
    presenceData.details = strings.viewingEmail
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
