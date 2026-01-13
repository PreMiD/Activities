import { Assets } from 'premid'

const presence = new Presence({
  clientId: '775415193760169995',
})
const browsingTimestamp: number = Math.floor(Date.now() / 1000)

async function getStrings() {
  return await presence.getStrings(
    {
      homepageDetails: 'general.viewHome',
      defaultTitle: 'general.browsing',
      defaultState: 'bl4cklist.defaultState',
      pageCoding: 'bl4cklist.pageCoding',
      pageCommunity: 'bl4cklist.pageCommunity',
      pageBot: 'bl4cklist.pageBot',
      pageContact: 'bl4cklist.pageContact',
      reading: 'general.readingAbout',
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

  const { href } = document.location
  // our discord help subdomain
  if (href.includes('discord.bl4cklist.de/')) {
    const title_split: string[] = document.title.split(' | ')
    presenceData.details = `Bl4cklist's ${title_split[1]}` // page name
    presenceData.state = `${strings.reading} ${title_split[0]} 💬` // article name
  }
  else if (href.includes('/discord/tech-coding/')) {
    presenceData.details = strings.defaultTitle
    presenceData.state = strings.pageCoding
  }
  else if (href.includes('/discord/community/')) {
    presenceData.details = strings.defaultTitle
    presenceData.state = strings.pageCommunity
  }
  else if (href.includes('/discord/clank-bot/')) {
    presenceData.details = strings.defaultTitle
    presenceData.state = strings.pageBot
  }
  else if (href.includes('/contact/')) {
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
