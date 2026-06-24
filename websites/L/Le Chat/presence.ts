const presence = new Presence({
  clientId: '1338859356497641503',
})
async function getStrings() {
  return presence.getStrings({
    play: 'presence.playback.playing',
    pause: 'presence.playback.paused',
    newPrompt: 'leChat.startingPrompt',
    talkingWithAi: 'leChat.talkingWithAi',
    readingResponse: 'leChat.readingResponse',
    askingQuestion: 'leChat.askingQuestion',
    doingAiStuff: 'leChat.doingAiStuff',
  })
}
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum Assets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/L/Le%20Chat/assets/logo.png',
}

presence.on('UpdateData', async () => {
  const { pathname } = document.location
  const showTitle = await presence.getSetting<boolean>('showTitle')

  let presenceDetail: string, presenceState: string

  const strings = await getStrings()

  if (pathname === '/chat') {
    presenceDetail = strings?.newPrompt ?? ''
  }
  else if (pathname.includes('/chat/')) {
    presenceDetail = (showTitle
      ? (document.title === 'Le Chat'
          ? document.querySelector(`a[href="${pathname}"]>div`)?.textContent
          : document.title)
      : strings.talkingWithAi) ?? strings.talkingWithAi
  }
  else {
    presenceDetail = strings.doingAiStuff
  }

  // Checking if the user is currently typing a question
  if (document.querySelector('div[contenteditable="true"]')?.textContent !== '') {
    presenceState = strings.askingQuestion
  }
  else if (
    document.querySelector(
      'div[data-message-part-type="answer"]',
    )
  ) {
    presenceState = strings.readingResponse
  }
  else {
    presenceState = ''
  }

  presence.setActivity({
    largeImageKey: Assets.Logo,
    startTimestamp: browsingTimestamp,
    details: presenceDetail,
    state: presenceState,
  })
})
