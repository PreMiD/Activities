const presence = new Presence({
  clientId: '1102935778570547282',
})
async function getStrings() {
  return presence.getStrings({
    aiResponding: 'chatgpt.aiResponding',
    conversationStats: 'chatgpt.conversationStats',
    startNewConversation: 'chatgpt.startNewConversation',
    talkingWithAI: 'chatgpt.talkingWithAI',
    thinkingOfPrompt: 'chatgpt.thinkingOfPrompt',
  })
}
const browsingTimestamp = Math.floor(Date.now() / 1000)

let oldLang: string | null = null
let strings: Awaited<ReturnType<typeof getStrings>>

enum ActivityAssets {
  Talking = 'https://cdn.rcd.gg/PreMiD/websites/C/ChatGPT/assets/0.png',
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/C/ChatGPT/assets/logo.png',
  Dark = 'https://cdn.rcd.gg/PreMiD/websites/C/ChatGPT/assets/1.png',
  Old = 'https://cdn.rcd.gg/PreMiD/websites/C/ChatGPT/assets/2.png',
}

presence.on('UpdateData', async () => {
  const { pathname } = document.location
  const [newLang, showTitle, logo] = await Promise.all([
    presence.getSetting<string>('lang').catch(() => 'en'),
    presence.getSetting<boolean>('showTitle'),
    presence.getSetting<number>('logo'),
  ])

  if (oldLang !== newLang || !strings) {
    oldLang = newLang
    strings = await getStrings()
  }

  const presenceData: PresenceData = {
    largeImageKey: [ActivityAssets.Logo, ActivityAssets.Dark, ActivityAssets.Old][logo] || ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const isTalking = document.querySelector(
    '.gap-x-1 > div > button[data-testid=stop-button]',
  )

  let wordCount = 0
  for (const element of document.querySelectorAll(
    '[data-message-author-role="user"],[data-message-author-role="assistant"]',
  )) {
    const text = element.textContent
      ?.replace(/(, )|(,\n)|(,)|(\. )|(\.)/g, ' ')
      // eslint-disable-next-line regexp/no-dupe-disjunctions
      .replace(/(\d*)|(\/)|(')|(,)|( )/g, '')
    if (text)
      wordCount += text.split(' ').slice(2, text.split(' ').length).length
  }

  if (pathname.split('/')[1] === 'c') {
    // check if the document title is the default title. If so, get the chat title from the UI. Otherwise, get it from the document title
    if (document.title === 'ChatGPT' && showTitle) {
      presenceData.details = document.querySelector(
        `[href="/c/${pathname.split('/')[2]}"]`,
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
            `${Number(
              document.querySelectorAll('[data-message-author-role="user"]')
                .length,
            )}`,
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
