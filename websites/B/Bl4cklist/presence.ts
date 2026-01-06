import { Assets } from 'premid'

const presence = new Presence({
  clientId: '775415193760169995',
})
const browsingTimestamp: number = Math.floor(Date.now() / 1000)

async function getStrings() {
  return await presence.getStrings(
    {
      homepageDetails: 'bl4cklist.homepageDetails',
      defaultTitle: 'bl4cklist.defaultTitle',
      defaultState: 'bl4cklist.defaultState',
      pageCoding: 'bl4cklist.pageCoding',
      pageCommunity: 'bl4cklist.pageCommunity',
      pageBot: 'bl4cklist.pageBot',
      pageContact: 'bl4cklist.pageContact',
    },
  )
}

presence.on('UpdateData', async (): Promise<void> => {
  const strings = await getStrings()
  const presenceData: PresenceData = {
    largeImageKey: 'https://i.imgur.com/IlaDOsb.png',
    smallImageKey: Assets.Reading,
    startTimestamp: browsingTimestamp,
  }

  const { pathname } = document.location
  if (pathname.includes('/discord/tech-coding/')) {
    presenceData.details = strings.defaultTitle
    presenceData.state = strings.pageCoding
  }
  else if (pathname.includes('/discord/community/')) {
    presenceData.details = strings.defaultTitle
    presenceData.state = strings.pageCommunity
  }
  else if (pathname.includes('/discord/clank-bot/')) {
    presenceData.details = strings.defaultTitle
    presenceData.state = strings.pageBot
  }
  else if (pathname.includes('/contact/')) {
    presenceData.details = strings.defaultTitle
    presenceData.state = strings.pageContact
  }
  else {
    // fallback
    presenceData.details = strings.homepageDetails
    presenceData.state = strings.defaultState
  }

  if (presenceData.state)
    presence.setActivity(presenceData)
  else presence.clearActivity()
})
