import { PrivacyUI } from './util/PrivacyUI.js'

const presence = new Presence({
  clientId: '1102935778570547282',
})

async function getStrings() {
  return presence.getStrings({
    ai: 'chatgpt.ai',
    aiResponding: 'chatgpt.aiResponding',
    conversationStats: 'chatgpt.conversationStats',
    exploreGPTs: 'chatgpt.exploreGPTs',
    pricing: 'chatgpt.pricing',
    settings: 'chatgpt.settings',
    startNewConversation: 'chatgpt.startNewConversation',
    startNewConversationInTemporaryChat: 'chatgpt.startNewConversationInTemporaryChat',
    talkingWithAI: 'chatgpt.talkingWithAI',
    talkingWithAIInSharedChat: 'chatgpt.talkingWithAIInSharedChat',
    talkingWithAIInTemporaryChat: 'chatgpt.talkingWithAIInTemporaryChat',
    thinkingOfPrompt: 'chatgpt.thinkingOfPrompt',
    viewingGPT: 'chatgpt.viewingGPT',
    viewingAGPT: 'chatgpt.viewingAGPT',
    viewingImage: 'chatgpt.viewingImage',
    viewingLibrary: 'chatgpt.viewingLibrary',
  })
}

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Talking = 'https://cdn.rcd.gg/PreMiD/websites/C/ChatGPT/assets/0.png',
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/C/ChatGPT/assets/logo.png',
  Dark = 'https://cdn.rcd.gg/PreMiD/websites/C/ChatGPT/assets/1.png',
  Old = 'https://cdn.rcd.gg/PreMiD/websites/C/ChatGPT/assets/2.png',
}

presence.on('UpdateData', async () => {
  const { pathname } = document.location
  const [showTitle, showGPTName, logo] = await Promise.all([
    presence.getSetting<boolean>('showTitle'),
    presence.getSetting<boolean>('showGPTName'),
    presence.getSetting<number>('logo'),
  ])
  const strings = await getStrings()

  const presenceData: PresenceData = {
    largeImageKey: [ActivityAssets.Logo, ActivityAssets.Dark, ActivityAssets.Old][logo] || ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const isTalking = document.querySelector(
    'button[data-testid=stop-button]',
  )

  let gptName = document.querySelector('button[data-testid=model-switcher-dropdown-button]')?.textContent?.trim()
  let wordCount = 0
  for (const element of document.querySelectorAll(
    '[data-message-author-role="user"],[data-message-author-role="assistant"]',
  )) {
    const text = element.textContent
      ?.replace(/(, )|(,\n)|(,)|(\. )|(\.)/g, ' ')
      // eslint-disable-next-line regexp/no-dupe-disjunctions
      .replace(/(\d*)|(\/)|(')|(,)|( )/g, '')
    if (text) {
      wordCount += text.split(' ').slice(2, text.split(' ').length).length
    }
  }

  if (document.location.hash.includes('#settings')) {
    presenceData.details = strings.settings
    presenceData.state = document.querySelector('[role=dialog] button[aria-selected=true]')?.textContent
  }
  else if (document.location.hash.includes('#pricing')) {
    presenceData.details = strings.pricing
  }
  else if (pathname.split('/')[1] === 'c') {
    const chatPrivacy = new PrivacyUI(pathname.split('/')[2]!)
    // check if the document title is the default title. If so, get the chat title from the UI. Otherwise, get it from the document title
    if (document.title === 'ChatGPT' && showTitle && !chatPrivacy.getIsHidden()) {
      presenceData.details = document.querySelector(
        `[href="${pathname}"]`,
      )?.textContent
    }
    else {
      presenceData.details = showTitle && !chatPrivacy.getIsHidden() ? document.title : (showGPTName ? strings.talkingWithAI.replace('{0}', gptName ?? strings.ai) : strings.talkingWithAI.replace('{0}', strings.ai))
    }

    presenceData.state = isTalking
      ? (showGPTName ? strings.aiResponding.replace('{0}', gptName ?? strings.ai) : strings.aiResponding.replace('{0}', strings.ai))
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
  else if (pathname.split('/')[1] === 'g') {
    gptName = document.querySelector('div[data-testid=undefined-button]')?.textContent?.trim()
    presenceData.details = strings.startNewConversation
    presenceData.state = strings.thinkingOfPrompt

    if (pathname.split('/')[3] === 'c') {
      const chatPrivacy = new PrivacyUI(pathname.split('/')[4]!)
      if (document.querySelector('div.group\\/sidebar') && showTitle && !chatPrivacy.getIsHidden()) {
        presenceData.details = document.querySelector(
          `[href="${pathname}"]`,
        )?.textContent
      }
      else {
        presenceData.details = showGPTName ? strings.talkingWithAI.replace('{0}', gptName ?? strings.ai) : strings.talkingWithAI.replace('{0}', strings.ai)
      }

      presenceData.state = isTalking
        ? (showGPTName ? strings.aiResponding.replace('{0}', gptName ?? strings.ai) : strings.aiResponding.replace('{0}', strings.ai))
        : strings.conversationStats
            .replace(
              '{0}',
              `${Number(
                document.querySelectorAll('[data-message-author-role="user"]')
                  .length,
              )}`,
            )
            .replace('{1}', `${wordCount}`)
    }
  }
  else if (pathname.split('/')[1] === 'gpts') {
    presenceData.details = strings.exploreGPTs
    presenceData.state = document.querySelector('div.cursor-pointer.border-token-text-primary')?.textContent

    if (document.querySelector('div[role=dialog]')) {
      presenceData.details = showGPTName ? strings.viewingGPT : strings.viewingAGPT
      presenceData.state = showGPTName ? document.querySelector('div[role=dialog] div.text-token-text-primary > div > div.text-center')?.textContent : null
    }
  }
  else if (document.location.search.includes('?temporary-chat=true')) {
    if (document.querySelector('h1[data-testid=temporary-chat-label]')) {
      presenceData.details = strings.startNewConversationInTemporaryChat
      presenceData.state = strings.thinkingOfPrompt
    }
    else {
      presenceData.details = (showGPTName ? strings.talkingWithAIInTemporaryChat.replace('{0}', gptName ?? strings.ai) : strings.talkingWithAIInTemporaryChat.replace('{0}', strings.ai))
      presenceData.state = isTalking
        ? (showGPTName ? strings.aiResponding.replace('{0}', gptName ?? strings.ai) : strings.aiResponding.replace('{0}', strings.ai))
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
  }
  else if (pathname.split('/')[1] === 'share') {
    presenceData.details = showTitle ? document.title : (showGPTName ? strings.talkingWithAIInSharedChat.replace('{0}', gptName ?? strings.ai) : strings.talkingWithAIInSharedChat.replace('{0}', strings.ai))
    presenceData.state = strings.conversationStats
      .replace(
        '{0}',
        `${Number(
          document.querySelectorAll('[data-message-author-role="user"]')
            .length,
        )}`,
      )
      .replace('{1}', `${wordCount}`)
  }
  else if (pathname.split('/')[1] === 'library') {
    const titleBar = document.querySelector('div[data-testid="modal-image-gen-lightbox"]')
    presenceData.details = titleBar ? strings.viewingImage.replace('{0}', document.querySelector('div[data-testid="modal-image-gen-lightbox"] h2.text-token-text-primary')!.textContent!) : strings.viewingLibrary
    presenceData.state = titleBar ? document.querySelector('div[data-testid="modal-image-gen-lightbox"] span.text-token-text-secondary')?.textContent : ''
  }
  else {
    presenceData.details = strings.startNewConversation
    presenceData.state = strings.thinkingOfPrompt
  }

  presence.setActivity(presenceData)
})
