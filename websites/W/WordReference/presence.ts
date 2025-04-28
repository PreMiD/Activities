const presence = new Presence({
  clientId: '1363658782831542312',
})

function languageCode(language: string): string {
  switch (language) {
    case 'ar':
      return 'Arabic'
    case 'cz':
      return 'Czech'
    case 'de':
      return 'German'
    case 'en':
      return 'English'
    case 'es':
      return 'Spanish'
    case 'fr':
      return 'French'
    case 'gr':
      return 'Greek'
    case 'is':
      return 'Icelandic'
    case 'it':
      return 'Italian'
    case 'ja':
      return 'Japanese'
    case 'ko':
      return 'Korean'
    case 'nl':
      return 'Dutch'
    case 'pl':
      return 'Polish'
    case 'pt':
      return 'Portuguese'
    case 'ro':
      return 'Romanian'
    case 'ru':
      return 'Russian'
    case 'sv':
      return 'Swedish'
    case 'tr':
      return 'Turkish'
    case 'zh':
      return 'Chinese'
    default:
      return 'Unknown'
  }
}

function tabSelection(id: string): string {
  switch (id) {
    case 'tabWR':
      return 'Translate the word : {0}'
    case 'tabHC':
      return 'Translate the word (Collins) : {0}'
    case 'tabRev':
      return 'Translate the word (Reverse) : {0}'
    case 'tabDefinition':
      return 'Read the definition of the word : {0}'
    case 'tabSynonyms':
      return 'Read the synonyms of the word : {0}'
    case 'tabEnglishUsage':
      return 'Read the English usage of the word : {0}'
    case 'tabEnglishCollocations':
      return 'Read the English collocations of the word : {0}'
    default:
      return 'Word : {0}'
  }
}
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/W/WordReference/assets/logo.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const path = document.location.pathname?.split('/')
  const urlParams = new URLSearchParams(document.location.search)

  if (path[1]?.length === 4 && languageCode(path[1]?.slice(0, 2)) !== 'Unknown' && languageCode(path[1]?.slice(2, 4))) {
    presenceData.details = path[2] ? tabSelection(document.querySelector('.selected')?.id ?? 'tabWR')?.replace('{0}', decodeURIComponent(path[2])) : `${languageCode(path[1]?.slice(0, 2))}-${languageCode(path[1]?.slice(2, 4))} Dictionary`
    presenceData.state = path[2] ? `From ${languageCode(path[1]?.slice(0, 2))} to ${languageCode(path[1]?.slice(2, 4))}` : ''
  }
  else if (path[1]?.length === 2 && languageCode(path[1]) !== 'Unknown' && path[2] === 'translation.asp') {
    presenceData.details = document.location.search?.includes('tranword') ? tabSelection(document.querySelector('.selected')?.id ?? 'tabWR')?.replace('{0}', decodeURIComponent(urlParams.get('tranword')!)) : `English-${languageCode(path[1])} Dictionary`
    presenceData.state = document.location.search?.includes('tranword') ? `From English to ${languageCode(path[1])}` : ''
  }
  else if (path[1]?.length === 2 && path[2]?.length === 2 && languageCode(path[1]) !== 'Unknown' && languageCode(path[2]) !== 'Unknown' && path[3] === 'translation.asp') {
    presenceData.details = document.location.search?.includes('spen') ? tabSelection(document.querySelector('.selected')?.id ?? 'tabWR')?.replace('{0}', decodeURIComponent(urlParams.get('spen')!)) : `${languageCode(path[1])}-English Dictionary`
    presenceData.state = document.location.search?.includes('spen') ? `From ${languageCode(path[1])} to English` : ''
  }
  else if (path[1] === 'definition' || path[1] === 'definicion' || path[1] === 'definizione' || path[1] === 'definicio') {
    switch (path[1]) {
      case 'definition':
        presenceData.details = path[2] ? `Reading the definition of the word : ${decodeURIComponent(path[2])}` : 'English Dictionary'
        presenceData.state = path[2] ? 'English Dictionary' : ''
        break
      case 'definicion':
        presenceData.details = path[2] ? `Reading the definition of the word : ${decodeURIComponent(path[2])}` : 'Spanish Dictionary'
        presenceData.state = path[2] ? 'Spanish Dictionary' : ''
        break
      case 'definizione':
        presenceData.details = path[2] ? `Reading the definition of the word : ${decodeURIComponent(path[2])}` : 'Italian Dictionary'
        presenceData.state = path[2] ? 'Italian Dictionary' : ''
        break
      case 'definicio':
        presenceData.details = path[2] ? `Reading the definition of the word : ${decodeURIComponent(path[2])}` : 'Catalan Dictionary'
        presenceData.state = path[2] ? 'Catalan Dictionary' : ''
        break
    }
  }
  else if (path[1] === 'synonyms' || path[1] === 'sinonimos') {
    switch (path[1]) {
      case 'synonyms':
        presenceData.details = path[2] ? `Reading the synonyms of the word : ${decodeURIComponent(path[2])}` : 'English Dictionary'
        presenceData.state = path[2] ? 'English Dictionary' : ''
        break
      case 'sinonimos':
        presenceData.details = path[2] ? `Reading the synonyms of the word : ${decodeURIComponent(path[2])}` : 'Spanish Dictionary'
        presenceData.state = path[2] ? 'Spanish Dictionary' : ''
        break
    }
  }
  else if (path[1] === 'gramatica' || path[1] === 'esgram') {
    presenceData.details = path[2] ? `Reading the grammar of the word : ${decodeURIComponent(path[2])}` : 'Spanish Grammar and Usage'
    presenceData.state = path[2] ? 'Spanish Grammar and Usage' : ''
  }
  else if (path[1] === 'englishusage') {
    presenceData.details = path[2] ? `Reading the usage of the word : ${decodeURIComponent(path[2])}` : 'English Usage'
    presenceData.state = path[2] ? 'English Usage' : ''
  }
  else if (path[1] === 'englishcollocations') {
    presenceData.details = path[2] ? `Reading the collocations of the word : ${decodeURIComponent(path[2])}` : 'English Collocations'
    presenceData.state = path[2] ? 'English Collocations' : ''
  }
  else if (path[1] === 'conj' && path[2]?.includes('verbs.aspx')) {
    presenceData.details = urlParams?.get('v') !== null ? `Conjugating the verb : ${decodeURIComponent(urlParams.get('v')!)}` : `Conjugating the verb : ${document.querySelector('h3')?.textContent}`
    presenceData.state = `${languageCode(path[2]?.slice(0, 2))} Conjugation`
  }
  else if (document.location.pathname === '/' || path[1]?.length === 2) {
    presenceData.details = 'Viewing the homepage'
  }
  else {
    presenceData.details = document.title?.replace(' - WordReference.com', '') ?? 'Unknown'
  }

  presence.setActivity(presenceData)
})
