const presence = new Presence({
  clientId: '1209550314987061258',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/G/Gemini/assets/logo.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    details: 'Browsing website',
  }
  const { pathname } = document.location
  const showTitle = await presence.getSetting<boolean>('showTitle')
  switch (true) {
    case pathname.startsWith('/app'):
      // Check the selected conversation
      if (showTitle) {
        presenceData.details = document.querySelector(
          'div.conversation.selected>div.conversation-title',
        )?.textContent ?? 'Thinking of a new Prompt...'

        // Show word count for messages
        const questions = document.querySelectorAll('p.query-text-line')
        const answers = document.querySelectorAll(
          'message-content.model-response-text',
        )

        // Loop through all response messages, to count the total words
        let askedWords = 0
        for (const x of questions)
          askedWords += x.textContent?.split(' ').length ?? 0

        let answeredWords = 0
        for (const x of answers)
          answeredWords += x.textContent?.split(' ').length ?? 0

        presenceData.state = `Asked ${askedWords} words | answered with ${answeredWords} words.`
      }
      else {
        presenceData.details = 'Asking questions'
      }

      break
    case pathname.startsWith('/extensions'):
      presenceData.details = 'Managing extensions'
      break
    case pathname.startsWith('/updates'):
      presenceData.details = 'Reading updates'
      break
    case pathname.startsWith('/faq'):
      presenceData.details = 'Reading FAQ'
      break
    case pathname.startsWith('/advanced'):
      presenceData.details = 'Reading about Gemini Advanced'
      break
  }

  presence.setActivity(presenceData)
})
