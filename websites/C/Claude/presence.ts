import { franc } from 'franc-min'

const presence = new Presence({
  clientId: '1326893434073776181',
})
async function getStrings() {
  return presence.getStrings(
    {
      talkingWithAI: 'claude.talkingWithAI',
      aiResponding: 'claude.aiResponding',
      conversationStats: 'claude.conversationStats',
      startNewConversation: 'claude.startNewConversation',
      thinkingOfPrompt: 'claude.thinkingOfPrompt',
    },

  )
}
const browsingTimestamp = Math.floor(Date.now() / 1000)
let oldLang: string | null = null
let strings: Awaited<ReturnType<typeof getStrings>>

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/C/Claude/assets/logo.png',
  Talking = 'https://cdn.rcd.gg/PreMiD/websites/C/Claude/assets/0.png',
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
  const messageElements = Array.from(
    document.querySelectorAll(
      'div[class*="font-user-message"],div[class*="font-claude-message"]',
    ),
  )
  const isTalking = messageElements
    .at(-1)
    ?.parentElement
    ?.getAttribute('data-is-streaming') === 'true'

  let wordCount = 0
  for (const element of messageElements) {
    const text = element.textContent
      ?.replace(/(, )|(,\n)|(,)|(\. )|(\.)/g, ' ')
      // eslint-disable-next-line regexp/no-dupe-disjunctions
      ?.replace(/(\d*)|(\/)|(')|(,)|( )/g, '')
    wordCount += Array.from(
      new Intl.Segmenter(franc(text), { granularity: 'word' }).segment(text!),
    ).length
  }

  if (pathname.split('/')[1] === 'chat') {
    // check if the document title is the default title. If so, get the chat title from the UI. Otherwise, get it from the document title
    if (document.title === 'Claude' && showTitle) {
      presenceData.details = document.querySelector(
        `a[href="/chat/${pathname.split('/')[2]}"]`,
      )?.textContent
    }
    else {
      presenceData.details = showTitle ? document.title : strings.talkingWithAI
    }
    presenceData.state = isTalking
      ? strings.aiResponding
      : strings.conversationStats
          .replace(
            '{0}',
            `${
              messageElements.filter(e =>
                e.classList.contains('font-user-message'),
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

  presence.setActivity(presenceData)
})
