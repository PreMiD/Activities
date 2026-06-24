const presence = new Presence({
  clientId: '1450225438709387477',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Talking = 'https://cdn.rcd.gg/PreMiD/websites/M/Microsoft%20Copilot/assets/0.png',
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/M/Microsoft%20Copilot/assets/logo.png',
}

presence.on('UpdateData', async () => {
  const { pathname } = document.location
  const showTitle = await presence.getSetting<boolean>('showTitle')
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  const strings = await presence.getStrings({
    aiResponding: 'microsoftcopilot.aiResponding',
    startNewConversation: 'microsoftcopilot.startNewConversation',
    conversationStats: 'microsoftcopilot.conversationStats',
    talkingWithAI: 'microsoftcopilot.talkingWithAI',
    thinkingOfPrompt: 'microsoftcopilot.thinkingOfPrompt',
    viewPublicImagesGenerated: 'microsoftcopilot.viewPublicImagesGenerated',
    prompt: 'microsoftcopilot.prompt',
    unknown: 'microsoftcopilot.unknown',
    listeningDayNews: 'microsoftcopilot.listeningDayNews',
    writingPage: 'microsoftcopilot.writingPage',
    viewTheirLibrary: 'microsoftcopilot.viewTheirLibrary',
    viewAGeneratedImage: 'microsoftcopilot.viewAGeneratedImage',
    viewResearchReport: 'microsoftcopilot.viewResearchReport',
    readingArticle: 'general.readingArticle',
    checkingWeather: 'microsoftcopilot.checkingWeather',
    watchingVideoArticle: 'microsoftcopilot.watchingVideoArticle',
    discoverNews: 'microsoftcopilot.discoverNews',
    discoverExperimentalFeatures: 'microsoftcopilot.discoverExperimentalFeatures',
    generateAudioExpression: 'microsoftcopilot.generateAudioExpression',
    viewPublic3DGenerations: 'microsoftcopilot.viewPublic3DGenerations',
    viewTheir3DGenerations: 'microsoftcopilot.viewTheir3DGenerations',
    playingWithAiGeneration: 'microsoftcopilot.playingWithAiGeneration',
  })

  const isTalking = document.querySelector(
    'button[data-testid=stop-button]',
  )

  let wordCount = 0
  for (const element of document.querySelectorAll(
    '[data-content="user-message"],[data-content="ai-message"]',
  )) {
    const text = element.textContent
      ?.replace(/, |,\n|,|\. |\./g, ' ')
      // eslint-disable-next-line regexp/no-dupe-disjunctions
      .replace(/\d*|[/', ]/g, '')
    if (text) {
      wordCount += text.split(' ').slice(2, text.split(' ').length).length
    }
  }

  if (pathname.split('/')[1] === 'chats') {
    const sidebarButtonToggle = document.querySelector('div[data-testid="sidebar-container"] button[role="link"]')
    const isSidebarOpen = sidebarButtonToggle?.parentElement?.className.includes('hidden') === false
    if (showTitle && isSidebarOpen) {
      presenceData.details = document.querySelector(
        'div[role="listbox"] > div[role="option"][aria-selected="true"]',
      )?.textContent
    }
    else {
      presenceData.details = strings.talkingWithAI
    }

    presenceData.state = isTalking
      ? strings.aiResponding
      : strings.conversationStats
          .replace(
            '{0}',
            `${Number(
              document.querySelectorAll('[data-content="user-message"]')
                .length,
            )}`,
          )
          .replace('{1}', `${wordCount}`)
    presenceData.smallImageKey = isTalking ? ActivityAssets.Talking : null
  }
  else if (pathname.split('/')[1] === 'pages') {
    const pageTitle = document.querySelector('h1[role="button"]')
    const pageTitleInput = document.querySelector<HTMLInputElement>('input[type="text"]')
    presenceData.details = strings.writingPage
    presenceData.state = pageTitle?.textContent?.trim() || pageTitleInput?.value?.trim() || strings.unknown
  }
  else if (pathname.split('/')[1] === 'research') {
    presenceData.details = strings.viewResearchReport
    presenceData.state = document.querySelector('.text-base')?.nextElementSibling?.textContent?.trim() ?? strings.unknown
  }
  else if (pathname.split('/')[1] === 'discover') {
    if (pathname.split('/')[2] === 'news-article') {
      presenceData.details = strings.readingArticle
      presenceData.state = document.querySelector('.content-title')?.textContent?.trim() ?? strings.unknown
    }
    else if (pathname.split('/')[2] === 'news-video') {
      presenceData.details = strings.watchingVideoArticle
    }
    else if (pathname.split('/')[2] === 'news-gem') {
      presenceData.details = strings.readingArticle
      presenceData.state = document.querySelector('.gem-header-title')?.textContent?.trim() ?? strings.unknown
    }
    else if (pathname.split('/')[2] === 'weather') {
      const data = document.querySelectorAll('div[data-testid="discover-weather-card"] span')
      presenceData.details = strings.checkingWeather.replace('{0}', data[0]?.textContent ?? strings.unknown)
      presenceData.state = `${data[1]?.textContent || ''} - ${data[2]?.textContent || ''} (${data[3]?.textContent || ''} / ${data[4]?.textContent || ''})`
    }
    else {
      presenceData.details = strings.discoverNews
    }
  }
  else if (pathname.split('/')[1] === 'imagine') {
    presenceData.details = strings.viewPublicImagesGenerated
    if (pathname.split('/')[2]) {
      presenceData.state = strings.prompt.replace('{0}', document.querySelector('button.text-start')?.textContent?.trim() ?? strings.unknown)
    }
  }
  else if (pathname.split('/')[1] === 'library') {
    const imageOpened = document.querySelector('img[referrerpolicy="no-referrer"]')
    presenceData.details = strings.viewTheirLibrary
    if (imageOpened) {
      presenceData.details = strings.viewAGeneratedImage
    }
  }
  else if (pathname.split('/')[1] === 'labs') {
    if (pathname.split('/')[4] === 'my-creations') {
      presenceData.details = strings.viewTheir3DGenerations
    }
    else if (pathname.split('/')[3] === '3d-generations') {
      presenceData.details = strings.viewPublic3DGenerations
    }
    else if (pathname.split('/')[2] === 'experiments') {
      presenceData.details = strings.discoverExperimentalFeatures
      presenceData.state = document.querySelector('main header')?.textContent?.trim() ?? strings.unknown
    }
    else if (pathname.split('/')[2] === 'audio-expression') {
      presenceData.details = strings.generateAudioExpression
    }
    else {
      presenceData.details = strings.discoverExperimentalFeatures
    }
  }
  else if (pathname.split('/')[1] === 'daily') {
    const chapters = document.querySelectorAll<HTMLDivElement>('[data-testid^="daily-briefing-chapter"]')
    const activeChapter = Array.from(chapters).find(el => el.style.opacity === '1')
    const newsTitle = activeChapter?.querySelector('h1[data-testid="chapter-title"]')
    presenceData.details = strings.listeningDayNews
    presenceData.state = newsTitle?.textContent?.trim() ?? strings.unknown
  }
  else if (pathname.split('/')[1] === 'gaming') {
    presenceData.details = strings.playingWithAiGeneration
  }
  else {
    presenceData.details = strings.startNewConversation
    presenceData.state = strings.thinkingOfPrompt
  }

  presence.setActivity(presenceData)
})
