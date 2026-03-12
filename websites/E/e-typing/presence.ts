import { ActivityType } from 'premid'

const presence = new Presence({
  clientId: '1343107487477399592',
})

const romaLargeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/E/e-typing/assets/logo.png'
const englishLargeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/E/e-typing/assets/0.png'
const kanaLargeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/E/e-typing/assets/1.png'
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData = generatePresenceData()

  presence.setActivity(presenceData)
})

function getMode() {
  const { search } = location

  if (search.includes('.2')) {
    return 'english'
  }
  else if (search.includes('kana.1')) {
    return 'kana'
  }
  else if (search.includes('.0')) {
    return 'roma'
  }

  const headerImgSrc = document.querySelector<HTMLImageElement>('#etyping img')?.src ?? ''
  const paths = headerImgSrc.split('/').filter(i => i !== '')
  const mode = paths[3]

  if (mode === 'eng') {
    return 'english'
  }
  else if (mode === 'kana') {
    return 'kana'
  }
  else {
    return 'roma'
  }
}

function getTypingContentWindowInfo() {
  const typingContent = document.querySelector<HTMLIFrameElement>('#typing_content')
  const appElement = typingContent?.contentDocument?.querySelector<HTMLDivElement>('#start_view > .title') ?? document.getElementById('app')

  if (typingContent || appElement) {
    const windowTitleElement = document.querySelector<HTMLParagraphElement>('.pp_description') ?? window.parent.document.querySelector<HTMLParagraphElement>('.pp_description')
    const windowTitle = windowTitleElement?.textContent ?? ''

    const wordTitleElement = typingContent?.contentDocument?.querySelector<HTMLDivElement>('#start_view > .title') ?? document.querySelector<HTMLDivElement>('#start_view > .title')
    const wordTitle = wordTitleElement?.textContent ?? ''
    const sessionStorageWordTitle = sessionStorage.getItem('presence:wordTitle') ?? ''

    if (!sessionStorageWordTitle) {
      sessionStorage.setItem('presence:wordTitle', wordTitle)
      return { windowTitle, wordTitle: `お題: ${wordTitle}` }
    }
    else {
      const replacedWindowTitle = location.search.includes('trysc.trysc.trysc') ? '腕試しレベルチェック' : windowTitle.replace(sessionStorageWordTitle, '')

      return { windowTitle: replacedWindowTitle, wordTitle: `お題: ${sessionStorageWordTitle}` }
    }
  }

  sessionStorage.setItem('presence:wordTitle', '')
  return { windowTitle: '', wordTitle: '' }
}

function generatePresenceData() {
  const mode = getMode()

  const { windowTitle: categoryTitle, wordTitle } = getTypingContentWindowInfo()

  const presenceData: PresenceData = {
    state: wordTitle,
    startTimestamp: browsingTimestamp,
    type: ActivityType.Playing,
  }

  if (mode === 'english') {
    presenceData.largeImageKey = englishLargeImageKey

    if (categoryTitle) {
      presenceData.details = `${categoryTitle} (英語)`
    }
  }
  else if (mode === 'kana') {
    presenceData.largeImageKey = kanaLargeImageKey
    if (categoryTitle) {
      presenceData.details = `${categoryTitle} (かな)`
    }
  }
  else {
    presenceData.largeImageKey = romaLargeImageKey
    if (categoryTitle) {
      presenceData.details = `${categoryTitle} (ローマ字)`
    }
  }

  return presenceData
}
