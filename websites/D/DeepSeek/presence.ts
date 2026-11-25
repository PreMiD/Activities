import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1333939310441009182',
})
async function getStrings() {
  return presence.getStrings({
    browsing: 'general.browsing',
    search: 'general.search',
    newPrompt: 'deepSeek.startingPrompt',
    talkingWithAi: 'deepSeek.talkingWithAi',
    aiTalking: 'deepSeek.aiTalking',
    readingResponse: 'deepSeek.readingResponse',
    askingQuestion: 'deepSeek.askingQuestion',
    conversationStats: 'deepSeek.conversationStats',
  })
}
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/D/DeepSeek/assets/logo.png',
  Talking = 'https://cdn.rcd.gg/PreMiD/websites/D/DeepSeek/assets/0.png',
}

function countWords(text: string | null | undefined): number {
  const trimmed = text?.trim()
  return trimmed ? trimmed.split(/\s+/).length : 0
}

// The DeepThink and search toggles share DeepSeek's toggle button
// component: an element with class "ds-toggle-button" that gains
// "ds-toggle-button--selected" while enabled (confirmed in the app's
// own JS/CSS bundles, 2026-11-17). The label tells the two apart.
function isSearchModeOn(): boolean {
  const labels = new Set(['Search', 'スマート検索', '联网搜索'])
  for (const el of document.querySelectorAll('.ds-toggle-button--selected')) {
    if (labels.has(el.textContent?.trim() ?? ''))
      return true
  }
  return false
}

presence.on('UpdateData', async () => {
  const { pathname } = document.location
  const showTitle = await presence.getSetting<boolean>('showTitle')

  let presenceDetail: string, presenceState: string
  let smallImageKey: string, smallImageText: string

  const strings = await getStrings()

  if (pathname === '/') {
    presenceDetail = strings?.newPrompt ?? ''
  }
  else if (pathname.includes('/a/chat/s')) {
    presenceDetail = (showTitle
      ? document.querySelector('div.d8ed659a')?.textContent?.trim()
      : undefined) || strings?.talkingWithAi || ''
  }
  else {
    presenceDetail = strings?.talkingWithAi ?? ''
  }

  // Count the conversation the same way the ChatGPT and Claude
  // presences do. Every message is a .ds-message element: a user
  // message holds the question text directly, while an AI message
  // holds its answer in .ds-markdown elements.
  let conversationStats: string | undefined
  if (pathname.includes('/a/chat/s')) {
    let askedCount = 0
    let wordCount = 0
    for (const el of document.querySelectorAll('.ds-message')) {
      const answers = el.querySelectorAll('.ds-markdown')
      if (answers.length) {
        for (const answer of answers)
          wordCount += countWords(answer.textContent)
      }
      else {
        askedCount++
        wordCount += countWords(el.textContent)
      }
    }
    if (askedCount > 0) {
      conversationStats = strings?.conversationStats
        ?.replace('{0}', `${askedCount}`)
        .replace('{1}', `${wordCount}`)
    }
  }

  // Checking if the user is currently typing a question
  if (document.querySelector('#chat-input')?.textContent?.trim()) {
    presenceState = strings?.askingQuestion ?? ''
    smallImageKey = Assets.Writing
    smallImageText = strings?.askingQuestion ?? ''
  }
  // Used for checking if the AI is currently responding
  else if (document.querySelector('div[class=\'f9bf7997 d7dc56a8\']')) {
    presenceState = strings?.aiTalking ?? ''
    smallImageKey = ActivityAssets.Talking
    smallImageText = strings?.aiTalking ?? ''
  }
  else if (document.querySelector('div.f9bf7997.d7dc56a8.c05b5566')) {
    presenceState = conversationStats ?? strings?.readingResponse ?? ''
    smallImageKey = Assets.Reading
    smallImageText = strings?.readingResponse ?? ''
  }
  else if (isSearchModeOn()) {
    presenceState = ''
    smallImageKey = Assets.Search
    smallImageText = strings?.search ?? ''
  }
  else {
    presenceState = conversationStats ?? ''
    smallImageKey = Assets.Viewing
    smallImageText = strings?.browsing ?? ''
  }

  presence.setActivity({
    largeImageKey: ActivityAssets.Logo,
    smallImageKey,
    smallImageText,
    startTimestamp: browsingTimestamp,
    details: presenceDetail,
    state: presenceState,
  })
})
