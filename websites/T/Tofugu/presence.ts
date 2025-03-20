const presence = new Presence({
  clientId: '958766344311025786',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/T/Tofugu/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }

  switch (location.host) {
    case 'www.tofugu.com': {
      const [, category, path] = location.pathname.split('/')
      switch (category) {
        case '': {
          presenceData.details = 'Viewing the homepage'
          break
        }
        case 'japanese': {
          if (path) {
            presenceData.details = 'Viewing a Japanese article'
            presenceData.state = document.querySelector('.article-highlight')?.textContent
          }
          else {
            presenceData.details = 'Viewing category'
            presenceData.state = document.querySelector('h1 > a')?.textContent
          }
          break
        }
        case 'interviews': {
          if (path) {
            presenceData.details = 'Viewing an interview article'
            presenceData.state = document.querySelector('.article-highlight')?.textContent
          }
          else {
            presenceData.details = 'Viewing category'
            presenceData.state = document.querySelector('h1 > a')?.textContent
          }
          break
        }
        case 'reviews': {
          if (path) {
            presenceData.details = 'Viewing a review article'
            presenceData.state = document.querySelector('.article-highlight')?.textContent
          }
          else {
            presenceData.details = 'Viewing category'
            presenceData.state = document.querySelector('h1 > a')?.textContent
          }
          break
        }
        case 'news': {
          if (path) {
            presenceData.details = 'Viewing a news article'
            presenceData.state = document.querySelector('h2')?.textContent
          }
          else {
            presenceData.details = 'Viewing category'
            presenceData.state = document.querySelector('h1 > a')?.textContent
          }
          break
        }
        case 'travel': {
          if (path) {
            presenceData.details = 'Viewing a travel article'
            presenceData.state = document.querySelector('.article-highlight')?.textContent
          }
          else {
            presenceData.details = 'Viewing category'
            presenceData.state = document.querySelector('h1 > a')?.textContent
          }
          break
        }
        case 'japanese-grammar': {
          if (path) {
            presenceData.details = 'Viewing a Japanese grammar article'
            presenceData.state = document.querySelector('.article-highlight')?.textContent
          }
          else {
            presenceData.details = 'Viewing category'
            presenceData.state = document.querySelector('h1 > a')?.textContent
          }
          break
        }
        case 'japanese-learning-resources-database': {
          if (path) {
            presenceData.details = 'Viewing a Japanese learning resource article'
            presenceData.state = document.querySelector('.article-highlight')?.textContent
          }
          else {
            presenceData.details = 'Viewing category'
            presenceData.state = document.querySelector('h1 > a')?.textContent
          }
          break
        }
        case 'japan': {
          if (path) {
            presenceData.details = 'Viewing a Japan article'
            presenceData.state = document.querySelector('.article-highlight')?.textContent
          }
          else {
            presenceData.details = 'Viewing category'
            presenceData.state = document.querySelector('h1 > a')?.textContent
          }
          break
        }
        case 'series': {
          if (path) {
            presenceData.details = 'Viewing an article series'
            presenceData.state = document.querySelector('.article-highlight')?.textContent
          }
          else {
            presenceData.details = 'Viewing category'
            presenceData.state = document.querySelector('h1 > a')?.textContent
          }
          break
        }
        case 'jobs': {
          if (path) {
            presenceData.details = 'Viewing a job listing'
            presenceData.state = document.querySelector('h2')?.textContent
          }
          else {
            presenceData.details = 'Viewing job listings'
          }

          break
        }
        default: {
          presenceData.details = 'Browsing'
          presenceData.state = document.querySelector('h1 > a')?.textContent
        }
      }
      break
    }
    case 'kana-quiz.tofugu.com': {
      switch (document.querySelector('.App > div')?.className) {
        case 'start': {
          presenceData.details = 'Preparing to practice kana'
          presenceData.state = document.querySelector<HTMLLabelElement>('.check')?.htmlFor === 'practice-hiragana'
            ? 'Hiragana'
            : 'Katakana'
          break
        }
        case 'quiz-page': {
          presenceData.details = 'Practicing kana'
          presenceData.state = document.querySelector('.focused-card span')?.textContent
          break
        }
        case 'results': {
          const [, correct, total, percent] = document
            .querySelector('.results > h3')
            ?.textContent
            // eslint-disable-next-line regexp/no-super-linear-backtracking, regexp/no-misleading-capturing-group
            ?.match(/.*?(\d+)\/(\d+).*?([\d.]+)/) ?? []
          presenceData.details = 'Viewing kana quiz results'
          presenceData.state = `${correct}/${total} (${percent}%)`
          break
        }
      }
      break
    }
  }

  presence.setActivity(presenceData)
})
