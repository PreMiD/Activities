import { franc } from 'franc-min'
import {
  clearResponsesMetadata,
  fetchResponsesMetadata,
  responsesMetadata,
} from './functions/fetchResponsesMetadata.js'

const presence = new Presence({
  clientId: '1350152994993209536',
})
async function getStrings() {
  return presence.getStrings({
    talkingWithAI: 'grok.talkingWithAI',
    aiResponding: 'grok.aiResponding',
    conversationStats: 'grok.conversationStats',
    startNewConversation: 'grok.startNewConversation',
    thinkingOfPrompt: 'grok.thinkingOfPrompt',
  })
}
const browsingTimestamp = Math.floor(Date.now() / 1000)
let oldLang: string | null = null
let strings: Awaited<ReturnType<typeof getStrings>>

enum ActivityAssets {
  Logo = 'https://i.imgur.com/bfxEiFr.png',
  Talking = 'https://i.imgur.com/ocYd337.png',
}

presence.on('UpdateData', async () => {
  const [lang, showTitle] = await Promise.all([
    presence.getSetting<string>('lang').catch(() => 'en'),
    presence.getSetting<boolean>('showTitle'),
  ])

  if (oldLang !== lang) {
    oldLang = lang
    strings = await getStrings()
  }

  const { pathname } = document.location
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  const conversationId = pathname.match(
    /\/chat\/([0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12})/,
  )?.[1]

  if (conversationId) {
    await fetchResponsesMetadata(conversationId)

    if (responsesMetadata.data.loadResponses) {
      const isTalking
        = document.getElementsByClassName('animate-gaussian').length > 0

      let wordCount = 0
      for (const response of responsesMetadata.data.loadResponses.responses) {
        wordCount += Array.from(
          new Intl.Segmenter(franc(response.message), {
            granularity: 'word',
          }).segment(response.message),
        ).length
      }

      presenceData.details = showTitle
        ? document.title.slice(0, -7)
        : strings.talkingWithAI
      presenceData.state = isTalking
        ? strings.aiResponding
        : strings.conversationStats
            .replace(
              '{0}',
              `${
                responsesMetadata.data.loadResponses.responses.filter(
                  response => response.sender === 'human',
                ).length
              }`,
            )
            .replace('{1}', `${wordCount}`)
      presenceData.smallImageKey = isTalking ? ActivityAssets.Talking : null
    }
    else {
      presenceData.details = strings.startNewConversation
      presenceData.state = strings.thinkingOfPrompt
    }
  }
  else {
    clearResponsesMetadata()
    presenceData.details = strings.startNewConversation
    presenceData.state = strings.thinkingOfPrompt
  }

  presence.setActivity(presenceData)
})
