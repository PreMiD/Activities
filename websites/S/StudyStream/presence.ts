const presence = new Presence({
  clientId: '1319468567405662209',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/S/StudyStream/assets/logo.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const path = document.location.pathname
  const paths = {
    focus: '/focus',
    profile: '/profile',
    focusBuddies: '/focus-buddies',
    conversations: '/conversations',
    groups: '/groups',
    leaderboards: '/leaderboards',
    focusSessions: '/focus-sessions',
  }
  const translatedStrings = await presence.getStrings({
    browsing: 'general.browsing',
    viewingAProfile: 'general.viewAProfile',
  })
  const hardCodedStrings = {
    inAFocusRoom: 'In a focus room',
    searchingForABuddy: 'Searching for a buddy',
    viewingDMs: 'Chatting',
    joiningAGroup: 'Joining a group',
    lookingAtLeaderboards: 'Looking at leaderboards',
    schedulingASession: 'Booking a focus session',
  }

  presenceData.details = translatedStrings.browsing

  if (path.startsWith(paths.focus))
    presenceData.details = hardCodedStrings.inAFocusRoom
  if (path.startsWith(paths.profile))
    presenceData.details = translatedStrings.viewingAProfile
  if (path.startsWith(paths.focusBuddies))
    presenceData.details = hardCodedStrings.searchingForABuddy
  if (path.startsWith(paths.conversations))
    presenceData.details = hardCodedStrings.viewingDMs
  if (path.startsWith(paths.groups))
    presenceData.details = hardCodedStrings.joiningAGroup
  if (path.startsWith(paths.leaderboards))
    presenceData.details = hardCodedStrings.lookingAtLeaderboards
  if (path.startsWith(paths.focusSessions))
    presenceData.details = hardCodedStrings.schedulingASession

  presence.setActivity(presenceData)
})
