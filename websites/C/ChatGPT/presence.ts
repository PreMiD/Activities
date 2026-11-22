import { Assets } from 'premid'
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
    search: 'general.search',
    settings: 'chatgpt.settings',
    spaceImages: 'chatgpt.spaceImages',
    spacePages: 'chatgpt.spacePages',
    spacePresentations: 'chatgpt.spacePresentations',
    spaceSharedWithMe: 'chatgpt.spaceSharedWithMe',
    spaceSites: 'chatgpt.spaceSites',
    spaceSpreadsheets: 'chatgpt.spaceSpreadsheets',
    spaceTrash: 'chatgpt.spaceTrash',
    spaceYourItems: 'chatgpt.spaceYourItems',
    startNewConversation: 'chatgpt.startNewConversation',
    startNewConversationInTemporaryChat: 'chatgpt.startNewConversationInTemporaryChat',
    talkingWithAI: 'chatgpt.talkingWithAI',
    talkingWithAIInSharedChat: 'chatgpt.talkingWithAIInSharedChat',
    talkingWithAIInTemporaryChat: 'chatgpt.talkingWithAIInTemporaryChat',
    thinkingOfPrompt: 'chatgpt.thinkingOfPrompt',
    viewingGPT: 'chatgpt.viewingGPT',
    viewingAGPT: 'chatgpt.viewingAGPT',
    viewingImage: 'chatgpt.viewingImage',
    viewingImages: 'chatgpt.viewingImages',
    viewingLibrary: 'chatgpt.viewingLibrary',
    viewingMaps: 'chatgpt.viewingMaps',
    viewingMyGPTs: 'chatgpt.viewingMyGPTs',
    viewingPlugin: 'chatgpt.viewingPlugin',
    viewingPlugins: 'chatgpt.viewingPlugins',
    viewingProfile: 'chatgpt.viewingProfile',
    viewingProjects: 'chatgpt.viewingProjects',
    viewingScheduledTasks: 'chatgpt.viewingScheduledTasks',
    viewingSkills: 'chatgpt.viewingSkills',
    viewingSpace: 'chatgpt.viewingSpace',
  })
}

const browsingTimestamp = Math.floor(Date.now() / 1000)

function isTypingPrompt(): boolean {
  const editors = document.querySelectorAll('#prompt-textarea, div.ProseMirror[contenteditable]')
  for (const editor of editors) {
    const text = editor instanceof HTMLTextAreaElement ? editor.value : (editor.textContent ?? '')
    if (text.replace(/\u200B/g, '').trim().length > 0)
      return true
  }
  return false
}

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
    'button[data-testid=stop-button], button[aria-label="Stop responding"], button[aria-label="Stop"], button[aria-label="停止"]',
  )
  const searchDialog = [...document.querySelectorAll('[role=dialog]')].find((dialog) => {
    const heading = dialog.querySelector('h1, h2, h3')?.textContent?.trim()
    const placeholder = dialog.querySelector('input')?.placeholder
    return (heading === 'グローバル検索' || heading === 'Global search')
      && (placeholder === '検索...' || placeholder === '検索…' || placeholder === 'Search...' || placeholder === 'Search…')
  })
  let gptName = document.querySelector('button[data-testid=model-switcher-dropdown-button]')?.textContent?.trim()
    ?? [...document.querySelectorAll('span')]
      .find(span => span.children.length === 0 && /^GPT-[\w.]+(?: [\w.]+)?/.test(span.textContent?.trim() ?? ''))
      ?.textContent
      ?.trim()
      .match(/^GPT-[\w.]+(?: [\w.]+)?/)?.[0]
  const setChatSmallImage = () => {
    if (isTalking) {
      presenceData.smallImageKey = ActivityAssets.Talking
      presenceData.smallImageText = showGPTName ? strings.aiResponding.replace('{0}', gptName ?? strings.ai) : strings.aiResponding.replace('{0}', strings.ai)
    }
    else if (isTypingPrompt()) {
      presenceData.smallImageKey = Assets.Writing
      presenceData.smallImageText = strings.thinkingOfPrompt
    }
  }
  let wordCount = 0
  for (const element of document.querySelectorAll(
    '[data-conversation-role="user"],[data-conversation-role="assistant"]',
  )) {
    const text = (element.closest('div.group')?.textContent ?? element.textContent)
      ?.replace(/, |,\n|,|\. |\./g, ' ')
      // eslint-disable-next-line regexp/no-dupe-disjunctions
      .replace(/\d*|[/', ]/g, '')
    if (text) {
      wordCount += text.split(' ').slice(2, text.split(' ').length).length
    }
  }

  if (searchDialog) {
    presenceData.details = strings.search
    presenceData.smallImageKey = Assets.Search
    presenceData.smallImageText = strings.search
  }
  else if (document.location.hash.includes('#settings')) {
    presenceData.details = strings.settings
    presenceData.state = document.querySelector('[role=dialog] button[aria-selected=true]')?.textContent
  }
  else if (document.location.hash.includes('#pricing')) {
    presenceData.details = strings.pricing
  }
  else if (pathname.split('/')[1] === 'settings') {
    presenceData.details = strings.settings
    presenceData.state = [...document.querySelectorAll('h1')].find(h1 => !h1.closest('nav'))?.textContent?.trim()
  }
  else if (pathname.split('/')[1] === 'c' || pathname.split('/')[1] === 'uc') {
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
              document.querySelectorAll('[data-conversation-role="user"]')
                .length,
            )}`,
          )
          .replace('{1}', `${wordCount}`)
    setChatSmallImage()
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
                document.querySelectorAll('[data-conversation-role="user"]')
                  .length,
              )}`,
            )
            .replace('{1}', `${wordCount}`)
      setChatSmallImage()
    }
  }
  else if (pathname === '/gpts/mine') {
    presenceData.details = strings.viewingMyGPTs
  }
  else if (pathname.split('/')[1] === 'gpts') {
    presenceData.details = strings.exploreGPTs
    presenceData.state = document.querySelector('button[role=tab][aria-selected=true]')?.textContent

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
                document.querySelectorAll('[data-conversation-role="user"]')
                  .length,
              )}`,
            )
            .replace('{1}', `${wordCount}`)
      setChatSmallImage()
    }
  }
  else if (pathname.split('/')[1] === 'share') {
    presenceData.details = showTitle ? document.title : (showGPTName ? strings.talkingWithAIInSharedChat.replace('{0}', gptName ?? strings.ai) : strings.talkingWithAIInSharedChat.replace('{0}', strings.ai))
    presenceData.state = strings.conversationStats
      .replace(
        '{0}',
        `${Number(
          document.querySelectorAll('[data-conversation-role="user"]')
            .length,
        )}`,
      )
      .replace('{1}', `${wordCount}`)
    setChatSmallImage()
  }
  else if (pathname.split('/')[1] === 'library') {
    const titleBar = document.querySelector('div[data-testid="modal-image-gen-lightbox"]')
    presenceData.details = titleBar ? strings.viewingImage.replace('{0}', document.querySelector('div[data-testid="modal-image-gen-lightbox"] h2.text-token-text-primary')!.textContent!) : strings.viewingLibrary
    presenceData.state = titleBar ? document.querySelector('div[data-testid="modal-image-gen-lightbox"] span.text-token-text-secondary')?.textContent : ''
  }
  else if (pathname.split('/')[1] === 'plugins') {
    if (pathname.startsWith('/plugins/plugin_connector_')) {
      presenceData.details = strings.viewingPlugin
      presenceData.state = [...document.querySelectorAll('h1')].find(h1 => !h1.closest('nav'))?.textContent?.trim()
    }
    else {
      presenceData.details = strings.viewingPlugins
    }
  }
  else if (pathname.split('/')[1] === 'space') {
    const params = new URLSearchParams(document.location.search)
    const spaceTypes: Record<string, string> = {
      sites: strings.spaceSites,
      pages: strings.spacePages,
      presentations: strings.spacePresentations,
      spreadsheets: strings.spaceSpreadsheets,
      images: strings.spaceImages,
    }
    const spaceType = spaceTypes[params.get('artifact') ?? ''] ?? spaceTypes[params.get('category') ?? '']
    presenceData.details = strings.viewingSpace
    if (pathname.split('/')[2] === 'd')
      presenceData.state = strings.spaceSharedWithMe
    else if (params.get('deleted') === 'true')
      presenceData.state = strings.spaceTrash
    else if (spaceType)
      presenceData.state = spaceType
    else if (params.get('tab') === 'all')
      presenceData.state = strings.spaceYourItems
  }
  else if (pathname.split('/')[1] === 'scheduled') {
    presenceData.details = strings.viewingScheduledTasks
  }
  else if (pathname.split('/')[1] === 'skills') {
    presenceData.details = strings.viewingSkills
  }
  else if (pathname.split('/')[1] === 'projects') {
    presenceData.details = strings.viewingProjects
  }
  else if (pathname.split('/')[1] === 'images') {
    presenceData.details = strings.viewingImages
  }
  else if (pathname.split('/')[1] === 'maps') {
    presenceData.details = strings.viewingMaps
  }
  else if (pathname.split('/')[1] === 'u') {
    presenceData.details = strings.viewingProfile
    if (document.title.includes(' | '))
      presenceData.state = document.title.split(' | ')[0]
  }
  else {
    presenceData.details = strings.startNewConversation
    presenceData.state = strings.thinkingOfPrompt
  }

  presence.setActivity(presenceData)
})
