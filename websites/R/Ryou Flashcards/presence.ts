const presence = new Presence({
  clientId: '794689032411283476',
})
const startTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/R/Ryou%20Flashcards/assets/logo.png',
    startTimestamp,
  }
  const { pathname } = window.location
  const title = document.querySelector('title')?.textContent

  if (title?.includes('Dashboard')) {
    presenceData.details = 'Viewing Dashboard'
    delete presenceData.state
  }
  else if (pathname.startsWith('/learn/')) {
    if (pathname.includes('/kanji')) {
      presenceData.details = 'Learning kanji'
      if (pathname.includes('/grades')) {
        const grade = pathname.match(/\/grades\/(\d+)/)
        if (grade)
          presenceData.state = `Grade ${Number.parseInt(grade[1]!)} kanji`
      }
      else if (pathname.includes('/jlpt')) {
        const jlptlevel = pathname.match(/\/jlpt\/(\d+)/)
        if (jlptlevel)
          presenceData.state = `JLPT N${Number.parseInt(jlptlevel[1]!)} kanji`
      }
      else if (pathname.includes('/genki')) {
        const genkilesson = pathname.match(/\/genki\/(\d+)/)
        if (genkilesson)
          presenceData.state = `Genki lesson ${Number.parseInt(genkilesson[1]!)} kanji`
      }
      else if (pathname.includes('/rtk')) {
        const rtklesson = pathname.match(/\/rtk\/(\d+)/)
        if (rtklesson)
          presenceData.state = `RTK lesson ${Number.parseInt(rtklesson[1]!)} kanji`
      }
      else if (pathname.includes('/wk')) {
        const wklevel = pathname.match(/\/wk\/(\d+)/)
        if (wklevel)
          presenceData.state = `Wanikani level ${Number.parseInt(wklevel[1]!)} kanji`
      }
      else {
        delete presenceData.state
      }
    }
    else if (pathname.includes('/vocabulary')) {
      presenceData.details = 'Learning vocabulary'
      delete presenceData.state
    }
  }
  else if (pathname.startsWith('/vocabulary')) {
    presenceData.details = 'Learning vocabulary'
    if (pathname.includes('/jlpt/')) {
      const jlptdetails = pathname.match(/\/jlpt\/(\d+)\/(\d+)/)
      if (jlptdetails) {
        presenceData.state = `JLPT N${Number.parseInt(jlptdetails[1]!)} page ${Number.parseInt(
          jlptdetails[2]!,
        )}`
      }
    }
    else if (pathname.includes('/genki')) {
      const genkilesson = pathname.match(/\/genki\/(\d+)/)
      if (genkilesson)
        presenceData.state = `Genki lesson ${Number.parseInt(genkilesson[1]!)}`
    }
    else if (pathname.includes('/unit')) {
      const unitname = document.querySelector('#vocabulary-unit h2')
      if (unitname)
        presenceData.state = unitname.textContent
    }
    else {
      // eslint-disable-next-line regexp/no-obscure-range
      const vocabword = title?.match(/[一-龯ぁ-ゔゞァ-・ヽヾ゛゜ー]+/)
      const vocabreading = document.querySelector(
        '#vocabulary-reading .kanji-field',
      )
      if (vocabword && vocabreading)
        presenceData.state = `${vocabword[0]} (${vocabreading.textContent})`
      else delete presenceData.state
    }
  }
  else if (pathname.startsWith('/kanji')) {
    presenceData.details = 'Learning kanji'
    const kanji = document.querySelector('#kanji')
    const kanjimeaning = document.querySelector('#kanji-meaning')
    if (kanji && kanjimeaning)
      presenceData.state = `${kanji.textContent} (${kanjimeaning.textContent})`
    else delete presenceData.state
  }
  else if (pathname.startsWith('/practice')) {
    if (pathname.includes('/kanji'))
      presenceData.details = 'Practicing kanji'
    else if (pathname.includes('/vocabulary'))
      presenceData.details = 'Practicing vocabulary'

    const currentKanji = document.querySelector('#current-kanji')
    if (currentKanji) {
      const [challenge] = document
        .querySelector('#challenge')
        ?.textContent
        ?.match(/reading|meaning/) ?? []
      presenceData.state = `${
        challenge?.charAt(0).toUpperCase()
      }${challenge?.slice(1)} of ${currentKanji.textContent}`
    }
    else {
      delete presenceData.state
    }
  }
  else if (pathname.startsWith('/reviews')) {
    presenceData.details = 'Completing reviews'
    const kanji = document.querySelector('#current-kanji')
    const progress = document.querySelector('#progress-bar-wrapper')
    if (kanji && progress) {
      presenceData.state = `${kanji.textContent} ・ ${
        Math.round(
          (Number.parseFloat(progress.getAttribute('progress')!) + Number.EPSILON) * 100,
        ) / 100
      }%`
    }
    else {
      delete presenceData.state
    }
  }
  else if (pathname.startsWith('/summary')) {
    presenceData.details = 'Viewing review results'
    const statsList = document.querySelectorAll('#summary-stats li')
    if (statsList) {
      const [totalLi, correctLi] = statsList
      if (totalLi && correctLi) {
        presenceData.state = `${correctLi.querySelector('p')?.textContent}/${
          totalLi.querySelector('p')?.textContent
        } correct`
      }
      else {
        delete presenceData.state
      }
    }
    else {
      delete presenceData.state
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
