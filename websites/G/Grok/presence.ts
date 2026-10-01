import { ActivityType } from 'premid'
import { ActivityAssets } from './assets.js'
import {
  formatPrompt,
  formatTitle,
  getConversationInfo,
} from './conversation.js'
import { getGrokMode, MODE_ASSETS } from './modes.js'

const presence = new Presence({
  clientId: '1350152994993209536',
})

const sessionTimestamp = Math.floor(Date.now() / 1000)
const chatTimestamps = new Map<string, number>()
let previousChatId: string | null = null

async function getStrings() {
  return presence.getStrings({
    talkingWithAI: 'grok.talkingWithAI',
    startNewConversation: 'grok.startNewConversation',
    thinkingOfPrompt: 'grok.thinkingOfPrompt',
    replyingTo: 'grok.replyingTo',
    creatingImages: 'grok.creatingImages',
    viewingFiles: 'grok.viewingFiles',
    browsingProjects: 'grok.browsingProjects',
    readingSharedChat: 'grok.readingSharedChat',
    browsing: 'general.browsing',
  })
}

function applyMode(presenceData: PresenceData, pathname: string): void {
  const mode = getGrokMode(pathname)
  if (!mode)
    return
  presenceData.smallImageKey = MODE_ASSETS[mode.id]
  presenceData.smallImageText = mode.title
}

function timestampFor(chatId: string | null, useChatTimer: boolean): number {
  if (!chatId || !useChatTimer)
    return sessionTimestamp

  let started = chatTimestamps.get(chatId)
  if (!started) {
    started = Math.floor(Date.now() / 1000)
    chatTimestamps.set(chatId, started)
  }
  return started
}

presence.on('UpdateData', async () => {
  const [showTitle, showLastPrompt] = await Promise.all([
    presence.getSetting<boolean>('showTitle').catch(() => true),
    presence.getSetting<boolean>('showLastPrompt').catch(() => true),
  ])
  const strings = await getStrings()
  const { pathname } = document.location
  const conversation = await getConversationInfo(pathname)
  const useChatTimer = !!(conversation.id && (showTitle || showLastPrompt))

  if (conversation.id !== previousChatId) {
    previousChatId = conversation.id
    if (conversation.id && !chatTimestamps.has(conversation.id))
      chatTimestamps.set(conversation.id, Math.floor(Date.now() / 1000))
  }

  const presenceData: PresenceData = {
    type: ActivityType.Playing,
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: timestampFor(conversation.id, useChatTimer),
  }

  applyMode(presenceData, pathname)

  const showDetails = showTitle || showLastPrompt

  if (!showDetails) {
    presence.setActivity(presenceData)
    return
  }

  switch (true) {
    case pathname.startsWith('/imagine'):
    case pathname.startsWith('/images'): {
      presenceData.details = strings.creatingImages
      break
    }
    case pathname.startsWith('/files'):
    case pathname.startsWith('/library'): {
      presenceData.details = strings.viewingFiles
      break
    }
    case pathname.startsWith('/project'):
    case pathname.startsWith('/workspace'): {
      presenceData.details = strings.browsingProjects
      break
    }
    case pathname.startsWith('/share'):
    case pathname.startsWith('/s/'): {
      presenceData.details = showTitle
        ? (conversation.title ? formatTitle(conversation.title) : strings.readingSharedChat)
        : strings.readingSharedChat
      if (showLastPrompt && conversation.lastPrompt) {
        presenceData.state = strings.replyingTo.replace(
          '{0}',
          formatPrompt(conversation.lastPrompt),
        )
      }
      break
    }
    case !!conversation.id:
    case pathname.startsWith('/voice'): {
      if (showTitle) {
        presenceData.details = conversation.title
          ? formatTitle(conversation.title)
          : strings.talkingWithAI
      }
      else if (showLastPrompt) {
        presenceData.details = strings.talkingWithAI
      }

      if (showLastPrompt && conversation.lastPrompt) {
        presenceData.state = strings.replyingTo.replace(
          '{0}',
          formatPrompt(conversation.lastPrompt),
        )
      }
      break
    }
    case pathname === '/' || pathname === '/chat' || pathname === '/c': {
      presenceData.details = strings.startNewConversation
      presenceData.state = strings.thinkingOfPrompt
      break
    }
    default: {
      presenceData.details = strings.browsing
      break
    }
  }

  presence.setActivity(presenceData)
})
