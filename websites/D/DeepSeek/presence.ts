const presence = new Presence({
  clientId: '1333939310441009182',
})
async function getStrings() {
  return presence.getStrings({
    play: 'general.playing',
    pause: 'general.paused',
    newPrompt: 'deepSeek.startingPrompt',
    talkingWithAi: 'deepSeek.talkingWithAi',
    aiTalking: 'deepSeek.aiTalking',
    readingResponse: 'deepSeek.readingResponse',
    askingQuestion: 'deepSeek.askingQuestion',
  })
}
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum Assets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/D/DeepSeek/assets/logo.png',
}

presence.on('UpdateData', async () => {
  const { pathname } = document.location
  const showTitle = await presence.getSetting<boolean>('showTitle')

  let presenceDetail: string, presenceState: string

  const strings = await getStrings()

  if (pathname === '/') {
    presenceDetail = strings?.newPrompt ?? ''
  }
  else if (pathname.includes('/a/chat/s')) {
    presenceDetail = (showTitle
      ? document.querySelector('div.d8ed659a')?.textContent
      : strings?.talkingWithAi) ?? ''
  }
  else {
    presenceDetail = strings?.talkingWithAi ?? ''
  }

  // Used for checking if the AI is currently responding

  // Checking if the user is currently typing a question
  if (document.querySelector('#chat-input')?.textContent !== '')
    presenceState = strings?.askingQuestion ?? ''
  else if (document.querySelector('div[class=\'f9bf7997 d7dc56a8\']'))
    presenceState = strings?.aiTalking ?? ''
  else if (document.querySelector('div.f9bf7997.d7dc56a8.c05b5566'))
    presenceState = strings?.readingResponse ?? ''
  else presenceState = ''

  presence.setActivity({
    largeImageKey: Assets.Logo,
    startTimestamp: browsingTimestamp,
    details: presenceDetail,
    state: presenceState,
  })
})
