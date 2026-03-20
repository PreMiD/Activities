const presence = new Presence({
  clientId: '1209550314987061258',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/G/Gemini/assets/logo.png',
  Talking = 'https://i.imgur.com/aWWXjuc.png',
}

presence.on('UpdateData', async () => {
  const strings = await presence.getStrings({
    aiResponding: 'gemini.aiResponding',
    askQuestions: 'gemini.askQuestions',
    browseGems: 'gemini.browseGems',
    browsing: 'general.browsing',
    conversationStats: 'gemini.conversationStats',
    createGem: 'gemini.createGem',
    editGem: 'gemini.editGem',
    editingInstructions: 'gemini.editingInstructions',
    manageConnectedApps: 'gemini.manageConnectedApps',
    managePublicLinks: 'gemini.managePublicLinks',
    manageScheduledActions: 'gemini.manageScheduledActions',
    readSharedChat: 'gemini.readSharedChat',
    searchChat: 'gemini.searchChat',
    startNewConversation: 'gemini.startNewConversation',
    talkingInTemporaryChat: 'gemini.talkingInTemporaryChat',
    talkingWithAI: 'gemini.talkingWithAI',
    thinkingOfPrompt: 'gemini.thinkingOfPrompt',
    viewTheirGeneratedStuff: 'gemini.viewTheirGeneratedStuff',
  })
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const { pathname } = document.location
  const [privacy, showTitle] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('showTitle'),
  ])
  const isTalking = document.querySelector(
    'button.stop',
  )
  switch (true) {
    case /\/app\/.*$/.test(pathname):
    case /\/gem\/[^/]+\/[^/]+$/.test(pathname):
    case /\/share\/continue\/[^/]+$/.test(pathname):
      // Check the selected conversation
      if (!privacy) {
        presenceData.details = showTitle
          ? document.querySelector(
            '[data-test-id="conversation-title"]',
          )?.textContent ?? strings.talkingWithAI
          : strings.talkingWithAI

        // Show word count for messages
        const questions = document.querySelectorAll('p.query-text-line')
        const answers = document.querySelectorAll(
          '.model-response-text',
        )

        // Loop through all response messages, to count the total words
        let askedWords = 0
        for (const x of questions) {
          const text = x.textContent
            ?.replace(/, |,\n|,|\. |\./g, ' ')
            .replace(/\d*/g, '')
          if (text) {
            askedWords += text.split(' ').slice(2, text.split(' ').length).length
          }
        }

        let answeredWords = 0
        for (const x of answers) {
          const text = x.textContent
            ?.replace(/, |,\n|,|\. |\./g, ' ')
            .replace(/\d*/g, '')
          if (text) {
            answeredWords += text.split(' ').slice(2, text.split(' ').length).length
          }
        }

        presenceData.state = isTalking
          ? strings.aiResponding
          : strings.conversationStats
              .replace('{0}', `${askedWords}`)
              .replace('{1}', `${answeredWords}`)
        presenceData.smallImageKey = isTalking ? ActivityAssets.Talking : null
      }
      else {
        presenceData.details = strings.askQuestions
      }

      break
    case /\/mystuff$/.test(pathname):
      presenceData.details = strings.viewTheirGeneratedStuff
      break
    case /\/gems\/create$/.test(pathname):
      presenceData.details = strings.createGem
      break
    case /\/gems\/edit\/.*$/.test(pathname):
      presenceData.details = strings.editGem
      break
    case /\/gems\/view$/.test(pathname):
      presenceData.details = strings.browseGems
      break
    case /\/share\/[^/]+$/.test(pathname):
      presenceData.details = strings.readSharedChat
      break
    case /\/search$/.test(pathname): {
      const searchInput = document.querySelector<HTMLInputElement>('input[data-test-id="search-input"]')
      presenceData.details = strings.searchChat
      presenceData.state = !privacy ? searchInput?.value : ''
      break
    }
    case /\/saved-info$/.test(pathname):
      presenceData.details = strings.editingInstructions
      break
    case /\/scheduled$/.test(pathname):
      presenceData.details = strings.manageScheduledActions
      break
    case /\/sharing$/.test(pathname):
      presenceData.details = strings.managePublicLinks
      break
    case /\/apps$/.test(pathname):
      presenceData.details = strings.manageConnectedApps
      break
    case /\/app$/.test(pathname):
    case /\/gem\/[^/]+$/.test(pathname): {
      const isTempChat = document.querySelector('[data-test-id="temporary-chat-header"]')
      if (isTempChat) {
        presenceData.details = strings.talkingInTemporaryChat
      }
      else {
        presenceData.details = strings.startNewConversation
        presenceData.state = strings.thinkingOfPrompt
      }
      break
    }
    default:
      presenceData.details = strings.browsing
      break
  }

  presence.setActivity(presenceData)
})
