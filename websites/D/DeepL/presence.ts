const presence = new Presence({
  clientId: '614903529240395782',
})

async function getStrings() {
  return presence.getStrings({
    from: 'deepl.from',
    improveText: 'deepl.improveText',
    in: 'deepl.in',
    savedTranslation: 'deepl.savedTranslation',
    savedTranslations: 'deepl.savedTranslations',
    to: 'deepl.to',
    translateFile: 'deepl.translateFile',
    translateText: 'deepl.translateText',
    viewPage: 'general.viewPage',
  })
}
const browsingTimestamp = Math.floor(Date.now() / 1000)

function langPair(pair: string, position: number, type: string) {
  const langSelection = document.querySelector(`button[aria-selected="true"][data-testid^=${type}translator-lang-option]`)?.textContent
  const langList = document.querySelector(`div[data-testid^="translator-${pair}-lang-list"]`)
  return langList ? langSelection : document.querySelectorAll(`[data-testid="translator-${pair}-lang"]`)[position]?.textContent
}

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/D/DeepL/assets/logo.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const path = document.location.pathname?.split('/')
  const strings = await getStrings()
  const writeLang = document.querySelector('[data-testid="write-language-selector_options"]') ? document.querySelector('div[aria-checked="true"][data-testid^="write-language-selector_option"]')?.textContent : document.querySelector('button[data-testid="write-language-selector"]')?.textContent

  if (path[2] === 'translator') {
    if (path[3] === 'files') {
      presenceData.details = strings.translateFile
      presenceData.state = `${strings.from.replace('{0}', langPair('source', 1, 'document-')!)} → ${strings.to.replace('{0}', langPair('target', 1, 'document-')!)}`
    }
    else {
      presenceData.details = strings.translateText
      presenceData.state = `${strings.from.replace('{0}', langPair('source', 0, '')!)} → ${strings.to.replace('{0}', langPair('target', 0, '')!)}`
    }
  }
  else if (path[2] === 'write') {
    presenceData.details = strings.improveText
    presenceData.state = strings.in.replace('{0}', writeLang!)
    console.error(writeLang)
  }
  else if (path[2] === 'saved') {
    if (path[3] === 'translation') {
      presenceData.details = strings.savedTranslation
      presenceData.state = document.querySelector('button[data-testid="saved-translation-item-rename"]')?.textContent ?? decodeURIComponent(document.location.hash!.split('/')[2]!)
    }
    else {
      presenceData.details = strings.savedTranslations
    }
  }
  else {
    presenceData.details = strings.viewPage
    presenceData.state = document.title
  }

  presence.setActivity(presenceData)
})
