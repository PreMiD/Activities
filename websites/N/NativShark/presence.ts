const presence: Presence = new Presence({
  clientId: '503557087041683458',
})
const startTimestamp: number = Math.floor(Date.now() / 1000)
const pathDescriptors: [string, string][] = [
  ['/learn/vocabulary', 'Learning new vocabulary'],
  ['/learn/kanji', 'Learning new kanji'],
  ['/learn/hiragana', 'Learning the Hiragana'],
  ['/learn/katakana', 'Learning the Katakana'],
  ['/tools/flashcards/review', 'Reviewing flashcards'],
  ['/tools/flashcards/browse', 'Browsing flashcard decks'],
  ['/tools/shadow_loops', 'Browsing shadow loop decks'],
  ['/tools/pitch', 'Studying the pitch of sentences'],
  ['/tools/conjugator', 'Practicing conjugations'],
  ['/tools/quizzes/', 'Doing a quiz'],
  ['/tools/quizzes', 'Browsing quizzes'],
  ['/tools/stats', 'Viewing their stats'],
  ['/tools/extra-credit', 'Earning some extra credits'],
  ['/tools/using-nativshark', 'Reading \'Using NativShark\''],
  ['/faq', 'Reading the FAQ'],
]

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/N/NativShark/assets/logo.png',
    startTimestamp,
    name: 'NativShark',
  }
  const { pathname } = window.location

  // Viewing the dashboard
  if (pathname.startsWith('/my-journey')) {
    const unitInfo = document
      .querySelector<HTMLElement>('[class*=\'SubNavigationDropdown__SNButton\']')
      ?.textContent
      ?.split('\n')

    if (unitInfo && unitInfo.length === 2) {
      let [unitText] = unitInfo

      if (unitText === 'All Units')
        unitText = 'Today\'s units'

      presenceData.details = 'Viewing the dashboard'
      presenceData.state = `${unitText}: ${unitInfo[1]}`
    }

    // Reading a lesson
  }
  else if (pathname.startsWith('/lessons/')) {
    presenceData.details = `Viewing lesson '${
      document.querySelector('[class*=\'LessonHeader__Title\'] > span')
        ?.textContent
    }'`

    // Reading a dialogue
  }
  else if (pathname.startsWith('/dialogues/')) {
    presenceData.details = `Reading dialogue '${
      document.querySelector('[class*=\'id__DialogueGrid\'] > div')?.textContent
    }'`

    // Test all the other path -> details mappings
  }
  else {
    for (const [path, detailsText] of pathDescriptors) {
      if (pathname.startsWith(path)) {
        presenceData.details = detailsText
        break
      }
    }
  }

  if (!presenceData.details)
    presence.setActivity()
  else presence.setActivity(presenceData, true)
})
