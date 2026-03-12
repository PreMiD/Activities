import { Assets } from 'premid'

const presence = new Presence({
  clientId: '937350108780052571',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/R/Reverso/assets/logo.png',
  }
  const showTime = await presence.getSetting<boolean>('stamp')
  const langLabel = document.querySelectorAll(
    'div.lang-label-container > span.lang-label',
  )
  const hrefEn = document
    .querySelector(
      ':is(link[hreflang=\'en\'], #interface-lang-menu > div.drop-down > a[data-value=\'en\'])',
    )
    ?.getAttribute('href')
  const hrefEnUrl = new URL(hrefEn ?? '')
  if (hrefEn) {
    if (hrefEn.includes('/text-translation')) {
      presenceData.details = `Traduction en ${langLabel[0]?.textContent?.trim()} → ${langLabel[1]?.textContent?.trim()}`
      if (
        document.querySelector('div.textarea__resize-div')?.textContent?.length !== 0
      ) {
        presenceData.details = `Traduction en ${langLabel[0]?.textContent?.trim()} → ${langLabel[1]?.textContent?.trim()} de :`
        presenceData.state = document.querySelector(
          'div.textarea__resize-div',
        )?.textContent
      }
    }
    else if (hrefEn.includes('/translation/')) {
      const input = document.querySelector<HTMLInputElement>('#entry')
      presenceData.details = 'Visite la page'
      presenceData.state = 'Traduction'

      if (
        input?.value.length !== 0
        && document.querySelector('#translations-content')
      ) {
        const langLabel = document.querySelectorAll(
          '#pair-selector .option.front',
        )
        presenceData.details = `Traduction de ${input?.value}`
        presenceData.state = `${langLabel[0]?.textContent} → ${langLabel[1]?.textContent}`
      }
    }
    else if (hrefEn.includes('/spell-checker/')) {
      presenceData.details = `Correction du texte en ${
        document.querySelector<HTMLDivElement>(
          'app-speller-language-select div',
        )?.textContent
      }`
      presenceData.state = document.querySelector<HTMLInputElement>('textarea')?.value
    }
    else if (hrefEn.includes('/synonym')) {
      const input = document.querySelector<HTMLInputElement>('#searchbox')
      presenceData.details = 'Visite la page'
      presenceData.state = 'Synonyme'
      if (
        input?.value.length !== 0
        && document.querySelector(
          '#cluster-n-1 > div.pannel.cluster > div.word-opt',
        )
      ) {
        presenceData.details = `Recherche des synonymes en ${
          document.querySelector(
            '#trg-selector > span.option.front > span.lang-trg',
          )?.textContent
        }`
        presenceData.state = `pour "${input?.value}"`
        presenceData.smallImageKey = Assets.Search
      }
    }
    else if (hrefEn.includes('/conjugation')) {
      const input = document.querySelector<HTMLInputElement>('#txtVerb')
      presenceData.details = 'Visite la page'
      presenceData.state = 'Conjugaison'
      if (
        input?.value.length !== 0
        && document.querySelector('#ch_divConjugatorHeader > div.verb-forms-wrap')
      ) {
        presenceData.details = `Recherche des formes conjugués de : ${input?.value}`
        presenceData.state = `en ${
          document.querySelector('#content-menu div.select-wrap > a > label')
            ?.textContent
        }`
        presenceData.smallImageKey = Assets.Search
      }
    }
    else if (hrefEnUrl.hostname === ('documents.reverso.net')) {
      const langLabel = document.querySelectorAll(
        '.translation-language-header .translation-language-text',
      )
      presenceData.details = 'Traduction d\'un document en'
      presenceData.state = `${langLabel[0]?.textContent} → ${langLabel[1]?.textContent}`
    }
    else if (hrefEnUrl.hostname === ('dictionary.reverso.net')) {
      if (document.location.pathname.startsWith('/CollabDict')) {
        const input = document.querySelector<HTMLInputElement>(
          '#ctl00_cC_ucCD_txtTargetContain',
        )
        presenceData.details = 'Visite la page'
        presenceData.state = 'Dictionnaire Collaboratif'
        if (
          input?.value.length !== 0
          && document.querySelector('#ctl00_cC_ucCD_ucCDE_lblMaxResultsTop')
        ) {
          presenceData.details = `Regarde "${input?.value}"`
          presenceData.state = `dans ${
            document.querySelector(
              `option[value='${new URLSearchParams(
                document.location.search,
              ).get('targLang')}']`,
            )?.textContent
          }`
        }
      }
      else {
        const input = document.querySelector<HTMLInputElement>(
          '#ctl00_cC_txtSearchText',
        )
        presenceData.details = 'Visite la page'
        presenceData.state = 'Dictionnaire'
        if (
          input?.value.length !== 0
          && document.querySelector('#ctl00_cC_translate_box')
        ) {
          presenceData.details = `Regarde "${input?.value}"`
          presenceData.state = `dans ${
            document.querySelector(
              `option[value=${document.location.pathname.split('/', 2)[1]}]`,
            )?.textContent
          }`
        }
      }
    }
  }
  else if (document.location.hostname === 'grammaire.reverso.net') {
    const input = document.querySelector<HTMLInputElement>('form > input')?.value
    presenceData.details = 'Visite la page'
    presenceData.state = 'Grammaire française'
    if (input?.length !== 0) {
      presenceData.details = `Recherche ${input}`
      presenceData.state = 'dans Grammaire française'
      presenceData.smallImageKey = Assets.Search
    }
  }
  else if (document.location.hostname === 'grammar.reverso.net') {
    const input = document.querySelector<HTMLInputElement>('form > input')?.value
    presenceData.details = 'Visite la page'
    presenceData.state = 'Grammaire anglaise'
    if (input?.length !== 0) {
      presenceData.details = `Recherche ${input}`
      presenceData.state = 'dans Grammaire anglaise'
      presenceData.smallImageKey = Assets.Search
    }
  }

  if (showTime)
    presenceData.startTimestamp = browsingTimestamp
  presence.setActivity(presenceData)
})
